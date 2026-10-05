import { v2 as cloudinary } from "cloudinary";
import { sessionCheck,badResponse, goodResponse } from "../_lib";
import { auth } from "@/utils/auth";
import type { APIRoute } from "astro";
export const prerender = false

const cloud_name = import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key = import.meta.env.PUBLIC_CLOUDINARY_API_KEY,
  api_secret = import.meta.env.CLOUDINARY_API_SECRET

export const deleteMedia = async (public_id: string|string[]): Promise<true> => {
  console.log(api_key)
  let toDelete = [];
  if (Array.isArray(public_id)) {
    toDelete = public_id
  } else {
    toDelete = [public_id]
  }
  if(!cloud_name||!api_key||!api_secret) throw new Error("env variables undefined");
  cloudinary.config({cloud_name,api_key,api_secret});
  try {
    const result = await cloudinary.api.delete_resources(toDelete);
    console.log(result);
    return true;

  } catch (err) {
    console.log(err);
    throw new Error("Couldn't delete file");
  }
}

export const DELETE:APIRoute= async ({request}:{request:Request}) => {
  const {public_id,isPublic} = await request.json();
  const session = await auth.api.getSession({
    headers:request.headers
  })
  if (!session && !isPublic) {
    console.log("no login")
    return badResponse("Not logged in",401)
  }
  console.log("no public id")
  if(!public_id) return badResponse("no publicid",401);
  try {
    const deleted = await deleteMedia(public_id);
    return goodResponse({deleted:true});

  } catch (err) {
    console.log(err)
    return badResponse("couldn't delete");

  }

}
