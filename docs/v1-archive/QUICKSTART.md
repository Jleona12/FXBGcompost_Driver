# Quick Start Guide

Get the FXBG Compost Driver PWA running in 5 minutes.

## Prerequisites

- Node.js 18+
- Supabase account (free tier works)
- Google Maps API key

## Step 1: Environment Setup (2 minutes)

1. Copy the environment template:
```bash
cp .env.local.example .env.local
```

2. Edit `.env.local` and add your keys:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-maps-key
```

**Where to find these:**
- Supabase: Project Settings → API → Project URL & anon key
- Google Maps: [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials

## Step 2: Install Dependencies (1 minute)

```bash
npm install
```

## Step 3: Database Setup (2 minutes)

Copy and run the SQL from [SETUP.md](./SETUP.md) in your Supabase SQL Editor.

Quick version:
1. Go to Supabase Dashboard → SQL Editor
2. Copy the entire SQL schema from SETUP.md
3. Click "Run"
4. Optionally add sample data

## Step 4: Run the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## What You Should See

1. **Home Page**: List of routes from your database
2. Click a route → See stops on map
3. Click "Log Pickup" → Test the logging form

## Quick Test

Add a test route in Supabase:

```sql
-- Add customer
INSERT INTO customers (name, phone, address, status)
VALUES ('Test Customer', '5401234567', '123 Main St, Fredericksburg, VA', 'active');

-- Add route
INSERT INTO routes (route_id, date)
VALUES ('TEST-01', CURRENT_DATE);

-- Add stop
INSERT INTO stops (route_id, customer_id, stop_order, stop_type)
SELECT 'TEST-01', id, 1, 'pickup'
FROM customers WHERE name = 'Test Customer';
```

Refresh the app → You should see "TEST-01" route!

## Troubleshooting

### "No routes available"
- Check Supabase connection in browser console
- Verify RLS policies allow anonymous access
- Check routes table has data

### Maps not loading
- Verify Google Maps API key is valid
- Check browser console for errors
- Ensure Maps JavaScript API is enabled in Google Cloud

### Build errors
- Check all environment variables are set
- Run `npm install` again
- Clear `.next` folder: `rm -rf .next`

## Next Steps

1. **Add Icons**: Replace placeholder icons in `/public/`
2. **Customize Branding**: Update Header component with real logo
3. **Test on Mobile**: Deploy to Vercel and test PWA installation
4. **Add Real Data**: Import your routes and customers

## Need Help?

- Check [README.md](./README.md) for detailed docs
- Check [SETUP.md](./SETUP.md) for complete setup guide
- Check browser console for errors
- Verify database schema matches requirements

## Deploy to Vercel (Optional)

1. Push to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import project
4. Add environment variables
5. Deploy!

URL will be: `https://your-app.vercel.app`

---

**That's it!** You now have a working PWA for FXBG Compost drivers. 🎉
