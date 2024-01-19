import db from "../db.js";

export async function getFeildOfApplicationCategories(feildOfApplication) {
    // определяем категории продуктов, относящиеся к указанной области применения
    const categories = await db.query(
        `
            SELECT category FROM products WHERE feildOfApplication = "${feildOfApplication}" 
            GROUP BY category
        `
    );

    // В-I

    // запрашиваем продукты указанных категорий, на выходе - массивы промисов
    let products_list = categories[0].map(async (el, i) => {
        const products = await db.query(
            `SELECT id, title, picture, price FROM products WHERE category = "${el.category}" LIMIT 3`
        );

        return products[0];
    });

    products_list = await Promise.all(products_list).then(list => list);

    const result = categories[0].map((el, i) => {
        return {category: el.category, products: products_list[i]}; // формируем необходимую структуру
    });


    // В-II

    // запрашиваем продукты указанной области применения
    // const products = await db.query(
    //     `
    //         SELECT id, title, picture, category, price FROM products 
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

    return result;
}

export async function getProductList(search, category, subcategory, minPrice, maxPrice, order, page, limit) {
    const filters = [];
    const params = [];
    
    if(search) {
        filters.push("title LIKE ?");
        params.push(`%${search}%`); 
    }

    if(category !== "") {
        filters.push("category = ?");
        params.push(category);
    }

    if(subcategory) { 
        filters.push("subcategory = ?");
        params.push(subcategory);
    }

    // РАНЖИРОВАНИЕ ЦЕНЫ
    filters.push("price BETWEEN ? AND ?");
    const priceFilter = [];
    const priceParam = [];

    if(subcategory) {
        priceFilter.push("WHERE subcategory = ?");
        priceParam.push(subcategory);
    }else if(category) {
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

    if(minPrice && !maxPrice) {
        params.push(minPrice, priceValues[0][0].max);
    }else if(!minPrice && maxPrice) {
        params.push(priceValues[0][0].min, maxPrice);
    }else if(minPrice && maxPrice) {
        params.push(minPrice, maxPrice);
    }else {
        params.push(priceValues[0][0].min, priceValues[0][0].max);
    }

    // ПАГИНАЦИЯ
    params.push((page - 1) * limit, limit);
    
    const products = await db.query(
        `
            SELECT id, title, picture, price, subcategory FROM products 
            WHERE ${filters.join(" AND ")}
            ${order ? `ORDER BY price ${order === "asc" ? "asc" : "desc"}` : ""}
            LIMIT ?, ?
        `,
        params
    );

    return {
        products: products[0],  
        priceMin : priceValues[0][0].min,
        priceMax : priceValues[0][0].max,
        length: products[0].length
    }
}

export async function getProduct(id) {
    const data = await db.query(`SELECT * FROM products WHERE id = "${id}"`);
    const rating = await db.query(`SELECT AVG(rate) AS rate FROM product_rating WHERE product_id = "${id}"`);
    const comments = await db.query(`SELECT comment FROM product_comments WHERE product_id = "${id}"`);
    const product = {... data[0][0], rating: rating[0][0].rate, comments: comments[0]};

    if(data[0][0]) { // товар с указанным id найден
        return {
            product
        };
    }else {
        return null;
    }
}