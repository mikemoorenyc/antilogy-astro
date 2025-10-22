import { v2 as cloudinary } from "cloudinary";
import { sessionCheck,badResponse, goodResponse } from "../_lib";
import { getSession, } from 'auth-astro/server';
export const prerender = false

const cloud_name = import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key = import.meta.env.PUBLIC_CLOUDINARY_API_KEY,
  api_secret = import.meta.env.CLOUDINARY_API_SECRET

export const deleteMedia = async (publicId:string):true => {
  if(!cloud_name||!api_key||!api_secret) throw new Error("env variables undefined"); 
  cloudinary.config({cloud_name,api_key,api_secret});
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return true; 

  }catch() {
    throw new Error("Couldn't delete file"); 
  }
}

export async function DELETE({params,request}) : Response {
  const session = getSession(request); 
  if(!session) {
    return badResponse("Not logged in",401)
  }
   const {publicId} = await request.json();
  if(!publicId) return badResponse("no publicid",401); 
  try {
    const deleted = await deleteMedia(publicId); 
    return goodResponse({deleted:true}); 

  } catch(err) {
    return badResponse("couldn't delete"); 

  }

}
