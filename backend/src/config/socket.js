import redisClient from './redisClient.js';


export const initializeSocket = (io)=>{
    io.on('connection',(socket)=>{
        console.log("New client connected: ",socket.id);

        socket.on("like-blog",async(blogId)=>{
            const key = `blog:${blogId}:likes`;
            const likes = await redisClient.incr(key);
            io.emit('likes-updated', { blogId, likes });
        });


        socket.on('view-blog', async (blogId) => {
            const key = `blog:${blogId}:views`;
            const views = await redisClient.incr(key);
            io.emit('views-updated', { blogId, views });
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
        
    })
}