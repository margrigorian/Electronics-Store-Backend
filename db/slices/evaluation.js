import db from "../db.js";

export async function getComment(commentId) {
    const comment = await db.query(`SELECT * FROM product_comments WHERE comment_id = "${commentId}"`);

    if (comment[0][0]) {
        return {
            comment: comment[0][0]
        };
    }

    return null;
}

export async function postComment(productId, comment, userId) {
    let commentId = await getLastCommentId();

    if (commentId) {
        commentId = commentId + 1;
    } else {
        commentId = 1; // самый первый комментарий
    }

    await db.query(
        `
            INSERT INTO product_comments(product_id, comment_id, comment, user_id) 
            VALUES("${productId}", "${commentId}", "${comment}", "${userId}")
        `
    );

    const postedComment = await getComment(commentId);
    return postedComment;
}

export async function putComment(commentId, comment) {
    // обновляем
    await db.query(`UPDATE product_comments SET comment = "${comment}" WHERE comment_id = "${commentId}"`);
    // запрашиваем обновленный комментарий
    const updatedComment = await getComment(commentId);
    return updatedComment;
}

export async function deleteComment(commentId) {
    await db.query(`DELETE FROM product_comments WHERE comment_id = "${commentId}"`);
}

export async function getUserRateOfProduct(productId, userId) {
    const rate = await db.query(`SELECT * FROM product_rating WHERE product_id = "${productId}" AND user_id = "${userId}"`);

    if (rate[0][0]) {
        return {
            rate: rate[0][0]
        };
    }

    return null;
}

export async function postRate(productId, rate, userId) {
    const userRate = await getUserRateOfProduct(productId, userId);

    // правило: один пользователь -  одна оценка к товару, иначе будет дублирование строк в БД
    if (!userRate) {
        await db.query(
            `
            INSERT INTO product_rating(product_id, rate, user_id) 
            VALUES("${productId}", "${rate}", "${userId}")
            `
        );

        const postedRate = await getUserRateOfProduct(productId, userId);
        return postedRate;
    }

    return null;
}

export async function putRate(productId, rate, userId) {
    // дублирование можно останавливать на front
    await db.query(
        `
            UPDATE product_rating SET rate = "${rate}" 
            WHERE product_id = "${productId}" AND user_id = "${userId}"
        `
    );
    // запрашиваем обновленный объект с информацией об оценке
    const updatedRate = await getUserRateOfProduct(productId, userId);
    return updatedRate;
}

async function getLastCommentId() {
    const lastId = await db.query("SELECT comment_id FROM product_comments ORDER BY comment_id DESC LIMIT 1");

    if (lastId[0][0]) {
        return lastId[0][0].comment_id;
    }

    return null; // комментариев еще нет
}

// DELETE
// async function getLastRateId() {
//     const lastId = await db.query("SELECT rate_id FROM product_rating ORDER BY rate_id DESC LIMIT 1");

//     if(lastId[0][0]) {
//         return lastId[0][0].rate_id;
//     }

//     return null; // оценок еще нет
// }

export async function getAvgRating(id) {
    let avgRating = await db.query(`SELECT AVG(rate) AS rate FROM product_rating WHERE product_id = "${id}"`);

    if (avgRating[0][0].rate) {
        // оценки присутствуют
        avgRating = +avgRating[0][0].rate;
    } else {
        avgRating = avgRating[0][0].rate; // будет null
    }

    return avgRating;
}

// используется в getProduct
export async function getCommentsWithRates(id) {
    const comments = await db.query(
        `
            SELECT c.comment_id, c.comment, r.rate, c.user_id, u.username FROM product_comments c
            INNER JOIN users u ON c.user_id = u.id
            LEFT JOIN product_rating r ON c.user_id = r.user_id AND c.product_id = r.product_id
            WHERE c.product_id = "${id}"
        `
    );

    return comments[0];
}

export async function getRates(id) {
    const rates = await db.query(`SELECT user_id, rate FROM product_rating WHERE product_id = "${id}"`);

    return rates[0];
}

// для allProductsController
export async function addAvgRatingAndCommentsToProducts(products) {
    let filledProductsArr = products.map(async el => {
        const avgRating = await getAvgRating(el.id);
        const comments = await getCommentsWithRates(el.id);
        el = { ...el, avgRating, comments };
        return el;
    });

    filledProductsArr = await Promise.all(filledProductsArr).then(arr => arr);

    return {
        products: filledProductsArr
    };
}
