export type TMainMenuItem = {
  url: string,
  label: string,
  slug?:string
}
const mainMenu: TMainMenuItem[] = [
  { url: "how-to-order", label: "How to order", slug: "how-to-order" },
  { url: "why-to-order", label: "Why to order" },
  { url: "frequently-asked-questions", label: "FAQs" ,slug:"faqs"},
  {url: "samples",label:"Samples",slug:"samples"}
]

export default mainMenu
