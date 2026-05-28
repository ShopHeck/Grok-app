export async function register() {
  // Validate environment variables at startup (server-side only)
  if (process.env.NODE_ENV === "production") {
    const { validateEnv } = await import("./lib/env");
    validateEnv();
  }
}
