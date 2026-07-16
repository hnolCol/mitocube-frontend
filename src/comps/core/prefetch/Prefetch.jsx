import React, { useMemo, useRef, useState } from 'react'
import { usePrefetchConditionApplicationTexts } from "@/api/orchestrated/conditionApplications";
import { usePrefetchAttributes } from "@/api/orchestrated/attributes";
import { usePrefetchProteins } from '@/api/orchestrated/proteins';
import _, { set } from "lodash";
import { ProteinSearch } from '../base/protein/ProteinSearch';

export function WithTagMaps({
    Component,
    ca_tags = [],
    attribute_tags = [],
    protein_tags = [],
    showProteinSearch = false,
    proteinSearchProps = {},
    ...rest
}) {
    // Persist across renders
    const [resetProteinSearchTrigger, setProteinSearchTrigger] = useState(undefined)
    const [proteinSearchTags, setProteinSearchTags] =  useState({tags : [], trigger : undefined})
    const proteinTagGeneNameMapRef = useRef(new Map())

    const { isReady, tagQueries } =
        usePrefetchConditionApplicationTexts(ca_tags)

    const {
        isReady: attributeIsReady,
        tagQueries: attributeTagQueries,
    } = usePrefetchAttributes(attribute_tags)

    const missingProteinTags = protein_tags.filter(
        t => !proteinTagGeneNameMapRef.current.has(t)
    )

    const {
        isReady: proteinIsReady,
        isLoading : proteinIsLoading,
        tagQueries: proteinTagQueries,
    } = usePrefetchProteins(missingProteinTags)

    const caTagMap = useMemo(() => {
        const map = new Map()

        tagQueries.forEach((q, idx) => {
            if (q.data) {
                map.set(ca_tags[idx], q.data)
            }
        })

        return map
    }, [tagQueries, ca_tags])

    const attributeTagMap = useMemo(() => {
        const map = new Map()

        attributeTagQueries.forEach((q, idx) => {
            if (q.data) {
                map.set(attribute_tags[idx], q.data)
            }
        })

        return map
    }, [attributeTagQueries, attribute_tags])

    const proteinTagMap = useMemo(() => {

        // Keep old values while loading
        if (_.isArray(missingProteinTags)) {
            missingProteinTags.forEach((protein_tag, idx) => {
                const q = proteinTagQueries[idx]

                if (q?.data) {
                    proteinTagGeneNameMapRef.current.set(
                        protein_tag,
                        { text: q.data.gene_name }
                    )
                }
            })
        }

        return proteinTagGeneNameMapRef.current

    }, [proteinTagQueries, missingProteinTags])

    
    const handleProteinSearchSuccess = (proteinTags) => { 

        setProteinSearchTags(prev => ({ key: "tag", values: proteinTags, trigger: Math.random() }))

    }

    const ready = isReady && attributeIsReady

    if (!ready) {
        return null
    }
    

    return (
        <div className='div--expand'>
            {showProteinSearch && (
                <div>
                    <h4>Search</h4>
                    <ProteinSearch onSuccess={handleProteinSearchSuccess} {...proteinSearchProps}  resetTrigger={resetProteinSearchTrigger} />
                </div>
            )}
        
        <Component
            {...rest}
            ca_tags={ca_tags}
            attribute_tags={attribute_tags}
            caTagMap={caTagMap}
            attributeTagMap={attributeTagMap}
            proteinTagMap={proteinTagMap}
            isReady={ready}
                proteinIsLoading={proteinIsLoading}
                proteinSearchResults={proteinSearchTags}
                setProteinSearchTrigger={setProteinSearchTrigger}   
                
            />
            </div>
    )
}