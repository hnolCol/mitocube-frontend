import { Button, Tooltip } from "@blueprintjs/core";


function TooltipButton(props) {
    const {content, ...rest} = props
    return (
        <Tooltip minimal={true} content={<div>{content}</div>} disabled={content===undefined} compact={true} inheritDarkTheme={false}>
            <Button minimal {...rest} />
        </Tooltip>
        
    )
}
export default TooltipButton