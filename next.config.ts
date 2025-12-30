/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com", // Google Auth
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com", // GitHub Auth
      },
      {
        protocol: "https",
        hostname: "secure.gravatar.com", // Gravatar
      },
    ],
  },
};

export default nextConfig;
