import express from "express";
import { validate } from "../middlewares/validate.js";
import { userRegistrationController, userLoginController } from "../controllers/authControllers.js";

const router = express.Router();

router.post("/register", validate("registration"), userRegistrationController);
router.post("/login", validate("authorization"), userLoginController);

export default router;
