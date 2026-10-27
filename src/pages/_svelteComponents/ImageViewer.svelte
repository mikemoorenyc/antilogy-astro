<script lang="ts">
    import type { TImageUrls } from "@/types";
    let {urls}:{urls:TImageUrls[]} = $props();
    let currentImage = $state(-1);
    import Portal from "svelte-portal";
    function updateImage(i:number) {
      let html = document.querySelector("html")
      if(!html) return ;
      if(i<0) {
        html.classList.remove("sample-open")
      } else {
        html.classList.add("sample-open")
      }
      currentImage = i
    }
</script>

<div class="dt-width-container">
    <ul class="samples-container-ul">
        {#each urls as image, i (image.thumbnail)}
            <li class="sample-li">
                <img alt="A t-shirt graphic" class="samples-image" src={image.thumbnail.src} srcSet={image.thumbnail.srcSet} />
                <button aria-label="Open image" class={"samples-image-overlay"} onclick={()=>{updateImage(i)}}>
                  <span class={"samples-image-overlay-icon-container"}>
                      <span class="samples-image-overlay-icon size-6 icon-[carbon--maximize] block"></span>



                  </span>

                </button>
            </li>
        {/each}
    </ul>
</div>
{#if currentImage >=0}
    <Portal target="#modal-container" >
        <div class="full-container">
            <img alt="T-shirt graphic" src={urls[currentImage].full.src} srcset={urls[currentImage].full.srcSet} class="full-size-image"/>
            <button style="position:absolute; inset:0; opacity:0" aria-label="Close" onclick={()=>{updateImage(-1)}} ></button>
            <button aria-label="Close" class="sample-zoom-close" onclick={(c)=>{c.preventDefault(); updateImage(-1)}}>
                <span class="size-6 block icon-[carbon--close-large]"></span>

                        </button>

        </div>
    </Portal>
{/if}


<style>
    .full-container {
        position: fixed;
        z-index: 9999;
        left:0;
        top:0;
        width:100%;
        height:100%;
        background-color: var(--bg);
        color:var(--bg)
    }
    .samples-container-ul {

        border: 1px solid var(--for);
        border-width: 1px 0 0 1px ;
    }
    @media(max-width:949px) {
        .samples-container-ul {
            margin: 0 var(--gutter);
        }
    }
    @media(min-width:550px) {
        .samples-container-ul {
            display:grid;
            grid-template-columns: repeat(2,minmax(0,1fr));
            grid-template-rows: auto;
            position: relative;
        }
    }
    @media(min-width:950px) {
        .samples-container-ul {
            grid-template-columns: repeat(4,minmax(0,1fr));
        }
    }
    .samples-container-ul .sample-li {
        border: 1px solid var(--for);
        border-width: 0 1px 1px 0;
        position:relative;
    }
    .samples-container-ul .samples-image {
        width: 100%;
        aspect-ratio: 1/1;
        object-fit: cover;
        object-position: center center;
    }
    .samples-image-overlay {
        position: absolute;
        inset: 0;

    }

    .samples-image-overlay-icon-container {
        position: absolute;
        left:50%;
        top:50%;
        transform:translate(-50%,-50%);
        background:var(--bg);
        border-radius: 9999px;
        padding: 12px;
        visibility: hidden;
    }
    .samples-image-overlay:hover .samples-image-overlay-icon-container {
        visibility: visible;
    }
    .sample-zoom-close {
        padding: 16px;
        border-radius:9999px;
        background:var(--bg);
        position:fixed;
        right:24px;
        top:24px;
        color:var(--for)
    }
    :global(html.sample-open) {
        overflow:hidden

    }


    .full-size-image {
        position: absolute;
        left: 0;
        top: 0;
        width:100%;
        height:100%;
        object-fit:contain;
        object-position:center center;
    }
</style>
