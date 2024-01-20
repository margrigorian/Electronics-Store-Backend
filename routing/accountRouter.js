import express from "express";
import { authenticate } from "../middlewares/authenticate.js";
import { validate } from "../middlewares/validate.js";
import upload from "../middlewares/fileProcessing.js";
import { postProductController } from "../controllers/postProductController.js";

const router = express.Router();

router.post("/admin", authenticate(true), upload.single("image"), validate("post"), postProductController);

export default router;