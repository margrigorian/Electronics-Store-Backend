import db from "../db.js";
import { getAvgRating, getCommentsWithRates, getRates } from "./evaluation.js";

const url = "http://localhost:3001/images/";

// FOR ADMIN
export async function getStructureOfProductCategories() {
    const feildsOfApplication = await db.query(`SELECT DISTINCT feildOfApplication FROM products`);

    if (feildsOfApplication[0].length > 0) {
        const categories = await db.query(
            `SELECT category, feildOfApplication AS fromFeildOfApplication FROM products GROUP BY category, feildOfApplication`
        );
        const subcategories = await db.query(`SELECT subcategory, category AS fromCategory FROM products GROUP BY subcategory, category`);

        return {
            feildsOfApplication: feildsOfApplication[0],
            categories: categories[0],
            subcategories: subcategories[0]
        };
    }

    return null;

    // ИНАЯ СТРУКТУРА НЕУДОБНА ДЛЯ ОТРИСОВКИ НА ФРОНТЕ
    // [
    //     {
    //         feildsOfApplication: "smart-home",
    //         structure: [
    //             {
    //                 category: "kitchen appliance",
    //                 subcategories: [subcategory: "kettle"]
    //             }
    //         ]
    //     },
    //     {
    //         feildsOfApplication: "life-style",
    //         structure: [
    //             {
    //                 category: "office",
    //                 subcategories: [subcategory: "laptop", subcategory: "tablet"]
    //             },
    //             {
    //                 category: "wearable",
    //                 subcategories: [subcategory: "watch", subcategory: "headphones"]
    //             },
    //         ]
    //     }
    // ]
}

export async function getFeildOfApplicationCategories(feildOfApplication) {
    // определяем категории продуктов, относящиеся к указанной области применения
    const categories = await db.query(
        `
            SELECT category FROM products WHERE feildOfApplication = "${feildOfApplication}" 
            GROUP BY category
        `
    );

    if (categories[0].length > 0) {
        // В-I

        // запрашиваем продукты указанных категорий, на выходе - массивы промисов
        let products_list = categories[0].map(async el => {
            let products = await db.query(`SELECT id, title, image, price FROM products WHERE category = "${el.category}" LIMIT 3`);
            // корректируем url изображения
            products = products[0].map(el => {
                el.image = url + el.image;
                return el;
            });

            return products;
        });

        products_list = await Promise.all(products_list).then(list => list);

        const result = categories[0].map((el, i) => {
            return { category: el.category, products: products_list[i] }; // формируем необходимую структуру
        });

        return {
            categories: result
        };
    } else {
        return null;
    }

    // В-II

    // запрашиваем продукты указанной области применения
    // const products = await db.query(
    //     `
    //         SELECT id, title, image, category, price FROM products
    //         WHERE feildOfApplication = "${feildOfApplication}"
    //     `
    // );

    // const result = categories[0].map(el => {
    //     return {...el, products: []}
    // });

    // categories[0].forEach((item, i) => {
    //     products[0].forEach(product => {
    //         if(result[i].products.length < 3) { // надо делать break
    //             if(item.category === product.category) {
    //                 result[i].products.push(product);
    //             }
    //         }
    //     })
    // })

    // console.log(result[0]);
}

