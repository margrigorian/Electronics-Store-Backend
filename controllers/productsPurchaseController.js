import getResponseTemplate from "../lib/responseTemplate.js";
import { postOrder} from "../db/slices/orders.js";

export async function productsPurchaseController(req, res) {
    try{
        const { order, forUser } = req.body;
        const response = getResponseTemplate();

        const data = await postOrder(order, forUser.id);
        
        if(data.order.length > 0) {
            response.data = {
                data
            }
            return res.status(201).json(response);
        }
        
        // id продуктов в заказе неверные или же заказанные товары отсутвуют "на складе" (quantity = 0)
        const message = "The sent data is incorrect";
        response.error = {
            message
        }
        return res.status(406).json(response);
    }catch(err) {
        const message = "500 Server Error";
        const response = getResponseTemplate();
        response.error = {
            message
        }
        return res.status(500).json(response);
    }
}