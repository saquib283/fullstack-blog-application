import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import cron from "node-cron";
import { cleanupUnusedImages } from "./utils/cleanupUnusedImages.js";
import { syncLikesAndViewsToMongo } from "./utils/syncLikesAndViews.js";
const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(
  express.json({
    limit: "16kb",
  })
);
app.use(
  express.urlencoded({
    extended: true,
    limit: "16kb",
  })
);
app.use(express.static("public"));
app.use(cookieParser());

cron.schedule('0 * * * *', async () => {
  console.log('Running cleanup job...');
  await cleanupUnusedImages();
});

cron.schedule('* * * * *', async () => {
  await syncLikesAndViewsToMongo();
});



import userRouter from "./routes/user.routes.js";
import blogRouter from "./routes/blog.route.js";
import adminRouter from "./routes/admin.route.js";
import categoryRouter from "./routes/category.route.js";
import commentRouter from "./routes/comment.route.js";



app.use("/api/v1/users", userRouter);
app.use("/api/v1/blogs",blogRouter);
app.use("/api/v1/admin",adminRouter);
app.use("/api/v1/category",categoryRouter);
app.use("/api/v1/comments",commentRouter);


app.get("/",(req,res)=>{
  return res.send("<h1>Backend is running</h1>")
})

app.use((err,req,res,next)=>{
  console.error("Error Middleware Caught:", err);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
})




export { app };