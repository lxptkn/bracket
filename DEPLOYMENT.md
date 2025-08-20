# Tournament Site Deployment Guide

This guide explains how to deploy your tournament site to Vercel for easy, reliable hosting.

## Why Vercel?

- ✅ **Perfect for Next.js** - Built specifically for Next.js applications
- ✅ **Automatic deployments** from Git
- ✅ **Global CDN** for fast loading worldwide
- ✅ **Free tier available** with generous limits
- ✅ **Automatic HTTPS** and SSL
- ✅ **Zero server management** required

## Prerequisites

- GitHub repository with your tournament site code
- Vercel account (free)
- Environment variables configured

## Quick Deployment

### 1. Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. **Sign up/Login** (you can use GitHub)
3. **Click "New Project"**
4. **Import your repository** from GitHub
5. **Select the tournament-site repository**

### 2. Configure the Project

Vercel will auto-detect it's a Next.js project:

- **Project Name**: `tournament-site` (or your preference)
- **Framework Preset**: Next.js (auto-detected)
- **Root Directory**: `./` (leave as default)
- **Build Command**: `npm run build` (auto-detected)
- **Output Directory**: `.next` (auto-detected)

### 3. Set Environment Variables

Add these in Vercel:

| Name | Value | Environment |
|------|-------|-------------|
| `NEXTAUTH_URL` | `https://your-domain.vercel.app` | Production |
| `NEXTAUTH_SECRET` | `your-generated-secret` | Production |
| `ADMIN_EMAIL` | `your-admin@email.com` | Production |
| `ADMIN_PASSWORD_HASH` | `your-bcrypt-hash` | Production |

### 4. Deploy

Click **Deploy** and Vercel will:
1. Pull your code from GitHub
2. Install dependencies
3. Build your Next.js app
4. Deploy to their global CDN
5. Give you a URL like `https://your-project.vercel.app`

## Automatic Updates

Once connected:
- **Every push to `main`** automatically deploys
- **Pull requests** create preview deployments
- **Branch deployments** for testing

## Custom Domain (Optional)

1. **Go to Project Settings** → **Domains**
2. **Add your domain** (e.g., `bracket.yourdomain.com`)
3. **Update DNS records** as instructed
4. **Vercel handles SSL** automatically

## Environment Variables Setup

### Local Development (.env.local)
```bash
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here
ADMIN_EMAIL=your-admin@email.com
ADMIN_PASSWORD_HASH=your-bcrypt-hash
```

### Production (Vercel)
- Set the same variables in Vercel dashboard
- Use your actual domain for `NEXTAUTH_URL`

## Testing Your Deployment

1. **Check the deployment logs** for any errors
2. **Test authentication** on your live site
3. **Verify admin access** works
4. **Test all functionality** (seasons, participants, brackets)

## Troubleshooting

### Common Issues

**"Invalid NextAuth Secret" Error:**
- Check `NEXTAUTH_SECRET` is set in Vercel
- Ensure it's a strong, random string

**"Invalid NextAuth URL" Error:**
- Verify `NEXTAUTH_URL` matches your actual domain
- Include `https://` in the URL

**Admin Authentication Not Working:**
- Verify `ADMIN_*` variables are set in Vercel
- Check the values match your expected credentials

## Benefits of Vercel

1. **Zero server management** - Vercel handles everything
2. **Instant scaling** - handles traffic spikes automatically
3. **Global performance** - CDN locations worldwide
4. **Git integration** - deploy on every push
5. **Preview deployments** - test changes before going live
6. **Built-in analytics** - performance monitoring

## Next Steps

1. **Deploy to Vercel** (takes 5 minutes)
2. **Test everything** works on the live site
3. **Set up custom domain** if desired
4. **Enjoy automatic deployments** on every Git push!

Your tournament site will be live and accessible worldwide with professional hosting! 🚀
