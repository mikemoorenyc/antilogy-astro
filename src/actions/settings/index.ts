import { ActionError, defineAction } from 'astro:actions';
import { isAuthed ,auth} from "@/utils/auth";
import { GetCommand,UpdateCommand,DeleteCommand, type UpdateCommandInput } from "@aws-sdk/lib-dynamodb";
import { ddbDocClient } from "@/utils/dynamoDb/ddbDocClient"
const SETTINGS_TABLE = import.meta.env.SETTINGS_TABLE;
import { type TFAQSettings, type TMainSettings, type TContactSettings, type TFAQ, MainSettings, FAQSettings, ContactSettings, type TSampleSettings, SamplesSettings, type TBackgroundImageValues } from './schema';
import type { ActionAPIContext } from 'astro/actions/runtime/entrypoints/server.js';


const settingsSchemas = {
  main: MainSettings,
  faqs: FAQSettings,
  contact: ContactSettings

} as const;
type SettingsKey = keyof typeof settingsSchemas;


export const getSettingsSection = async (key: string) => {
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

    return data.Item;



  } catch (err) {
    throw new ActionError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Errored "+String(err)
    })
  }
}
const getMainSettings = async () : Promise<TMainSettings> => {
  try {
    const data = await getSettingsSection("main")
    return MainSettings.parse(data)
  } catch (err) {
    if (err instanceof ActionError) throw err;
    throw new ActionError({
      code: "INTERNAL_SERVER_ERROR",
      message:"Couldn't get main settings"
    })
  }
}
const updateMainSettings = async (data:TMainSettings,context:ActionAPIContext): Promise<TMainSettings> => {

  const { user, error } = await checkUpdateReady(context);
  if (error||!user) {
    throw error;
  }
  const dbTable = {TableName: SETTINGS_TABLE,
      Key :{
        section: "main"
      }
  }
  let ExpressionAttributeValues: Record<string, string | number|TBackgroundImageValues[]> = {};
  let UpdateExpressionArray: string[] = [];
  let newData = {
    ...data, ...{
      modifiedBy: user.email,
      modifiedAt:Date.now()
  }}
  Object.entries(newData).forEach(([key, value]) => {
    ExpressionAttributeValues[`:${key}`] = value;
    UpdateExpressionArray.push(`${key}=:${key}`)
  });



  const command: UpdateCommandInput = {
    ...dbTable, ...{
      UpdateExpression: `set ${UpdateExpressionArray.join(',')}`,
      ExpressionAttributeValues,
      ReturnValues: "ALL_NEW"
    }
  }
  try {
    const update = await ddbDocClient.send(new UpdateCommand(command));
    if(!update.Attributes) {
      throw new ActionError({
        code: "INTERNAL_SERVER_ERROR",
        message:"No attributes returned "
      });
    }
    const { success, error } = await rebuilder();
    if (error) {
      throw error;
    }
    return MainSettings.parse(update.Attributes);
  } catch (err) {
    throw new ActionError({
      code: "INTERNAL_SERVER_ERROR",
      message:"Couldn't update:"+String(err)
    })
  }


}
const getFaqSettings = async (): Promise<TFAQSettings> => {
  try {
    const data = await getSettingsSection("faqs");
   ;
    return FAQSettings.parse(data);
  } catch (err) {
    if (err instanceof ActionError) throw err
    console.log(err);
    throw new ActionError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Couldn't get faq settings"
    })
  }
}
const getSamplesSettings = async (): Promise<TSampleSettings> => {
  try {
    const data = await getSettingsSection("samples");
   ;
    return SamplesSettings.parse(data)
  } catch (err) {
    if (err instanceof ActionError) throw err
    console.log(err);
    throw new ActionError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Couldn't get sample settings"
    })
  }
}
export const getContactSettings = async (): Promise<TContactSettings> => {
  try {
    const data = await getSettingsSection("contact");
    ;

    return ContactSettings.parse(data)
  } catch (err) {
    if (err instanceof ActionError) throw err
    console.log(err);
    throw new ActionError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Couldn't get contact settings"
    })
  }
}
const checkUpdateReady = async (context: ActionAPIContext): Promise<{
  success: boolean,
  user?: {
    id:string,email:string
  }
  error?: ActionError
}> => {
  if (!SETTINGS_TABLE) {
    return {
      success: false,
      error: new ActionError({
        code: "INTERNAL_SERVER_ERROR",
        message:"SETTINGS_TABLE undefined"
      })
    }
  }
  const session = await auth.api.getSession({
    headers:context.request.headers
  })
  if (!session) {
    return {
      success: false,
      error: new ActionError({
        code: "UNAUTHORIZED",
        message:"Session not authenticated"
      })
    }
  }
  return {
    success: true,
    user: session.user
  }

}
const rebuilder = async () => {
  const deployHook = import.meta.env.DEPLOY_HOOK
  if(deployHook) {
    try {
      const rebuild = await fetch(deployHook);
      return {success:true}
    } catch (err) {
      return {
        error:new ActionError({
          code: "INTERNAL_SERVER_ERROR",
         message:"Couldn't redeploy"+String(err)
        })
      }
    }
  } else {
    return {success:true}
  }
}

