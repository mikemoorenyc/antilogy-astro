import { createAuthClient } from "better-auth/client"
import {getEnv} from "@/_lib/env"
export const authClient =  createAuthClient({
     baseURL: import.meta.env.PUBLIC_SITE_URL
})
