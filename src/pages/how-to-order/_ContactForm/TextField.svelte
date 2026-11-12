<script lang="ts">
    import InteractionContainer from "@/pages/how-to-order/_ContactForm/InteractionContainer.svelte";
    type TProps = {
      currentValue:string|number,
      type?:"text"|"date"|"textarea"|"email"|"dropdown",
      id:string,
      required?:boolean,
      label:string,
      helperText?:string,
      options?:{label:string,id:string}[]
    }
    let {currentValue=$bindable(),id,required,type,label,helperText,options}:TProps = $props()
    let isActive = $state(false)
    let currentLabel = $derived.by(()=> {
      if(!currentValue||!options) return ""
      const currentOption = options.find(o => o.id == currentValue);
      if(currentOption) {
        return currentOption.label
      } else {
        return ""
      }
    })
</script>

<InteractionContainer labelFor={id} label={label}  helperText={helperText} isOpen={String(currentValue).length>0 } isActive={isActive}>
    {#if type&&["text","date","email"].includes(type)}
    <input type={type||"text"} required={required} class="formField textField" bind:value={currentValue}
        onfocus={()=>{isActive = true}}
        onblur={()=>{isActive = false}}
    />
    {/if}
    {#if type == "textarea"}
    <textarea bind:value={currentValue} onblur={()=>{isActive=false}} onfocus={()=>{isActive=true}} class="formField bigTextField"></textarea>
    {/if}
    {#if (type =="dropdown")}

        <select class="formField textField opacity-0" bind:value={currentValue}
            onfocus={()=>{isActive = true}}
            onblur={()=>{isActive = false}}
        >
            {#each options as o,i (o.id) }
                <option value={o.id}>{o.label}</option>
            {/each}
        </select>
        <div class="flex pointer-events-none absolute inset-0 items-center">
            <div class={`formField textField ${!currentValue?"opacity-0":""} flex-1 ${isActive?"text-action":""}`}>{currentLabel}</div>
            <span class={`icon-[carbon--chevron-down] size-6 leading-none mr-2 ${isActive?"text-action":""}`}></span>
        </div>
    {/if}
</InteractionContainer>

<style>
    .formField {
        border: 0;
        display: block;
        font-family: inherit;
        font-size: inherit;
        outline: 0;
        padding: 16px;
        width: 100%;
    }
    .textField {
        height: 50px;
        line-height: 1;
    }
    .bigTextField {
        line-height: 1.4;
          min-height: 10em;
          resize: vertical;

    }
</style>
