import ModalContainer from "@/components/ModalContainer/ModalContainer";

type TProps = {
  filesToUpload?: {
    id: string,
    uploaded:boolean
    }[],
  filesToDelete?: {
    id: string,
    deleted:boolean
    }[]
}

export default function ({ filesToUpload=[], filesToDelete=[] }:TProps) {

  if (!filesToUpload.length && !filesToDelete.length) {
    return <></>
  }
  return <ModalContainer>
    <div className="p-gutter">
    <h2 className="text-lg mb-3"><strong>Saving images. Don't close this tab!</strong></h2>
    {filesToUpload.length > 0 && <>
      <h3 className="mb-2">Uploading</h3>
      <ul className="mb-3">
        {filesToUpload.map((u,i) => {
          return <li key={ `${u.id}-${i}`} className="flex items-center mb-1">

             <span className={`size-4 ${u.uploaded?"text-action":""} ${u.uploaded?"icon-[carbon--checkmark-filled]":"icon-[carbon--cloud-upload]"}`} />

           <div className="flex-1 ml-2 font-serif">{u.id}</div>
         </li>
       })}

      </ul>
    </>}
    {filesToDelete.length > 0 && <>
      <h3 className="mb-2">Deleting</h3>
      <ul className="mb-3">
        {filesToDelete.map((u,i) => {
          return <li key={`${u.id}-${i}`} className="flex items-center mb-1">

             <span className={`size-4 ${u.deleted?"text-action":""} ${u.deleted?"icon-[carbon--checkmark-filled]":"icon-[carbon--trash-can]"}`} />

           <div className="flex-1 ml-2 font-serif">{u.id}</div>
         </li>
       })}

      </ul>
    </>}
  </div>
  </ModalContainer>
}
