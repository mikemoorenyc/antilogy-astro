import { type Settings } from "./_types";
import { ddbDocClient } from "../dynamodb/_lib/ddbDocClient";
import { GetCommand,UpdateCommand,DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { getSession, } from 'auth-astro/server';
import { sessionCheck,badResponse, goodResponse } from "../_lib";


export const prerender = false
const SETTINGS_TABLE = import.meta.env.SETTINGS_TABLE 

export const getSettings = async (id:string="main") : Promise<Settings> => {

  if(!SETTINGS_TABLE) {
    console.log("SETTINGS_TABLE not defined")
    throw Error("SETTINGS_TABLE not defined")
    
  }
  const input = {
    TableName : SETTINGS_TABLE,
    Key: {
      section: id
    }
 
  }
  try {
    const data = await ddbDocClient.send(new GetCommand(input));  
     
    return data.Item as Settings;
  } catch (err) {
      console.log("Error", err);
      throw new Error("couldn't get settings")
  }
}
type SettingsValues = {main:string[],contact:string[]}
const settingsValues : SettingsValues  = {
  main: ["spotifyRefreshToken","siteTitle","siteDescription","siteFavicon","siteFaviconSVG","homepageLogo","siteLogo","siteBg"],
  contact : ["pageTitle", 
    "pageIntro",
    "physicalAddress",
    "contactInfo",
    "contactForm",
    "hours",
    "email"]
}


export const newUpdate = async(updatePackage:Settings) :Promise<Settings> => {
  if(!SETTINGS_TABLE) throw new Error("no settings table defined"); 
  let UpdateExpression = "set ";
  let ExpressionAttributeValues :{[key:string]:string} = {}; 
  Object.entries(updatePackage).forEach(([key, value]) => {
    if(key == "section"|| key == "lastUpdated") return; 
    UpdateExpression += ` ${key}=:${key},`
    ExpressionAttributeValues[`:${key}`] = value;
  });
  UpdateExpression  += "lastUpdated=:lastUpdated"
  ExpressionAttributeValues[":lastUpdated"] = new Date().toLocaleString();
  const command = {
    TableName:SETTINGS_TABLE,
    Key :{
      section: "main",
    },
    UpdateExpression,
    ExpressionAttributeValues,
    ReturnValues: "ALL_NEW" as const
  }
  try {
    const update = await ddbDocClient.send(new UpdateCommand(command));
    const deployHook = import.meta.env.DEPLOY_HOOK 
    if(deployHook) {
      const rebuild = await fetch(deployHook);
    }
    return update.Attributes as Settings; 
  } catch(err) {
    if (err instanceof Error) {
      throw new Error(err.message);
    } 
     throw new Error(String(err));
  }
}


export async function POST({request}:{request:Request}) {
  const session = await getSession(request)
  if(!session) {
    return badResponse("Must be logged in",401);
  }

  const updatePackage = await request.json();
  try {
    const updatedSettings = await newUpdate(updatePackage);
    return goodResponse({settings:updatedSettings})
    
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
