import express from "express";
import { validate } from "../middlewares/validate.js";
import { userRegistrationController } from "../controllers/authControllers.js";

const router = express.Router();

router.post("/register", validate("registration"), userRegistrationController);

export default router;