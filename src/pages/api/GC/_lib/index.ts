import { Storage } from "@google-cloud/storage";
const bucketName = import.meta.env.GCLOUD_BUCKET || process.env.GCLOUD_BUCKET



export const createStorage = () => {
  const id = import.meta.env.GCLOUD_PROJECT_ID || process.env.GCLOUD_PROJECT_ID
  const keys = import.meta.env.GCLOUD_CREDENTIALS || process.env.GCLOUD_CREDENTIALS 
  if(!id||!keys) { console.log("coudn't created storage"); return  false}; 
  return new Storage({
  projectId:process.env.CLOUD_PROJECT_ID,
  credentials: JSON.parse(keys)
  });
}
export const createBucket = () => {
   

  if(!bucketName ) {console.log("couldn't create bucket"); return false }; 
  const storage = createStorage();
  if(!storage) return false; 
  return storage.bucket(bucketName);
}