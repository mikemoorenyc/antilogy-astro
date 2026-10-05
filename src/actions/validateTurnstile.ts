import { ActionError, defineAction } from 'astro:actions';
import { z } from 'astro/zod';

const siteSecret = import.meta.env.PUBLIC_TURNSTILE_SITE_SECRET||""

export const validator = async (token:string) => {
  try {
		const response = await fetch(
			"https://challenges.cloudflare.com/turnstile/v0/siteverify",
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					secret: siteSecret,
					response: token,

				}),
			},
		);

    const result: { success: boolean } = await response.json();
    console.log(result);
    if (!result.success) {
       console.log(result);
      throw new ActionError({
        message: "Couldn't validate",
        code:"UNAUTHORIZED"
      })
    }
		return {success:true }
  } catch (error) {

    throw new ActionError({
      message: "Couldn't connect to Cloudflare",
			code:"BAD_REQUEST"
			})
	}
}
export const turnstile = {
  validateToken: defineAction({
    input: z.string(),
    handler:validator
  })
}
