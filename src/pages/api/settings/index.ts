import { type Settings } from "./types";
import { ddbDocClient } from "../dynamodb/_lib/ddbDocClient";
import { GetCommand,UpdateCommand,DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { getSession, } from 'auth-astro/server';
import { sessionCheck,badResponse } from "../_lib";

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

export const updateSettings = async (updatePackage :any ) =>{
  const updateKey: string = updatePackage?.section;
  if(!updateKey) {
    return false; 
  } 
  const updateArray: string[] = settingsValues[updateKey as keyof SettingsValues]; 
  const expressAttr:any = {};
  let atts = updateArray.filter(a => updatePackage[a ]).map(a => {
    const value = updatePackage[a ];
    expressAttr[`:${a}`] = value 
    return `${a} = :${a}`
  }).join(" , ");
  atts = "set "+atts
  atts = atts+`,lastUpdated = :lastUpdated`
  expressAttr[`:lastUpdated`] = new Date().toLocaleString();


  const command = {
      TableName:SETTINGS_TABLE,
      Key : {
        section: updateKey
      },
      UpdateExpression: atts,
      ExpressionAttributeValues: expressAttr,
      ReturnValue: "ALL_NEW"
    }
    try {
      const update = await ddbDocClient.send(new UpdateCommand(command));
      //REDEPLOY
      const deployHook = import.meta.env.DEPLOY_HOOK 
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

  const updatePackage = await request.json();
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
