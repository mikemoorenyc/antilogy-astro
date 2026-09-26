<script lang="ts">
    import InteractionContainer from "@/pages/how-to-order/_ContactForm/InteractionContainer.svelte";
    type TProps = {
      currentValue:string,
      type?:"text"|"date"|"textarea"|"email",
      id:string,
      required?:boolean,
      label:string,
      helperText?:string
    }
    let {currentValue=$bindable(),id,required,type,label,helperText}:TProps = $props()
    let isActive = $state(false)
</script>
<InteractionContainer labelFor={id} label={label}  helperText={helperText} isOpen={currentValue.length>0 } isActive={isActive}>
    {#if type!=="textarea"}
    <input type={type||"text"} required={required} class="formField textField" bind:value={currentValue}
        onfocus={()=>{isActive = true}}
        onblur={()=>{isActive = false}}
    />
    {:else}
    <textarea bind:value={currentValue} onblur={()=>{isActive=false}} onfocus={()=>{isActive=true}} class="formField bigTextField"></textarea>
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
