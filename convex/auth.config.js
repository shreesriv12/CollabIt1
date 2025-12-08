const authConfig = {
  providers: [
    {
      // Your existing Clerk configuration
      domain: "https://suitable-prawn-91.clerk.accounts.dev",
      applicationID: "convex",
    },
    // ADD THE GOOGLE PROVIDER HERE
    {
      domain: "https://accounts.google.com",
      applicationID: "GOOGLE", // The required applicationID for Google in Convex
    },
  ],
};

export default authConfig;