import { Button, Dialog } from "@blueprintjs/core";



function SelectionDialog({title="Selection", isOpen = false, children, onApply, onClose, applyButtonDisabled = false}) {
    
    return (
        <Dialog {...{ title, isOpen, onClose}}
            isCloseButtonShown={true}
            canEscapeKeyClose={true}
            canOutsideClickClose={true}>
            
            <div className="flex flex-column">
            {children}
                <div className="flex justify-space-around intent-margin-bottom--little">
                    <Button text="Apply" intent="primary" small={true} onClick={onApply} disabled={applyButtonDisabled} />
                    <Button text="Close" small={true} onClick={onClose}/>
                </div>
            </div>
        </Dialog>
    )
}


export default SelectionDialog