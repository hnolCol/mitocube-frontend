import { useGetPubmedPublication_EX } from "../../../hooks/external_queries/pubmed.articles"
import _ from "lodash"
import { Loading } from "../base/states/Loading"
import { motion } from "framer-motion"






/**
 * @description Displays the author, lastauthor, the title and the journal/date of a pubmed publication. 
 * @param {Object} props 
 * @param {String} props.pubmedid Even though it is a number, the eserch returns pubmedid as a string. 
 * @returns 
 */
export function PubmedPublication({ pubmedid }) {
    
    const { data: publication, isLoading, isFetching, isSuccess, isError } = useGetPubmedPublication_EX({ pubmedid })
    if (!_.isObject(publication)) return 
    if (isError) return <div>Error loading PubMed article {pubmedid}</div>
    return (<div>
        {isSuccess ? <motion.div className="flex padding--medium div--round bg--white margin--little" whileHover={{backgroundColor : "#466688",color :"#ffffff"}}>
            <div>{_.has(publication, ["result", pubmedid, "authors"])
                && _.isArray(publication.result[pubmedid].authors)
                && publication.result[pubmedid].authors.length > 0 ? `${publication.result[pubmedid].authors[0].name}, [...] ,and ${publication.result[pubmedid].lastauthor}`: null} </div>
            <div className="margin-left--little" style={{ fontStyle: "italic" }}>{publication.result[pubmedid].title} <strong>{publication.result[pubmedid].fulljournalname}</strong></div>
            <div className="margin-left--little">({publication.result[pubmedid].pubdate})</div>
            <div className="margin-left--little"><a href={`https://pubmed.ncbi.nlm.nih.gov/${pubmedid}`} target="_blank" rel="noopener noreferrer">{pubmedid}</a></div>
        </motion.div> : isLoading || isFetching ? <Loading /> : null }
    </div>)
}