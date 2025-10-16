import { createStorage } from "../_lib";
const bucketName = import.meta.env.GCLOUD_BUCKET || process.env.GCLOUD_BUCKET
export default async function deleteFile(path:string) : Promise<true>  {
  const storage = createStorage();
  if(!storage||!bucketName) {
    throw new Error("local variables not defined")
  }
  try {
      const deleted = await storage.bucket(bucketName).file(path).delete(); 
      return true; 
    } catch (err) {
      console.log("no delete",err);
      throw new Error(err as string);
    }
}
