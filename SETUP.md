# 🚀 CollabIt Setup Guide

This guide will help you set up the CollabIt project with all necessary dependencies and environment configurations.

## 📋 Prerequisites

Before setting up the project, make sure you have:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm**, **yarn**, or **pnpm** package manager
- **Git** for version control

## 🔧 Required Services Setup

### 1. Convex Database Setup

1. Visit [Convex Dashboard](https://dashboard.convex.dev/)
2. Create a new account or sign in
3. Create a new project
4. Copy your deployment URL and project name
5. Install Convex CLI globally: `npm install -g convex`

### 2. Clerk Authentication Setup

1. Visit [Clerk Dashboard](https://dashboard.clerk.com/)
2. Create a new account or sign in
3. Create a new application
4. Configure sign-in methods (email, social providers, etc.)
5. Copy your publishable key and secret key from the API Keys section

### 3. Liveblocks Real-time Collaboration Setup

1. Visit [Liveblocks Dashboard](https://liveblocks.io/dashboard)
2. Create a new account or sign in
3. Create a new project
4. Copy your public key and secret key from the API Keys section

## ⚙️ Installation & Setup

### Step 1: Clone and Install Dependencies

```bash
# Navigate to the project directory
cd CollabIt

# Install dependencies
npm install
# or
yarn install
# or
pnpm install
```

### Step 2: Environment Configuration

1. Copy the environment template:
```bash
cp .env.local.template .env.local
```

2. Fill in your actual values in `.env.local`:

```env
# Disable Next.js telemetry
NEXT_TELEMETRY_DISABLED=1

# Convex Database Configuration
CONVEX_DEPLOYMENT=dev:your-convex-project-name
NEXT_PUBLIC_CONVEX_URL=https://your-convex-project-name.convex.cloud

# Clerk Authentication Configuration
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_actual_key_here
CLERK_SECRET_KEY=sk_test_your_actual_secret_here

# Clerk Organization Settings (optional)
CLERK_DEFAULT_ORGANIZATION_ID=org_your_org_id_here

# Liveblocks Real-time Collaboration Configuration
NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY=pk_dev_your_actual_key_here
LIVEBLOCKS_SECRET_KEY=sk_dev_your_actual_secret_here
```

### Step 3: Convex Database Setup

1. Login to Convex:
```bash
npx convex login
```

2. Initialize Convex in your project:
```bash
npx convex dev
```

This will:
- Create a new Convex deployment
- Set up your database schema
- Start the development server

3. The Convex CLI will provide you with your deployment URL - update your `.env.local` file with this URL.

### Step 4: Clerk Authentication Setup

1. In your Clerk dashboard, configure your application settings:
   - **Allowed redirect URLs**: Add `http://localhost:3000`
   - **Sign-in options**: Configure email and any social providers you want
   - **Organizations**: Enable if you want multi-tenant functionality

2. Update the Clerk domain in `convex/auth.config.js` with your actual Clerk domain:
```javascript
const authConfig = {
  providers: [
    {
      domain: "https://your-clerk-domain.clerk.accounts.dev",
      applicationID: "convex",
    },
  ],
};
```

## 🚀 Running the Project

### Development Mode

```bash
# Start the Next.js development server
npm run dev
# or
yarn dev
# or
pnpm dev

# In a separate terminal, run Convex development server
npx convex dev
```

The application will be available at `http://localhost:3000`

### Production Build

```bash
# Build the application
npm run build

# Start the production server
npm run start
```

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 📁 Project Structure

```
├── app/                    # Next.js 13+ app directory
│   ├── (dashboard)/       # Dashboard pages
│   ├── api/              # API routes
│   └── board/            # Board pages
├── components/           # Reusable UI components
├── convex/              # Convex database schema and functions
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions
├── providers/           # React context providers
├── store/               # State management (Zustand)
└── types/               # TypeScript type definitions
```

## 🔑 Key Features

- **Real-time collaboration** with Liveblocks
- **Authentication** with Clerk
- **Database** with Convex
- **Modern UI** with Tailwind CSS and Radix UI
- **Drawing tools** with perfect-freehand
- **Responsive design**

## 🐛 Troubleshooting

### Common Issues

1. **Environment variables not loading**
   - Make sure `.env.local` is in the root directory
   - Restart your development server after changing environment variables

2. **Convex authentication errors**
   - Ensure your Clerk domain in `convex/auth.config.js` matches your actual domain
   - Verify your Convex deployment is running with `npx convex dev`

3. **Build errors**
   - Clear Next.js cache: `rm -rf .next`
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`

4. **Liveblocks connection issues**
   - Verify your Liveblocks keys are correct
   - Check that your API route `/api/liveblocks-auth` is working

### Getting Help

- Check the [Next.js documentation](https://nextjs.org/docs)
- Visit [Convex documentation](https://docs.convex.dev/)
- Check [Clerk documentation](https://clerk.com/docs)
- Read [Liveblocks documentation](https://liveblocks.io/docs)

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.