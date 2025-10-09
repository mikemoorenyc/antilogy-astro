import type { ReactNode } from "react"

type Props = {
  topLine?:string,
  bottomLine?:string, 
  icon?:ReactNode
}

export default function DataSection({topLine,bottomLine,icon}:Props) {
  return <div>
  {icon && <div>{icon}</div>}
    <div>
      {topLine && <div>{topLine}</div>}
      {bottomLine && <div>{bottomLine}</div>}
    </div>
  </div>
}