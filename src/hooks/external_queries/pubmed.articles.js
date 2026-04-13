import axios from "axios";
import { useQuery } from "@tanstack/react-query";


/**
 * 
 * @param {Object} props
 * @param {String} props.gene_name The 
 * @param {Number} props.limit The maximum number of publications to return  
 * @returns 
 */
async function getPubmedIDByQuery_API({ query, limit = 5, field }) {

    const res = await axios.get(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?`,

        {
            headers: {
                "Authorization": null
            },
            params: {
                retmode: "json",
                sort: "pub_date",
                retmax: limit,
                db: "pubmed",
                term: query,
                field
                
        } }) //science[journal]
    return res.data 
}

export const useGetPubmedArticlesByQuery_EX = (APIParams = { query, limit : 5, field }, useQueryOptions = {}) => {
    return useQuery({
        queryKey: ["getPubmedArtikles",APIParams.query, APIParams.limit],
        queryFn: () => getPubmedIDByQuery_API({ ...APIParams }),
        ...useQueryOptions
    })
}



async function getPubmedArticle_API({pubmedid}) {
    const res = await axios.get(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${pubmedid}&retmode=json`,
        { headers: { "Authorization": null } }) //science[journal]
    return res.data 
}
export const useGetPubmedPublication_EX = (APIParams = { pubmedid }, useQueryOptions = { staleTime: Infinity }) => {
    return useQuery({
        queryKey: ["getPubmedArticle", APIParams.pubmedid],
        queryFn: () => getPubmedArticle_API({ ...APIParams }),
        ...useQueryOptions
    })
}