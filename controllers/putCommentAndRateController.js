import getResponseTemplate from "../lib/responseTemplate.js";
import { getProduct } from "../db/slices/products.js";
import { getComment, putComment, getUserRateOfProduct, putRate } from "../db/slices/evaluation.js";

export async function putCommentAndRateController(req, res) {
    try {
        const { productId, commentId, comment, forUser } = req.body;
        const { rate } = req.query;
        const response = getResponseTemplate();
        let message;
        let data = "";

        const product = await getProduct(productId);
        // проверка в случае неверного productId через POSTMAN params
        if (product) {
            if (commentId && comment) {
                // put на comment

                const productComment = await getComment(commentId); // проверка наличия соответ. комментария
                // комментарий должен отновиться к продукту с указанным id
                if (productComment && productComment.comment.product_id === product.product.id) {
                    // право на обновление, "это твой комментарий?"
                    if (productComment.comment.user_id === forUser.id) {
                        data = await putComment(commentId, comment);
                    } else {
                        message = "403 Forbidden"; // прав на обновления комментария нет
                        response.error = {
                            message
                        };
                        return res.status(403).json(response);
                    }
                }
            } else if (rate) {
                // put на rate
                const productRate = await getUserRateOfProduct(+productId, forUser.id); // проверка наличия соответ. оценки

                if (productRate) {
                    data = await putRate(+productId, +rate, forUser.id);
                }
            }

            if (data) {
                // комментарий или оценка существует, они обновлены
                response.data = {
                    data
                };
                return res.status(201).json(response);
            }
        }

        // комментария или оценки не нет, обновить их нельзя
        message = "400 Bad Request";
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
