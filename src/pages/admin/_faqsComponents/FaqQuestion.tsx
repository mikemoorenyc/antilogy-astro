import { useState } from "react";
import type { TFaq } from "../../api/faqs"

type TProps = {
  question: TFaq
}

export default function FaqQuestion ({question}:TProps) {
  const title = question.question;
  const {answer} = question
  const tempAnswer = useState(answer);
  const tempTitle = useState(title);
  const isEditing = useState(false)
  return (
  <div>
    <div>{title}</div>
  </div>
  )
}