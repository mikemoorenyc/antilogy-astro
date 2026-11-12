<script lang="ts">
    import type { TContactFormSection } from "@/actions/settings/schema";
    import InteractionContainer from "./InteractionContainer.svelte"
    type TProps = {
      formSection: TContactFormSection,
      currentValue:string|number
    }
    let {formSection,currentValue=$bindable()}:TProps = $props()
    const {label,id,options,helperText} = $derived(formSection)
    let isActive = $state(false);
</script>


<InteractionContainer label={label} labelFor={String(id)} isActive={isActive} isOpen={String(currentValue).length>0}>
    <select></select>
</InteractionContainer>
