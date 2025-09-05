import { Router } from "express";
import { PasswordController } from "../controllers/password.controller.js";
const router = Router();

router.post("/request", PasswordController.request);
router.post("/reset", PasswordController.reset);

export default router;
