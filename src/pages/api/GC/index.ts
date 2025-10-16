import { getSession, } from 'auth-astro/server';
import deleteFile from './_methods/delete';
import { createStorage } from './_lib';
import { badResponse, goodResponse } from '../_lib';


export const prerender = false;

export async function DELETE({ params,request }:{params:{path:string},request:Request}) :Promise<Response> {
  const session = await getSession(request)
  if(!session) return badResponse("Not logged in",401);
  const {path} = await request.json(); 
  if(!path) return badResponse("No path specified",400);
  try {
    const deleted = await deleteFile(path); 
    if(deleted) {
      return goodResponse({deleted:true})
    } else {
      return badResponse("Couldn't delete",500); 
    }
  } catch(err) {
    return badResponse("Couldn't delete",500); 
  }
}