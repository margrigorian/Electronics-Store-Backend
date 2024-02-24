import z from "zod";
import getResponseTemplate from "../lib/responseTemplate.js";

export function validate(action) {
    return (req, res, next) => {
        const orderSchemas = z.object({
            productId: z.number().positive(),
            quantity: z.number().positive()
        });

        const schemas = {
            registration: z.object({
                username: z.string().min(1),
                email: z.string().email(),
                password: z.string().min(5)
            }),
            authorization: z.object({
                email: z.string().email(),
                password: z.string().min(5)
            }),
            getProduct: z.object({
                productId: z.preprocess(a => parseInt(String(a), 10), z.number().positive()) // проверка id из params
            }),
            postProduct: z.object({
                title: z.string().min(1),
                description: z.string().min(1),
                // feildOfApplication: z.union([z.literal("smart-home"), z.literal("life-style")]),
                // нет четкой типизации, так как могут вноситься новые категории товаров
                feildOfApplication: z.string().min(1),
                category: z.string().min(1),
                subcategory: z.string().min(1),
                quantity: z.preprocess(a => parseInt(String(a), 10), z.number().nonnegative()), // допускается 0
                price: z.preprocess(a => parseInt(String(a), 10), z.number().positive())
            }),
            putProduct: z.object({
                id: z.preprocess(a => parseInt(String(a), 10), z.number().positive()),
                title: z.union([z.string().min(1), z.literal(""), z.undefined()]),
                description: z.union([z.string().min(1), z.literal(""), z.undefined()]),
                feildOfApplication: z.union([z.string().min(1), z.literal(""), z.undefined()]),
                category: z.union([z.string().min(1), z.literal(""), z.undefined()]),
                subcategory: z.union([z.string().min(1), z.literal(""), z.undefined()]),
                quantity: z
                    .preprocess(a => (a === "" ? a : parseInt(String(a), 10)), z.union([z.number().nonnegative(), z.literal("")]))
                    .optional(z.undefined()),
                price: z
                    .preprocess(a => (a === "" ? a : parseInt(String(a), 10)), z.union([z.number().positive(), z.literal("")]))
                    .optional(z.undefined())
            }),
            postComment: z.object({
                productId: z.preprocess(a => parseInt(String(a), 10), z.number().positive()), // проверка id из params
                comment: z.string().min(2).optional(z.undefined())
            }),
            putComment: z.object({
                productId: z.preprocess(a => parseInt(String(a), 10), z.number().positive()), // проверка id из params
                commentId: z.number().positive().optional(z.undefined()),
                comment: z.string().min(2).optional(z.undefined())
            }),
            deleteComment: z.object({
                commentId: z.number().positive() // отправлено через req.body
            }),
            productsPurchase: z.object({
                order: z.array(orderSchemas)
            })
        };

        const { id } = req.params; // для getProductController и postCommentController
        if (id) {
            req.body = { ...req.body, productId: id };
        }

        const validatedData = schemas[action].safeParse(req.body);

        if (validatedData.success) {
            next();
            return;
        }

        const message = "The sent data is incorrect";
        const response = getResponseTemplate();
        response.error = {
            message
        };

        return res.status(406).json(response);
    };
}
