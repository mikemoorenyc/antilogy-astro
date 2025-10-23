import { v2 as cloudinary } from "cloudinary";
import { sessionCheck,badResponse, goodResponse } from "../_lib";
import type { APIRoute } from "astro";
export const prerender = false

const cloud_name = import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key = import.meta.env.PUBLIC_CLOUDINARY_API_KEY,
  api_secret = import.meta.env.CLOUDINARY_API_SECRET


type SignatureValues = {
  public_id?: string,
  resource_type?:"raw"|"image",
  overwrite?:true
}

const generateSignature = (values?:SignatureValues) : SignatureValues & {overwrite?:true,signature:string,timestamp:number,api_key:string,cloud_name:string} => {
  if(!cloud_name||!api_key||!api_secret) throw new Error("env variables undefined"); 
  cloudinary.config({cloud_name,api_key,api_secret});
  const timestamp = Math.floor(Date.now() / 1000);
  const signParams=values? {...values,...{timestamp}}:{timestamp};
  if(values?.public_id) signParams.overwrite = true;
  
  try {
    const signature = cloudinary.utils.api_sign_request(signParams,api_key);
    return {
      ...signParams,
      ...{cloud_name,api_key,signature}
    }
  }catch(err) {
    throw new Error("couldn't generate signature")
  }
}
export const GET : APIRoute = ({params}) => {
  const values : SignatureValues = {}
  if(params.public_id){
    values.public_id = params.public_id
  }
  if(params.resource_type && ["raw","image"].includes(params.resource_type)) {
    values.resource_type = params.resource_type as "raw"|"image"
  }; 
  try {
    const sig = (Object.entries(values).length === 0) ? generateSignature():generateSignature(values); 
    return goodResponse(sig);
  } catch {
    return badResponse("couldn't get signature"); 
  }
}


