import getResponseTemplate from "../lib/responseTemplate.js";
import { getComment, deleteComment } from "../db/slices/evaluation.js";

export async function deleteCommentController(req, res) {
    try {
        const { commentId, forUser } = req.body;
        const response = getResponseTemplate();
        let message;

        const comment = await getComment(commentId);

        if (comment) {
            if (forUser.status === "admin" || comment.comment.user_id === forUser.id) {
                await deleteComment(commentId);

                response.data = {
                    data: comment
                };
                return res.status(200).json(response);
            }

            message = "403 Forbidden"; // прав на удаление комментария нет
            response.error = {
                message
            };
            return res.status(403).json(response);
        }

        message = "The comment not found"; // в случае неверного comment_id
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
