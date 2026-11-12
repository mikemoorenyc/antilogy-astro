import { defaultSettings } from '@/assets/settings';
import { z } from 'astro/zod';

export const formSectionTypes = [
  {
  id: "textField",
  label: "Text Field",
  },
  {
  id: "emailAddress",
  label: "Email Address"
  },
  {
    id: "bigTextField",
    label:"Big Text Field"
  },
  {
    id: "fileUploader",
    label: "File Uploader"
  },
  {
    id: "orderQuantity",
  label:"Order Quantity"
  },
  {
    id: "checkBoxes",
    label: "Check Boxes",
    requiresOptions:true
  },
  {
    id: "radioButtons",
    label: "Radio Buttons",
    requiresOptions:true
  },
  {
    id: "datePicker",
    label:"Date Picker"
  },
  {
    id: "dropdown",
    label: "Dropdown",
    requiresOptions:true
  }
] ;

const FormSectionIds = z.literal(formSectionTypes.map(f => f.id));
export type TFormSectionIds = z.infer<typeof FormSectionIds>

export const FormSectionOption = z.object({
  label: z.string(),
  id:z.string()
})
export type TFormSectionOption = z.infer<typeof FormSectionOption>;
export const ContactFormSection = z.object({
  id: z.union([z.literal("new"), z.number()]),
  fieldType: z.literal(formSectionTypes.map(t=>t.id)),
  label: z.string(),
  required: z.boolean(),
  helperText: z.optional(z.string()),
  width: z.union([z.literal("half"), z.literal("full")]),
  min: z.optional(z.string()),
  max: z.optional(z.string()),
  options: z.array(FormSectionOption).optional()
})
export type TContactFormSection = z.infer<typeof ContactFormSection>
export const ContactSettings = z.object({
  physicalAddress: z.optional(z.string()),
  email: z.optional(z.string()),
  hours: z.optional(z.string()),
  contactForm: z.array(ContactFormSection).default([]),
  pageTitle: z.string().default("How to order"),
  pageIntro: z.string().optional()
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
  original_width: z.number().optional(),
  original_height: z.number().optional(),
  url: z.string(),
  cloud_id: z.string(),
  altText: z.string().default("An image of a screenprinted graphic"),
  id:z.number()
})
export type TSampleImage = z.infer<typeof SampleImage>

export const SamplesSettings = z.object({
  pageTitle: z.string().default("Samples"),
  pageIntro: z.string().optional(),
  sampleImages:z.array(SampleImage).default([])
})
export type TSampleSettings = z.infer<typeof SamplesSettings>

let { siteDescription, siteFaviconSVG, siteTitle } = defaultSettings.main;
export const BackgroundImageValues = z.object({
  url: z.url(),
  public_id: z.string()
})
export type TBackgroundImageValues = z.infer<typeof BackgroundImageValues>;
export const imgAssetPrefix = `antilogy/settings_images/`;
export const backgroundImageAssetPrefix = `${imgAssetPrefix}backgroundImages/`
export const MainSettings = z.object({
  backgroundImages: z.array(BackgroundImageValues).default([]),
  siteTitle: z.string().default(siteTitle),
  siteDescription: z.string().default(siteDescription),
  siteFaviconSVG: z.string().optional(),
  siteTagline: z.string().optional(),
  socialLinks: z.string().regex(/^([^,;]+,[^,;]+;)*[^,;]+,[^,;]+;?$/, "Invalid format").optional()

})
export type TMainSettings = z.infer<typeof MainSettings>
