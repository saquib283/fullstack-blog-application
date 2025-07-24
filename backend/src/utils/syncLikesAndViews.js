import { Blog } from '../models/blog.model.js';
import redisClient from '../config/redisClient.js';

export const syncLikesAndViewsToMongo = async () => {
    try {
        const likeKeys = await redisClient.keys('blog:*:likedBy');
        const viewKeys = await redisClient.keys('blog:*:views');

        // 🔁 Sync Likes
        for (const key of likeKeys) {
            const blogIdMatch = key.match(/^blog:(.+):likedBy$/);
            if (!blogIdMatch) continue;

            const blogId = blogIdMatch[1];
            const userIds = await redisClient.sMembers(key); // ✅ Correct camelCase method

            if (Array.isArray(userIds) && userIds.length > 0) {
                await Blog.findByIdAndUpdate(blogId, {
                    $set: { likes: userIds },
                });
            }

            // Cleanup Redis keys
            await redisClient.del(key);
            await redisClient.del(`blog:${blogId}:likes`);
        }

        // 🔁 Sync Views
        for (const key of viewKeys) {
            const blogIdMatch = key.match(/^blog:(.+):views$/);
            if (!blogIdMatch) continue;

            const blogId = blogIdMatch[1];
            const views = await redisClient.get(key);

            if (views !== null) {
                await Blog.findByIdAndUpdate(blogId, {
                    $set: { views: parseInt(views, 10) || 0 },
                });
            }

            await redisClient.del(key);
        }

        console.log("✅ Synced likes and views to MongoDB");
    } catch (error) {
        console.error("❌ syncLikesAndViewsToMongo error:", error.message);
    }
};
