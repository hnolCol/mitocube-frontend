
import _ from "lodash"

import ResultChart from "../resultCard/chart"
import { useGetDataByFeatureID, useGetFeatureByTag } from "../../../../hooks/queries/feature.hooks"
import { useOutletContext } from "react-router"
import APIError from "../../../core/error/APIerror"
import { DialogBody, Drawer } from "@blueprintjs/core"
import { useGetMetadata } from "../../../../hooks/queries/datasets.hooks"
import Loading from "../../../core/base/loading"
import { useMemo, useState } from "react"
import DatasetAttributeHierarchy from "../../../submission/new/attribute/view/DatasetAttributesHierarchy"
import { getFormatDateFromTimestamp } from "../../../../services/date/format"
import MultipleMetrices from "../../../core/metrics/collection"
import { useGetFilters } from "../../../../hooks/queries/filter.hooks"
import { FilterSummary } from "../../../core/filters/FilterSummary"
import { AuthorList } from "../../../core/authors/SubmissionAuthorList"
import { Metatexts } from "../../../core/metatext/SubmissionMetatext"
import { GenePublications } from "../../../core/publications/GenePublications"
import { ProteinAbundance } from "../FeatureAbundance"


function MetaDataDrawer({ dataset_label, isOpen, setIsOpen }) {
    const {data : metadata, isLoading, isError, error, isFetching, isSuccess} = useGetMetadata({tag : dataset_label},{enabled : _.isString(dataset_label) && dataset_label.length > 1})
    
    const metdataIsObject = _.isObject(metadata)
    
    
    //TODO put in service file ... redundant with dataset overview
    
    const { datasetMetrices, m, formatedTime } = useMemo(() => {
        if (!metdataIsObject) return []
        //get metrices available at any state of the project
        const [m, formatedTime] =  getFormatDateFromTimestamp(metadata.created_on) 
        let datasetMetrices = [
            { label : "Label", metric : metadata.label},
            { label: "Samples", metric: metadata.n_samples },
            { label: "Replicates", metric: metadata.n_replicates},
            // { label: "Genotypes", metric : 2},
            // { label: "Sample Attributes", metric: Object.keys(metadata.samples_attributes).length },
        ]
        //add others / optional 
        return { datasetMetrices , m ,formatedTime}
    }, [dataset_label, metdataIsObject])

    return <Drawer {...{
        isOpen,
        isCloseButtonShown: true,
        title: "Metadata Overview",
        onClose : () => setIsOpen(prevValues => { return { ...prevValues, isOpen: false } })
    }}>
    
        
        {isLoading || isFetching ? <Loading /> : isError ? <APIError error={error} /> : 
            metdataIsObject ? <div className="div--expand padding--little" style={{overflowY:"scroll"}}>
                
                <div className="flex flex-column center-items ">
                <h1>{metadata.title}</h1>
                    <AuthorList {...{
                        submission_tag : metadata.tag,
                        emailSubject: `Related to dataset ${metadata.title} (${metadata.label})`
                    }} />
                <div className="font-size--small intent-margin-top--little">
                    {`${m.fromNow()} (${formatedTime})`}
                    </div>
                    <div className="intent-margin-top--little">
                <MultipleMetrices metrices={datasetMetrices} />
                </div>
                </div>
                <div className="margin--medium">
                <h2>Dataset Attributes</h2>
                <DatasetAttributeHierarchy {...{
                    selectedDasetAttributeValues: metadata.dataset_attributes,
                    selectedAttributes: _.values(metadata.attributes)
                }} />
                <h2>Metatext</h2>
                <Metatexts submission_tag={metadata.tag} fill={true} />
                </div>
            </div> : null}
    </Drawer>
}



function ProteinFilter({ tag }) {
    const { data, isSuccess } = useGetFilters({ feature_tag: tag })

    return <div>
        <h4>Protein Filter Tags</h4>
        <p>The protein is associated with the following protein filter tags:</p>
        {_.isArray(data) ? data.length === 0 ?
            <div className="font-size--smallest"><p>The protein is not present in any of the filter sets.</p></div>
            : <div>{data.map(filter => <FilterSummary key={filter.tag} filter={filter} />)} </div> : null}

    </div>
}


function ProteinCorrelation({tag}) {

    return <div>
        <h3>Correlation</h3>
        <div>Under progress. Showing correlations across all datasets   </div>
    </div>
}

