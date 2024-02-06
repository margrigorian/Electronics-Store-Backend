import z from "zod";
import getResponseTemplate from "../lib/responseTemplate.js";

export function queriesParamsValidate(action) {
    return (req, res, next) => {
        const schemas = {
            allProductsQueries: z.object({
                page: z
                    .preprocess(a => (a === "" ? a : parseInt(String(a), 10)), z.union([z.number().positive(), z.literal("")]))
                    .optional(z.undefined()),
                limit: z
                    .preprocess(a => (a === "" ? a : parseInt(String(a), 10)), z.union([z.number().positive(), z.literal("")]))
                    .optional(z.undefined())
            }),
            productListQueries: z.object({
                // .optional обрабатывает undefined, NaN - нет
                category: z.union([z.literal("kitchen appliance"), z.literal("office"), z.literal("wearable"), z.literal(""), z.undefined()]),
                subcategory: z.union([
                    z.literal("kettle"),
                    z.literal("laptop"),
                    z.literal("tablet"),
                    z.literal("monitor"),
                    z.literal("router"),
                    z.literal("watch"),
                    z.literal("headphones"),
                    z.literal("other"),
                    z.literal(""),
                    z.undefined()
                ]),
                // допустила number, "", undefined; в случае NaN случится ошибка (например, при "text")
                minPrice: z
                    .preprocess(a => (a === "" ? a : parseInt(String(a), 10)), z.union([z.number().positive(), z.literal("")]))
                    .optional(z.undefined()),
                maxPrice: z
                    .preprocess(a => (a === "" ? a : parseInt(String(a), 10)), z.union([z.number().positive(), z.literal("")]))
                    .optional(z.undefined()),
                order: z.union([z.literal("asc"), z.literal("desc"), z.literal("")]).optional(z.undefined()),
                page: z
                    .preprocess(a => (a === "" ? a : parseInt(String(a), 10)), z.union([z.number().positive(), z.literal("")]))
                    .optional(z.undefined()),
                limit: z
                    .preprocess(a => (a === "" ? a : parseInt(String(a), 10)), z.union([z.number().positive(), z.literal("")]))
                    .optional(z.undefined())
                // лишние query-параметры не препятсвуют запросу
            }),
            searchQueries: z.object({
                q: z.string().optional(z.undefined()),
                subcategory: z.union([
                    z.literal("kettle"),
                    z.literal("laptop"),
                    z.literal("tablet"),
                    z.literal("monitor"),
                    z.literal("router"),
                    z.literal("watch"),
                    z.literal("headphones"),
                    z.literal("other"),
                    z.literal(""),
                    z.undefined()
                ]),
                // допустила number, "", undefined; в случае NaN случится ошибка (например, при "text")
                minPrice: z
                    .preprocess(a => (a === "" ? a : parseInt(String(a), 10)), z.union([z.number().positive(), z.literal("")]))
                    .optional(z.undefined()),
                maxPrice: z
                    .preprocess(a => (a === "" ? a : parseInt(String(a), 10)), z.union([z.number().positive(), z.literal("")]))
                    .optional(z.undefined()),
                order: z.union([z.literal("asc"), z.literal("desc"), z.literal("")]).optional(z.undefined()),
                page: z
                    .preprocess(a => (a === "" ? a : parseInt(String(a), 10)), z.union([z.number().positive(), z.literal("")]))
                    .optional(z.undefined()),
                limit: z
                    .preprocess(a => (a === "" ? a : parseInt(String(a), 10)), z.union([z.number().positive(), z.literal("")]))
                    .optional(z.undefined())
            }),
            rateQuery: z.object({
                rate: z.preprocess(a => parseInt(String(a), 10), z.union([z.number().min(1).max(5)])).optional(z.undefined())
            })
        };

        let queryParams;
        const { category } = req.params;
        category ? (queryParams = { ...req.query, category }) : (queryParams = req.query);

        const validatedData = schemas[action].safeParse(queryParams);

        const min = queryParams.minPrice;
        const max = queryParams.maxPrice;

        if (validatedData.success) {
            // допускается undefined/"" и верное мат. сравнение
            if (!min || !max || min < max) {
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
    };
}
