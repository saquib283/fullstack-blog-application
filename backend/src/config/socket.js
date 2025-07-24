import redisClient from './redisClient.js';

export const initializeSocket = (io) => {
    io.on('connection', (socket) => {
        console.log("🟢 New client connected:", socket.id);

        socket.on("like-blog", async ({ blogId, userId }) => {
            try {
                const likeKey = `blog:${blogId}:likedBy`;
                const wasAdded = await redisClient.sAdd(likeKey, userId); // ✅ sAdd for Redis v4+

                if (wasAdded) {
                    const likeCount = await redisClient.sCard(likeKey); // ✅ sCard to get total likes
                    await redisClient.set(`blog:${blogId}:likes`, likeCount); // ✅ Save like count
                    io.emit("likes-updated", { blogId, likes: likeCount });
                }

            } catch (err) {
                console.error("❌ Redis like-blog error:", err);
            }
        });

        socket.on("view-blog", async (blogId) => {
            try {
                const viewKey = `blog:${blogId}:views`;
                const views = await redisClient.incr(viewKey); // ✅ incr for atomic increment
                io.emit("views-updated", { blogId, views });
            } catch (err) {
                console.error("❌ Redis view-blog error:", err);
            }
        });

        socket.on("disconnect", () => {
            console.log("🔴 Client disconnected:", socket.id);
        });
    });
};
