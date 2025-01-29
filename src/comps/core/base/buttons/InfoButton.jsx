import { Button, Tooltip } from "@blueprintjs/core";


export function InfoButton({ infoElement }) {
    
    return (
        <Tooltip inheritDarkTheme={false} content={<div style={{maxWidth : "min(20vw,400px)"}}>{infoElement}</div>}>
            <Button small minimal icon="info-sign" />
        </Tooltip>
    )
}