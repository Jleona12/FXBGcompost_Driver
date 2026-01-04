# Setup Guide for FXBG Compost Driver PWA

This guide will help you get the FXBG Compost Driver PWA up and running.

## Step 1: Environment Variables

1. Copy the example environment file:
```bash
cp .env.local.example .env.local
```

2. Edit `.env.local` and add your credentials:

### Supabase Setup
- Go to your Supabase project dashboard
- Navigate to Settings > API
- Copy the **Project URL** → paste as `NEXT_PUBLIC_SUPABASE_URL`
- Copy the **anon/public key** → paste as `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Google Maps Setup
- Go to [Google Cloud Console](https://console.cloud.google.com/)
- Create a new project or select an existing one
- Enable the **Maps JavaScript API**
- Create an API key in "Credentials"
- Copy the API key → paste as `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`

## Step 2: Database Schema

Run the following SQL in your Supabase SQL Editor to create the required tables:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enums
CREATE TYPE subscription_type AS ENUM ('weekly', 'biweekly', 'monthly');
CREATE TYPE status_type AS ENUM ('active', 'paused', 'cancelled');
CREATE TYPE stop_type AS ENUM ('pickup', 'delivery', 'both');

-- Customers table
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  stripe_customer_id TEXT,
  subscription_type subscription_type,
  status status_type NOT NULL DEFAULT 'active',
  notes TEXT
);

-- Routes table
CREATE TABLE routes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  route_id TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  date DATE,
  notes TEXT,
  metadata JSONB
);

-- Stops table
CREATE TABLE stops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  route_id TEXT NOT NULL REFERENCES routes(route_id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  stop_order INTEGER NOT NULL,
  stop_type stop_type NOT NULL DEFAULT 'pickup',
  flags TEXT[],
  notes TEXT
);

-- Pickup events table (append-only)
CREATE TABLE pickup_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  stop_id UUID NOT NULL REFERENCES stops(id) ON DELETE CASCADE,
  driver_initials TEXT NOT NULL CHECK (length(driver_initials) >= 2 AND length(driver_initials) <= 3),
  notes TEXT,
  completion_status BOOLEAN NOT NULL DEFAULT false
);

-- Message state table (future use)
CREATE TABLE message_state (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  message_type TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL,
  metadata JSONB
);

-- Indexes for performance
CREATE INDEX idx_stops_route_id ON stops(route_id);
CREATE INDEX idx_stops_stop_order ON stops(stop_order);
CREATE INDEX idx_pickup_events_stop_id ON pickup_events(stop_id);
CREATE INDEX idx_pickup_events_created_at ON pickup_events(created_at DESC);

-- Row Level Security (RLS)
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE pickup_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_state ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read access (for MVP without auth)
CREATE POLICY "Allow anonymous read access" ON customers FOR SELECT USING (true);
CREATE POLICY "Allow anonymous read access" ON routes FOR SELECT USING (true);
CREATE POLICY "Allow anonymous read access" ON stops FOR SELECT USING (true);
CREATE POLICY "Allow anonymous read access" ON pickup_events FOR SELECT USING (true);

-- Allow anonymous insert for pickup events only
CREATE POLICY "Allow anonymous insert" ON pickup_events FOR INSERT WITH CHECK (true);
```

## Step 3: Sample Data (Optional)

Add some test data to verify the app works:

```sql
-- Insert a sample customer
INSERT INTO customers (name, email, phone, address, subscription_type, status)
VALUES
  ('John Doe', 'john@example.com', '5401234567', '123 Main St, Fredericksburg, VA 22401', 'weekly', 'active'),
  ('Jane Smith', 'jane@example.com', '5409876543', '456 Oak Ave, Fredericksburg, VA 22401', 'biweekly', 'active');

-- Insert a sample route
INSERT INTO routes (route_id, date, notes)
VALUES ('ROUTE-001', CURRENT_DATE, 'Monday morning route');

-- Insert sample stops (note: stop_order must be sequential integers)
INSERT INTO stops (route_id, customer_id, stop_order, stop_type, flags, notes)
SELECT
  'ROUTE-001',
  c.id,
  ROW_NUMBER() OVER (ORDER BY c.name),
  'pickup',
  CASE WHEN c.name = 'John Doe' THEN ARRAY['Long driveway', 'Gate code: 1234'] ELSE NULL END,
  NULL
FROM customers c
WHERE c.status = 'active';
```

