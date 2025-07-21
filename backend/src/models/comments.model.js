import mongoose, { Schema } from "mongoose";

const commentSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    blog: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Blog",
        required: true
    },
    content: {
        type: String,
        required: true
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    parentId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment', 
        default: null 
    },
}, { timestamps: true });

export const Comment = mongoose.model("Comment", commentSchema);
