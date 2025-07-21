import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Blog } from "../models/blog.model.js";
import { User } from "../models/user.model.js";
import { ReportedBlog } from "../models/reportedBlogs.model.js";

export const removeBlog = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!id) {
        throw new ApiError(400, "User ID is required");
    }
    try {
        const blog = await Blog.findById(id);
        if (!blog) {
            throw new ApiError(404, "Blog not found");
        }
        await blog.deleteOne();
        return res
            .status(200)
            .json(new ApiResponse(200, null, "Blog deleted successfully"));
    } catch (error) {
        throw new ApiError(
            error.statusCode || 500,
            error.message || "Internal Server Error"
        );
    }
});
export const removeUser = asyncHandler(async(req,res)=>{
    const {id} = req.params;
    if (!id) {
        throw new ApiError(400, "User ID is required");
    }
    try {
        const user = await User.findById(id);
        if(!user){
            throw new ApiError(404, "Blog not found");
        }
        await user.deleteOne();
        return res
            .status(200)
            .json(new ApiResponse(200, null, "User deleted successfully"));
    } catch (error) {
        throw new ApiError(
            error.message || "Internal Server Error",
            error.statusCode || 500
        )
    }
});
export const getAllReportedBlogs = asyncHandler(async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const skip = (page - 1) * limit;

        const [reportedBlogs, total] = await Promise.all([
            ReportedBlog.find()
                .populate("blog", "title slug")
                .populate("reportedBy", "username email")
                .populate("actionTakenBy", "username email")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            ReportedBlog.countDocuments()
        ]);

        return res.status(200).json(
            new ApiResponse(200, {
                total,
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                reports: reportedBlogs
            }, "Fetched reported blogs successfully")
        );
    } catch (error) {
        throw new ApiError(
            error.statusCode || 500,
            error.message || "Failed to fetch reported blogs"
        );
    }
});
export const manageReportedBlog = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status, actionTaken, adminNotes } = req.body;

    const validStatuses = ["Pending", "Reviewed", "Dismissed", "Action Taken"];
    const validActions = ["REMOVE_BLOG", "REMOVE_USER", "REMOVE_BLOG_AND_USER"];

    const report = await ReportedBlog.findById(id).populate("blog reportedBy");

    if (!report) {
        throw new ApiError(404, "Reported blog entry not found");
    }

    // If status is provided, validate and apply
    if (status) {
        if (!validStatuses.includes(status)) {
            throw new ApiError(400, "Invalid status value");
        }
        report.status = status;
    }

    // If action is provided, validate and execute
    if (actionTaken) {
        if (!validActions.includes(actionTaken)) {
            throw new ApiError(400, "Invalid actionTaken value");
        }

        const blogId = report.blog?._id;
        const userId = report.reportedBy?._id;

        if ((actionTaken === "REMOVE_BLOG" || actionTaken === "REMOVE_BLOG_AND_USER") && blogId) {
            await Blog.findByIdAndDelete(blogId);
        }

        if ((actionTaken === "REMOVE_USER" || actionTaken === "REMOVE_BLOG_AND_USER") && userId) {
            await User.findByIdAndDelete(userId);
        }

        report.status = "Action Taken";
        report.actionTaken = actionTaken;
    }

    // Update admin notes and admin info
    if (adminNotes) {
        report.adminNotes = adminNotes;
    }
    report.actionTakenBy = req.user._id;

    await report.save();

    return res.status(200).json(
        new ApiResponse(200, report, "Report processed successfully")
    );
});
export const actionOnReportedComment = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { actionTaken, adminNotes } = req.body;

    // Validate actionTaken
    const validActions = ['REMOVE_COMMENT', 'REMOVE_USER', 'REMOVE_COMMENT_AND_USER'];
    if (!validActions.includes(actionTaken)) {
        throw new ApiError(400, "Invalid or missing actionTaken value");
    }

    // Get report + populate references
    const report = await ReportedComment.findById(id).populate("content reportedBy");
    if (!report) {
        throw new ApiError(404, "Reported comment entry not found");
    }

    const commentId = report.content?._id;
    const userId = report.reportedBy?._id;

    // 💥 Do the action
    if (['REMOVE_COMMENT', 'REMOVE_COMMENT_AND_USER'].includes(actionTaken) && commentId) {
        await Comment.findByIdAndDelete(commentId);
    }

    if (['REMOVE_USER', 'REMOVE_COMMENT_AND_USER'].includes(actionTaken) && userId) {
        await User.findByIdAndDelete(userId);
    }

    // 📝 Update report
    report.status = "Action Taken";
    report.actionTaken = actionTaken;
    report.adminNotes = adminNotes || "";
    report.actionTakenBy = req.user?._id; // assuming this comes from checkAuth
    await report.save();

    return res.status(200).json(
        new ApiResponse(200, report, `Action "${actionTaken}" executed successfully on reported comment.`)
    );
});
export const promoteUserToModerator = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Find the user
    const user = await User.findById(id);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Check if already a moderator or admin
    if (user.role === "MODERATOR" || user.role === "ADMIN") {
        throw new ApiError(400, `User is already a ${user.role}`);
    }

    // Promote to moderator
    user.role = "MODERATOR";
    await user.save();

    res.status(200).json(
        new ApiResponse(200, user, `${user.username} has been promoted to MODERATOR`)
    );
});
export const demoteModeratorToUser = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Find the user
    const user = await User.findById(id);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Only allow demotion from MODERATOR to USER
    if (user.role !== "MODERATOR") {
        throw new ApiError(400, "Only moderators can be demoted to users");
    }

    user.role = "USER";
    await user.save();

    res.status(200).json(
        new ApiResponse(200, user, `${user.username} has been demoted to USER`)
    );
});
export const promoteUserToAdmin = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Already an admin? No need to promote
    if (user.role === "ADMIN") {
        return res.status(200).json(
            new ApiResponse(200, user, `${user.username} is already an ADMIN`)
        );
    }

    user.role = "ADMIN";
    await user.save();

    res.status(200).json(
        new ApiResponse(200, user, `${user.username} has been promoted to ADMIN`)
    );
});
export const selfDemoteToModerator = asyncHandler(async (req, res) => {
    const adminId = req.user?._id;

    const user = await User.findById(adminId);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    if (user.role !== "ADMIN") {
        throw new ApiError(403, "Only admins can self-demote");
    }

    user.role = "MODERATOR";
    await user.save();

    res.status(200).json(
        new ApiResponse(200, user, "You have successfully demoted yourself to MODERATOR")
    );
});
export const selfDemoteToUser = asyncHandler(async (req, res) => {
    const adminId = req.user?._id;

    const user = await User.findById(adminId);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    if (user.role !== "ADMIN") {
        throw new ApiError(403, "Only admins can self-demote");
    }

    // Optional: Prevent last admin from self-demoting
    const adminCount = await User.countDocuments({ role: "ADMIN" });
    if (adminCount <= 1) {
        throw new ApiError(403, "At least one admin is required. Cannot self-demote.");
    }

    user.role = "USER";
    await user.save();

    res.status(200).json(
        new ApiResponse(200, user, "You have successfully demoted yourself to USER")
    );
});
export const changeBlogStatus = asyncHandler(async (req, res) => {
    const { blogId } = req.params;
    const { status } = req.body;

    // Validate new status
    const validStatuses = ["draft", "published", "archived"];
    if (!status || !validStatuses.includes(status)) {
        throw new ApiError(400, "Invalid or missing status value.");
    }

    const blog = await Blog.findById(blogId);
    if (!blog) {
        throw new ApiError(404, "Blog not found.");
    }

    blog.status = status;
    await blog.save();

    res.status(200).json(
        new ApiResponse(200, blog, `Blog status updated to "${status}".`)
    );
});










