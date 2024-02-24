import express from "express";
import { authenticate } from "../middlewares/authenticate.js";
import { queriesParamsValidate } from "../middlewares/queriesParamsValidate.js";
import { validate } from "../middlewares/validate.js";
import upload from "../middlewares/fileProcessing.js";
import { allProductsController } from "../controllers/allProductsController.js";
import { postProductController } from "../controllers/postProductController.js";
import { putProductController } from "../controllers/putProductController.js";
import { deleteProductController } from "../controllers/deleteProductController.js";
import { productsPurchaseController } from "../controllers/productsPurchaseController.js";

const router = express.Router();

router.get("/admin", authenticate(true), queriesParamsValidate("searchQueries"), allProductsController);
router.post("/admin", authenticate(true), upload.single("image"), validate("postProduct"), postProductController);
router.put("/admin", authenticate(true), upload.single("image"), validate("putProduct"), putProductController);
router.delete("/admin", authenticate(true), queriesParamsValidate("deletionQuery"), deleteProductController);
router.post("/user", authenticate(), validate("productsPurchase"), productsPurchaseController);

export default router;
