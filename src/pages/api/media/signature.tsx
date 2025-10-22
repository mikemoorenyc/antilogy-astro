import { v2 as cloudinary } from "cloudinary";
import { sessionCheck,badResponse, goodResponse } from "../_lib";
export const prerender = false

const cloud_name = import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key = import.meta.env.PUBLIC_CLOUDINARY_API_KEY,
  api_secret = import.meta.env.CLOUDINARY_API_SECRET


type SignatureValues = {
  folder?: string, 
  public_id?: string,
  resource_type?:"raw"|"image"
}

const generateSignature = (values?:SignatureValues) : SignatureValues & {signature:string,timestamp:number,api_key:string,cloud_name:string} => {
  if(!cloud_name||!api_key||!api_secret) throw new Error("env variables undefined"); 
  cloudinary.config({cloud_name,api_key,api_secret});
  const timestamp = Math.floor(Date.now() / 1000);
  const signParams=values? {...values,...{timestamp,overwrite:true}}:{timestamp}
  
  try {
    const signature = cloudinary.utils.api_sign_request({...signParams,...{timestamp}}, process.env.CLOUDINARY_API_SECRET);
    return {
      ...signParams,
      ...{cloud_name,api_key,signature}
    }
  }catch(err) {
    throw new Error("couldn't generate signature")
  }
}
export async function GET({params,request}:{request:Request}) {
  const values : SignatureValues = {}
  if(params.folder)values.folder = params.folder;
  if(params.public_id)values.public_id = params.public_id;
  if(["raw","image"].includes(params.resource_type)values.resource_type = params.resource_type; 
  try {
    const sig = (Object.entries(values).length === 0) ? generateSignature():generateSignature(values); 
    return goodResponse(sig);
  } catch {
    return badResponse("couldn't get signature"); 
  }
}


