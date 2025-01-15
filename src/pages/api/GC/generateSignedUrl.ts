import { getSession, } from 'auth-astro/server';
import { createBucket } from './_lib';

export const prerender = false

export async function POST({ params,request }:{params:{path:string},request:Request}) {
  const session = await getSession(request)
  
  if(!session) {
    return new Response(
      null, {
        status: 401,
        statusText: "Must be logged in"
      }
    )
  }
  const {path} = await request.json(); 
  if(!path) {
    return new Response(null, {
      status:500,
      statusText: "no path specified"
    }) 
  }
  
  const corsList = import.meta.env.GCLOUD_CORS || process.env.GCLOUD_CORS
  const bucket = createBucket(); 
  if(!corsList||!bucket) {
    return new Response(null, {
      status:500,
      statusText: "error bucket or cors"
    }) 
  }
  try {
     const corSet = await bucket.setCorsConfiguration([
    {
      "origin": corsList.split(','),
      "method": ["POST"],
      "responseHeader": ["Content-Type"],
      "maxAgeSeconds": 3600
    }
  ])
  } catch(err) {
    console.log(err);
    return new Response(null, {
      status:500,
      statusText: "error setting CORS"
    }) 
  }
  const file = bucket.file(path as string);
  const options = {
    expires: Date.now() + 5 * 60 * 1000, //  5 minutes,
    fields: { "x-goog-meta-source": "astro-project" },
  };
  const [response] = await file.generateSignedPostPolicyV4(options);


  if(!response) {
    return new Response(null, {
      status:500,
      statusText: "error getting url from API"
    }) 
  }
  return  new Response(
       JSON.stringify(response)
      ,{
      status:200,
      headers: {
        "Content-Type": "application/json"
      }
    }
    )
}