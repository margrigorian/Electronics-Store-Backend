import { checkToken } from "../servicing/authService.js";
import getResponseTemplate from "../lib/responseTemplate.js";

export function authenticate(access = false) {
    return async (req, res, next) => {
        try {
            let message;
            const response = getResponseTemplate();

            const bearer = req.headers.authorization || "";
            const token = bearer.split(" ")[1];
            const user = await checkToken(token);

            if (user) {
                // токен есть, актуальный, user найден
                req.body = { ...req.body, forUser: user }; // доп.

                if (access) {
                    // доступ к действиям, определяется путем url, поэтому проверка админа обязательна

                    if (user.status === "admin") {
                        next();
                        return;
                    }

                    message = "403 Forbidden"; // прав на действия нет
                    response.error = {
                        message
                    };
                    return res.status(403).json(response);
                } else {
                    next();
                    return;
                }
            }

            message = "401 Unauthorized";
            response.error = {
                message
            };
            return res.status(401).json(response);
        } catch (err) {
            const message = "500 Server Error";
            const response = getResponseTemplate();
            response.error = {
                message
            };
            return res.status(500).json(response);
        }
    };
}
