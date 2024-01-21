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
            }),
            post: z.object({
                title: z.string().min(2),
                description: z.string().min(2),
                feildOfApplication: z.union([z.literal("smart-home"), z.literal("life-style")]),
                category: z.union([
                    z.literal("kitchen appliance"), z.literal("office"), z.literal("wearable")
                ]),
                subcategory: z.union([
                    // все ли описывается?
                    z.literal("kettle"), z.literal("laptop"), z.literal("tablet"), z.literal("monitor"), z.literal("router"),
                    z.literal("watch"), z.literal("headphones"), z.literal("other")
                ]),
                quantity: z.preprocess((a) => parseInt(String(a), 10), z.number().nonnegative()), // допускается 0
                price: z.preprocess((a) => parseInt(String(a), 10), z.number().positive()),
            }),
            put: z.object({
                id: z.preprocess((a) => parseInt(String(a), 10), z.number().positive()),
                title: z.union([z.string().min(2), z.literal(""), z.undefined()]),
                description: z.union([z.string().min(2), z.literal(""), z.undefined()]),
                feildOfApplication: z.union([
                    z.literal("smart-home"), z.literal("life-style"), 
                    z.literal(""), z.undefined()
                ]),
                category: z.union([
                    z.literal("kitchen appliance"), z.literal("office"), z.literal("wearable"), 
                    z.literal(""), z.undefined()
                ]),
                subcategory: z.union([
                    z.literal("kettle"), z.literal("laptop"), z.literal("tablet"), z.literal("monitor"), z.literal("router"),
                    z.literal("watch"), z.literal("headphones"), z.literal("other"),
                     z.literal(""), z.undefined()
                ]),
                quantity: z.preprocess((a) => a === "" ? a : parseInt(String(a), 10), z.union([z.number().nonnegative(), z.literal("")])).optional(z.undefined()),
                price: z.preprocess((a) => a === "" ? a : parseInt(String(a), 10), z.union([z.number().positive(), z.literal("")])).optional(z.undefined())
            })
        }

        let validatedData;
        const queryParams = req.query;
        
        if(Object.keys(queryParams).length > 0) {
            validatedData = schemas[action].safeParse(queryParams);

            const min = queryParams.minPrice;
            const max = queryParams.maxPrice;

            if(validatedData.success) {
                // допускается undefined/"" и верное мат. сравнение
                if(!min || !max || min < max) {
                    next();
                    return;
                }
            }
        }else {
            validatedData = schemas[action].safeParse(req.body);

            if(validatedData.success) {
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