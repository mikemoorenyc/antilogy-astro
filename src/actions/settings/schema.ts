import { z } from 'astro/zod';


export const ContactFormSection = z.object({
  id: z.union([z.literal("new"), z.number()]),
  fieldType: z.string(),
  label: z.string(),
  required: z.boolean(),
  helperText: z.optional(z.string()),
  width: z.union([z.literal("half"), z.literal("full")]),
  min: z.optional(z.number()),
  max: z.optional(z.number()),
  options: z.optional(z.array(z.object({
    label: z.string(),
    value: z.string()
  })))
})
export type TContactFormSection = z.infer<typeof ContactFormSection>
export const ContactSettings = z.object({
  physicalAddress: z.optional(z.string()),
  email: z.optional(z.string()),
  hours: z.optional(z.string()),
  sections: z.array(ContactFormSection)
})
export type TContactSettings = z.infer<typeof ContactSettings>

export const Faq = z.object({
  question: z.string(),
  answer: z.string(),
  category: z.optional(z.string()),
  id:z.number()
})
export type TFAQ = z.infer<typeof Faq>

export const FAQSection = z.object({
  title: z.string(),
  id: z.number(),
  questions:z.array(Faq)
})
export type TFAQSection = z.infer<typeof FAQSection>

export const FAQSettings = FAQSection
export type TFAQSettings = z.infer<typeof FAQSettings>

export const MainSettings = z.object({
  section: z.string(),
  siteTitle: z.optional(z.string()),
  siteDescription: z.optional(z.string()),
  siteFaviconSVG: z.optional(z.string()),
  faqSection: FAQSettings
})
export type TMainSettings = z.infer<typeof MainSettings>
