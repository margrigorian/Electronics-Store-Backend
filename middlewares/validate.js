import z from "zod";
import getResponseTemplate from "../lib/responseTemplate.js";

export function validate(action) {
    return (req, res, next) => {
        
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
            productListQueries: z.object({
                // .optional обрабатывает undefined, NaN - нет
                subcategory: z.union([z.string(), z.literal(""), z.undefined()]),
                // допустила number, "", undefined; в случае NaN случится ошибка (например, при "text")
                minPrice: z.preprocess((a) => a === "" ? a : parseInt(String(a), 10), z.union([z.number().positive(), z.literal("")])).optional(z.undefined()),
                maxPrice: z.preprocess((a) => a === "" ? a : parseInt(String(a), 10), z.union([z.number().positive(), z.literal("")])).optional(z.undefined()),
                order: z.union([z.literal("asc"), z.literal("desc"), z.literal("")]).optional(z.undefined()),
                page: z.preprocess((a) => a === "" ? a : parseInt(String(a), 10), z.union([z.number().positive(), z.literal("")])).optional(z.undefined()),
                limit: z.preprocess((a) => a === "" ? a : parseInt(String(a), 10), z.union([z.number().positive(), z.literal("")])).optional(z.undefined())
                // лишние query-параметры не препятсвуют запросу
            }),
            searchQueries: z.object({
                q: z.string().min(1),
                subcategory: z.union([z.string(), z.literal(""), z.undefined()]),
                page: z.preprocess((a) => a === "" ? a : parseInt(String(a), 10), z.union([z.number().positive(), z.literal("")])).optional(z.undefined()),
                limit: z.preprocess((a) => a === "" ? a : parseInt(String(a), 10), z.union([z.number().positive(), z.literal("")])).optional(z.undefined())
            })
        }

        let validatedData;
        const queryParams = req.query;
        
        if(Object.keys(queryParams).length > 0) {
            validatedData = schemas[action].safeParse(queryParams);
        }else {
            validatedData = schemas[action].safeParse(req.body);
        }

        const min = queryParams.minPrice;
        const max = queryParams.maxPrice;

        if(validatedData.success) {
            // допускается undefined/"" и верное мат. сравнение
            if(!min || !max || min < max) {
                next();
                return;
            }
        }

        const message = "The sent data is incorrect";
        const response = getResponseTemplate();
        response.error = {
            message
        };

        return res.status(406).json(response);
    }
}