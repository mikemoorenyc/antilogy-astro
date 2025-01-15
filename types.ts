import type { CSSProperties } from "react"

export type TSettings = {
  siteTitle: string, 
  siteDescription?: string, 
  siteFavicon?: string, 
  siteFaviconSVG?: string, 
  homepageLogo?: string, 
  siteLogo?: string ,
  siteBg?: string,
  
}

export type IButton ={
  label:string,
  icon?:string,
  type: "link"|"action",
  classes?: string,
  href?: string,
  target?:string
  modClasses?: ("big"|"sm"|"reverse"|"ghost")[],
  actionId?: string,
  style?: CSSProperties| React.CSSProperties
  
}
export type TIcon = {
  icon:string,
  size?:number,
  fill?:string
}