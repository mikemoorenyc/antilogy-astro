import { getSession, } from 'auth-astro/server';

import { createStorage } from './_lib';

export const prerender = false;
const bucketName = import.meta.env.GCLOUD_BUCKET || process.env.GCLOUD_BUCKET

export const deleteFile = async (filePath:string) => {
  
    //const bucket = createBucket(); 
    const storage = createStorage();
    
    if(!storage || !bucketName) {console.log(storage,bucketName); return false;} 
    try {
      const deleted = await storage.bucket(bucketName).file(filePath).delete(); 
      
      return true; 
    } catch (err) {
      console.log("no delete",err);
      throw new Error(err as string);
    }
  
} 

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
  console.log(path);
  if(!path) {
    return new Response(null, {
      status:500,
      statusText: "no path specified"
    }) 
  }
  

  try {
    const deletedFile = await deleteFile(path);
    console.log(deletedFile)
    if(!deletedFile) {
      return new Response(null, {
      status:500,
      statusText: "error deleting file"
     })
    }
  } catch(err) {
    console.log(err);
    return new Response(null, {
      status:500,
      statusText: "error deleting file"
    }) 
  }

  


  
  return  new Response(
       JSON.stringify({success:true})
      ,{
      status:200,
      headers: {
        "Content-Type": "application/json"
      }
    }
    )
}