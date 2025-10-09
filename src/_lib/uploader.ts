

export  async function uploader(file:File, path:string) :Promise<string>{
  
  const fetchURL = await fetch("/api/GC/generateSignedUrl",{
    method:"POST",
    body: JSON.stringify({
      path: path
    })
  })

  if(!fetchURL.ok) {
    console.log("bad fetch of URL")
    return false; 
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
      throw new Error(`Response status: ${response.status}`);
    }
    
  } catch(err) {
    throw new Error(`${err.message}`)
  }
    
}
