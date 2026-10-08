import { ActionError, defineAction } from 'astro:actions';
import { z } from 'astro/zod';
import { isAuthed } from "@/utils/auth";
import { GetCommand,UpdateCommand,DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { ddbDocClient } from "@/utils/dynamoDb/ddbDocClient"
const SETTINGS_TABLE = import.meta.env.SETTINGS_TABLE;
import { type TFAQSettings,type TMainSettings,type TContactSettings, type TFAQ } from './schema';


export const getSettingsSection = async (key: "main"|"faqs"|"contact") : Promise<TContactSettings|TMainSettings|TFAQSettings> => {
  if (!SETTINGS_TABLE) {
    throw new ActionError({
      code: "BAD_REQUEST",
      message:"Settings table not defined"
    })
  }
  try {
    const data = await ddbDocClient.send(new GetCommand({
      TableName: SETTINGS_TABLE,
      Key: {
        section:key
      }
    }));
    if (!data.Item) {
      throw new ActionError({
        code: "BAD_REQUEST",
        message:"No data item returned"
      })
    }
    if (key == "main") {
      return data.Item as TMainSettings
    }
    if (key == "contact") {
      return data.Item as TContactSettings
    }
    const item = data.Item as TMainSettings;
    if (key == "faqs") {
      return item.faqSection as TFAQSettings;
    }
    return data.Item as TMainSettings
  } catch (err) {
    throw new ActionError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Errored "+String(err)
    })
  }
}


export const settings = {
  getSettingsSection: defineAction({
    input: z.union([z.literal("main"),z.literal("faqs"),z.literal("contact")]),
    handler:getSettingsSection
  })
}
