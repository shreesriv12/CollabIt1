// This file is needed to support autocomplete for process.env
export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // convex public url
      NEXT_PUBLIC_CONVEX_URL: string;

      // clerk default org id
      CLERK_DEFAULT_ORGANIZATION_ID: string;

      // liveblocks api keys
      NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY: string;
      LIVEBLOCKS_SECRET_KEY: string;

      // Google API credentials
      GOOGLE_CLIENT_ID: string;
      GOOGLE_CLIENT_SECRET: string;
      NEXT_PUBLIC_GOOGLE_API_KEY: string;
    }
  }
}