

export function RemoveButton({fontColor, onRemove, isLoading}) {
    
    return <button
        disabled={isLoading}
        onClick={onRemove}
        style={{ margin: "0px", padding: "0px", border: "none", background: "transparent", outline: "none", color: fontColor }}>
        <div className="close-div" />
        </button> 
}