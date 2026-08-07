import { betterAuth } from "better-auth";
import { getEnv } from "@/_lib/env";
export const auth = betterAuth({
  socialProviders: {
        google: {
            clientId: import.meta.env.GOOGLE_AUTH_ID||"",
            clientSecret: import.meta.env.GOOGLE_AUTH_SECRET||"",
        },
    },
});