const updateFaqSettings = async (data:TFAQSettings,context:ActionAPIContext): Promise<TFAQSettings> => {

  const { user, error } = await checkUpdateReady(context);
  if (error||!user) {
    throw error;
  }
  const dbTable = {TableName: SETTINGS_TABLE,
      Key :{
        section: "faqs"
      }
  }
  const { faqSection, pageTitle, pageIntro } = data;
  const ExpressionAttributeValues = {
    ":faqSection": faqSection,
    ":pageTitle": pageTitle,
    ":pageIntro": pageIntro,
    ":modifiedBy": user.email,
    ":modifiedAt":Date.now()
  }
  if (!pageIntro) {
    delete ExpressionAttributeValues[":pageIntro"];
  }
  const command: UpdateCommandInput = {
    ...dbTable, ...{
      UpdateExpression: `set modifiedBy=:modifiedBy,modifiedAt=:modifiedAt,faqSection=:faqSection,pageTitle=:pageTitle${pageIntro ? ",pageIntro=:pageIntro" : ""}`,
      ExpressionAttributeValues,
      ReturnValues: "ALL_NEW"
    }
  }
  try {
    const update = await ddbDocClient.send(new UpdateCommand(command));
    if(!update.Attributes) {
      throw new ActionError({
        code: "INTERNAL_SERVER_ERROR",
        message:"No attributes returned "
      });
    }
    const { success, error } = await rebuilder();
    if (error) {
      throw error;
    }
    return FAQSettings.parse(update.Attributes);
  } catch (err) {
    throw new ActionError({
      code: "INTERNAL_SERVER_ERROR",
      message:"Couldn't update:"+String(err)
    })
  }


}

const updateSampleSettings = async (data:TSampleSettings,context:ActionAPIContext): Promise<TSampleSettings> => {

  const { user, error } = await checkUpdateReady(context);
  if (error||!user) {
    throw error;
  }
  const dbTable = {TableName: SETTINGS_TABLE,
      Key :{
        section: "samples"
      }
  }
  const { sampleImages, pageTitle, pageIntro } = data;
  const ExpressionAttributeValues = {
    ":sampleImages": sampleImages,
    ":pageTitle": pageTitle,
    ":pageIntro": pageIntro,
    ":modifiedBy": user.email,
    ":modifiedAt":Date.now()
  }
  if (!pageIntro) {
    delete ExpressionAttributeValues[":pageIntro"];
  }
  const command: UpdateCommandInput = {
    ...dbTable, ...{
      UpdateExpression: `set modifiedBy=:modifiedBy,modifiedAt=:modifiedAt,sampleImages=:sampleImages,pageTitle=:pageTitle${pageIntro ? ",pageIntro=:pageIntro" : ""}`,
      ExpressionAttributeValues,
      ReturnValues: "ALL_NEW"
    }
  }
  try {
    const update = await ddbDocClient.send(new UpdateCommand(command));
    if(!update.Attributes) {
      throw new ActionError({
        code: "INTERNAL_SERVER_ERROR",
        message:"No attributes returned "
      });
    }
    const { success, error } = await rebuilder();
    if (error) {
      throw error;
    }
    return SamplesSettings.parse(update.Attributes);
  } catch (err) {
    throw new ActionError({
      code: "INTERNAL_SERVER_ERROR",
      message:"Couldn't update:"+String(err)
    })
  }


}
const updateContactSettings = async (data: TContactSettings, context: ActionAPIContext): Promise<TContactSettings> => {

  const { user, error } = await checkUpdateReady(context);
  if (error || !user) {
    console.log(user);
    console.log(error)
    throw error;
  }
  const dbTable = {TableName: SETTINGS_TABLE,
      Key :{
        section: "contact"
      }
  }
  const updateString: string[] = [];
  type Prefixed<T> = {
    [K in keyof T as `:${K & string}`]?: T[K]
  };

  function setPrefixedValue<K extends keyof TContactSettings>(
    target: Prefixed<TContactSettings>,
    key: K,
    value: TContactSettings[K]
  ) {
    (target as Record<string, unknown>)[`:${key}`] = value;
  }

  const ExpressionAttributeValues: Prefixed<TContactSettings> = {};

  for (const key of Object.keys(data) as (keyof TContactSettings)[]) {
    setPrefixedValue(ExpressionAttributeValues, key, data[key]);
    updateString.push(`${key}=:${key}`)
  }
  console.log(ExpressionAttributeValues);
  const command: UpdateCommandInput = {
    ...dbTable, ...{
      UpdateExpression: `set ${updateString.join(",")}`,
      ExpressionAttributeValues,
      ReturnValues: "ALL_NEW"
    }
  }
  try {
    const update = await ddbDocClient.send(new UpdateCommand(command));
    console.log(update.Attributes);
    if(!update.Attributes) {
      throw new ActionError({
        code: "INTERNAL_SERVER_ERROR",
        message:"No attributes returned "
      });
    }
    const { success, error } = await rebuilder();
    if (error) {
      throw error;
    }
    return ContactSettings.parse(update.Attributes);
  } catch (err) {
    throw new ActionError({
      code: "INTERNAL_SERVER_ERROR",
      message:"Couldn't update:"+String(err)
    })
  }


}

export const settings = {
  getMainSettings: defineAction({
    handler: getMainSettings
  }),
  updateMainSettings: defineAction({
    handler: updateMainSettings,
    input: MainSettings
  }),
  getFaqSettings: defineAction({
    handler: getFaqSettings,
  }),
  updateFaqSettings: defineAction({
    handler: updateFaqSettings,
    input:FAQSettings
  }),
  getSamplesSettings: defineAction({
    handler: getSamplesSettings
  }),
  updateSampleSettings: defineAction({
    handler: updateSampleSettings,
    input:SamplesSettings
  }),
  getContactSettings: defineAction({
    handler:getContactSettings
  }),
  updateContactSettings: defineAction({
    handler: updateContactSettings,
    input:ContactSettings
  })
}
