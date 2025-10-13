const updateMethod = async (settings: Settings) : Promise<Settings> => {
  const session = await getSession(request)
  if(!session) throw new Error("not logged in"); 
  if(!SETTINGS_TABLE) throw new Error("no settings table defined"); 
  let UpdateExpression = "set ";
  let ExpressionAttributeValues: {}; 

  Object.entries(settings).forEach(([key, value]) => {
    UpdateExpression += ` ${key}=:${key},`
    ExpressionAttributeValues[`:${key}`] = value;
  });
  //Add update Data
  UpdateExpression  += "lastUpdated=:lastUpdated"
  ExpressionAttributeValues[":lastUpdated"] = new Date().toLocaleString();
  const command = {
    TableName:SETTINGS_TABLE,
    Key :{
      id: "settings"
    },
    UpdateExpression,
    ExpressionAttributeValues,
    ReturnValue: "ALL_NEW"
  }
  try {
    const update = await ddbDocClient.send(new UpdateCommand(command));
      //REDEPLOY
    
    const deployHook = import.meta.env.DEPLOY_HOOK 
    if(deployHook) {
      const rebuild = await fetch(deployHook);
    }
    return update


  }catch(err) {
    throw new Error("bad request" + err.message); 
  }




}
