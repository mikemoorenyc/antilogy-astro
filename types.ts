import type { CSSProperties } from "react"
import type { TContactFormSection } from "./src/pages/admin/_adminComponents/FormEditor"

export type TSettings = {
  siteTitle: string, 
  siteDescription?: string, 
  siteFavicon?: string, 
  siteFaviconSVG?: string, 
  homepageLogo?: string, 
  siteLogo?: string ,
  siteBg?: string,
  spotifyRefreshToken?:string,
  section?:string
}

export type IButton ={
  label:string,
  icon?:string,
  type?: "link"|"action",
  classes?: string,
  href?: string,
  target?:string
  modClasses?: ("big"|"sm"|"reverse"|"ghost"|"caution")[],
  actionId?: string,
  style?: CSSProperties| React.CSSProperties
  
}
export type TIcon = {
  icon:string,
  size?:number,
  fill?:string
}
export type TSpotifyImage = {
    url: string;
    height: number;
    width: number;
}
export type  TSpotifyUserProfile = {

    display_name: string;
    email: string;

    external_urls: { spotify: string; };

    href: string;
    id: string;
    images: TSpotifyImage[];
  
 
    uri: string;
}
export type TSpotifyData = {
  appId : string, 
  requestUrl?: string, 
  profileData?: TSpotifyUserProfile
  
}

export type TContact = {
  pageTitle: string, 
  pageIntro?:string,

  contactForm:TContactFormSection[],
  physicalAddress?:string,
  hours?:string, 
  email?:string 
}