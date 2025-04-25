import "dotenv/config";

export const appConfig = {
  node: process.env.NODE_ENV || "development",
  isProduction: process.env.NODE_ENV === "production",
  isDevelopment: process.env.NODE_ENV === "development",
  name: process.env.APP_NAME,
  port: Number(process.env.PORT),
  useCompression: true,
  runsBehindProxy: true,
  appUrl: process.env.APP_URL,
  version: "/v1",

  //  cronJobsEnabled: toBool(env("ENABLE_CRON_JOBS")),
};