export async function getProductList(search, category, subcategory, minPrice, maxPrice, order, page, limit) {
    const filters = [];
    const params = [];

    if (search) {
        filters.push("title LIKE ?");
        params.push(`%${search}%`);
    }

    if (category !== "") {
        filters.push("category = ?");
        params.push(category);
    }

    if (subcategory) {
        filters.push("subcategory = ?");
        params.push(subcategory);
    }

    // SUBCATEGORIES для фильтрации на фронте
    let subcategories;

    if (category) {
        // при product-list
        subcategories = await db.query(`SELECT DISTINCT subcategory FROM products WHERE category = "${category}"`);
    } else {
        // при search
        subcategories = await db.query(`SELECT DISTINCT subcategory FROM products WHERE title LIKE "%${search}%"`);
    }

    subcategories = subcategories[0].map(el => el.subcategory);
    // если subcategory "other" есть и она не находится в конце массива, переносим ее туда
    if (subcategories.indexOf("other") !== -1 && subcategories.indexOf("other") !== subcategories.length - 1) {
        subcategories.splice(subcategories.indexOf("other"), 1);
        subcategories.push("other");
    }

    // РАНЖИРОВАНИЕ ЦЕНЫ
    filters.push("price BETWEEN ? AND ?");
    const priceFilter = [];
    const priceParam = [];

    if (search) {
        priceFilter.push("title LIKE ?");
        priceParam.push(`%${search}%`);
    }

    if (subcategory) {
        priceFilter.push("subcategory = ?");
        priceParam.push(subcategory);
    } else if (category) {
        priceFilter.push("category = ?");
        priceParam.push(category);
    }

    const priceValues = await db.query(
        `
            SELECT CEIL(MAX(price)) AS max, FLOOR(MIN(price)) AS min FROM products
            ${priceFilter.length > 0 ? `WHERE ${priceFilter.join(" AND ")}` : ""}
        `,
        priceParam
    );

    if (minPrice && !maxPrice) {
        params.push(minPrice, priceValues[0][0].max);
    } else if (!minPrice && maxPrice) {
        params.push(priceValues[0][0].min, maxPrice);
    } else if (minPrice && maxPrice) {
        params.push(minPrice, maxPrice);
    } else {
        params.push(priceValues[0][0].min, priceValues[0][0].max);
    }

    // ПАГИНАЦИЯ
    params.push((page - 1) * limit, limit);

    // без category в select выдает ошибку, так как атрибут исп. в фильтрах
    let products = await db.query(
        `
            SELECT id, title, description, image, price, quantity, AVG(rate) AS rate, feildOfApplication, category, subcategory FROM products 
            LEFT JOIN product_rating ON products.id = product_rating.product_id
            GROUP BY id
            HAVING ${filters.join(" AND ")}
            ${order ? `ORDER BY price ${order === "asc" ? "asc" : "desc"}` : ""}
            LIMIT ?, ?
        `,
        params
    );

    // COUNT срабатывает неточно, приходится дублировать для получения общего кол-ва товаров
    const productsQuantity = await db.query(`SELECT * FROM products WHERE ${filters.join(" AND ")}`, params);

    if (products[0].length > 0) {
        // Корректна ли проверка? Возможна ли ошибка priceValues при пустом списке?

        products = products[0].map(el => {
            el.image = url + el.image;
            return el;
        });

        return {
            products,
            subcategories: subcategories,
            priceMin: priceValues[0][0].min,
            priceMax: priceValues[0][0].max,
            length: productsQuantity[0].length
        };
    } else {
        return null;
    }
}

export async function getProduct(id) {
    let data = await db.query(`SELECT * FROM products WHERE id = "${id}"`);

    if (data) {
        // товар с указанным id найден
        data = data[0][0];
        // коректируем путь к изображению
        data.image = url + data.image;

        const avgRating = await getAvgRating(id);
        const comments = await getCommentsWithRates(id);
        const rates = await getRates(id);
        const product = { ...data, avgRating, comments, rates };

        return {
            product
        };
    } else {
        return null;
    }
}

export async function checkProductExistence(title) {
    const product = await db.query(`SELECT * FROM products WHERE title = ?`, [title]);

    if (product[0][0]) {
        return {
            product: product[0][0]
        };
    } else {
        return null;
    }
}

export async function postProduct(title, description, image, feild, category, sub, quantity, price) {
    let id = await getLastProductId();

    if (id) {
        id = id + 1;
    } else {
        id = 1; // самый первый продукт
    }

    await db.query(
        `
            INSERT INTO products(id, title, description, image, feildOfApplication, category, subcategory, quantity, price) 
            VALUES("${id}", ?, ?, "${image}", "${feild}", "${category}", "${sub}", "${quantity}", "${price}")
        `,
        [title, description]
    );

    const product = await getProduct(id);
    return product;
}

export async function updateProduct(id, title, description, image, feild, category, sub, quantity, price) {
    const product = await getProduct(id);

    if (product) {
        // если продукта найден, обновляем
        const filters = [];
        const params = [];

        if (title) {
            filters.push("title = ?");
            params.push(title);
        }

        if (description) {
            filters.push("description = ?");
            params.push(description);
        }

        if (image) {
            filters.push("image = ?");
            params.push(image);
        }

        if (feild) {
            filters.push("feildOfApplication = ?");
            params.push(feild);
        }

        if (category) {
            filters.push("category = ?");
            params.push(category);
        }

        if (sub) {
            filters.push("subcategory = ?");
            params.push(sub);
        }

        if (quantity) {
            filters.push("quantity = ?");
            params.push(quantity);
        }

        if (price) {
            filters.push("price = ?");
            params.push(price);
        }

        await db.query(
            `
                UPDATE products SET ${filters.join(",")}
                WHERE id="${id}"
            `,
            params
        );

        const updatedProduct = await getProduct(id);
        return updatedProduct;
    } else {
        return null;
    }
}

export async function deleteProduct(id) {
    const product = await getProduct(id);

    if (product) {
        await db.query(`DELETE FROM products WHERE id = "${id}"`);
    }

    return product;
}

async function getLastProductId() {
    const lastId = await db.query("SELECT id FROM products ORDER BY id DESC LIMIT 1");

    if (lastId[0][0]) {
        return lastId[0][0].id;
    }

    return null; // записей еще нет
}
