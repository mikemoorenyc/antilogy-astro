import { getSession, } from 'auth-astro/server';

export const badResponse = (status : string , code:number=500 ) => {
    return new Response(null, {
      status: code, 
      statusText: status
    })
}

export const sessionCheck = async (request:Request) => {
  const session = await getSession(request)
  if(!session) {
    return badResponse("Must be logged in",401);
  } else {
    return true; 
  }
}
