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