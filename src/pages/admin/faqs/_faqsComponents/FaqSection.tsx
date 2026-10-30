import type { TFAQSection } from "@/actions/settings/schema"
import type { ReactNode } from "react"
import FaqSectionHeader from "./FaqSectionHeader"
import ReactButton from "@/components/Button/ReactButton"
import { useSortable } from "@dnd-kit/react/sortable"
import { useDroppable } from "@dnd-kit/react"
import { CollisionPriority } from "@dnd-kit/abstract";
type TProps = {
  section: TFAQSection,
  children: ReactNode,
  questionEditing: boolean,
  changeSectionTitle: (id: number, newTitle: string) => void,
  deleteFaqSection: (section: TFAQSection) => void,
  addQuestion: (id: number) => void,
  index:number
}
export default function FaqSection({ index,section, children,questionEditing,changeSectionTitle ,deleteFaqSection,addQuestion}: TProps) {
  const {
      ref: emptyDropRef,
      isDropTarget,
    } = useDroppable({
      id: "empty-"+section.id,
      type: "empty-section",
      accept: "question",

      collisionPriority: CollisionPriority.Low,
    });
  const { ref, handleRef, isDragging} = useSortable({
    id: section.id,
    index,
    accept:["section"],
    type: "section",
    group: "sections",
       collisionPriority: CollisionPriority.Low,
  })

  return <div ref={ref} className={`bg-shadow-sm border border-foreground mb-4 p-2 bg-background ${isDragging?"border-solid":"border-dashed"}`}>
    <div className="flex-center mb-2">
      <div ref={handleRef} className="cursor-grab flex items-center">
        <span className="icon-[carbon--draggable] size-5"></span>
      </div>
      <FaqSectionHeader
          questionEditing={questionEditing}
                changeSectionTitle={(newTitle: string) =>
                  changeSectionTitle(section.id, newTitle)
                }
                section={section}
                deleteItem={() => deleteFaqSection(section)}
      />
    </div>
    <div>
      {section.questions.length < 1 && <ul ref={emptyDropRef} style={{ height: 32 }} className={`border border-foreground  ml-5 ${isDropTarget ? "border-solid" : "border-dotted"}`}></ul>}
      {children}
    </div>
    <div className="pl-5 py-3">
            <ReactButton
              modClasses={["sm"]}
              label="Add FAQ"
              onClick={() => addQuestion(section.id)}
            />
          </div>

  </div>
}
