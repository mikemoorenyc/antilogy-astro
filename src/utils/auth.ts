import { betterAuth } from "better-auth";
import { getEnv } from "@/_lib/env";

let hosts: string[] = []
if (process.env.NODE_ENV === "development") {
  hosts = ["192.168.1.88:4321", "localhost:4321"]
} else {
  const envHosts:string = import.meta.env.ALLOWED_HOSTS || ""
  hosts = envHosts.split(",").map(h=> h.trim())
}

export const auth = betterAuth({
  baseURL: {
    allowedHosts: hosts,
    protocol: process.env.NODE_ENV === "development" ? "http" : "https",
  },
  socialProviders: {
        google: {
            clientId: import.meta.env.GOOGLE_AUTH_ID||"",
            clientSecret: import.meta.env.GOOGLE_AUTH_SECRET||"",
        },
    },
});
