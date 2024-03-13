import { Dialog, DialogBody, DialogFooter } from "@blueprintjs/core";


export function BaseDialog({ isOpen, onClose, children, title = "Base Dialog", useDialogBody = true, style = {}}) {
    
    return (
        <Dialog {...{isOpen,onClose, isCloseButtonShown : true, title}} style={style}>
            {useDialogBody ? <DialogBody>
                {children}
            </DialogBody> : children}
            {/* <DialogFooter /> */}
        </Dialog>
    )
}