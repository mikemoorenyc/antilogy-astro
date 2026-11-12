<script lang="ts">
    import type { TContactFormSection } from "@/actions/settings/schema";


  type TProps = {
    formSection: TContactFormSection,
    currentValue: string[]|string|number
  }
  let {formSection,currentValue=$bindable()}:TProps = $props();
  const {id,fieldType,label,helperText,options} = $derived(formSection);
  const isChecked = (id:string) => {
    if(typeof currentValue == "string") {
      return id == currentValue
    }
    if(Array.isArray(currentValue)) {
      return currentValue.includes(id)
    }
    return false;
  }

  let emptyIcon = $derived(fieldType=="checkBoxes"?`icon-[carbon--checkbox]`:`icon-[carbon--radio-button]`);
  let fullIcon = $derived(fieldType=="checkBoxes"?`icon-[carbon--checkbox-checked-filled]`:`icon-[carbon--radio-button-checked]`);

</script>
{#if !options||options.length<1}
<div>No options defined</div>
{:else}

<fieldset class="checkbox-section">
    <legend class="checkbox-title block mb-3">{label}</legend>
    {#each options as o,i (o.id) }
        <label for={o.id} class="checkbox-item flex mb-gutter cursor-pointer text-sm items-center md:inline-flex md:mr-gutter
            md:mb-3">
            {#if fieldType=="checkBoxes"}
                <input style="display:none"id={o.id} type="checkbox" bind:group={currentValue} name={String(id)} value={o.id} />
            {:else}
                <input style="display:none"id={o.id} type="radio" bind:group={currentValue} name={String(id)} value={o.id} />
            {/if}
            <span class={
                `mr-2 size-4
                ${isChecked(o.id)?fullIcon:emptyIcon}`
                }></span>
            <span class="checkbox-label">{o.label}</span>
        </label>
    {/each}
</fieldset>
{/if}
{#if helperText}
    <div class="pt-1 pl-5 text-[12px] leading-snug">{helperText}</div>
{/if}
