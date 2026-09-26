<script lang="ts">
    import type { TImageUrls } from "@/types";
    let {urls}:{urls:TImageUrls[]} = $props();
    let currentImage = $state(-1);
    import Portal from "svelte-portal";
    function updateImage(i:number) {
      let body = document.body
      if(i<0) {
        body.classList.remove("sample-open")
      } else {
        body.classList.add("sample-open")
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
                    <svg class={"samples-image-overlay-icon size-6"} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" >
                      <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                    </svg>
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
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>

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
    :global(body.sample-open) {
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
