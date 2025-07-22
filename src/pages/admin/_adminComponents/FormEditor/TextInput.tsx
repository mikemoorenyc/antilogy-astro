
type TProps = {
  label:string, 
  id: string, 
  value: string, 
  onChange: Function,
  required?: boolean,
  type?:string
}

export default function TextInput(props:TProps) {
  const {id,label,value,onChange,required,type="text"} = props
  return <div>
    <label  htmlFor={id} className="text-xs uppercase leading-none">
    {label}
    </label>
    <input type={type} required={required} className="block border-2 border-foreground w-full p-1 text-sm" id={id} value={value} onChange={(e)=>{e.preventDefault(); onChange(e.target.value)}} />
  
  </div>
}
