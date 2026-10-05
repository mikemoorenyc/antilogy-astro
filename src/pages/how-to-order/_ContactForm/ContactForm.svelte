
<script lang="ts">
    import {type UploadApiOptions } from "cloudinary";
    import FileUploader from "./FileUploader.svelte";
    import {interestOptions,shippingOptions, type TFormValues} from "./options";
    import Check from "@/pages/_svelteComponents/icons/Check.svelte";
    import TextField from "./TextField.svelte";
    import { onMount } from "svelte";
    import TurnstileInput from "./TurnstileInput.svelte";
    import { actions } from 'astro:actions';

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

    const formValues = $state<TFormValues>({
      name: "",
      email: "",
      questions: "",
      businessname:"",
      quantity:500,
      interested:[],
      description:"",
      date:"",
      shipping:"shipping",
      hear:""
    })
    let attachments = $state<{url:string,public_id:string}[]>([])
    let files = $state<{
      file: File,
      id:string
      }[]>([])

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
    const public_id = `antilogy/tempFiles/${formValues.email}_${Date.now()}/${file.id}`
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
console.log({...formValues,attachments,turnstileToken})
  let {data,error} = await actions.resend.sendEmail({
    ...formValues,
    attachments,
    turnstileToken
  })
  if(error) {
    alert("Couldn't send message. Try again later")
    submitState="errored"
    return false
  }
  submitState="sent"

}
</script>
{#if submitState !== "sent"}
<form class="mainContactForm" id="main-contact-form" onsubmit={submitForm}>

    {#each topInputs as input,i (input.id)}
        <section class={`section ${input.full?"":"half"}`}>
           <TextField {...input} bind:currentValue={formValues[input.id]}/>

        </section>
    {/each}
    <!--Full description -->
    <section class="section half">
        <TextField id="questions" type="textarea" label="General questions" helperText="Any questions are ok!" bind:currentValue={formValues.questions}/>

    </section>
    <!-- File Uploader -->
    <section class="section half">
        <FileUploader {...{files}} updateFiles={(id:string,add:boolean,file?:File)=> {
          if(add && file) {
            const idExists = files.find(f=>f.id == id);
            if(!idExists) {
              files.push({
                file,id
              })
            }

          } else {
            files = files.filter(f=>f.id !== id);
          }

        }}/>
    </section>
    <section class="section">
        <label for={"quantity"} class="checkbox-title">Order quantity</label>
                <div class="range-container" >
                <input  bind:value={formValues.quantity} class="range-input" type="range" id={"quanity"} name={"quantity"} min={36} max={2000} step="2" />
                <div  class="range-counter">{formValues.quantity}{(formValues.quantity == 36?" (minimum order)":"")}{formValues.quantity>= 2000?" or more":""}</div>
                </div>
    </section>
    <section class="section">
        <fieldset class="checkbox-section">
            <legend class="checkbox-title">What are you interested in?</legend>
            {#each interestOptions as interest,i (interest.id) }
               <label for={interest.id} class="checkbox-item">
                   <input style="display:none"id={interest.id} type="checkbox" bind:group={formValues.interested} name="interested" value={interest.id} />
                   <span class={`checkbox-check-container ${formValues.interested.includes(interest.id)?"isChecked":""}`}>
                       <Check size={12} extraStyles={`"width: 12px;
                       height: 12px;
                       position:absolute;
                       left: 50%;
                       top: 50%;
                       transform: translate(-50%,-50%);
                       opacity: ${formValues.interested.includes(interest.id)?"1":"0"};"`}/>
                   </span>
                   <span class="checkbox-label">{interest.label}</span>
               </label>
            {/each}
        </fieldset>

    </section>
    <section class="section">
       <TextField id="description" label="Project description" bind:currentValue={formValues.description} type="textarea"/>
    </section>
    <section class="section half">

            <TextField type="date" bind:currentValue={formValues.date} label="Project due date" id="date" helperText="Leave blank if no hard date" />


    </section>
    <section class="section half">
        <fieldset class="checkbox-section">
             <legend class="checkbox-title">Shipping or pickup?</legend>
             {#each shippingOptions as s, i (s.id) }
                 <label for={s.id} class="checkbox-item">
                     <input style="display:none"id={s.id} type="radio" bind:group={formValues.shipping} name="shipping" value={s.id} />
                     <span class={`checkbox-check-container ${formValues.shipping.includes(s.id)?"isChecked":""} radio`}>

                     </span>
                     <span class="checkbox-label">{s.label}</span>
                 </label>
             {/each}
        </fieldset>

    </section>
    <section class="section">
        <TextField id="hear" bind:currentValue={formValues.hear} label="How did you hear about Antilogy Design?"></TextField>
    </section>
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
        & svg {
            width: 12px;
            height: 12px;
            position:absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%,-50%);
            opacity: 0;
        }
        &.isChecked {
            background:var(--for);
            color: var(--bg);
            & svg {
                opacity: 1;
            }
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
