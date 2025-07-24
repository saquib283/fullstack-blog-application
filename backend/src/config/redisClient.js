import { createClient } from "redis";

const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379", // fallback for local
});

redisClient.on("error", (err) => {
  console.error("❌ Redis Client Error:", err);
});

// Immediately connect to Redis
(async () => {
  try {
    await redisClient.connect();
    console.log("✅ Redis connected successfully.");
  } catch (err) {
    console.error("❌ Failed to connect to Redis:", err);
  }
})();

export default redisClient;