## Step 4: Install Dependencies

```bash
npm install
```

## Step 5: Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Step 6: PWA Icons

To create proper PWA icons from your FXBG Compost logo:

### Option 1: Online Tool
1. Go to [RealFaviconGenerator](https://realfavicongenerator.net/)
2. Upload your FXBG Compost logo (SVG or high-res PNG)
3. Configure settings (use green theme color: #2E7D32)
4. Generate and download the icon package
5. Extract icons to `/public/` directory

### Option 2: CLI Tool
```bash
npx pwa-asset-generator logo.svg public --background "#FFFFFF" --splash-only false --icon-only --favicon
```

Required icon files:
- `favicon.ico` (16x16, 32x32)
- `icon-192x192.png` (192x192)
- `icon-512x512.png` (512x512)

## Step 7: Test the App

### Test Route Preview
1. Navigate to home page
2. Should see list of routes from database
3. Click on a route

### Test Route Detail
1. Should see map with markers for each stop
2. Should see list of stops ordered by `stop_order`
3. Each stop should show customer info, flags, and contact buttons

### Test Pickup Logging
1. Click "Log Pickup" on a stop
2. Enter driver initials (2-3 characters)
3. Optionally add notes
4. Check "Pickup Complete" if done
5. Submit
6. Verify event appears in Supabase `pickup_events` table

### Test Offline Mode
1. Open browser DevTools
2. Go to Network tab
3. Enable "Offline" mode
4. Try logging a pickup → should queue
5. Disable offline mode → should sync automatically
6. Verify event appears in Supabase

### Test on Mobile
1. Deploy to a staging URL (e.g., Vercel)
2. Open on mobile device
3. Install as PWA (Add to Home Screen)
4. Test offline functionality
5. Test click-to-call and click-to-text links

## Step 8: Deploy

### Deploy to Vercel
1. Push code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "Import Project"
4. Select your GitHub repository
5. Add environment variables in Settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
6. Deploy

## Troubleshooting

### Supabase Connection Errors
- Verify environment variables are set correctly
- Check Supabase project is active
- Verify RLS policies allow anonymous access (for MVP)

### Google Maps Not Loading
- Verify API key is valid
- Ensure Maps JavaScript API is enabled in Google Cloud Console
- Check browser console for specific error messages

### Offline Sync Not Working
- Check browser supports Service Workers
- Verify PWA is installed properly
- Check browser console for sync errors

### Stop Order Issues
- Ensure `stop_order` values are sequential integers (1, 2, 3...)
- Never use fractional values (1.5, 2.3)
- Re-order stops if needed in Supabase

## Security Notes for Production

For production deployment:

1. **Add Authentication**: Implement driver login system
2. **Restrict RLS Policies**: Update Supabase RLS to require authentication
3. **Secure API Keys**: Use environment variables, never commit to git
4. **HTTPS Only**: Ensure app is served over HTTPS
5. **Rate Limiting**: Add rate limiting to API routes

## Next Steps

Once the MVP is working:

1. Add real FXBG Compost logo and branding
2. Set up authentication for drivers
3. Add messaging integration
4. Implement push notifications
5. Add analytics and reporting
6. Consider route optimization features

## Support

If you encounter issues:
1. Check the browser console for errors
2. Verify database schema matches requirements
3. Test with sample data first
4. Review the README.md for detailed documentation
