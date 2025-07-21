import mongoose, { Schema } from "mongoose";

const ReportedBlogSchema = new Schema({
    blog: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Blog",
        required: true
    },
    reportedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    reason: {
        type: String,
        enum: [
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
        ],
        required: true
    },
    customReason: {
        type: String 
    },
    status: {
        type: String,
        enum: ["Pending", "Reviewed", "Dismissed", "Action Taken"],
        default: "Pending"
    },
    actionTaken:{
        type:String,
        enum:['REMOVE_BLOG','REMOVE_USER','REMOVE_BLOG_AND_USER']
    },
    actionTakenBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    adminNotes: {
        type: String 
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export const ReportedBlog = mongoose.model("ReportedBlog", ReportedBlogSchema);


