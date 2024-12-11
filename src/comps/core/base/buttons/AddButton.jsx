

export function AddButton({fontColor = "#00000", onSelect, isLoading}) {
    
    return <button
        delete={isLoading}
        onClick={onSelect}
        style={{ margin: "0px", padding: "0px", border: "none", background: "transparent", outline: "none", color: fontColor }}>
        <div className="add-div" />
        </button> 
}