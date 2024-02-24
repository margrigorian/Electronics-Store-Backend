import getResponseTemplate from "../lib/responseTemplate.js";
import { getStructureOfProductCategories, getProductList } from "../db/slices/products.js";
import { addAvgRatingAndCommentsToProducts } from "../db/slices/evaluation.js";

export async function allProductsController(req, res) {
    try {
        let { q, subcategory, minPrice, maxPrice, order, page, limit } = req.query; // может быть "", undefined

        minPrice ? (minPrice = +minPrice) : (minPrice = "");
        maxPrice ? (maxPrice = +maxPrice) : (maxPrice = "");
        page ? (page = +page) : (page = 1);
        limit ? (limit = +limit) : (limit = 5);

        let data = "";

        const structure = await getStructureOfProductCategories();

        // значит список продуктов не пуст, раз есть структуры
        if (structure) {
            const productsList = await getProductList(q, "", subcategory, minPrice, maxPrice, order, page, limit);
            // получаем productsList с доп. инфорамцией
            // при search может быть null, поэтому необходима проверка
            if (productsList) {
                const productListWithAdditionalInfo = await addAvgRatingAndCommentsToProducts(productsList.products);
                // заменяем изначальный productsList
                productsList.products = productListWithAdditionalInfo.products;
            }

            data = {
                structure,
                ...productsList
            };
        }

        const response = getResponseTemplate();

        if (data) {
            response.data = {
                data
            };
            return res.status(200).json(response);
        }

        const message = "404 NOT FOUND"; // список продуктов пуст
        response.error = {
            message
        };
        return res.status(404).json(response);
    } catch (err) {
        const message = "500 Server Error";
        const response = getResponseTemplate();
        response.error = {
            message
        };
        res.status(500).json(response);
    }
}
