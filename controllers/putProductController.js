import getResponseTemplate from "../lib/responseTemplate.js";
import { updateProduct } from "../db/slices/products.js";

export async function putProductController(req, res) {
    try {
        let { id, title, description, feildOfApplication, category, subcategory, quantity, price } = req.body;
        let image;

        req.file ? (image = req.file.path) : (image = "");
        quantity ? (quantity = +quantity) : (quantity = "");
        price ? (price = +price) : (price = "");

        const response = getResponseTemplate();
        const data = await updateProduct(+id, title, description, image, feildOfApplication, category, subcategory, +quantity, +price);

        if (data) {
            response.data = {
                data
            };
            return res.status(201).json(response);
        }

        const message = "The product not found"; // в случае неверного id продукта
        response.error = {
            message
        };
        return res.status(404).json(response); // или 406 из-за некорректного id?
    } catch (err) {
        const message = "500 Server Error";
        const response = getResponseTemplate();
        response.error = {
            message
        };
        return res.status(500).json(response);
    }
}
