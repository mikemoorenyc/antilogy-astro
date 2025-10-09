import { ddbDocClient } from "../../dynamodb/_lib/ddbDocClient";
import type { Contact } from "../types";
import { GetCommand } from "@aws-sdk/lib-dynamodb";
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