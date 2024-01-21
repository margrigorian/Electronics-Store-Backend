import express from "express";
import { authenticate } from "../middlewares/authenticate.js";
import { validate } from "../middlewares/validate.js";
import upload from "../middlewares/fileProcessing.js";
import { postProductController } from "../controllers/postProductController.js";
import { putProductController } from "../controllers/putProductController.js";
import { deleteProductController } from "../controllers/deleteProductController.js";

const router = express.Router();

router.post("/admin", authenticate(true), upload.single("image"), validate("post"), postProductController);
router.put("/admin", authenticate(true), upload.single("image"), validate("put"), putProductController);
router.delete("/admin", authenticate(true), validate("delete"), deleteProductController);

export default router;