import db from "../db.js";
import { getProduct } from "./products.js";

export async function postOrder(userOrder, userId) {
    // проверка наличия заказанных товаров
    let orderedProducts = userOrder.map(async (el, i) => {
        let product = await getProduct(el.productId);

        if(product) {
            product = product.product;
            product.quantity = userOrder[i].quantity; // заменила общее количество на заказанное юзером
            return product;
        }

        return null;
    });

    orderedProducts = await Promise.all(orderedProducts).then(result => result);
    // убираем null значения и оставляем продукты с количеством > 0 
    orderedProducts = orderedProducts.filter(item => item && item.quantity > 0);

    const orderIdArr = []; // для запросов к таблице order
    let order = []; // результирующий массив заказанных продуктов
    
    if(orderedProducts.length > 0) { // заказанные продукты существуют
        let orderId = await getOrderId();
        const params = [];
        let expression = [];
        
        orderedProducts.forEach(async el => {

            expression.push("(?, ?, ?, ?, ?, ?)");

            params.push(orderId);
            params.push(el.id);
            params.push(el.title);
            params.push(el.price);
            params.push(el.quantity);
            params.push(userId);
            
            orderIdArr.push(orderId);
            orderId += 1;
        })

        // множественный insert в таблицу order
        await db.query(
            `
                INSERT INTO orders(order_id, product_id, product_title, product_price, quantity, user_id)
                VALUES ${expression.join(",")}
            `,
            params
        );

        // запрашиваем информацию о заказах из таблицы order
        order = orderIdArr.map(async id => {
            const product = await getOrderedProduct(id);
            return product;
        });

        order = await Promise.all(order).then(orders => orders);
    }

    return {
        order
    };
}

async function getOrderId() {
    let id = await db.query('SELECT order_id FROM orders ORDER BY order_id DESC LIMIT 1');
    
    if(id[0][0]) {
        id = id[0][0].order_id + 1;
        return id;
    }else {
        id = 1; // самый первый заказ
        return id
    }
}

async function getOrderedProduct(orderId) {
    const orderedProduct = await db.query(`SELECT * FROM orders WHERE order_id = "${orderId}"`);
    return orderedProduct[0][0];
}