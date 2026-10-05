<script lang="ts">
  import { onMount } from "svelte";
  type TurnstileOptions = {
      sitekey: string;
      callback?: (token: string) => void;
      "expired-callback"?: () => void;
      "error-callback"?: () => void;
  };
  type TurnstileAPI = {
    render: ( container: HTMLElement, options: TurnstileOptions ) => string;
    reset: (widgetId?: string) => void;
    remove: (widgetId?: string) => void;
  };
  type TurnstileWindow = Window & {
    turnstile?: TurnstileAPI;
  };
  type TProps = {
    updateCallback: (t:string)=>void;
  }
  let {updateCallback} = $props();
  let sitekey = import.meta.env.PUBLIC_TURNSTILE_SITE_KEY || ""
  let container: HTMLDivElement;
  let widgetId: string | undefined;
  let errored = $state(false)
  const renderInput = () => {
    const win = window as TurnstileWindow;
    if(!win.turnstile || !container||!sitekey) return ;
    win.turnstile.render(container,{
      sitekey,
      callback:updateCallback,
      "error-callback":() => {
        console.log("error");
        updateCallback("");
        errored=true
      },
      "expired-callback":() => {
        updateCallback("")
      }
    })
  }
  onMount(()=> {
    const loader = setInterval(()=> {
      const win = window as TurnstileWindow;
      if(container&&win.turnstile) {
        console.log("load")
        clearInterval(loader)
        renderInput();
      } ;
      const existingScript = document.querySelector( 'script[src^="https://challenges.cloudflare.com/turnstile/"]' );
      if(existingScript) {
        return ;
      }
      const script = document.createElement("script"); script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"; script.async = true; script.defer = true;
      document.head.appendChild(script);


    },100)
    return () => {
      clearInterval(loader)
    }
  })
</script>

<div bind:this={container}></div>
