import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode} from "react"

type TDialogRequest = {
  type: "alert" | "confirm",
  cancelAction: () => void,
  confirmAction?: () => void,
  children:ReactNode
}

export function DialogProvider({ children }: { children: ReactNode }) {
  const queueRef = useRef<TDialogRequest[]>([]);
  const [active, setActive] = useState<TDialogRequest | null>(null);
  const enqueue = useCallback((type:TDialogRequest["type"]) => {

  },[])
}
