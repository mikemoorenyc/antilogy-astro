<script lang="ts">
     import type { Snippet } from 'svelte';
    type TProps = {
      isActive: boolean,
      label: string,
      labelFor?:string,
      helperText?: string,
      children:Snippet
      errored?: boolean,
      isOpen:boolean,
      icon?:Snippet
    }

    const {isActive,label,labelFor,isOpen,children,helperText}:TProps = $props();
    const activeClass = $derived(isActive?"isActive":"")



</script>


<div class={`interactionContainer ${activeClass}`}>
    <label for={labelFor} class={`interactionLabel ${activeClass} ${isOpen||isActive?"opened":""}`}>{label}</label>
    {@render children()}

</div>

{#if helperText}
    <div class="helperText">{helperText}</div>
{/if}
<style>
    .interactionContainer {
        width:100%;
        position: relative;
    }
    .interactionContainer:before {
        display: block;
        content:"";
        position: absolute;
        inset:0;
        border: 2px solid var(--for);
        pointer-events: none;
    }
    .interactionContainer.isActive:before {
        border-color:var(--action);
    }
    .interactionLabel {
        cursor: pointer;
          left: 12px;
        line-height: 1.4;
        max-width: calc(100% - 32px);
        overflow: hidden;
        padding: 0;
        pointer-events: none;
        position: absolute;
        text-overflow: ellipsis;
        top: 14px;
        transform: scale(1);
        transform-origin: left center;
        transition: transform .1s;
        white-space: nowrap;
        width: auto;
        will-change: transform;
        background:var(--bg);
        padding:0 4px;
    }
    .interactionLabel.isActive {
        color:var(--action);
    }
    .interactionLabel.opened {
        transform: translateY(-26px) scale(.75);
    }
    .helperText {
        font-size: 12px;
          line-height: 1.3;
          padding: 4px 0 0 20px;
    }
</style>
