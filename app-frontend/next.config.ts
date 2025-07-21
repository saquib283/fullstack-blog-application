/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "res.cloudinary.com",
        pathname: "/**", 
      },
    ],
  domains: ['images.unsplash.com', 'source.unsplash.com'],
  },
};

module.exports = nextConfig;
