/** @type {import('next').NextConfig} */
const nextConfig = {
  api: {
    bodyParser: false, // required for formidable
  },
};

module.exports = nextConfig;
