import { defaultSettings } from '@/assets/settings';
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
  category: z.string().optional(),
  id:z.number()
})
export type TFAQ = z.infer<typeof Faq>
export const FAQSection = z.object({
  title: z.string(),
  id: z.number(),
  questions: z.array(Faq).default([])
})
export type TFAQSection = z.infer<typeof FAQSection>

let { pageTitle } = defaultSettings.faqs;
export const FAQSettings = z.object({
  pageTitle: z.string().default(pageTitle),
  pageDescription:z.string().optional(),
  pageIntro:z.string().optional(),
  section:z.string(),
  faqSection: z.array(FAQSection).default([]),
})


export type TFAQSettings = z.infer<typeof FAQSettings>

export const SampleImage = z.object({
  original_width: z.number(),
  original_height: z.number(),
  url: z.string(),
  altText:z.string().optional()
})
export type TSampleImage = z.infer<typeof SampleImage>

export const SamplesSettings = z.object({
  pageTitle: z.string().default("Samples"),
  pageIntro: z.string().optional(),
  sampleImages:z.array(SampleImage).default([])
})
export type TSampleSettings = z.infer<typeof SamplesSettings>

let { siteDescription, siteFaviconSVG,  siteTitle } = defaultSettings.main;
export const MainSettings = z.object({
  section: z.string(),
  siteTitle: z.string().default(siteTitle),
  siteDescription: z.string().default(siteDescription),
  siteFaviconSVG: z.string().default(siteFaviconSVG),
  siteTagline: z.string().optional(),
  socialLinks: z.string().regex(/^([^,;]+,[^,;]+;)*[^,;]+,[^,;]+;?$/, "Invalid format").optional()

})
export type TMainSettings = z.infer<typeof MainSettings>
