<script lang="ts">
    import {type UploadApiOptions } from "cloudinary";
    import FileUploader from "./FileUploader.svelte";
    import { type TFormValue, type TFormData } from "./options";
    import { untrack } from "svelte";
    import TextField from "./TextField.svelte";
    import { onMount } from "svelte";
    import TurnstileInput from "./TurnstileInput.svelte";
    import { actions } from 'astro:actions';
    import { formSectionTypes, type TContactFormSection} from "@/actions/settings/schema";
    import CheckBoxes from "./CheckBoxes.svelte";
    import Dropdown from "./Dropdown.svelte";

    let {formStructure}:{formStructure:TContactFormSection[]} =$props();
    const formTypes = formSectionTypes.map(t=>t.id);

    let successfulSubmit = $state(false);
    let submitState = $state<"Uploading files"|"idle"|"submitting"|"errored"|"sent">("idle")
    type Ids = "name" | "email"|"questions"|"businessname"|"quantity"|"description"|"date"|"shipping"|"hear";
    type TTextInput = {
      label: string,
      helperText?: string,
      id: Ids,
      full?: boolean,
      required?:boolean,
      type?:"text"|"date"|"email"|"textarea"
    }





    let initialValues: Record<number, TFormValue> = untrack(() => {
      const values: TFormData = {};

      formStructure.forEach(f => {
        const typeData = formSectionTypes.find(s => s.id == f.fieldType);
        if (f.id === "new") return;
        let value:string = "";
        if(f.fieldType == "orderQuantity"&&f.max) {
          value = String(Number(f.max)/2);
        }
        if((f.fieldType == "radioButtons"||(f.fieldType == "dropdown" && f.required))&&f.options) {
          value = f.options[0].id;
        }
        values[f.id] = {
          value ,
          selected: []
        };
      });

      return values;
    });

    let buttonText = $derived.by(()=> {
      let bt = "Submit"
      switch( submitState) {
        case"Uploading files":
          bt = "Uploading files"
          break;
        case "submitting":
          bt = "Sending message"
          break;
      }
      return bt
    })
    let activeInput = $state<Ids[]>([])
    const required=["name",'email']
    let errored = $state<Ids[]>([])

    const formValues = $state(initialValues)
    let attachments = $state<{url:string,public_id:string}[]>([])
    let files = $state<{
      file: File,
      id:string
      }[]>([])
    const updateFiles = (id:string,add:boolean,file?:File|undefined) => {
      if(add && file) {
        const idExists = files.find(f=>f.id == id);
        if(!idExists) {
          files.push({file,id})
        }

      } else {
        files = files.filter(f=>f.id !== id);
      }
    }
    const topInputs: TTextInput[] = [
      { id: "name", helperText: "*required", label: "Full name*" ,required:true}, { id: "email", helperText: "*required", label: "Email address*",type:"email",required:true },
      { id: "businessname", label: "Business name",full:true  }
    ]
    let turnstileToken = $state("");
    const updateTurnstileToken = (t:string) => {
      turnstileToken = t;
    }
    onMount(() => {
      if (sessionStorage.getItem("successSubmit") === "true") {
        successfulSubmit = true
      }
	});
const submitForm = async (e:SubmitEvent) => {
  e.preventDefault();

   submitState = "submitting"
  if(files.length > 0) {
    submitState = "Uploading files"
    const {data,error } = await actions.turnstile.validateToken(turnstileToken)
    if(error) {
      alert("Couldn't validate captcha");
      submitState="errored"
      return false;
    }
  }
  //Start Uploading attachments
  for(const file of files) {
    const public_id = `antilogy/tempFiles/_${Date.now()}/${file.id}`
    const params : UploadApiOptions & {
      public:boolean
    } = {
      public_id,
      public:true
    }
    const sig = await fetch(`/api/media/signature`, {
      method:"POST",
      body: JSON.stringify(params)
    });
    if(!sig.ok) {
      alert("Couldn't get cloudinary signature signature "+file.id);
      console.log(sig.status);
      return false;
    }
    const formData = new FormData();
    const {data}= await sig.json()
    console.log(data);
    Object.keys(data).forEach(key => {
      const value = data[key];
       formData.append(key, value);
    });
    formData.append("file",file.file);
    const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/${data.cloud_name}/image/upload`, {
      method: 'POST',
      body: formData,
    });
    if(!uploadResponse.ok) {
      const errorData = await uploadResponse.json();
      console.log(errorData)
      alert(`Couldn't upload ${file.id} ${errorData.error.message}`)
      return false ;
    }
    const uploadResult = await uploadResponse.json();
    attachments.push({
      public_id,
      url:uploadResult.url
    })
  }
  submitState = "submitting"
  //FINISH UPLOADING ATTACHMENTS
console.log($state.snapshot({formData:formValues,attachments,turnstileToken}))
  let {data,error} = await actions.resend.sendEmail({
    formData:formValues,
    attachments,
    turnstileToken
  })
  if(error) {
    alert("Couldn't send message. Try again later "+String(error))
    submitState="errored"
    return false
  }
  submitState="sent"

}
const textFieldMap = {
  bigTextField: "textarea",
  textField: "text",
  emailAddress:"email",
  datePicker:"date"
  } as const
