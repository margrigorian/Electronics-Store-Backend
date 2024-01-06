import db from "../db.js";

export async function getUser(email) {
    const user = await db.query(`SELECT * FROM users WHERE email = "${email}"`); // без "" не работает
    console.log(user);
    return user[0][0];
}