/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	images: {
	  domains: ['tr.rbxcdn.com'],
	},
	env: {
	  NEXT_PUBLIC_DATABASE_CHECK: process.env.DATABASE_URL ? 'true' : '',
	},
	async headers() {
	  return [
		{
		  // Apply these headers to all routes
		  source: '/:path*',
		  headers: [
			{
			  key: 'X-DNS-Prefetch-Control',
			  value: 'on',
			},
			{
			  key: 'X-XSS-Protection',
			  value: '1; mode=block',
			},
			{
			  key: 'X-Content-Type-Options',
			  value: 'nosniff',
			},
			{
			  key: 'Referrer-Policy',
			  value: 'origin-when-cross-origin',
			},
			{
  key: 'Content-Security-Policy',
  value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https: blob:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https:; frame-src 'self' https://docs.google.com; frame-ancestors 'self'; base-uri 'self'; form-action 'self';",
},
		  ],
		},
	  ];
	},
  };
  
  module.exports = nextConfig;
  