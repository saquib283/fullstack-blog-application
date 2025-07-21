import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import { BlogImageUpload } from '../models/blogImageUpload.model.js';



export const uploadTempImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        console.log('REQ FILE:', req.file);
        console.log('Uploading from:', req.file.path);

        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'blogs/temp',
            resource_type: 'image'
        });

        console.log('Cloudinary result:', result);

        if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        const newImage = await BlogImageUpload.create({
            url: result.secure_url,
            public_id: result.public_id,
        });

        res.status(200).json({
            success: 1,
            file: {
                url: newImage.url
            }
        });

    } catch (err) {
        console.error('Upload failed:', err);
        res.status(500).json({ error: err.message || 'Image upload failed' });
    }
};
