import type { Settings } from "../settings/_types";
import { badResponse } from "../_lib";
import { newUpdate,getSettings } from "../settings";
import { getSession } from "auth-astro/server";

export async function spotifyDisconnect() : Promise<boolean> {
  const settings = await getSettings()
  if(!settings) return false ; 
  const newPayload :Settings = {...settings, ...{spotifyRefreshToken:""}} 
  const removedConnection = await newUpdate(newPayload );
  if (!removedConnection){console.log("error updating"); return false}; 
  return true; 
}

export async function POST({ params,request }:{params:{path:string},request:Request}) {
  const session = await getSession(request);
  if(!session) {
    return badResponse("Not logged in",401);
  }
  const deletedConnection = await spotifyDisconnect();
  if(!deletedConnection) {
    return badResponse("couldn't delete");
  }
  return new Response(JSON.stringify({"deleted":true}),{
    status: 200,
    headers: {
      "Content-Type": "application/json"
    }
  })
}
