import db from "../db.js";

export async function getUser(email) {
    const user = await db.query(`SELECT * FROM users WHERE email = "${email}"`); // без "" не работает
    return user[0][0];
}

export async function addUser(username, email, hashpassword) {
    const lastIs = await getLastUserId();
    await db.query(`INSERT INTO users(id, username, email, password) VALUES(${lastIs + 1}, "${username}", "${email}", "${hashpassword}")`);
    return getUser(email);
}

async function getLastUserId() {
    const lastId = await db.query("SELECT id FROM users ORDER BY id DESC LIMIT 1");
    return lastId[0][0].id;
}
