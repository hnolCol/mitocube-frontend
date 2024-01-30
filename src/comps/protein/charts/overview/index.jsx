
import _ from "lodash"

import ResultChart from "../resultCard/chart"
import { useGetDataByFeatureID } from "../../../../hooks/queries/feature.hooks"
import { useOutletContext } from "react-router"
import APIError from "../../../core/error/APIerror"




function ProteinOverview({
    authenticationStatus,
    // yaxisName = "y",
    // sizeName = "y",
    // colorName = "T",
    // subplotName = "T",
    // data = [{ "T": "HEK", "y" : 6, N : "GG"},{ "T": "Macrophages", "y" : 2 , N : "GG"} ,{ "T": "HeLa", "y" : 2 , N : "GG"},{ "T": "HeLa", "y" : 14 , N : "GG"},{ "T": "HeLa" , "y" : 3, N : "PP"}, { "T": "HeLa" , "y" : 4,  N : "PP"}, { "T": "HEK" , "y" : 4,  N : "PP"}],
    subplotBasicWidth = 90,
    orderData = true
}) {
    
    const { featureKey } = useOutletContext()

    const { data: featureData, isError, error } = useGetDataByFeatureID({ feature_key: featureKey }, {})
    console.log(featureData)
    if (isError) return <APIError error={error} />
    return (
        <div className="flex flex--wrap center-items container--scroll-y-hide-x" style={{maxHeight:"90vh"}}>
            
            {_.isObject(featureData) ? featureData["dataset_labels"].map(dataID => {
                const data = featureData["data"][dataID] //get data for dataset
                return (
                    <ResultChart key={`${featureKey}-${dataID}`} groupings={featureData["samples_attributes"][dataID]} data={data} {...{ dataID, featureID: featureKey }} yaxisName="value"
                        attributesByTag={featureData.attributes}
                        attributeValuesByTag={featureData.attribute_values_by_tag} />
                )
            }): null}
            
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