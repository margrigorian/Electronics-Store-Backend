import getResponseTemplate from "../lib/responseTemplate.js";
import { getProduct } from "../db/slices/products.js";
import { postComment, postRate } from "../db/slices/evaluation.js";

export async function postCommentAndRateController(req, res) {
    try {
        const { productId, comment, forUser } = req.body;
        const { rate } = req.query;
        const response = getResponseTemplate();
        let data = "";

        const product = await getProduct(productId);

        if (product) {
            if (comment) {
                // post на comment
                data = await postComment(+productId, comment, forUser.id);
            } else if (rate) {
                // post на rate
                data = await postRate(+productId, +rate, forUser.id);
            }

            if (data) {
                // продукт существует, комментарий или оценка добавлены
                response.data = {
                    data
                };
                return res.status(201).json(response);
            }
        }

        // товара с таким id нет или оценка к продукту уже проставлена, в таком случае post-запрос явл. ошибочным
        const message = "400 Bad Request";
        response.error = {
            message
        };
        return res.status(400).json(response);
    } catch (err) {
        const message = "500 Server Error";
        const response = getResponseTemplate();
        response.error = {
            message
        };
        return res.status(500).json(response);
    }
}
