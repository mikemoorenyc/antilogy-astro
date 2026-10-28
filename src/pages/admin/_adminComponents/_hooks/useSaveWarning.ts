import { useRef, useMemo, useEffect } from "react";

export default function useSaveWarning(initValue: string, currentValue: string) {
  const initialValue = useRef(initValue);
  const isEdited = useMemo(()=>initialValue.current !== currentValue,[initialValue,currentValue])
  const beforeunload = useRef((e: BeforeUnloadEvent) => {
    e.preventDefault()
  })
  useEffect(() => {
    if (!window) return;
    console.log(isEdited,initialValue.current,currentValue)
    if (isEdited) {
      window.addEventListener('beforeunload', beforeunload.current);
    } else {
      window.removeEventListener("beforeunload", beforeunload.current)
    }
    return () => {
      window.removeEventListener("beforeunload", beforeunload.current)
    }
  }, [isEdited])
  return {
    removeSaveWarning: () => {
      window.removeEventListener("beforeunload", beforeunload.current)
    },
    beforeunload:beforeunload.current
  }

}
