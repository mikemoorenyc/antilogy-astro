import { defineConfig } from 'auth-astro'
import Google from "@auth/core/providers/google"

export default defineConfig({
	providers: [
    Google(
      {
        clientId: import.meta.env.AUTH_GOOGLE_ID || process.env.AUTH_GOOGLE_ID,
        clientSecret: import.meta.env.AUTH_GOOGLE_SECRET || process.env.AUTH_GOOGLE_SECRET,
        
      }
    )
	],
  
  callbacks: {
    
    signIn({ profile }) {
      const userList = import.meta.env.ALLOWED_USERS || process.env.ALLOWED_USERS

      if(! userList) return "/loginerror" ; 
      if(!profile || !profile?.email) {
        console.log("no match")
        return "/loginerror"; 
      }
      const allowedUsers = userList.split(',');
     

      return allowedUsers.includes(profile?.email)? true : "/loginerror"
    }
  }
})