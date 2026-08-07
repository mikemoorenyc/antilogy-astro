import { auth } from "@/utils/auth"

export const badResponse = (status : string , code:number=500 ) => {
    return new Response(null, {
      status: code, 
      statusText: status
    })
}
export const goodResponse = (data: Record<string,any>):Response => {
  return new Response(JSON.stringify({data}),
    {
      status:200,
      headers: {
        "Content-Type": "application/json"
      }
    }
  )
}

export const sessionCheck = async (request:Request) => {
  const session = await auth.api.getSession({
    headers:request.headers
  })
  if(session) {
    return true
  } else {
    return false 
  }
}
