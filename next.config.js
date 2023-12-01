/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  experimental: {
    largePageDataBytes: 128 * 40000,
  },
}
 
module.exports = nextConfig