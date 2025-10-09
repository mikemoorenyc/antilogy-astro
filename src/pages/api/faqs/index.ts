import { ddbDocClient } from "../dynamodb/_lib/ddbDocClient";
import { GetCommand,UpdateCommand,DeleteCommand,ScanCommand } from "@aws-sdk/lib-dynamodb";
import { getSession, } from 'auth-astro/server';
import { sessionCheck,badResponse } from "../_lib";
import { getSettings } from "../settings";
import type { Faq,FaqSection } from "./types";

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
  const command = {...dbTable, {
    
  }

  }
  return []; 
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

}