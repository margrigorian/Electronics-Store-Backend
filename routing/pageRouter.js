import express from "express";
import { validate } from "../middlewares/validate.js";
import { feildOfApplicationController } from "../controllers/feildOfApplicationController.js";
import { productListController } from "../controllers/productListController.js";

const router = express.Router();

// router.get("/"); // home, популярные продукты
router.get("/smart-home", feildOfApplicationController);
router.get("/life-style", feildOfApplicationController);
router.get("/product-list/:category", validate("productListQueries"), productListController);

export default router;