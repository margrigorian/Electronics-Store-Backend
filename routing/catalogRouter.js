import express from "express";
import { validate } from "../middlewares/validate.js";
import { feildOfApplicationController } from "../controllers/feildOfApplicationController.js";
import { productListController } from "../controllers/productListController.js";
import { searchController } from "../controllers/searchController.js";
import { productController } from "../controllers/productController.js";

const router = express.Router();

// router.get("/"); // home, популярные продукты
router.get("/smart-home", feildOfApplicationController);
router.get("/life-style", feildOfApplicationController);
router.get("/product-list/:category", validate("productListQueries"), productListController);
router.get("/search", validate("searchQueries"), searchController);
router.get("/product/:id", productController);

export default router;