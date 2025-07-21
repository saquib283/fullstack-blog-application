import { Router } from "express";
import {
    loginUser,
    registerUser,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {upload} from "../middlewares/multer.middleware.js"
import { createBlog, getAllBlogs, getBlogById, getBlogBySlug, updateBlog, updateLikes, updateViews } from "../controllers/blog.controller.js";
import { uploadTempImage } from "../controllers/blogimageuploader.controller.js";

const router = Router();

router.route("/create-blog").post(verifyJWT,upload.single('thumbnail'),createBlog);
router.route("/update-blog/:Id").patch(verifyJWT,updateBlog);
router.route("/update-like").get(verifyJWT,updateLikes);
router.route("/upload-blog-image").post( upload.single('image'), uploadTempImage);
router.route("/getAllBlogs").get(verifyJWT,getAllBlogs);
router.route("/update-views").get(updateViews);
router.route("/getblogbySlug/:slug").get(getBlogBySlug);
router.route("/getblogbyId/:Id").post(getBlogById);






export default router;