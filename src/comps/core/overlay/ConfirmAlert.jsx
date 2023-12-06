import { Alert } from "@blueprintjs/core";


export function ConfirmAlert({isOpen = false, text = "Please confirm.", onConfirm, onCancel, confirmButtonText}) {
    console.log(onCancel)
    return (
        <Alert intent="danger" cancelButtonText="Cancel" {...{ confirmButtonText, isOpen, onCancel, onConfirm }}>
            <h3>Please confirm.</h3>
            <p>{text}</p>
        </Alert>
    )


}