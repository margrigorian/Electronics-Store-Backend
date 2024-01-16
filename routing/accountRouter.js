import express from "express";
import { authenticate } from "../middlewares/authenticate.js";
import { validate } from "../middlewares/validate.js";
import fileMiddleware from "../middlewares/fileProcessing.js";
import { postProductController } from "../controllers/postProductController.js";

const router = express.Router();

router.post(
    "/admin", 
    // authenticate(true), 
    // validate("post"), 
    fileMiddleware.single("image"), 
    postProductController
);

export default router;