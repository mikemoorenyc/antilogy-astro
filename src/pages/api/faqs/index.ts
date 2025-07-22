import { ddbDocClient } from "../dynamodb/_lib/ddbDocClient";
import { GetCommand,UpdateCommand,DeleteCommand,ScanCommand } from "@aws-sdk/lib-dynamodb";
import { getSession, } from 'auth-astro/server';
import { sessionCheck,badResponse } from "../_lib";

const FAQS_TABLE = import.meta.env.FAQS_TABLE 

export type TFaq = {
  question:string,
  answer:string, 
  category?: string
  id:number
}
export type TFaqSection = {
  title: string,
  id:number, 
  questions: TFaq[];
}

export const getFaqs = async function() {
  try {
     const data = await ddbDocClient.send(new ScanCommand({ TableName: FAQS_TABLE }));
      if (!data.Items) {
        console.log("not data",data);
        return false; 
      }
      return data.Items as TFaqSection[];
      
    } catch (err) {
      console.log("Error", err);
    }
}