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
    upload: {
        title: "File Uploader",
        
    },
    quantity: {
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
            options: {
                type:"textField",
                description: "Put options in semi-colon seperated list",
                label: "Options"
            }
        }
    },
    date: {
        title: "Date Picker",
       
    },
    select: {
        title: "Select",
        otherSettings: {
            options: {
                type:"textField",
                description: "Put options in semi-colon seperated list",
                label: "Options"
            }
        }
    }


}
export {formComponents,commonSettings}