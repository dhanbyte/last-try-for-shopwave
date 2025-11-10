# ShopWave Deployment Guide

## Vercel Deployment Steps

### 1. Pre-deployment Checklist
- ✅ Environment variables configured
- ✅ Database connection optimized
- ✅ Build scripts updated
- ✅ CORS headers configured

### 2. Deploy to Vercel

```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

### 3. Environment Variables Setup in Vercel Dashboard

Add these environment variables in Vercel dashboard:

```
MONGODB_URI=mongodb+srv://dhananjaywin15112004:ec2cY3Gk2HxizdS2@cluster.4jkps.mongodb.net/?retryWrites=true&w=majority&appName=photos-test
MONGODB_DB_NAME=photos-test
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YWR2YW5jZWQta29pLTU4LmNsZXJrLmFjY291bnRzLmRldiQ
CLERK_SECRET_KEY=sk_test_79pbdZWPLcN5GtX0mUgC6WD6eyzWGOSqkKHGmgP5gg
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_RDS7GUfIddVKwK
RAZORPAY_KEY_ID=rzp_test_RDS7GUfIddVKwK
RAZORPAY_KEY_SECRET=Sk0lz17w2Hz328cgvSs9WsVR
NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY=public_wkRNuym4bz+0R6wuAYTQfiaWi90=
IMAGEKIT_PRIVATE_KEY=private_CbNfu0pqv6SGi5szq+HCP01WZUc=
NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/b5qewhvhb
NEXT_PUBLIC_APP_URL=https://shopwave.social
NODE_ENV=production
```

### 4. Domain Configuration
- Set custom domain in Vercel dashboard
- Update NEXT_PUBLIC_APP_URL to your production domain

### 5. Post-deployment Verification
- Test all API endpoints
- Verify image uploads work
- Check payment gateway integration
- Test vendor and admin functionalities

## Alternative Deployment Options

### Netlify
```bash
# Build command: pnpm run build
# Publish directory: .next
```

### Railway/Render
```bash
# Start command: pnpm start
# Build command: pnpm run build
```

## Troubleshooting

### Common Issues:
1. **Database Connection**: Ensure MongoDB URI is correct
2. **Environment Variables**: Check all required vars are set
3. **Build Errors**: Run `pnpm run build` locally first
4. **API Routes**: Verify all API endpoints work in production

### Performance Optimization:
- Images are optimized via ImageKit CDN
- Database connections are pooled
- Static assets are cached