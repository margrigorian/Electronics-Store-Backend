import getResponseTemplate from "../lib/responseTemplate.js";
import { getProductList } from "../db/slices/products.js";

export async function searchController(req, res) {
    try {
        let { q, subcategory, minPrice, maxPrice, order, page, limit } = req.query; // может быть "", undefined

        minPrice ? (minPrice = +minPrice) : (minPrice = "");
        maxPrice ? (maxPrice = +maxPrice) : (maxPrice = "");
        page ? (page = +page) : (page = 1);
        limit ? (limit = +limit) : (limit = 8);
        // category не передаем, остальное для фильтрации

        const data = await getProductList(q, "", subcategory, minPrice, maxPrice, order, page, limit);

        const response = getResponseTemplate();

        response.data = {
            data
        };
        return res.status(200).json(response);

        // ПРИ ПУСТОМ ПОИСКЕ НЕ ДОЛЖНО БЫТЬ ОШИБКИ
        // const message = "404 NOT FOUND"; // поиск нулевой
        // response.error = {
        //     message
        // };
        // return res.status(404).json(response);
    } catch (err) {
        const message = "500 Server Error";
        const response = getResponseTemplate();
        response.error = {
            message
        };
        res.status(500).json(response);
    }
}
