import { ActionError, defineAction } from 'astro:actions';
import { Resend } from 'resend';
import { type TFormValues, type TUploadPackage } from '@/pages/how-to-order/_ContactForm/options';
import { turnstile, validator } from './validateTurnstile';
import { deleteMedia } from '@/pages/api/media';
import { actions } from "astro:actions"
import { type TFormData,FormData } from '@/pages/how-to-order/_ContactForm/options';
import { formSectionTypes } from './settings/schema';
import { z } from 'astro/zod';
import { getContactSettings } from './settings';


const UploadPackage = z.object({
  turnstileToken: z.string().optional(),
  attachments: z.array(z.object({
    url: z.string(),
    public_id: z.string()
  })).optional(),
  formData: FormData
})

type TFormUpload = z.infer<typeof UploadPackage>

const sendEmail = async ({ formData, attachments=[], turnstileToken }: TFormUpload) => {



  const contactData = await getContactSettings();

  const { contactForm } = contactData;
  if (!contactForm) {
    throw new ActionError({
      code: "INTERNAL_SERVER_ERROR",
      message:"No contact form data"
    })
  }

  //Attachments haven't been checked need to validate captcha
  if (attachments.length<1) {
    console.log("need to validate")
    if (!turnstileToken) {
      throw new ActionError({
        code: "BAD_REQUEST",
        message:"captcha not validated. no token"
      })
    }
    await validator(turnstileToken)
  }

  const resend = new Resend(import.meta.env.RESEND_API_KEY);
  if (!resend) {
    throw new ActionError({
      code: "BAD_REQUEST",
      message:"No Resend api key"
    })
  }

  let emailHtml = "";
  let emailAddress=""
  contactForm.forEach((s) => {
    let id = s.id
    let type = s.fieldType
    const typeSchema = formSectionTypes.find(t => t.id == type);
    if (id == "new") return
    const data = formData[id];
    if (type == "checkBoxes" && data.selected.length > 0 && s.options) {
      emailHtml += `<b>${s.label}</b><br/>`
      let selections = data.selected.map(sele => {
        let option = s.options?.find(o => o.id == sele);
        if (!option) return null;
        return option.label;
      }).filter(sel => sel !== null).join(", ");
      emailHtml +=`${selections}<br/><br/>`
    }
    if (type !== "checkBoxes" && data.value.length > 0) {
      emailHtml += `<b>${s.label}</b><br/>`

      let content = data.value;
      if (typeSchema && typeSchema.requiresOptions && s.options) {
        let label = s.options.find(o => o.id == data.value)?.label;
        if (label) content = label;
      }
      emailHtml += `${content}<br/><br/>`
    }
    if (type == "emailAddress") {
      emailAddress = data.value;
    }

  })

  let { data, error } = await resend.emails.send({
      from: import.meta.env.SENDER_EMAIL||'Acme <onboarding@resend.dev>',
      to:(import.meta.env.FORM_RECIPIENTS||"").split(","),
      subject: `New contact form submission from website${emailAddress.length>0 ? `: ${emailAddress}`:""}`,
      html: emailHtml,
    attachments: attachments?(attachments).map(f => {return {path:f.url,filename:f.public_id} }):undefined
    });
  if (error) {
    console.log(error);
    throw new ActionError({
      code: "BAD_REQUEST",
      message:error.message
    })
  }
  /*
  if (attachments) {
    const deleteAll = await deleteMedia(attachments.map(f=>f.public_id))
  }
  */
  return {success:true, message:"Email sent"}

}


export const resend = {
  sendEmail: defineAction({
    handler: sendEmail,
    input:UploadPackage
  })
}
