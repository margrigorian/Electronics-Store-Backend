import z from "zod";
import responseTemplate from "../lib/responseTemplate.js";

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
            })
        }

        validatedData = schemas[action].safeParse(req.body);

        if(validatedData.success) {
            next();
            return;
        }

        const message = "The sent data is incorrect";
        const response = responseTemplate;
        response.error = {
            message
        };
        return res.status(406).json(response);
    }
}