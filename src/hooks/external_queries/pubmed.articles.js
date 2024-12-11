import axios from "axios";
import { useQuery } from "react-query";


async function getPubmedIDByGeneName_API({ gene_name, limit = 5 }) {

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
                term: gene_name,
                //field: "tiab"
                
        } }) //science[journal]
    return res.data 
}

export const useGetPubmedArticlesByGeneName_EX = (APIParams = { gene_name, limit : 5 }, useQueryOptions = {}) => {
    return useQuery(["getPubmedArtikles",APIParams.gene_name, APIParams.limit],
        () => getPubmedIDByGeneName_API({ ...APIParams }), useQueryOptions)
}



async function getPubmedArticle_API({pubmedid}) {
    const res = await axios.get(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${pubmedid}&retmode=json`,
        { headers: { "Authorization": null } }) //science[journal]
    return res.data 
}
export const useGetPubmedPublication_EX = (APIParams = { pubmedid }, useQueryOptions = { staleTime: Infinity }) => {
    return useQuery(["getPubmedArticle",APIParams.pubmedid],
        () => getPubmedArticle_API({ ...APIParams }), useQueryOptions)
}