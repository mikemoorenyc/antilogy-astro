type TInput = {
  forValue: string, 
  value: string | number | undefined, 
  onChange: Function,
  type?:"text"|"textarea"|"email",
  required?: boolean
  rows?: number,
  errored?: boolean
}


export default function FormInput({rows=4,required=true,forValue, value, onChange,type="text",errored=false}:TInput) {
  const classString = ` focus:border-action focus:outline-none text-black bg-white block w-full border-2 py-1 px-2 resize-none text-sm ${errored ? "border-alarm":"border-foreground"}`
  const params = {
    required,
    value, 
    type, 
    name: forValue,
    id: forValue,
    onChange: (e: any)=>{
      e.preventDefault(); 
      const target  = e.target as HTMLInputElement | HTMLTextAreaElement
      const value : string = target.value; 
      onChange(value);
    } ,
    
     
  }
  if(type=="textarea") {
    return <textarea className={classString} {...params} rows={rows}/>
  }
  return <input className={classString} {...params}/>
  
  
}