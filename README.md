# ECG Shift Simulator

A platform for healthcare professionals to practice ECG interpretation skills through simulated tele-ECG shifts. Users can interpret ECG images and compare their reports against official interpretations with detailed scoring and feedback.

## Features

- **User Authentication**: Registration, login, password reset via Supabase Auth
- **Admin Panel**: Upload ECG images, create official reports, manage users
- **ECG Viewer**: Zoomable, pannable high-resolution ECG display
- **Report Builder**: Click-based interface for rhythm, rate, axis, intervals, and findings
- **Scoring System**: Field-by-field comparison with partial credit logic
- **User Dashboard**: Progress tracking, accuracy rates, recent activity

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Server Actions
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Image Storage**: Cloudinary
- **Deployment**: Vercel (recommended)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Cloudinary account

### 1. Clone and Install

```bash
git clone <repository-url>
cd ecg-shift-simulator
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the schema from `supabase/schema.sql`
3. Copy your project URL and anon key from Settings > API

### 3. Set Up Cloudinary

1. Create an account at [cloudinary.com](https://cloudinary.com)
2. Go to Settings > Upload and create an upload preset named `ecg_uploads`
   - Set signing mode to "Unsigned"
   - Set folder to "ecg-images"
3. Copy your cloud name from the Dashboard

### 4. Configure Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your values:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=ecg_uploads

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 5. Create Admin User

1. Register a new user through the app
2. In Supabase Dashboard > Table Editor > profiles
3. Find your user and change `role` from `user` to `admin`

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (dashboard)/        # Protected user pages
│   │   ├── dashboard/      # User dashboard
│   │   └── practice/       # ECG practice interface
│   ├── admin/              # Admin panel
│   │   └── ecgs/           # ECG management
│   ├── login/              # Authentication pages
│   ├── register/
│   └── page.tsx            # Landing page
├── components/
│   ├── ecg/                # ECG-specific components
│   │   ├── ecg-viewer.tsx  # Zoom/pan image viewer
│   │   ├── report-form.tsx # Report builder form
│   │   └── result-comparison.tsx
│   ├── layout/             # Layout components
│   └── ui/                 # Reusable UI components
├── lib/
│   ├── supabase/           # Supabase client config
│   ├── scoring.ts          # Scoring algorithm
│   ├── ecg-constants.ts    # ECG options/findings
│   └── cloudinary.ts       # Image upload helper
└── types/
    └── database.ts         # TypeScript types
```

## Scoring System

Reports are scored out of 100 points:

| Field | Points | Notes |
|-------|--------|-------|
| Rhythm | 25 | Multiple rhythms supported |
| Findings | 35 | Partial credit for partial matches |
| Heart Rate | 10 | ±10 bpm tolerance |
| Axis | 10 | Exact match required |
| PR Interval | 5 | Exact match required |
| QRS Duration | 5 | Exact match required |
| QT Interval | 5 | Exact match required |
| Regularity | 5 | Exact match required |

**Passing score**: 80%+

## Database Schema

See `supabase/schema.sql` for the complete schema including:

- `profiles`: User profiles extending Supabase auth
- `ecgs`: ECG case metadata and image URLs
- `official_reports`: Correct interpretations for each ECG
- `attempts`: User interpretation attempts with scores

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project to Vercel
3. Add environment variables
4. Deploy

### Other Platforms

The app can be deployed to any platform supporting Next.js:
- Railway
- Render
- AWS Amplify
- Self-hosted

## Future Enhancements

- [ ] AI-powered teaching integration
- [ ] Advanced analytics dashboard
- [ ] Error pattern analysis

## License

MIT
