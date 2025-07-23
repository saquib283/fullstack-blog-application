import { createClient } from "redis";

const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://redis:6379",
});

redisClient.on("error", (err) => {
  console.error("Redis Error:", err);
});

async function connectRedis() {
  try {
    await redisClient.connect();
    console.log("Redis connected successfully ✨");
  } catch (err) {
    console.error("Failed to connect to Redis 😵", err);
  }
}

connectRedis();

export default redisClient;
