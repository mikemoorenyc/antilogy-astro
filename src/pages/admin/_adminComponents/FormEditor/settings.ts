type TSettingSchema = {
  title:string,
  otherSettings?: {}
}
type TOption = {
    label:string,
    type:string,
    description?:string
}

const commonSettings = {
    required: {
        type: "checkBox",
        label : "Required"
    },
    width: {

        type: "select",
        label: "Width",
        options: ["Full", "Half"],

    },
    helperText:{

        type: "textField",
        label: "Helper Text",

    }
}
const formComponents = {
    textField: {
        title: "Text Field",

    },
    emailAddress: {
        title: "Email Address",

    },
    bigTextField: {
        title :"Big Text Field",

    },
    fileUploader: {
        title: "File Uploader",

    },
    orderQuantity: {
        title: "Order Quantity",
        otherSettings: {
            min: {
                type: "numberField",
                label: "Minimum Amount",
            },
            max: {
                type: "numberField",
                label: "Maximum Amount"
            }
        }
    },
    checkBoxes: {
        title: "Check Boxes",
        otherSettings: {

        }
    },
    datePicker: {
        title: "Date Picker",

    },
    select: {
        title: "Select",
        otherSettings: {

        }
  },
  dropdown: {
      title: "Dropdown",
      otherSettings: {

      }
  },
  radioButtons: {
      title: "Radio buttons",
      otherSettings: {

      }
  }



}
export {formComponents,commonSettings}
