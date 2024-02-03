import db from "../db.js";

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
            const products = await db.query(`SELECT id, title, image, price FROM products WHERE category = "${el.category}" LIMIT 3`);

            return products[0];
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
    const subcategories = await db.query(`SELECT DISTINCT subcategory FROM products WHERE category = "${category}"`);

    // РАНЖИРОВАНИЕ ЦЕНЫ
    filters.push("price BETWEEN ? AND ?");
    const priceFilter = [];
    const priceParam = [];

    if (subcategory) {
        priceFilter.push("WHERE subcategory = ?");
        priceParam.push(subcategory);
    } else if (category) {
        priceFilter.push("WHERE category = ?");
        priceParam.push(category);
    }

    const priceValues = await db.query(
        `
            SELECT CEIL(MAX(price)) AS max, FLOOR(MIN(price)) AS min FROM products
            ${priceFilter.length > 0 ? priceFilter[0] : ""}
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
    const products = await db.query(
        `
            SELECT id, title, image, price, AVG(rate) AS rate, category, subcategory FROM products 
            LEFT JOIN product_rating ON products.id = product_rating.product_id
            GROUP BY id
            HAVING ${filters.join(" AND ")}
            ${order ? `ORDER BY price ${order === "asc" ? "asc" : "desc"}` : ""}
            LIMIT ?, ?
        `,
        params
    );

    // COUNT срабатывает неточно, приходится дублировать для получения общего кол-ва товаров
    const productsQuantity = await db.query(
        `
            SELECT id, title, image, price, AVG(rate) AS rate, category, subcategory FROM products 
            LEFT JOIN product_rating ON products.id = product_rating.product_id
            GROUP BY id
            HAVING ${filters.join(" AND ")}
            ${order ? `ORDER BY price ${order === "asc" ? "asc" : "desc"}` : ""}
        `,
        params
    );

    if (products[0].length > 0) {
        // Корректна ли проверка? Возможна ли ошибка priceValues при пустом списке?
        return {
            products: products[0],
            subcategories: subcategories[0],
            priceMin: priceValues[0][0].min,
            priceMax: priceValues[0][0].max,
            length: productsQuantity[0].length
        };
    } else {
        return null;
    }
}

export async function getProduct(id) {
    const data = await db.query(`SELECT * FROM products WHERE id = "${id}"`);

    if (data[0][0]) {
        // товар с указанным id найден

        const avgRating = await getAvgRating(id);
        const comments = await getComments(id);

        // user_id - для отрисовки оценки с комментариями
        const rates = await db.query(
            `
                SELECT rate, user_id FROM product_rating 
                WHERE product_id = "${id}"
            `
        );
        const product = { ...data[0][0], avgRating, comments, rates: rates[0] };

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

// перенести в evaluation slice?
async function getAvgRating(id) {
    let avgRating = await db.query(`SELECT AVG(rate) AS rate FROM product_rating WHERE product_id = "${id}"`);

    if (avgRating[0][0].rate) {
        // оценки присутствуют
        avgRating = +avgRating[0][0].rate;
    } else {
        avgRating = avgRating[0][0].rate; // будет null
    }

    return avgRating;
}

async function getComments(id) {
    const comments = await db.query(
        `
            SELECT c.comment_id, c.comment, c.user_id, u.username FROM product_comments c
            INNER JOIN users u ON  c.user_id = u.id
            WHERE c.product_id = "${id}"
        `
    );

    return comments[0];
}

export async function addAvgRatingAndCommentsToProducts(products) {
    let fiiledProductsArr = products.map(async el => {
        const avgRating = await getAvgRating(el.id);
        const comments = await getComments(el.id);
        el = { ...el, avgRating, comments };
        return el;
    });

    fiiledProductsArr = await Promise.all(fiiledProductsArr).then(arr => arr);

    return {
        products: fiiledProductsArr
    };
}
