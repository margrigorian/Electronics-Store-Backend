import express from "express";

const router = express.Router();

router.post("/register", validate("registration"), userRegistrationController);

export default router;