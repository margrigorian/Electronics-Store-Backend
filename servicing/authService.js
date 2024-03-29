import bcript from "bcryptjs";
import jwt from "jsonwebtoken";
import { secret } from "../lib/config.js";
import { getUser, addUser } from "../db/slices/users.js";

export async function checkUser(email, password) {
    // будет исп. и при регистрации и при логине
    const user = await getUser(email); // будет проходить проверка в базе данных
    let areSamePassword = undefined;

    if (user) {
        areSamePassword = await bcript.compare(password, user.password); // проверка соответствия пароля
        delete user.password; // чтобы на front не был отправлен пароль
    }

    if (user && areSamePassword) {
        return user;
    } else {
        return null;
    }
}

export async function addNewUser(username, email, password) {
    const hashpassword = await bcript.hash(password, 10);
    const newUser = await addUser(username, email, hashpassword);
    delete newUser.password; // чтобы на front не был отправлен пароль
    return newUser;
}

export function getToken(email) {
    const payload = {
        email
    };

    const token = jwt.sign(payload, secret, { expiresIn: "12h" });
    return token;
}

export async function checkToken(token) {
    try {
        const decodedToken = jwt.verify(token, secret); // при ошибке пробрасывает throw
        const user = await getUser(decodedToken.email); // проверка наличия юзера с таким email, возращ. объект c пользователем

        if (user) {
            // пользователь найден
            return user;
        } else {
            return null;
        }
    } catch (err) {
        return null; // в случае ошибки jwt.verify
    }
}
