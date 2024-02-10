import getResponseTemplate from "../lib/responseTemplate.js";
import { getProductList } from "../db/slices/products.js";
import { addAvgRatingAndCommentsToProducts } from "../db/slices/evaluation.js";

export async function allProductsController(req, res) {
    try {
        let { page, limit } = req.query;
        page ? (page = +page) : (page = 1);
        limit ? (limit = +limit) : (limit = 5);
        let data = "";

        const productsList = await getProductList("", "", "", "", "", "", page, limit);

        if (productsList) {
            data = await addAvgRatingAndCommentsToProducts(productsList.products);
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
