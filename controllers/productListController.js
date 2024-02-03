import getResponseTemplate from "../lib/responseTemplate.js";
import { getProductList } from "../db/slices/products.js";

export async function productListController(req, res) {
    try {
        const { category } = req.params;
        let { subcategory, minPrice, maxPrice, order, page, limit } = req.query; // может быть "", undefined

        minPrice ? (minPrice = +minPrice) : (minPrice = "");
        maxPrice ? (maxPrice = +maxPrice) : (maxPrice = "");
        page ? (page = +page) : (page = 1);
        limit ? (limit = +limit) : (limit = 5);

        const data = await getProductList("", category, subcategory, minPrice, maxPrice, order, page, limit);
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
