import { Alert } from "@blueprintjs/core";
import Loading from "../base/loading";


export function ConfirmAlert({isOpen = false, text = "Please confirm.", onConfirm, onCancel, confirmButtonText, isLoading = false}) {
    return (
        <Alert intent="danger" cancelButtonText="Cancel" {...{ confirmButtonText, isOpen, onCancel, onConfirm }}>
            <h3>Please confirm.</h3>
            <p>{text}</p>
            {isLoading?<Loading />:null}
        </Alert>
    )


}