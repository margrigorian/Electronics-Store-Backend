import express from "express";
import { authenticate } from "../middlewares/authenticate.js";
import { validate } from "../middlewares/validate.js";
import { queriesParamsValidate } from "../middlewares/queriesParamsValidate.js";
import { feildOfApplicationController } from "../controllers/feildOfApplicationController.js";
import { productListController } from "../controllers/productListController.js";
import { searchController } from "../controllers/searchController.js";
import { productController } from "../controllers/productController.js";
import { postCommentAndRateController } from "../controllers/postCommentAndRateController.js";
import { putCommentAndRateController } from "../controllers/putCommentAndRateController.js";
import { deleteCommentController } from "../controllers/deleteCommentController.js";

const router = express.Router();

// router.get("/home"); // популярные продукты
router.get("/smart-home", feildOfApplicationController);
router.get("/life-style", feildOfApplicationController);
router.get("/product-list/:category", queriesParamsValidate("productListQueries"), productListController);
router.get("/search", queriesParamsValidate("searchQueries"), searchController);
router.get("/product/:id", validate("getProduct"), productController);
router.post("/product/:id", authenticate(), queriesParamsValidate("rateQuery"), validate("postComment"), postCommentAndRateController);
router.put("/product/:id", authenticate(), queriesParamsValidate("rateQuery"), validate("putComment"), putCommentAndRateController);
router.delete("/product/:id", authenticate(), validate("deleteComment"), deleteCommentController);

export default router;
