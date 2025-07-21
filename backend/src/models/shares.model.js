import mongoose from "mongoose";

const shareSchema = new mongoose.Schema({
    blog: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Blog",
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    medium: {
        type: String,
        enum: ['email', 'whatsapp', 'twitter', 'facebook', 'copyLink', 'other'],
        required: true
    },
    sharedAt: {
        type: Date,
        default: Date.now
    }
});

export const Share = mongoose.model("Share", shareSchema);
