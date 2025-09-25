# FluxEdit Deployment Guide

## 🚀 Complete Deployment Setup

### 1. Supabase Project Setup

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create new project: `fluxedit-hackathon`
   - Note down your project URL and anon key

2. **Run Database Migrations**
   - Copy the SQL from `docs/supabase-setup.md`
   - Run in Supabase SQL Editor
   - This creates tables: profiles, projects, versions

3. **Configure Google OAuth**
   - Go to Authentication > Providers
   - Enable Google provider
   - Add your Google OAuth credentials
   - Set redirect URLs:
     - `https://your-project.supabase.co/auth/v1/callback`
     - `https://fluxedit-hackathon.vercel.app/auth/callback`

### 2. Google Cloud Console Setup

1. **Create OAuth Application**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create new project or select existing
   - Enable Google+ API
   - Create OAuth 2.0 Client ID
   - Add authorized redirect URIs:
     - `https://your-project.supabase.co/auth/v1/callback`

### 3. Vercel Environment Variables

Add these environment variables in your Vercel project settings:

```env
# FAL AI (Required)
FAL_KEY=3d345ffe-2909-4b44-a10b-84af79c9ac6a:c540b43d3b68b5860ab7b8e59d345b6b

# Supabase (Required for auth)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 4. Deploy to Vercel

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "feat: Add complete Supabase authentication integration"
   git push
   ```

2. **Vercel Deployment**
   - Vercel will automatically deploy from GitHub
   - Add environment variables in project settings
   - Redeploy after adding environment variables

### 5. Test Authentication Flow

1. **Guest Mode Testing**
   - Visit your deployed app
   - Upload an image
   - Try entering a prompt
   - Verify auth gate appears when clicking "Apply AI Edit"

2. **Authenticated Mode Testing**
   - Sign in with Google
   - Verify you can process images
   - Check that projects are saved to database

### 6. Production Checklist

- ✅ Supabase project created and configured
- ✅ Database schema deployed
- ✅ Google OAuth configured
- ✅ Environment variables set in Vercel
- ✅ App deployed and accessible
- ✅ Authentication flow working
- ✅ Image processing working for authenticated users
- ✅ Guest mode allows browsing without barriers

## 🎯 User Experience Flow

1. **Guest Experience**
   - Users can explore the entire interface
   - Upload images and see the UI
   - Enter prompts and adjust parameters
   - When they try to process → Auth gate appears

2. **Authentication**
   - Beautiful auth modal with benefits
   - One-click Google sign in
   - Seamless transition to authenticated mode

3. **Authenticated Experience**
   - Full AI processing capabilities
   - Projects saved to database
   - Version history preserved
   - Pro user badge in header

## 🔧 Troubleshooting

### Common Issues

1. **Auth not working**
   - Check Supabase environment variables
   - Verify Google OAuth redirect URLs
   - Check browser console for errors

2. **Image processing fails**
   - Verify FAL_KEY is set correctly
   - Check API route authentication
   - Ensure user is signed in

3. **Database errors**
   - Verify RLS policies are set up
   - Check table permissions
   - Ensure user profile is created on signup

### Support

For issues, check:
1. Vercel deployment logs
2. Supabase logs and metrics
3. Browser developer console
4. Network tab for API calls