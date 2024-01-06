import bcript from "bcryptjs";
import { getUser } from "../db/slices/users.js";

export async function checkUser(email, password) { // будет исп. и при рег-и и при логине 
    const user = await getUser(email); // будет проходить проверка в базе данных
    let areSamePassword = undefined;

    if(user) {
        areSamePassword = await bcript.compare(password, user.password); // проверка соответствия пароля
    }

    if(user && areSame) {
        return user;
    }else {
        return null;
    }
}