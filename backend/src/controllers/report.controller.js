import { asyncHandler } from "../utils/AsyncHandler";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { Blog } from "../models/blog.model";
import { ReportedBlog } from "../models/reportedBlog.model";

const VALID_REASONS = [
    "Spam",
    "Plagiarism",
    "Misinformation",
    "Offensive Content",
    "Hate Speech",
    "Harassment",
    "Sexual Content",
    "Violence or Threats",
    "Promotes Self-Harm or Suicide",
    "Scam or Fraud",
    "Illegal Activity",
    "Copyright Violation",
    "Personal Attacks",
    "Privacy Violation",
    "Other"
];
export const reportBlog = asyncHandler(async (req, res) => {
    const { id } = req.params || req.body;
    const { reason, customReason } = req.body;
    const userId = req.user?._id;
    if (!id) {
        throw new ApiError(400, "Blog ID is required");
    }
    const blog = await Blog.findById(id);
    if (!blog) {
        throw new ApiError(404, "Blog not found");
    }
    if (!reason || !VALID_REASONS.includes(reason)) {
        throw new ApiError(400, "Invalid or missing report reason");
    }

    if (reason === "Other" && !customReason?.trim()) {
        throw new ApiError(400, "Custom reason must be provided for 'Other'");
    }

    const alreadyReported = await ReportedBlog.findOne({
        blog: id,
        reportedBy: userId,
        status: "Pending",
    });

    if (alreadyReported) {
        throw new ApiError(409, "You have already reported this blog");
    }

    const report = await ReportedBlog.create({
        blog: id,
        reportedBy: userId,
        reason,
        customReason,
    });

    return res.status(201).json(
        new ApiResponse(201, report, "Blog reported successfully and is pending review.")
    );
});