const rangeText = (number:string,min:string,max:string) => {
  const numInt = Number(number);
  const minInt = Number(min);
  const maxInt = Number(max);
  let afterText= "";
  if(numInt == minInt) {
    afterText = " (minimum order)"
  }
  if(numInt >=maxInt ){
    afterText = " or more"
  }
  return `${numInt}${afterText}`

}
</script>
{#if submitState !== "sent"}
<form class="mainContactForm" id="main-contact-form" onsubmit={submitForm}>
    {#each formStructure as formSection,i (formSection.id)}
        <section class={`section ${formSection.width}`}>

            {#if (formSection.fieldType=="textField"||formSection.fieldType=="emailAddress"||formSection.fieldType=="datePicker"||formSection.fieldType=="bigTextField")}
                <TextField type={textFieldMap[formSection.fieldType]}
                    bind:currentValue={formValues[formSection.id as number].value}
                    label={formSection.label}
                    required={formSection.required}
                    helperText={formSection.helperText}
                    id={String(formSection.id)}/>
            {/if}
            {#if formSection.fieldType=="fileUploader"}
               <FileUploader {...{...formSection,files,updateFiles}} />
            {/if}
            {#if (formSection.fieldType == "orderQuantity" && formSection.min&&formSection.max)}
                <label for={"quantity"} class="checkbox-title">{formSection.label}</label>
                <div class="range-container">
                    <input  class="range-input"  type="range" id={"quanity"} name={"quantity"} min={Number(formSection.min)} max={Number(formSection.max)} step="2" value={formValues[formSection.id as number].value} oninput={(e) => formValues[formSection.id as number].value = String(e.currentTarget.value)} />
                    <div  class="range-counter">{rangeText(formValues[formSection.id as number].value,formSection.min,formSection.max)}</div>
                </div>

            {/if}
            {#if formSection.fieldType == "radioButtons"}
                <CheckBoxes {...{formSection}} bind:currentValue={formValues[formSection.id as number].value} />
            {/if}
            {#if ["checkBoxes"].includes(formSection.fieldType)}
                <CheckBoxes {...{formSection}} bind:currentValue={formValues[formSection.id as number].selected} />
            {/if}
            {#if formSection.fieldType == "dropdown"}
                <TextField {...formSection} type={formSection.fieldType} id={String(formSection.id)} bind:currentValue={formValues[formSection.id as number].value}/>
            {/if}
        </section>
    {/each}

    <section class="section text-center">
        <TurnstileInput updateCallback={updateTurnstileToken}/>
    </section>

    <section class="section text-center">


        <button  disabled={submitState !="idle" || !turnstileToken} type="submit" class="contact-form-submit-button homepage-nav-button button-base button-base__active">
                        <span>
                           { buttonText }
                        </span>
                    </button>
    </section>

</form>
{:else }
<p>Thank you for sending a message. Someone will get in contact with you soon.</p>

{/if}
<style>


    .section {
        padding:0 var(--gutter);
        margin-bottom: calc(var(--gutter) * 1.25)
    }

    .textField:focus {
        color:var(--action);
    }
    .checkbox-title {
            margin-bottom: calc(var(--gutter) * .75);
            display: block;
        }


    .range-input {
        display:block;
        width: 100%;
        -webkit-appearance: none;
        appearance: none;
        background: transparent;
        cursor: pointer;

        color: var(--screen-text);

        &::-webkit-slider-runnable-track {
            height: 4px;
            border: 1px solid currentColor;

        }
        &::-moz-range-track {
            height: 4px;
            border: 1px solid currentColor;
        }
        &::-webkit-slider-thumb {
            -webkit-appearance: none; /* Override default look */
            appearance: none;
            margin-top: -10px; /* Centers thumb on the track */
            background-color: currentColor;
            border-radius: 50%;
            height: 20px;
            width: 20px;
            }
            &::-moz-range-thumb {
            -webkit-appearance: none; /* Override default look */
            appearance: none;
            margin-top: -10px; /* Centers thumb on the track */
            background-color: currentColor;
            border-radius: 50%;
            height: 20px;
            width: 20px;
            }
    }
    .range-counter {
        margin-top: 8px;
        font-size: 16px;
        position:relative;
        @media(min-width:950px) {
            margin-top: 0;
            font-size: 16px;
        }

    }
    .range-container {
        @media(min-width:950px) {
            display:flex;
            justify-content: space-between;
            align-items: center;
            > * {
                width: calc(50% - calc(var(--gutter) * .75));
            }
        }
    }
    .checkbox-item {
        display:flex;
        margin-bottom: var(--gutter);
        font-size: 14px;
        cursor: pointer;
        align-items: center;
        @media(min-width: 950px) {
            display:inline-flex;
            margin-right: var(--gutter);
            margin-bottom: calc(var(--gutter) * .5);
        }
    }
    .checkbox-label {
        flex:1;
        font-size: 14px;
    }
    .checkbox-check-container {
        width: 16px;
        height: 16px;
        border: 1px solid var(--for);
        position:relative;
        margin-right: 10px;
        &.radio {
            border-radius:9999px;
        }

        &.isChecked {
            background:var(--for);
            color: var(--bg);

        }
    }

    @media(min-width:950px) {
        .mainContactForm {
            display: flex;
            flex-wrap: wrap;
            position: relative;
            right: calc(var(--gutter)*.75);
            width: calc(100% + var(--gutter)*1.5);
        }
        .section {
            padding: 0 calc(var(--gutter)*.75);
            width: 100%;
        }
        .section.half {
            width:50%
        }
    }
    .contact-form-submit-button {
        display:inline-flex;
        &[disabled] {
            opacity:.5;
        }
    }

</style>
