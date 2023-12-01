import { Button, FormGroup, InputGroup } from "@blueprintjs/core";
import _ from "lodash"
import { Header } from "../../core/base/Header";

function Link({index, id = "", url = "",comment = "", removeLink, onChange}) {
    //displays a link
    return (
        <div>
            <FormGroup
                inline={false}>
                <div className="flex" style={{ minWidth: "200px", maxWidth : "28vw"}}>
                    <InputGroup placeholder="https://" value={url} onValueChange={(valueString => onChange(index, {url : valueString,comment, id}))} leftIcon="link"/>
                    <InputGroup placeholder="Comment" value={comment} onValueChange={(valueString => onChange(index, {comment : valueString,url, id}))}/>
                    <Button icon="minus" small={true} intent="danger" onClick={() => removeLink(index)}/>
                </div>
            </FormGroup>
        </div>
    )
}

function DatasetLinks({ links = [{id : "", url: "", comment: "" }], addLink, removeLink, onChange, index = 4}) {
    //handle dataset links 
    return (
        <div className="bg--lightgrey padding--medium div--round intent-margin-top--little">
            <h3>{`${index}. Links`}</h3>
            <p>Add relevant links for dataset. For exmaple the link to the electronic labbooks or protocols from a publication that is relevant for the project.
            Please add more information in the comment.</p>
            <div className="flex flex--wrap" style={{columnGap : "1rem"}}>
                {links.map((linkProps, linkIdx) => {
                    return <Link key={`submission-link-${linkIdx}`} index={linkIdx} {...linkProps} removeLink={removeLink} onChange={onChange} />
                })}
            </div>
            <Button icon="plus" small={true} intent="primary" onClick={addLink}/>
        </div>
    )

}


export default DatasetLinks