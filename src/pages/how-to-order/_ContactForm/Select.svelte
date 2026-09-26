<script lang="ts">
import InteractionContainer from "./InteractionContainer.svelte"
type TProps = {
  currentValue:string,
  values : {id:string,label:string}[]
}

let isActive = $state(false);
let {currentValue,values}:TProps = $props()
</script>


<InteractionContainer label="Shipping or Pickup?" labelFor="shipping" isOpen={true} isActive={isActive}>
    <select bind:value={currentValue}>
    {#each values as v,i(v.id)}
            <option value={v.id}>{v.label}</option>
    {/each}
    </select>
</InteractionContainer>
