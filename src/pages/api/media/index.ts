import { v2 as cloudinary } from "cloudinary";
import { sessionCheck,badResponse, goodResponse } from "../_lib";
import { getSession, } from 'auth-astro/server';
import type { APIRoute } from "astro";
export const prerender = false

const cloud_name = import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key = import.meta.env.PUBLIC_CLOUDINARY_API_KEY,
  api_secret = import.meta.env.CLOUDINARY_API_SECRET

export const deleteMedia = async (public_id:string):Promise<true> => {
  if(!cloud_name||!api_key||!api_secret) throw new Error("env variables undefined"); 
  cloudinary.config({cloud_name,api_key,api_secret});
  try {
    const result = await cloudinary.uploader.destroy(public_id);
    return true; 

  }catch(err) {
    throw new Error("Couldn't delete file"); 
  }
}

export const DELETE:APIRoute= async ({request}:{request:Request}) => {
  const session = getSession(request); 
  if(!session) {
    return badResponse("Not logged in",401)
  }
   const {public_id} = await request.json();
  if(!public_id) return badResponse("no publicid",401); 
  try {
    const deleted = await deleteMedia(public_id); 
    return goodResponse({deleted:true}); 

  } catch(err) {
    return badResponse("couldn't delete"); 

  }

}
