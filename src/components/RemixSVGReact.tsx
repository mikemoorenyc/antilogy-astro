import { type TIcon } from "../../types";

export default function RemixSVGReact(props:TIcon) {

const {size,fill,icon} = props

const setSize = size || 16
const setFill = fill || 'currentColor'

const styles = {
  width: setSize,
  height: setSize,
  fill: setFill
}

  return <svg style={styles}>
  <use  href={`/remixicon.symbol.svg#ri-file-image-line`}></use>
</svg>
}