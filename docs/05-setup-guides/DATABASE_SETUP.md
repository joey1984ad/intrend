# Database Setup Guide

This guide will help you set up Neon PostgreSQL and Vercel Blob for your Facebook Ads Dashboard.

## 🗄️ Neon PostgreSQL Setup

### 1. Create a Neon Account
1. Go to [https://console.neon.tech/](https://console.neon.tech/)
2. Sign up with your GitHub account
3. Create a new project

### 2. Get Your Database URL
1. In your Neon dashboard, click on your project
2. Go to the "Connection Details" tab
3. Copy the connection string that looks like:
   ```
   postgresql://username:password@hostname/database
   ```

### 3. Add to Environment Variables
Add this to your `.env.local` file:
```env
DATABASE_URL=postgresql://username:password@hostname/database
```

## 📁 Vercel Blob Setup

### 1. Create a Vercel Blob Store
1. Go to [https://vercel.com/dashboard/stores](https://vercel.com/dashboard/stores)
2. Click "Create Store"
3. Choose "Blob" as the store type
4. Give it a name like "facebook-dashboard-files"
5. Select your project

### 2. Get Your Blob Token
1. In your Vercel dashboard, go to Storage
2. Click on your Blob store
3. Go to "Settings" tab
4. Copy the "Read/Write Token"

### 3. Add to Environment Variables
Add this to your `.env.local` file:
```env
BLOB_READ_WRITE_TOKEN=your_blob_token_here
```

## 🚀 Initialize Database

### Option 1: Using the API Route
1. Start your development server: `npm run dev`
2. Make a POST request to `/api/init-db`:
   ```bash
   curl -X POST http://localhost:3000/api/init-db
   ```

### Option 2: Using the Dashboard
1. The database will be automatically initialized when you first connect to Facebook
2. Check the console logs for database initialization messages

## 📊 Database Schema

The database includes these tables:

### `facebook_sessions`
- Stores user Facebook login sessions
- Tracks access tokens and ad account IDs

### `campaign_data`
- Stores campaign performance data
- Organized by date range and session

### `metrics_cache`
- Stores calculated metrics
- Cached for faster loading

## 🔧 Troubleshooting

### Database Connection Issues
1. Check your `DATABASE_URL` is correct
2. Ensure your Neon database is active
3. Check the console for connection errors

### Blob Storage Issues
1. Verify your `BLOB_READ_WRITE_TOKEN` is correct
2. Ensure your Vercel Blob store is created
3. Check file upload permissions

### Environment Variables
Make sure all required variables are set:
```env
# Facebook
NEXT_PUBLIC_FACEBOOK_APP_ID=your_app_id
FACEBOOK_APP_SECRET=your_app_secret

# Database
DATABASE_URL=your_neon_url

# Blob Storage
BLOB_READ_WRITE_TOKEN=your_blob_token
```

## 🎯 Next Steps

1. **Set up your environment variables** using the guide above
2. **Initialize the database** using the API route
3. **Connect to Facebook** and test the data flow
4. **Check the console logs** to see data being saved to the database

The dashboard will now:
- ✅ Store Facebook sessions in the database
- ✅ Cache campaign data for faster loading
- ✅ Save metrics for historical tracking
- ✅ Support file exports via Blob storage
- ✅ Provide better data persistence and performance

## 🔍 Monitoring

Check these logs to verify everything is working:
- `✅ Database initialized successfully`
- `✅ Saved X campaigns for date range Y`
- `✅ Data saved to database for user X`
- `✅ File uploaded: URL`

If you see these messages, your database setup is working correctly! 