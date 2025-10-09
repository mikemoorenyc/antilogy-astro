

import type { SpotifyData } from "@/pages/api/settings/types"
import ReactButton from "../../../../components/Button/ReactButton"
import { spotifyDisconnect } from "../../../api/spotify/disconnect"

type TProps = {
  spotifyData?: SpotifyData
}

export default function SpotifySection({spotifyData}:TProps) {
  
  
  const spotifyDisconnect = async () => {
    const deleted = await fetch("/api/spotify/disconnect",{method:"POST"});
    if(deleted.ok) {
      location.reload();
      return false; 
    }
    alert("Couldn't disconnect");
    return false; 
  }

  if(!spotifyData?.profileData) {
    return <ReactButton label={"Connect to spotify"} type="link"  href={spotifyData?.requestUrl} target="_self"/>
  }
  const profileData = spotifyData?.profileData;
  return (
<div className="flex">

  <div className="flex-1 ml-2 pt-1">
    <div className="font-bold text-sm">Connected as: {profileData.display_name}</div>
    <div className="text-xs mb-4"><a href={profileData.external_urls.spotify}>View profile</a></div>
    <ReactButton  type="action" label="Disconnect from spotify" onClick={()=>{spotifyDisconnect()}}/>
  
  </div>
  
</div>


  )

}
