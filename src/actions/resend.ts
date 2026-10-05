import { ActionError, defineAction } from 'astro:actions';
import { Resend } from 'resend';
import { type TFormValues, type TUploadPackage,UploadPackage } from '@/pages/how-to-order/_ContactForm/options';
import { validator } from './validateTurnstile';
import { deleteMedia } from '@/pages/api/media';

const sendEmail = async (formData: TUploadPackage) => {

  //Attachments haven't been checked need to validate captcha
  if (!formData.attachments || formData.attachments.length<1) {
    console.log("need to validate")
    if (!formData.turnstileToken) {
      throw new ActionError({
        code: "BAD_REQUEST",
        message:"captcha not validated. no token"
      })
    }
    await validator(formData.turnstileToken)
  }

  const resend = new Resend(import.meta.env.RESEND_API_KEY);
  if (!resend) {
    throw new ActionError({
      code: "BAD_REQUEST",
      message:"No Resend api key"
    })
  }
  const sectionHeadings = {
    name: "Name",
    email: "Email address",
    businessname: "Business Name",
    questions: "General questions",
    quantity: "Quantity",
    interested: "What are you interested in",
    description: "Description of project",
    date: "Project due date",
    shipping: "Shipping or pickup",
    hear:"How did you hear about us"
  }
  let emailHtml = "";

  ['name', "email", "businessname", "questions", "quantity", "interested", "description", "date", "shipping", "hear"].forEach(s => {
    const data = formData[s as keyof TFormValues];
    console.log(data)
    if (!data) {
      return
    }
    if (Array.isArray(data) && data.length<1) {
      return
    }
    emailHtml+=`<b>${sectionHeadings[s as keyof Object]}</b><br/>`;
    if (Array.isArray(data)) {
      emailHtml+=`${data.join(", ")}`
    } else {
      emailHtml+=data
    }
    emailHtml += "<br/><br/>"

  })


  const { data, error } = await resend.emails.send({
      from: 'Acme <onboarding@resend.dev>',
      to:(import.meta.env.FORM_RECIPIENTS||"").split(","),
      subject: 'New contact form submission from website: '+formData.email,
      html: emailHtml,
    attachments: formData.attachments?(formData.attachments).map(f => {return {path:f.url,filename:f.public_id} }):undefined
    });
  if (error) {
    throw new ActionError({
      code: "BAD_REQUEST",
      message:error.message
    })
  }

  if (formData.attachments) {
    const deleteAll = await deleteMedia(formData.attachments.map(f=>f.public_id))
  }
  return {success:true, message:"Email sent"}

}


export const resend = {
  sendEmail: defineAction({
    handler: sendEmail,
    input:UploadPackage
  })
}
