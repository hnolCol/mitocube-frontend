import { useGetPubmedArticlesByGeneName_EX } from "../../../hooks/external_queries/pubmed.articles"
import _ from "lodash" 
import { PubmedPublication } from "./PubmedPublication"
import { PubmedPublicationList } from "./PubmedPublicationList"

export function GenePublications({ gene_name }) {
    const { data: publications, isSuccess } = useGetPubmedArticlesByGeneName_EX({ gene_name, limit : 15 }, {enabled : _.isString(gene_name)})
    return (<div>
        <h3>Publications</h3>
        {isSuccess ? <div>
            <div className="font-size--smallest">
                <div>{`Searching for ${gene_name} resulted in ${publications.esearchresult.count} publications.`} </div>
                <div>{`Showing ${publications.esearchresult.retmax} results. Searches are performed based on gene name and results are not filtered for organism.`}</div>
            </div>

            <div style={{width : "max(85vw,400px)"}}>
                {_.isArray(publications.esearchresult.idlist) ? <PubmedPublicationList pubmedids={publications.esearchresult.idlist} /> : null}
                {/* {_.isArray(publications.esearchresult.idlist) ? publications.esearchresult.idlist.map(pubmedid => <div><PubmedPublication key={pubmedid} pubmedid={pubmedid} /></div>) : null} */}
            </div>
        </div> : null 
        }
    </div>)
}