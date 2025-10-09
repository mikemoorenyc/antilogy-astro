export type Contact = {
  pageTitle: string, 
  pageIntro?:string,

  contactForm:ContactFormSection[],
  physicalAddress?:string,
  hours?:string, 
  email?:string 
}
export type ContactFormSection = {
  id: number|"new", 
  fieldType:string,
  label:string,
  required:boolean,
  helperText?:string,
  width: "half"|"full",
  min?: number, 
  max?: number, 
  options?: string 
}