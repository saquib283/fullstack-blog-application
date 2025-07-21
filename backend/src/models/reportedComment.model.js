import mongoose, { Schema } from "mongoose";

const ReportedCommentSchema = new Schema({
    content: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comments",
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
            "Abuse",
            "Hate Speech",
            "Harassment",
            "Misinformation",
            "Bullying",
            "Sexual Content",
            "Violence or Threats",
            "Offensive Language",
            "Impersonation",
            "Illegal Activity",
            "Self-Harm or Suicide",
            "Personal Information",
            "Scam or Fraud",
            "Other"
        ],
        required: true
    },  
    customReason: {
        type: String, 
    },
    status: {
        type: String,
        enum: ["Pending", "Reviewed", "Dismissed", "Action Taken"],
        default: "Pending"
    },
    actionTaken: {
        type: String,
        enum: ['REMOVE_COMMENT', 'REMOVE_USER', 'REMOVE_COMMENT_AND_USER']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model("ReportedComment", ReportedCommentSchema);
