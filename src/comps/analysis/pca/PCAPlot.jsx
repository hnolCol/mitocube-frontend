import _ from "lodash";
import { useEffect, useMemo, useState } from "react";

import InteractiveChart from "../../core/charts/interactive";
import { ScatterPlot } from "../../core/charts/scatter";
import { getNumericKeysFromArrayOfObjects } from "../../../services/arrays/filter";
import { ScatterDataSelection } from "../../core/charts/selections/ScatterDataSelection";

import { Loading } from "@/comps/core/base/states/Loading";

/**
 * Main PCA visualization component.
 * Renders projection and drivers scatter plots with interactive selection.
 */
function PCAPlot({
    submission_tag,
    ca_tags,
    pcaresults,
    isPCALoading,
    attribute_tags,
    caTagMap,
    attributeTagMap,
    proteinTagMap,
    isReady,
    proteinIsLoading,
    proteinSearchResults,
    setRequiredProteinTags,
    showHoverLabels,
    externalSearchResult
}) {
    const [selection, setSelection] = useState({
        xaxisName: undefined,
        yaxisName: undefined,
        colorName: undefined,
        tooltipNames: [],
        sizeName: undefined,
        filterTag: undefined
    });

    const pcaResultsValid = _.isObject(pcaresults) && _.isArray(pcaresults.drivers) && _.isArray(pcaresults.projection);
    const numericKeyNames = pcaResultsValid ? getNumericKeysFromArrayOfObjects(pcaresults.drivers) : [];
    const numericKeyNamesProjection = pcaResultsValid ? getNumericKeysFromArrayOfObjects(pcaresults.projection) : [];

    useEffect(() => {
        if (!_.isObject(pcaresults) && !isPCALoading) return;
        setSelection({
            xaxisName: numericKeyNames[0],
            yaxisName: numericKeyNames[1],
            tooltipNames: [],
            colorName: undefined,
        });
    }, [_.isObject(pcaresults)]);

    const handleScatterSelection = (idx, selectionKey, keyName) => {
        setSelection(prevValues => ({ ...prevValues, [selectionKey]: keyName }));
    };

    if (isPCALoading) return <Loading />;
    if (!isReady) return <Loading />;
    if (!pcaResultsValid) return <div>No PCA results found for this submission. Likely the data are not yet uploaded.</div>;

    return (
        <div className="div--expand" style={{ overflowY: "scroll", height: "90vh" }}>
            <h2>Principal Component Analysis</h2>
            {_.isObject(pcaresults) && _.isArray(pcaresults.variance_explained) ? (
                <span>
                    {pcaresults.variance_explained.length} components calculated, explaining {_.round(_.sum(pcaresults.variance_explained) * 10000) / 100}% of the total variance.
                </span>
            ) : null}

            <div className="flex" style={{ gap: "5rem", marginTop: "1rem" }}>
                {/* Projection Plot */}
                <div>
                    <ScatterDataSelection
                        keyNames={_.keys(pcaresults.projection[0])}
                        title="Projection"
                        idx={0}
                        numericKeyNames={numericKeyNames}
                        selection={selection}
                        itemIsAttribute={false}
                        colorAndSizeAreAttributes={true}
                        numericIsAttribute={false}
                        colorAndSizeKeyNames={attribute_tags}
                        setSelection={handleScatterSelection}
                        downloadElements={["scatter_plot-pca-projection", pcaresults.projection]}
                        elementNames={["SVG", "DIVIDER", `Projected Data (${pcaresults.projection.length} x ${_.keys(pcaresults.projection[0]).length})`]}
                        fileNames={[`${submission_tag}-PCA.svg`, `${submission_tag}-PCA-Projection.txt`]}
                        elementTypes={["svg", "data"]}
                    />
                    {pcaResultsValid ? (
                        <InteractiveChart
                            data={pcaresults.projection}
                            extraLimitNames={[selection.colorName, selection.sizeName].filter(
                                keyName => _.isString(keyName) && numericKeyNamesProjection.includes(keyName)
                            )}
                            keyNames={[{ xaxisName: selection.xaxisName, yaxisName: selection.yaxisName }]}
                            isPointChart={[true]}
                        >
                            {(chartData) =>
                                chartData.map(({
                                    data,
                                    chartIdx,
                                    xaxisName,
                                    yaxisName,
                                    valid,
                                    limits,
                                    findDataInRectangle,
                                    setHoverDataInRectangle,
                                    handleSearchByDataIndex,
                                    filterDataInKeyByValue,
                                    hoverProps,
                                    filterProps
                                }, didx) => (
                                    <div key={`${chartIdx}-projection`}>
                                        <ScatterPlot
                                            chartIdx={chartIdx}
                                            colorName={selection.colorName}
                                            sizeName={selection.sizeName}
                                            data={data}
                                            valid={valid}
                                            findDataInRectangle={findDataInRectangle}
                                            setHoverDataInRectangle={setHoverDataInRectangle}
                                            xaxisName={xaxisName}
                                            yaxisName={yaxisName}
                                            limits={limits}
                                            tooltipSmall={false}
                                            tooltipNames={["tag"]}
                                            {...hoverProps}
                                            {...filterProps}
                                            legend={true}
                                            handleSearchByDataIndex={handleSearchByDataIndex}
                                            tooltipNameIsProtein={{}}
                                            filterDataInKeyByValue={filterDataInKeyByValue}
                                            svgID="scatter_plot-pca-projection"
                                        />
                                    </div>
                                ))
                            }
                        </InteractiveChart>
                    ) : null}
                </div>

                {/* Drivers Plot */}
                {pcaResultsValid ? (
                    <InteractiveChart
                        data={pcaresults.drivers}
                        externalSearchResult={proteinSearchResults}
                        extraLimitNames={numericKeyNames}
                        keyNames={[{ xaxisName: selection.xaxisName, yaxisName: selection.yaxisName }]}
                        isPointChart={[true]}
                        passOnProps={{
                            setRequiredProteinTags,
                            proteinTagMap,
                            proteinIsLoading,
                            showHoverLabels
                        }}
                    >
                        {(chartData) =>
                            chartData.map(({
                                data,
                                chartIdx,
                                xaxisName,
                                yaxisName,
                                valid,
                                limits,
                                findDataInRectangle,
                                setHoverDataInRectangle,
                                filterDataInKeyByValue,
                                hoverProps,
                                filterProps,
                                labelProps,
                                findClosestPoint,
                                triggerResetAxis,
                                setTriggerResetAxisZoom
                            }, didx) => (
                                <div key={`${didx}-driver-pca-${xaxisName}`}>
                                    <ScatterDataSelection
                                        keyNames={_.keys(pcaresults.drivers[0])}
                                        title="Drivers"
                                        numericKeyNames={numericKeyNames}
                                        showAxisSelection={false}
                                        showMarksSelection={false}
                                        idx={1}
                                        chartIdx={chartIdx}
                                        selection={selection}
                                        setSelection={handleScatterSelection}
                                        setTriggerResetAxisZoom={setTriggerResetAxisZoom}
                                        itemIsAttribute={false}
                                        numericIsAttribute={false}
                                        downloadElements={["scatter_plot-pca-drivers", pcaresults.drivers]}
                                        elementNames={["SVG", "DIVIDER", `Data (${pcaresults.drivers.length} x ${_.keys(pcaresults.drivers[0]).length})`]}
                                        fileNames={[`${submission_tag}-PCA-drivers.svg`, `${submission_tag}-PCA-Drivers.txt`]}
                                        elementTypes={["svg", "data"]}
                                    />

                                    <ScatterPlot
                                        key={`${chartIdx}-drivers-${submission_tag}`}
                                        chartIdx={chartIdx}
                                        data={data}
                                        valid={valid}
                                        svgID="scatter_plot-pca-drivers"
                                        sizeName={selection.sizeName}
                                        colorName={selection.colorName}
                                        tooltipNames={["tag"]}
                                        labelNames={[]}
                                        findDataInRectangle={findDataInRectangle}
                                        setHoverDataInRectangle={setHoverDataInRectangle}
                                        filterDataInKeyByValue={filterDataInKeyByValue}
                                        findClosestPoint={findClosestPoint}
                                        {...labelProps}
                                        xaxisName={xaxisName}
                                        yaxisName={yaxisName}
                                        limits={limits}
                                        {...hoverProps}
                                        {...filterProps}
                                        proteinTagMap={proteinTagMap}
                                        attributeTagMap={attributeTagMap}
                                        caTagMap={caTagMap}
                                        legendWithAttributes={false}
                                        triggerResetAxis={triggerResetAxis}
                                        setTriggerResetAxisZoom={setTriggerResetAxisZoom}
                                        setRequiredProteinTags={setRequiredProteinTags}
                                        proteinIsLoading={proteinIsLoading}
                                        labelIsProtein={true}
                                        showHoverLabels={showHoverLabels}
                                        tooltipNameIsProtein={{ "tag": true }}
                                    />
                                </div>
                            ))
                        }
                    </InteractiveChart>
                ) : null}
            </div>
        </div>
    );
}

export default PCAPlot;
