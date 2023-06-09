import DeleteButton  from "../buttons/DeleteButton"

export function MCTagButton(props) {
    
    return (
            <div className={props.highlighted?"fade-out-box-container-highlighted":"fade-out-box-container"} onClick={() => props.handleClick(props.id)}>
            <div className={"fade-out-text-box"}>{props.text}</div>
                
                <DeleteButton callback = {props.handleDelete} callbackValue = {props.id}/>
        </div>
    )
}


MCTagButton.defaultProps = {
    text : "Whole proteome",
    handleDelete : undefined,
    handleClick : undefined,
    id : {},
    highlighted : false,
}