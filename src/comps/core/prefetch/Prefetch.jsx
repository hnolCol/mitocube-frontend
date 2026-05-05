import React, { useMemo, useState } from 'react'
import { usePrefetchConditionApplicationTexts } from "@/api/orchestrated/conditionApplications";
import { usePrefetchAttributes } from "@/api/orchestrated/attributes";
import _ from "lodash"; 
import { usePrefetchProteins } from '@/api/orchestrated/proteins';

export function WithTagMaps({
    Component,
    ca_tags,
    attribute_tags,
    protein_tags = [], 
    ...rest
}) {
    const [refetchedTrigger, setRefetchTrigger] = useState(0) // State to trigger refetching when tags change
    const proteinTagGeneNameMap = new Map() 
    const { isReady, tagQueries } =
        usePrefetchConditionApplicationTexts(ca_tags)

    const {
        isReady: attributeIsReady,
        tagQueries: attributeTagQueries,
    } = usePrefetchAttributes(attribute_tags)


    const {
        isReady: proteinIsReady,
        tagQueries: proteinTagQueries,
    } = usePrefetchProteins(protein_tags.filter(t => !proteinTagGeneNameMap.has(t)))

    const caTagMap = useMemo(() => {
        if (!isReady) return null
        const map = new Map()
        tagQueries.forEach((q, idx) => {
            if (q.data) {
                map.set(ca_tags[idx], q.data)
            }
        })
        return map
    }, [_.join(ca_tags), isReady])

    const attributeTagMap = useMemo(() => {
        if (!attributeIsReady) return null 
        const map = new Map()
        attributeTagQueries.forEach((q, idx) => {
            if (q.data) {
                map.set(attribute_tags[idx], q.data)
            }
        })
        return map
    }, [_.join(attribute_tags), attributeIsReady])

    const proteinTagMap = useMemo(() => {
        if (!proteinIsReady) return null 
        
        if (_.isArray(protein_tags)) {
            protein_tags.forEach((protein_tag, idx) => {
                const q = proteinTagQueries[idx]
                if (q && q.data) {
                    proteinTagGeneNameMap.set(protein_tag, { text: q.data.gene_name }) //extract gene names   
                }
            })
            // setRefetchTrigger(Math.random()) // Trigger refetching of components that depend on the protein tag map
        }
        return proteinTagGeneNameMap
    }, [_.join(protein_tags), proteinIsReady])


    const ready = isReady && attributeIsReady

    if (!ready) {
        return null
    }



    return (
        <Component
            {...rest}
            ca_tags={ca_tags}
            attribute_tags={attribute_tags}
            caTagMap={caTagMap}
            attributeTagMap={attributeTagMap}
            isReady={ready}
            proteinTagMap={proteinTagMap} 
            refetchedTrigger={refetchedTrigger}
        />
    )
}
