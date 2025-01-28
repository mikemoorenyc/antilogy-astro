type TSettingSchema = {
  title:string, 
  otherSettings: {}
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
        otherSettings: {}
    },
    emailAddress: {
        title: "Email Address",
        otherSettings: {}
    },
    bigTextField: {
        title :"Big Text Field",
        otherSettings:{}
    },
    upload: {
        title: "File Uploader",
        otherSettings: {}
    },
    quantity: {
        title: "Order Quantity",
        otherSettings: {
            min: {
                type: "textField",
                label: "Minimum Amount",
            },
            max: {
                type: "textField",
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
        otherSettings: {}
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