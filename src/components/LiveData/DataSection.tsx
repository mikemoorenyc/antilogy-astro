import type { ReactNode } from "react"

type TProps = {
  topLine?:string,
  bottomLine?:string, 
  icon?:ReactNode
}

export default function DataSection({topLine,bottomLine,icon}:TProps) {
  return <div>
  {icon && <div>{icon}</div>}
    <div>
      {topLine && <div>{topLine}</div>}
      {bottomLine && <div>{bottomLine}</div>}
    </div>
  </div>
}