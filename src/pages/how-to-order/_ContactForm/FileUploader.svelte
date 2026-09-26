<script lang="ts">
    import CloseIcon from "@/pages/_svelteComponents/icons/CloseIcon.svelte";


import InteractionContainer from "./InteractionContainer.svelte";
    type TProps = {
      updateFiles: (id:string,add:boolean,file?:File) => void
      files:{file:File,id:string}[],

    }
    const allowedFileTypes = [".pdf",".eps",".ai",".psd"]
    let fileInput:HTMLInputElement;
    let {updateFiles,files}:TProps = $props();

    let isActive = $state(false);
    let isOpen = $derived(files.length > 0)
    const openFileInput = () => {
      if(fileInput) {
        fileInput.click();
      }
    }
    const fileChanges = (files:FileList) => {
      [...files].forEach(f => {
        const isImage = f.type.includes("image");
        const ext = f.name.split(".").at(-1);
        if(!isImage && !allowedFileTypes.includes("."+ext)) {
          alert("Unsupported file");
          return
        }
        let size = (f.size / (1024 * 1024))

        if(size > 5) {
          alert(`${f.name} is too big. Can't upload`)
          return ;
        }
        updateFiles(f.name,true,f);

      })
      fileInput.value=""
    }

    const dragHandler= (e:DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const type = e.type.toLowerCase();
        if(["dragenter","dragover"].includes(type)) {
            isActive=true
        } else {
            isActive=false
        }
        if(type == "drop") {
            if(!e.dataTransfer) return ;
            console.log(e.dataTransfer.files);
            fileChanges(e.dataTransfer.files);
            isActive=false
        }
    }


</script>

<InteractionContainer helperText={"We accept .jpg,.png,.ai,.psd,.eps,.pdf files. Maximum size is 5mb."} label="Upload art" labelFor={"files"} {...{isActive,isOpen}}>
    <div class="file-upload-field" role="region" ondragenter={dragHandler} ondragover={dragHandler} ondragleave={dragHandler} ondragend={dragHandler} ondrop={dragHandler}>
        {#if files.length<1}
            <div class="upload-field-text">Drag & drop files here or <button class="link-button" onclick={(e)=> {
                e.preventDefault()
                openFileInput()
            }}>browse your device</button></div>
        {/if}
        {#if files.length>0}
        <div class="file-item-list">
            {#each files as f,i (f.id) }
                <div class="file-item button-base button-sm">
                    <div class="file-item-inner">
                        <div class={`file-item-name`}>{f.id}</div>
                        <button class="remove-file-button" aria-label="Remove file" title="Remove file" onclick={(e)=> {
                          e.preventDefault();
                          updateFiles(f.id,false)
                        }}>
                            <CloseIcon extraClasses="close-icon"/>
                        </button>
                    </div>


                </div>

            {/each}
        </div>
        <button onclick={(e)=> {
            e.preventDefault()
            openFileInput()
        }} class="link-button">Upload more files</button>
        {/if}
    </div>
    <input type="file" onchange={(e:Event)=> {
      e.preventDefault();
      const input = e.currentTarget as HTMLInputElement;
      if(!input||!input.files) {
        return;
      }
      fileChanges(input.files)
    }} bind:this={fileInput} style="display:none;" multiple accept={`image/*,${allowedFileTypes.join(",")},`}/>
</InteractionContainer>

<style>
    .file-upload-field {
        min-height:10em;

        padding: var(--gutter)
    }
    .upload-field-text {
        padding-top:42px;
        font-size:14px;
    }
    .link-button {
        display: inline;
        text-decoration: underline;
        color: var(--action);
        font-size:14px;

    }
    .file-item {
            max-width: 100%;
            margin: 0 8px 8px 0;
        }
        .file-item-inner{
           display:flex;
           max-width: 100%;
           align-items: center;
           padding-right: 40px;
        }
        .file-item-name {
            flex: 1;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            min-width:0;
        }
        .remove-file-button {
            position:absolute;
            right: 0;
            top: 0;
            height: 100%;
            width: 32px;

        }
        .remove-file-button svg {
            position:absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%,-50%);
        }
</style>
