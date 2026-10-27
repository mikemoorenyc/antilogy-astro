import { v2 as cloudinary, type UploadApiOptions } from "cloudinary";
import { ActionError, defineAction, type ActionAPIContext } from 'astro:actions';
import { z } from 'astro/zod';
import { isAuthed } from "@/utils/auth";

const cloud_name = import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key = import.meta.env.PUBLIC_CLOUDINARY_API_KEY,
  api_secret = import.meta.env.CLOUDINARY_API_SECRET
const badEnv = !cloud_name || !api_key || !api_secret;

const SignatureInput = z.object({
  public_id: z.string(),
  overwrite: z.boolean(),
  public:z.boolean()
}).partial()
type TSignatureInput = z.infer<typeof SignatureInput>

const generateSignature = async (values: TSignatureInput,context:ActionAPIContext): Promise<UploadApiOptions & { signature: string, timestamp: number, api_key: string, cloud_name: string }> => {
  if (badEnv) {
    throw new ActionError({code:"INTERNAL_SERVER_ERROR",message:"env variables undefined"})
  }

  if (!values?.public) {
    if (!await isAuthed(context.request)) {
      throw new ActionError({ code:"UNAUTHORIZED",message:"Need to be logged in" })
    }
  } else {
    delete values.public
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
    throw new ActionError({code:"BAD_REQUEST",message:"Couldn generate sig"})
  }
}

const DeleteInput = z.object({
  items: z.union([z.string(), z.array(z.string())]),
  publicUser: z.boolean().optional()
})
type TDeleteInput = z.infer<typeof DeleteInput>
export const deleteMedia = async (input:TDeleteInput,context:ActionAPIContext): Promise<true> => {
  if (badEnv) {
    throw new ActionError({code:"INTERNAL_SERVER_ERROR",message:"env variables not configured"})
  }
  const { items, publicUser=false } = input;
  if (!publicUser) {
    if (!await isAuthed(context.request)) {
      throw new ActionError({ code:"UNAUTHORIZED",message:"Need to be logged in" })
    }
  }
  let toDelete = [];
  if (Array.isArray(items)) {
    toDelete = items
  } else {
    toDelete = [items]
  }
  cloudinary.config({cloud_name,api_key,api_secret});
  try {
    const result = await cloudinary.api.delete_resources(toDelete);
    console.log(result);
    return true;

  } catch (err) {
    throw new ActionError({code:"INTERNAL_SERVER_ERROR",message:"Cloudinary couldn't delete:"+String(err)})
  }
}
export const media = {
  generateSignature: defineAction({
    input: SignatureInput,
    handler: generateSignature
  }),
  deleteMedia: defineAction({
    input: DeleteInput,
    handler:deleteMedia
  })
}
