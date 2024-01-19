import getResponseTemplate from "../lib/responseTemplate.js";
import { getProduct } from "../db/slices/products.js";

export async function productController(req, res) {
    try{
        const { id } = req.params;
        const data = await getProduct(+id);

        const response = getResponseTemplate();
        response.data = {
            data
        }
        res.status(200).json(response);
    }catch(err) {
        const message = "500 Server Error";
        const response = getResponseTemplate();
        response.error = {
            message
        }
        res.status(500).json(response);
    }
}