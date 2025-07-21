import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createComment, deleteCommentbyUser, updateComment } from "../controllers/comment.controller.js";

const router = Router();

router.route("/add-comment/:id").post(verifyJWT,createComment);
router.route("/delete-comment/:id").delete(verifyJWT, deleteCommentbyUser);
router.route("/update-comment/:id").patch(verifyJWT, updateComment);




export default router;