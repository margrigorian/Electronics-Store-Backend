import getResponseTemplate from "../lib/responseTemplate.js";

export async function productListController(req, res) {
    try{
        let products = "OK";

        const response = getResponseTemplate();
        response.data = {
            products
        }

        return res.status(200).json(response);
    }catch(err) {
        const message = "500 Server Error";
        const response = getResponseTemplate();
        response.error = {
            message
        }
        res.status(500).json(response);
    }
}