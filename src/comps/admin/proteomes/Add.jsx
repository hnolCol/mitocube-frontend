import { Button, Checkbox, InputGroup } from "@blueprintjs/core";
import { useState } from "react";
import _ from "lodash"
import { usePostProteome } from "../../../hooks/queries/proteome.hooks";
import APIError from "../../core/error/APIerror";

export function AddProteome({ }) {
    const [proteomes, setProteomes] = useState({proteome_tag : "", reviewed : true})
    const { mutate, isLoading, isError, error } = usePostProteome()
    
    console.log(proteomes)

    const handleProteomeSubmit = (e) => {
        if (_.isString(proteomes.proteome_tag) && proteomes.proteome_tag.length > 2) { //API checks for more comprehensive things
            mutate(proteomes)
        }
    }

    return (

            <div>
            <p>Add a proteome using the Uniprot <a href="https://www.uniprot.org/proteomes?query=*">reference proteome.</a></p>
            <div className="flex">
                <InputGroup placeholder="Enter uniprot proteome id(s) (UP....)" value={proteomes.proteome_tag} onValueChange={(value) => setProteomes(prevValues => {return {...prevValues, proteome_tag : value}})} fill/>
                <Button icon="plus" onClick={handleProteomeSubmit} small={true} intent="primary" />
            </div>
            <p>Add multiple proteome tags by separating them using a ';'.</p>
            <Checkbox label="Reviewed entries only" checked={proteomes.reviewed} onChange={() => setProteomes(prevValues => { return { ...prevValues, reviewed: !prevValues.reviewed } })} />
            {isLoading ? <p><h2>Loading...</h2> You will be notified via mail when the proteome has been successfully added (takes several minutes depending on the proteome size and the download speed).</p> :
                isError ? <APIError error={error} /> : null}
            </div>

    )
}