


export  async function uploader(file:File, path:string) :Promise<string>{

  try {
    const fetchURL = await fetch("/api/GC/generateSignedUrl",{
    method:"POST",
    body: JSON.stringify({
      path: path
    })})
    if(!fetchURL.ok) {
      throw new Error(`Response: ${fetchURL.status}`)
    }
    const {url,fields} = await fetchURL.json();
    const formData = new FormData();
    Object.entries({ ...fields, file }).forEach(([key, value]) => {
      formData.append(key, value as string | Blob);
    });
    try {
      const upload = await fetch(url, {
      method: "POST",
      body: formData,
    });
    if(upload.ok) {
      return upload.url + path; 
    } else {
      throw new Error(`Response status: ${upload.status}`);
    }

    } catch(err) {
      if (err instanceof Error) {
      throw new Error(err.message);
      } else {
      throw new Error(String(err));
      }

    }
    

  } catch(err) {
    if (err instanceof Error) {
      throw new Error(err.message);
    } else {
      throw new Error(String(err));
    }
  }
  
  
  
}
