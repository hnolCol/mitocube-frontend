
export function ReduceButton({fontColor, onReduce, isLoading}) {
    
    return <button
        disabled={isLoading}
        onClick={onReduce}
        style={{ margin: "0px", padding: "0px", border: "none", background: "transparent", outline: "none", color: fontColor }}>
        <div className="reduce-div" />
        </button> 
}



export function IncreaseButton({fontColor, onIncrease, isLoading}) {
    
    return <button
        disabled={isLoading}
        onClick={onIncrease}
        style={{ margin: "0px", padding: "0px", border: "none", background: "transparent", outline: "none", color: fontColor }}>
        <div className="increase-div" />
        </button> 
}