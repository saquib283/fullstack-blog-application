import { BlogImageUpload } from '../models/blogImageUpload.model.js';
import { v2 as cloudinary } from 'cloudinary';

export const cleanupUnusedImages = async () => {
    const expiryDate = new Date(Date.now() - 24 * 60 * 60 * 1000); 

    const unusedImages = await BlogImageUpload.find({
        used: false,
        createdAt: { $lt: expiryDate },
    });

    for (const img of unusedImages) {
        try {
            await cloudinary.uploader.destroy(img.public_id);
            await img.deleteOne();
            console.log(`Deleted unused image: ${img.public_id}`);
        } catch (err) {
            console.error(`Failed to delete ${img.public_id}:`, err.message);
        }
    }
};
