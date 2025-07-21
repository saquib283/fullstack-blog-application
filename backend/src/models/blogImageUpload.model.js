import mongoose, { Schema } from 'mongoose';

const blogImageUploadSchema = new Schema({

    url: {
        type: String,
        required: true
    },
    public_id: {
        type: String,
        required: true
    },
    used: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

blogImageUploadSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 7 }); 

export const BlogImageUpload = mongoose.model('BlogImageUpload', blogImageUploadSchema);
