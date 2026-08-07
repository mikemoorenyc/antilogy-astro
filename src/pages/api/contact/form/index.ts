import { ddbDocClient } from "../../dynamodb/_lib/ddbDocClient";
import type { Contact, ContactFormSection } from "../_types";
import { GetCommand,UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { auth } from "@/utils/auth";
import { badResponse } from "../../_lib";
export const prerender = false

const SETTINGS_TABLE = import.meta.env.SETTINGS_TABLE 


export const getContactForm =  async ():Promise<Contact>=>  {

  if(!SETTINGS_TABLE) {
    console.log("SETTINGS_TABLE not defined")
    throw Error("SETTINGS_TABLE not defined")
    
  }
  const input = {
    TableName : SETTINGS_TABLE,
    Key: {
      section: "contact"
    }
 
  }
  try {
    const data = await ddbDocClient.send(new GetCommand(input));  
    if(!data.Item) {
      throw new Error("no item");
    }
     
    return data.Item as Contact ;
  } catch (err) {
      console.log("Error", err);
      throw new Error("couldn't get contact info")

  }

}

export const updateContactForm= async(updatePackage:Contact) :Promise<Contact> => {
  if(!SETTINGS_TABLE) throw new Error("no settings table defined"); 
  let UpdateExpression = "set ";
  let ExpressionAttributeValues :{[key:string]:string|ContactFormSection[]} = {}; 
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
      section: "contact",
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
    return update.Attributes as Contact; 
  } catch(err) {
    if (err instanceof Error) {
      throw new Error(err.message);
    } 
     throw new Error(String(err));
  }
}

export async function POST({request}:{request:Request}) {
  const session = await auth.api.getSession({
    headers:request.headers
  })
  if(!session) {
    return badResponse("Must be logged in",401);
  }
  

  const updatePackage = await request.json();
  try {
    const updatedSettings = await updateContactForm(updatePackage);
    return new Response(JSON.stringify({
      data: {
        item: updatedSettings
      }
    }),{
        status: 200,
        headers: {
          "Content-Type": "application/json"
        }
      })
  } catch (err) {
    console.log(err);
    return badResponse("Couldn't update episode")
  }
}