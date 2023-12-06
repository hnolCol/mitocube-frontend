import { Button, Tooltip } from "@blueprintjs/core";


function TooltipButton(props) {
    const {content, ...rest} = props
    return (
        <Tooltip minimal={true} content={<div className="">{content}</div>} disabled={content===undefined} compact={true} inheritDarkTheme={false}>
            <Button {...rest} minimal={true}/>
        </Tooltip>
        
    )
}

export default TooltipButton