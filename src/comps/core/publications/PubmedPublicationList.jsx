import { useGetPubmedPublication_EX } from "../../../hooks/external_queries/pubmed.articles"
import _ from "lodash"
import { Loading } from "../base/states/Loading"
import { motion } from "framer-motion"


/**
 * @description Displays the author, lastauthor, the title and the journal/date of a pubmed publication. 
 * @param {Object} props 
 * @param {String[]} props.pubmedids Even though it is a number, the eserch returns pubmedid as a string. 
 * @returns 
 */
export function PubmedPublicationList({ pubmedids }) {
    
    const { data: publications, isLoading, isFetching, isSuccess, isError } = useGetPubmedPublication_EX({ pubmedid : _.join(pubmedids,",") })
    if (!_.isObject(publications)) return 
    if (isError) return <div>Error loading PubMed articles</div>


    return (<div>
        {isSuccess ? publications.result.uids.map(pubmedid => <motion.div
                    key = {pubmedid}
                    className="flex padding--medium div--round bg--white margin--little" whileHover={{ backgroundColor: "#466688", color: "#ffffff" }}>
                        <div>{_.has(publications, ["result", pubmedid, "authors"])
                            && _.isArray(publications.result[pubmedid].authors)
                            && publications.result[pubmedid].authors.length > 0 ? `${publications.result[pubmedid].authors[0].name}, [...] ,and ${publications.result[pubmedid].lastauthor}`: null} </div>
                        <div className="margin-left--little" style={{ fontStyle: "italic" }}>{publications.result[pubmedid].title} <strong>{publications.result[pubmedid].fulljournalname}</strong></div>
                        <div className="margin-left--little">({publications.result[pubmedid].pubdate})</div>
                        <div className="margin-left--little"><a href={`https://pubmed.ncbi.nlm.nih.gov/${pubmedid}`} target="_blank" rel="noopener noreferrer">{pubmedid}</a></div>
                    </motion.div>)
                 : isLoading || isFetching ? <Loading /> : null }
    </div>)
}