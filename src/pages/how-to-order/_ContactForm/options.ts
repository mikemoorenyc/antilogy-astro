import z from "astro/zod"
import { describe } from "astro:schema"
export const interestOptions = [
  {
    id:"tshirts",label:"T-shirts"
  },
  {
    id:"longsleeves", label:"Long Sleeves"
  },
  {
    id:"crewneck-sweatshirts",label:"Crewneck Sweatshirts"
  },
  {
    id:"hooded-sweatshirts",label:"Hooded Sweatshirts"
  },
  {
    id:"tote-bags" ,label:"Tote Bags"
  },
  {
    id:"posters",label:"Posters"
  },
  {
    id:"hats",label:"Hats"
  },
  {
    id:"other",label:"Other"
  }

]
export const shippingOptions = [
  { id: "shipping", label: "Shipping" },
  {id:"pickup",label:"Pickup"}
]
export const FormValues = z.object({
  name: z.string(),
  email: z.string(),
  questions: z.string(),
  businessname: z.string(),
  quantity: z.coerce.number(),
  interested: z.array(z.string()),
  description: z.string(),
  date: z.string(),
  hear: z.string(),
  shipping:z.string()
})
export type TFormValues  = z.infer<typeof FormValues>;
export const UploadPackage = z.object({
  ...FormValues.shape,
  attachments: z.optional(z.array(z.object({
    url: z.string(),
    public_id:z.string()
  }))),
  turnstileToken:z.optional(z.string())
})
export type TUploadPackage = z.infer<typeof UploadPackage>
