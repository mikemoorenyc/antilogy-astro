import { ddbDocClient } from "../dynamodb/_lib/ddbDocClient";
import { GetCommand,UpdateCommand,DeleteCommand,ScanCommand } from "@aws-sdk/lib-dynamodb";
import { getSession, } from 'auth-astro/server';
import { sessionCheck,badResponse, goodResponse } from "../_lib";
import { getSettings } from "../settings";
import type { Faq,FaqSection } from "./_types";
import type { UpdateCommandInput } from "@aws-sdk/lib-dynamodb";

export const prerender = false;

const SETTINGS_TABLE = import.meta.env.SETTINGS_TABLE 

const dbTable = {TableName: SETTINGS_TABLE,
      Key :{
        section: "faqs"
      }
}


export const getFaqs = async function() :Promise<FaqSection[]> {
  if(!SETTINGS_TABLE) {
    throw new Error("no settings table defined");
  }
  
  try {
     
     const faqSection = await ddbDocClient.send(new GetCommand(dbTable));  
     
      if (!faqSection.Item) {

        throw new Error("no data")
      }
      const item = faqSection.Item; 

      if(!item.faqSection) {
        return [] as FaqSection[];
      }
      return item.faqSection as FaqSection[];
      
    } catch (err) {
      throw new Error("coulnd't connect for FAQs");
    }
}
const updateFaqs = async (faqs: Faq[]) : Promise<Faq[]> => {
  if(!SETTINGS_TABLE) {
    throw new Error("no settings table defined");
  }
  const command : UpdateCommandInput = {...dbTable, ...{
    UpdateExpression: `set faqSection=:faqSection`,
    ExpressionAttributeValues: {
      ":faqSection": faqs
    },
    ReturnValues:"ALL_NEW"
  }

  }
  try {
    const update = await ddbDocClient.send(new UpdateCommand(command));
    if(!update.Attributes) {
      throw new Error("no attributes defined");
    }
    const deployHook = import.meta.env.DEPLOY_HOOK 
    if(deployHook) {
      const rebuild = await fetch(deployHook);
    }
    console.log(update.Attributes.faqSection)
    return update.Attributes.faqSection as Faq[]; 

  } catch(err) {
    if (err instanceof Error) {
      throw new Error(err.message);
    } 
     throw new Error(String(err));
    
  }

}
export async function POST({request}:{request:Request}) {
  const session = getSession(request); 
  if(!session) {
    return badResponse("Not logged in",401)
  }
  const {faqs} = await request.json();
  console.log(faqs);
  if(!faqs) {
    return badResponse("No faqs",400);
  }
  const results = await updateFaqs(faqs); 
  if(!results) {
    return badResponse("couldn't updated",500);
  }
  return goodResponse({faqs})


}