import type { CSSProperties } from "react"
export type ButtonModifiers = "big"|"sm"|"reverse"|"ghost"|"caution"|"disabled"
export type Button ={
  label:string,
  icon?:string,
  type?: "link"|"action",
  classes?: string,
  href?: string,
  target?:string
  modClasses?: ButtonModifiers[],
  actionId?: string,
  style?: CSSProperties| React.CSSProperties
  
}
export type Icon = {
  icon:string,
  size?:number,
  fill?:string
}