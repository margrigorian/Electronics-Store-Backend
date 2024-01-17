import url from "url";
import responseTemplate from "../lib/responseTemplate.js";
import { getFeildOfApplicationCategories } from "../db/slices/products.js";
import { log } from "console";

export async function feildOfApplicationController(req, res) {
    try{
        const reqURL = url.parse(req.url, true);
        // frontend в обоих случаях будет отрисовывать весь список категорий продуктов из этой области применения
        const feildOfApplication = reqURL.pathname.split("/"); // область применения продукта ([1])
        // const { category } = req.params; // на front будет "якорем", уточнить использование
    
        const data = await getFeildOfApplicationCategories(feildOfApplication[1]);
        const response = responseTemplate;
        response.data = {
            data
        }
        res.status(200).json(response);
    }catch(err) {
        const message = "500 Server Error";
        const response = responseTemplate;
        response.error = {
            message
        }
        res.status(500).json(response);
    }
}