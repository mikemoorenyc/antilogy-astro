import { type TSettings } from "../../../../types";
import { ddbDocClient } from "./_lib/ddbDocClient";
import { GetCommand,UpdateCommand,DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { getSession, } from 'auth-astro/server';
import { sessionCheck,badResponse } from "../_lib";

export const prerender = false
const SETTINGS_TABLE = import.meta.env.SETTINGS_TABLE || process.env.SETTINGS_TABLE 

export const getSettings = async () => {

  if(!SETTINGS_TABLE) {
    console.log("SETTINGS_TABLE not defined")
    throw Error("SETTINGS_TABLE not defined")
    
  }
  const input = {
    TableName : SETTINGS_TABLE,
    Key: {
      section: "main"
    }
 
  }
  try {
    const data = await ddbDocClient.send(new GetCommand(input));  
     
    return data.Item as TSettings;
  } catch (err) {
      console.log("Error", err);
      return false; 
  }
}

const updateSettings = async (updatePackage : TSettings) =>{
  const expressAttr:any = {};
  let atts = ["siteTitle","siteDescription","siteFavicon","siteFaviconSVG","homepageLogo","siteLogo","siteBg"].filter(a => updatePackage[a as keyof TSettings]).map(a => {
    const value = updatePackage[a as keyof TSettings];
    expressAttr[`:${a}`] = value 
    return `${a} = :${a}`
  }).join(" , ");
  atts = "set "+atts
  atts = atts+`,lastUpdated = :lastUpdated`
  expressAttr[`:lastUpdated`] = new Date().toLocaleString();


  const command = {
      TableName:SETTINGS_TABLE,
      Key : {
        section: "main"
      },
      UpdateExpression: atts,
      ExpressionAttributeValues: expressAttr,
      ReturnValue: "ALL_NEW"
    }
    try {
      const update = await ddbDocClient.send(new UpdateCommand(command));
      //REDEPLOY
      const deployHook = import.meta.env.DEPLOY_HOOK || process.env.DEPLOY_HOOK
      if(deployHook) {
        const rebuild = await fetch(deployHook);
      }
      return true ; 
      /*
      return new Response(JSON.stringify(await getSettings()),{
        status: 200,
        headers: {
          "Content-Type": "application/json"
        }
      })
      */
    } catch(err) {
      
      console.log("Error",err)
      return false; 
    }
}

export async function POST({request}:{request:Request}) {
  const session = await getSession(request)
  if(!session) {
    return badResponse("Must be logged in",401);
  }

  const updatePackage = await request.json() as TSettings;
  try {
    const updatedSettings = await updateSettings(updatePackage);
    return new Response(JSON.stringify(await getSettings()),{
        status: 200,
        headers: {
          "Content-Type": "application/json"
        }
      })
  } catch (err) {
    console.log(err);
    return badResponse("Couldn't update episode")
  }
  /*
  const expressAttr:any = {};
  let updateExpress = "set ";
  
  let atts = ["siteTitle","siteDescription","siteIcon","homePageLogo","siteLogo"].filter(a => {
    const value = updatePackage[a as keyof TSettings];
    if (!value) return false; 
    expressAttr[`:${a}`] = value 
    return `${a} = :${a}`
  }).join(" , ");
  atts = "set "+atts
  atts = atts+`,lastUpdated = :lastUpdated`
    
    atts.forEach((a,i) => {
      const value = updatePackage[a as keyof TSettings] 
      updateExpress = updateExpress + `${i !== 0? " , ":""}${a}=:${a}`
      expressAttr[`:${a}`] = value ? value : ""; 
    })
    
 /// updateExpress = updateExpress + `,lastUpdated = :lastUpdated`
 // expressAttr[`:lastUpdated`] = new Date().toLocaleString(); 
  const command = {
      TableName:SETTINGS_TABLE,
      Key : {
        id: "main"
      },
      UpdateExpression: updateExpress,
      ExpressionAttributeValues: expressAttr,
      ReturnValue: "ALL_NEW"
    }
    try {
      const update = await ddbDocClient.send(new UpdateCommand(command));
      //REDEPLOY
      const deployHook = import.meta.env.DEPLOY_HOOK || process.env.DEPLOY_HOOK
      if(deployHook) {
        const rebuild = await fetch(deployHook);
      }
      return new Response(JSON.stringify(await getSettings()),{
        status: 200,
        headers: {
          "Content-Type": "application/json"
        }
      })
    
    } catch(err) {
      console.log("Error",err)
    }
    */
}
