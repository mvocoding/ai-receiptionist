# Supabase Integration Setup

## Step 1: Install Dependencies

Run the following command to install the Supabase client:

```bash
npm install
```

## Step 2: Create .env File

Create a `.env` file in the root directory with the following content:

```
REACT_APP_SUPABASE_URL=https://bbmseguzqboxbalhfcop.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJibXNlZ3V6cWJveGJhbGhmY29wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3NjE5MTUsImV4cCI6MjA3ODMzNzkxNX0.Fkw_O-EdO_dgwWjYuXvIEcXiaxXQh4N4EL4GIa16GAQ
```

## Step 3: Create Database Tables

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to the SQL Editor
4. Copy and paste the contents of `supabase-schema.sql`
5. Click "Run" to execute the SQL

This will create:
- `store_settings` table (single row for store configuration)
- `barbers` table (for barber information)
- Sample data for both tables
- Auto-update triggers for timestamps
- Row Level Security policies

## Step 4: Verify Setup

1. Restart your development server: `npm start`
2. Navigate to the Dashboard page
3. You should see data loaded from Supabase
4. Try adding, editing, or deleting a barber to verify CRUD operations work

## Database Schema

### store_settings
- `id` (UUID, Primary Key)
- `banner_url` (TEXT)
- `intro_text` (TEXT)
- `phone_number` (TEXT)
- `address` (TEXT)
- `hours` (TEXT)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### barbers
- `id` (UUID, Primary Key)
- `name` (TEXT)
- `specialty` (TEXT)
- `image` (TEXT)
- `price` (DECIMAL)
- `working_days` (TEXT[])
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

## Features

- ✅ Automatic data fetching on page load
- ✅ Save store settings to Supabase
- ✅ Add new barbers
- ✅ Edit existing barbers
- ✅ Delete barbers
- ✅ Real-time updates (data persists across page refreshes)

