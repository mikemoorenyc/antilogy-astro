import { getSettings } from "../settings";


export  async function getTempToken() : Promise<string|false> {
  const spotifyAppId = import.meta.env.SPOTIFY_APP_ID || process.env.SPOTIFY_APP_ID,
        spotifyAppSecret = import.meta.env.SPOTIFY_APP_SECRET || process.env.SPOTIFY_APP_SECRET
  if(!spotifyAppId || !spotifyAppSecret) throw new Error("env variables not defined"); 
  const settings = await getSettings();
  if(!settings) throw new Error("couldn't get settings");
  if(!settings?.spotifyRefreshToken) return false; 
  try {
    const refreshData = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + (Buffer.from(spotifyAppId+":"+spotifyAppSecret).toString('base64'))
    },
    body: new URLSearchParams({
        'grant_type': 'refresh_token',
        "refresh_token": settings?.spotifyRefreshToken
    })
  })
  if(!refreshData.ok) {throw new Error("failed getting refresh") }; 
  const dataJson = await refreshData.json();
  
  return dataJson.access_token
  } catch(err) {
    throw new Error("failed getting refresh")

  }
  


}
