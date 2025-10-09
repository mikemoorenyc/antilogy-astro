import type { ReactNode } from "react"



const DataContainer = ({children}:{children:ReactNode}) => {
  return<div className="leading-none ">
    {children}
  </div>
}

export default function LiveData ()  {
  return <div className="bg-accent px-4 sticky bottom-0 text-black p7-2 min-h-12 flex-center text-smDisplay uppercase justify-between">
    <DataContainer>
      <div className="flex-center">
        <div className="pr-2"> 
          <img width={36} height={36} className="border border-black" src="https://i.scdn.co/image/ab67616d000048516667f3d4428ef88ff966b0f8" />
        </div>
        <div className="flex-1 ">
        Playing now at the shop: <br/>
        Southern Belles in London sing<br/>
        by The Faint
        </div>
      
      </div>
    
    </DataContainer>
    <DataContainer>
      <div className="pl-2">
        Weather:<br/>
        24° & Clear
      </div>
    </DataContainer>
  
  </div>
}

//https://i.scdn.co/image/ab67616d000048516667f3d4428ef88ff966b0f8


//Playing now at the shop:
//Southern Belles In London Sing
//by The Faint