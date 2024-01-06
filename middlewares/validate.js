import z from "zod";
import responseTemplate from "../lib/responseTemplate.js";

export async function validate(action) {
    return (req, res, next) => {

        const schemas = {
            registartion: z.object({
                username: z.string.min(1),
                email: z.email(),
                phone: z.number().min(11),
                password: z.string.min(5)
            }),
            authorization: z.object({
                emailOrPhone: z.email() || z.number.min(11),
                password: z.string().min(5)
            }),
        }

        const validatedData = schemas[action].safeParse(req.body);
        if(validatedData.success) {
            next();
            return;
        }

        const message = "The sent data is incorrect";
        const response = responseTemplate;
        response.error = {
            message
        };
        res.status(406).json(response);
        return;
    }
}