function ProteinOverview() {
    
    const { feature_tag } = useOutletContext()
    const [metadataDrawer, setMetadataDrawer] = useState({isOpen : false, dataset_label : undefined})
    const { data: featureData, isError, error } = useGetDataByFeatureID({ feature_tag }, {})
    const { data : feature } = useGetFeatureByTag({tag : feature_tag}, {enabled : _.isString(feature_tag), staleTime : Infinity})
    console.log(feature)
    const featureIsLoaded = _.isObject(feature)
    if (isError) return <APIError error={error} />
    return (
        <div>
            <MetaDataDrawer isOpen={metadataDrawer.isOpen} dataset_label={metadataDrawer.dataset_label} setIsOpen={setMetadataDrawer} />
            <div>
                <h3>Protein Information</h3>
                {featureIsLoaded ? <div><div>{feature.gene_names}</div><div>{feature.protein_name}</div></div> : null}
                <MultipleMetrices metrices={[{label : "Times viewed", metric : 839}, {label : "Genotypes", metric : 4}]}/>
                <ProteinFilter tag = {feature_tag} />
                <h3>Abundance</h3>
                {featureIsLoaded ? <ProteinAbundance tag={feature_tag} proteome_tag={feature.proteome_tag} /> : null}
                <ProteinCorrelation />
                {featureIsLoaded && _.has(feature, "gene_name") ? <GenePublications gene_name={feature.gene_name} /> : null}


            </div>
            <div className="flex flex--wrap center-items container--scroll-y-hide-x" style={{maxHeight:"90vh"}}>
            {_.isObject(featureData) ? featureData["submission_tags"].map(submission_tag => {
                const data = featureData["data"][submission_tag] //get data for dataset
                return (
                    <ResultChart key={`${feature_tag}-${submission_tag}`}
                        sample_attribute_tags={featureData["sample_attribute_by_submission_tag"][submission_tag]}
                        data={data}
                        {...{
                            submission_tag, featureID: feature_tag,
                            title: featureData.title_by_tag[submission_tag]
                        }}
                        yaxisName="value"
                        attributesByTag={featureData.attributes}
                        genotypesByTag={featureData["genotypes_by_tag"][submission_tag]}
                        attributeValuesByTag={featureData.attribute_values_by_tag}
                        openMetadataDrawer={setMetadataDrawer} />
                )
            }) : null}
                </div>
            
            {/* <BoxplotWithValue/>
            <div> Color : </div>
                <Combobox
                    items={keyNames}
                    placeholder={columnSelection.colorName}
                    callback={(colorName) => setColumnSelection(prevValues => { return { ...prevValues, colorName } })} />
            <div> Size : </div>
                <Combobox
                    items={numericKeys}
                    placeholder={columnSelection.sizeName}
                    callback={(sizeName) => setColumnSelection(prevValues => { return { ...prevValues, sizeName } })} />
            <div> Subplot : </div>
                <Combobox items={categoricalKeys} placeholder={columnSelection.subplotName} callback={(subplotName) => setColumnSelection(prevValues => { return { ...prevValues, subplotName} })}/>
            <div> Filter : </div>
                <InputGroup placeholder="Search ..." leftIcon="search" />
            </div>
            <SVGHeader svgID={Object.keys(svgIDs)} svgFileName={Object.values(svgIDs)} chartData={data} txtFileName="ChartData.txt" />
            <CollapsableAxes
                data={orderedData}
                colorName={columnSelection.colorName}
                sizeName={columnSelection.sizeName}
                subplotName = {columnSelection.subplotName}
                rowHeight={250}
                subplotBasicWidth={subplotBasicWidth}
            >
                  {(subplots) => subplots.map(({
                      width,
                      height,
                      divIsCollapsed,
                      toggleCollapse,
                      subplotIdx,
                      subplotName,
                      subplotCategory,
                      subplotCategories,
                      subplotCategoriesCounts,
                      subplotData, colorScale, sizeScale}, idx) => {
                        return (
                            <div className="flex bg--grey" key={subplotIdx} style={{ backgroundColor: "#efefef", width, height, minWidth: width, maxWidth: width, margin: "1rem" }}>
                                {!divIsCollapsed ?
                                    <CategoricalScatter
                                        data={subplotData}
                                        svgID={subplotCategory}
                                        title = {`${subplotCategory} (${subplotCategoriesCounts[subplotCategory]})`}
                                        defaultColor={defaultColors[idx]}
                                        sizeName={columnSelection.sizeName}
                                        colorName={columnSelection.colorName}
                                        {...{ yAxisDomain, width, height, subplotName, colorscale : colorScale, sizescale : sizeScale}} /> : 
                                    <div>
                                    <SVG {...{ width, height }}>

                                        <Text x={width / 2} y={height / 2} verticalAnchor="middle" textAnchor="middle">{subplotCategory}</Text>
                                    
                                    </SVG></div>}
                                {idx === subplots.length - 1 ? <div>
                                    <LegendOrdinal scale={colorScale}>
                                    {(labels) => (
                                        <div style={{ display: 'flex', flexDirection: 'row' }}>
                                        {labels.map((label, i) => (
                                            <LegendItem
                                            key={`legend-quantile-${i}`}
                                            margin="0 5px">
                                            
                                            <svg width={15} height={15}>
                                                <rect fill={label.value} width={15} height={15} />
                                            </svg>
                                            <LegendLabel align="left" margin="0 0 0 4px">
                                                {label.text}
                                            </LegendLabel>
                                            </LegendItem>
                                        ))}
                                            </div>)}
                                    </LegendOrdinal>
                                    <LegendSize scale={sizeScale} steps={3} >
                                        {(labels) =>
                                            labels.map((label) => {
                                            const size = sizeScale(label.datum) ?? 0;
                                            return (
                                                <LegendItem
                                                key={`legend-${label.text}-${label.index}`}
                                                >
                                                <svg width={size} height={size} style={{ margin: '4px 0' }}>
                                                    <circle fill={"grey"} r={size / 2} cx={size / 2} cy={size / 2} />
                                                </svg>
                                                <LegendLabel align="left" margin="0 8px">
                                                    {label.text}
                                                </LegendLabel>
                                                </LegendItem>
                                            );
                                            })
                                        }
                                        </LegendSize>
                                </div>
         
                                 : null}
                          </div>
                        )
                    })
                  }
                
                </CollapsableAxes>
            
            <div style={{ maxWidth: "400px", height: "500px"}}>
                    <ParentSize>{(parent) => 
                        <div>
                            <SVGHeader svgID={"volc"} />
                            <ChartLegend width={parent.width} height={80}/>
                            <LineChart width={parent.width} height={parent.height} svgID={"volc"} />
                        </div>}
                    </ParentSize>
                
                </div> */}
        </div>

    )
}


export default ProteinOverview