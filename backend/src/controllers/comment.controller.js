import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import {Comment} from "../models/comments.model.js";
import { Blog } from "../models/blog.model.js";



export const createComment = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { content } = req.body;
    if (!id) {
        return new ApiError(400, "Blog Id is required to comment")
    }
    if (!req.user) {
        return new ApiError(401, "You are not authorised to comment")
    }

    const blog = await Blog.findById(id);
    if (!blog) {
        return new ApiError(404, "Request blog not found to comment");
    }

    if (!blog.allowComments) {
        throw new ApiError(403, "Commenting is disabled for this blog");
    }

    const newComment = await Comment.create({
        user: req.user._id,
        blog: blog._id,
        content
    })
    await newComment.save();

    blog.comments.push(newComment._id);

    await blog.save();

    return res.status(201).json(
        new ApiResponse(201, newComment, "comment added successfully")
    )

})



export const replyToComment = asyncHandler(async (req, res) => {
    const { parentId, content, blogId } = req.body;

    if (!parentId || !content || !blogId) {
        throw new ApiError(400, "parentId, content, and blogId are required");
    }

    if (!req.user) {
        throw new ApiError(401, "You are not authorised to reply");
    }

    const blog = await Blog.findById(blogId);
    if (!blog) {
        throw new ApiError(404, "Blog not found");
    }

    if (!blog.allowComments) {
        throw new ApiError(403, "Commenting is disabled for this blog");
    }

    const parentComment = await Comment.findById(parentId);
    if (!parentComment) {
        throw new ApiError(404, "Parent comment not found");
    }

    if (parentComment.blog.toString() !== blog._id.toString()) {
        throw new ApiError(400, "Parent comment does not belong to this blog");
    }

    const reply = await Comment.create({
        user: req.user._id,
        blog: blog._id,
        content,
        parentId
    });

    blog.comments.push(reply._id);
    await blog.save();

    return res.status(201).json(
        new ApiResponse(201, reply, "Reply added successfully")
    );
});




export const deleteCommentbyUser = asyncHandler(async(req,res)=>{
    const {id} = req.params;
    if(!id){
        throw new ApiError(400,"Please provide comment id to proceed");
    }
    const userId = req.user._id;
    if(!userId){
        throw new ApiError(400, "Please login to continue");
    }

    const comment = await Comment.findById(id);

    if(!comment){
        throw new ApiError(404, "Comment not found");
    }

    if (!comment.user.equals(userId)) {
        throw new ApiError(403, "You are not authorized to delete this comment");
    }

    await comment.deleteOne();

    await Blog.findByIdAndUpdate(comment.blog, {
        $pull: { comments: comment._id }
    });


    return res.status(200).json(
        new ApiResponse(200,{success:true},"Comment deleted successfully")
    )

})

export const updateComment = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { content } = req.body;

    if (!id || !content) {
        throw new ApiError(400, "Comment ID and content are required");
    }

    const userId = req.user?._id;
    if (!userId) {
        throw new ApiError(401, "Unauthorized");
    }

    const comment = await Comment.findById(id);

    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    if (!comment.user.equals(userId)) {
        throw new ApiError(403, "You are not allowed to update this comment");
    }

    comment.content = content;
    await comment.save();

    return res.status(200).json(
        new ApiResponse(200, comment, "Comment updated successfully")
    );
});
