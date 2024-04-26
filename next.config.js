/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  experimental: {
    largePageDataBytes: 128 * 40000,
  },
  i18n: {
    locales: ["en"],
    defaultLocale: "en",
  },
}
 
module.exports = nextConfig