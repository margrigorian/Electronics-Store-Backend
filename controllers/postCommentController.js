import getResponseTemplate from "../lib/responseTemplate.js";
import { postComment } from "../db/slices/products.js";

export async function postCommentController(req, res) {
    try{
        const { productId, comment, forUser} = req.body;
        const response = getResponseTemplate();
        const data = await postComment(+productId, comment, forUser.id);
        
        if(data) { // продукт существует, комментарий добавлен
            response.data = {
                data
            }
            return res.status(201).json(response);
        }

        const message = "The product not found"; // в случае неверного id продукта
        response.error = {
            message
        }
        return res.status(404).json(response); 
    }catch(err) {
        const message = "500 Server Error";
        const response = getResponseTemplate();
        response.error = {
            message
        }
        return res.status(500).json(response);
    }
}