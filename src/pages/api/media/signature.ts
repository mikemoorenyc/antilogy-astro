import { v2 as cloudinary, type UploadApiOptions } from "cloudinary";
import { auth } from "@/utils/auth";
import { sessionCheck,badResponse, goodResponse } from "../_lib";
import type { APIRoute } from "astro";
export const prerender = false

const cloud_name = import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key = import.meta.env.PUBLIC_CLOUDINARY_API_KEY,
  api_secret = import.meta.env.PUBLIC_CLOUDINARY_API_SECRET



const generateSignature = (values?:UploadApiOptions) : UploadApiOptions & {signature:string,timestamp:number,api_key:string,cloud_name:string} => {
  

  
  if(!cloud_name||!api_key||!api_secret) {
    console.log("no api variabls",cloud_name,api_key,api_secret)
    throw new Error("env variables undefined"); 
  }
  
  
  const timestamp = Math.floor(Date.now() / 1000);
  const signParams=values? {...values,...{timestamp}}:{timestamp};
  if(values?.public_id) signParams.overwrite = true;
  
  try {
    cloudinary.config({cloud_name,api_key,api_secret});

    const signature = cloudinary.utils.api_sign_request(signParams,api_secret);
   
    return {
      ...signParams,
      ...{cloud_name,api_key,signature}
    }
  }catch(err) {
    console.log(err);
    throw new Error("couldn't generate signature")
  }
}
export const POST : APIRoute = async ({request}) => {
  const session = await auth.api.getSession({
      headers:request.headers
    })
    if(!session) {
      return badResponse("Not logged in",401)
    }
  /*const url = new URL(request.url);
  const public_id = url.searchParams.get("public_id");
  const resource_type = url.searchParams.get("resource_type");

  const values : SignatureValues = {}
  if(public_id){
    values.public_id = public_id
  }
  if(resource_type && ["raw","image"].includes(resource_type)) {
    values.resource_type = resource_type as "raw"|"image"
  };*/
  const params: UploadApiOptions = await request.json(); 
   
  try {
    const sig = !params ? generateSignature():generateSignature(params); 
    return goodResponse(sig);
  } catch {
    return badResponse("couldn't get signature"); 
  }
}


