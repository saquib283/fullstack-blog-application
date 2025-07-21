import { Router } from "express";
import { getAllCategories } from "../controllers/category.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();
router.route("/all-categories").get(getAllCategories);

export default router;