export type Faq = {
  question:string,
  answer:string, 
  category?: string
  id:number
}
export type FaqSection = {
  title: string,
  id:number, 
  questions: Faq[];
}
