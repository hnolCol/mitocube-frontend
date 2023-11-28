import { Dialog, DialogBody, DialogFooter } from "@blueprintjs/core";


export function BaseDialog({isOpen, onClose, children, title = "Base Dialog"}) {
    

    return (
        <Dialog {...{isOpen,onClose, isCloseButtonShown : true, title}}>
            <DialogBody>
                {children}
            </DialogBody>
            {/* <DialogFooter /> */}
        </Dialog>
    )
}