import getResponseTemplate from "../lib/responseTemplate.js";
import { checkProductExistence, postProduct } from "../db/slices/products.js";

export async function postProductController(req, res) {
    try {
        const { title, description, feildOfApplication, category, subcategory, quantity, price } = req.body;
        const image = req.file.filename;

        const product = await checkProductExistence(title);
        const response = getResponseTemplate();

        if (product === null) {
            // продукт не должен дублироваться
            const data = await postProduct(title, description, image, feildOfApplication, category, subcategory, +quantity, +price);

            response.data = {
                data
            };
            return res.status(201).json(response);
        }

        const message = "The product already exists. Change the product title";
        response.error = {
            message
        };
        return res.status(406).json(response); // ошибка некорректных данных
    } catch (err) {
        const message = "500 Server Error";
        const response = getResponseTemplate();
        response.error = {
            message
        };
        return res.status(500).json(response);
    }
}
