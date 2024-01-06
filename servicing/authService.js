import bcript from "bcryptjs";
import { getUser, addUser } from "../db/slices/users.js";

export async function checkUser(email, password) { // будет исп. и при регистрации и при логине 
    const user = await getUser(email); // будет проходить проверка в базе данных
    let areSamePassword = undefined;

    if(user) {
        areSamePassword = await bcript.compare(password, user.password); // проверка соответствия пароля
    }

    if(user && areSamePassword) {
        return user;
    }else {
        return null;
    }
}

export async function addNewUser(username, email, password) {
    const hashpassword = await bcript.hash(password, 10);
    let newUser = await addUser(username, email, hashpassword);
    delete newUser.password;
    return newUser;
}