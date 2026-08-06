import { useEffect, useMemo, useState, useCallback } from "react"
import PropTypes from 'prop-types'
import { addItemToArrayIfNotPresent } from "../../../../services/arrays/transforms"
import _ from "lodash"
import KDBush from 'kdbush';
import { getMinMaxForMultipleKeyNames } from "../../../../services/arrays/boundaries";
import { filterArrayBySearchStringByMultipleKeys, filterArrayBySearchStringBySingleKey } from "../../../../services/arrays/filter";
import { checkChartData } from "../../types/checks/data";
import { checkInteractiveChartKeyNames } from "../../types/checks/chart";
import { getItemFromLocalStorage, saveInLocalStorage } from "@/services/localstorage";


/**
 * @description Interactive chart wrapper that calculates limits, gets indices of valid values and provides hover, search and filter 
 * capabilities.
 * @param {Object} props 
 * @param {Object[]} props.data The data given as an array of objects. The keys can be selected for showing the data. 
 * @param {Object[]} props.keyNames The definition of the keys that should be used for the xaxis and yaxis. The object *must* have the keys
 * 'xaxisName' and 'yaxisName'. The length of the array defines the number of charts that are returned (plotted)
 * @param {String[]} props.extraLimitNames - Keys for which the limits (e.g. chart boundaries) should be calculated in addition to the xaxis and yaxis. 
 * This might accelerate the interactivity when switching between xaxis and yaxis names. 
 * @param {String} props.dataName A name of the dataset when changing this the graph is updated. Usually given as the data id/tag to make the graph update if the
 * dataset is changed. 
 * @param {Number} props.dataUpdateTrigger - A trigger to update the data. If the value changes the chart is updated. 
 * @param {String} props.labelIndicesKey - The key under which the label indices are saved in the local storage.
 * @param {String} props.labelIndicesDataKey - The key under which the label indices for the data are saved in the local storage. This allows to save the indices of the data that are labeled, which is useful for example for volcano plots, where one labels points in the plot, but wants to know which data points are labeled (e.g. to show them in a table or to download them) and not only which indices in the currently shown data are labeled, as these can change when switching between different xaxis and yaxis.
 * @param {Function} props.onLabelDataChange  - Called if defined as afunction upon labelData change (returns the selected indices in the data.)
 * @returns {Array.<import("../../../../types/charts").InteractiveChartResponse>} Returns the interactive response including function to identify points below the mouse using KDBush. 
 */
function InteractiveChart({
    data = dataTest,
    keyNames = [{ xaxisName: "x", yaxisName: "y" }, { xaxisName: "idx", yaxisName: ["x", "y"] }],
    isPointChart = [true, false],
    extraLimitNames = [],
    dataName = "",
    children,
    dataUpdateTrigger = undefined,
    onLabelDataChange,
    passOnProps = {},
    labelIndicesKey = "labelIndices",
    labelIndicesDataKey = "labelIndicesforData",
    initialLabelIndices = undefined,
    externalSearchResult = { values: [], key: "tag", trigger: undefined },
    externalLabelResult = {values : [], key : "tag", trigger : undefined},
    externalHoverResult = { values: [], key: "tag", trigger: undefined } }) {
    
    
    const numberCharts = keyNames.length
    //hovering data 
    const [hoverData, setHoverData] = useState({data : [], idcs : new Set(), rerender : [Math.random()], rect : [], hoverChart : -1, hoverTags : []})
    //label data, the data that are annotated. 
    const [labelData, setLabelData] = useState({ idcs : new Set(), rerender : [Math.random()], labelChart : -1, lastSelected : undefined})
    //background scatter indicates hovering over the data points. This allows quick rendering, as all chart components only rerender if the value rerender changes.
    const [backgroundScatter, setRerender] = useState({ rerender: [Math.random()], filterIndices: new Set(), filterRange: [0, 100], searchIndices: new Set(), searchString: "" })
    const [externalHoverData, setExternalHoverData] = useState({idcs : new Set(), rerender : [Math.random()]})
    const [externalLabelData, setExternalLabelData] = useState({idcs : new Set(), rerender : [Math.random()]})
    
    const [resetAxisZoom, setResetAxisZoom] = useState(_.range(numberCharts).map(idx => { return { chartIdx: undefined } }))

    const keyNamesFlatten = useMemo(
        () => [...new Set(
            keyNames.flatMap(Object.values).flat()
        )],
        [keyNames]
    )

    const flattenKeyNames = useMemo(
        () => keyNamesFlatten.join("|"),
        [keyNamesFlatten]
    )

    const limits  = useMemo(() => getMinMaxForMultipleKeyNames({data, keyNames : _.concat(keyNamesFlatten,extraLimitNames)}), [numberCharts,flattenKeyNames,dataName,_.join(extraLimitNames),data.length, dataUpdateTrigger])
    //get the indices in the data array that are valid (e.g. have valid numbers for xaxisName and yaxisName)
    const validIndices = useMemo(() => {

        return Object.fromEntries(
            keyNames.map(({xaxisName,yaxisName},chartIdx)=>{

                const yKeys = Array.isArray(yaxisName)
                        ? yaxisName
                        : [yaxisName]

                    return [
                        chartIdx,
                        data.map(row =>
                            isPointChart[chartIdx]
                                ? Number.isFinite(row[xaxisName]) &&
                                Number.isFinite(row[yaxisName])
                                : yKeys.every(k =>
                                    Number.isFinite(row[k])
                                )
                        )
                    ]
                })
            )

    },[data,keyNames,isPointChart])

    //create search trees for fast point finding in the array
    const searchTrees = useMemo(()=>{

    return Object.fromEntries(

        keyNames.map((keys,chartIdx)=>{

            if(!isPointChart[chartIdx])
                return [chartIdx,null]

            const valid = validIndices[chartIdx]
            const indices=[]
            const tree = new KDBush(
                valid.filter(Boolean).length
            )
            data.forEach((d,i)=>{

                if(valid[i]){
                    tree.add(
                        d[keys.xaxisName],
                        d[keys.yaxisName]
                    )
                    indices.push(i)
                }

            })
            tree.finish()
            return [
                chartIdx,
                {
                    tree,
                    data_index:indices
                }
            ]

        })
    )

},[data,keyNames,validIndices,isPointChart])

    useEffect(() => {
        if (initialLabelIndices === undefined) return

        setLabelData(prevValues => { return {...prevValues, idcs : initialLabelIndices, rerender : [Math.random()]}})
    }, [initialLabelIndices]) 
    
    useEffect(() => {
        setRerender(prevValues => { return {...prevValues, rerender: [Math.random()]}})
    }, [flattenKeyNames,
        numberCharts,
        _.join(extraLimitNames),
        dataName,
        data.length,
        dataUpdateTrigger])
    
    
    
    const findIndicesByValues = useCallback((values, key) => {
        if (!Array.isArray(values) || values.length === 0) {
            return new Set();
        }

        const valueSet = new Set(values);

        return new Set(
            data.reduce((indices, item, idx) => {
                if (valueSet.has(item[key])) {
                    indices.push(idx);
                }
                return indices;
            }, [])
        );
    }, [data, dataUpdateTrigger]);

    useEffect(() => {
        if (externalSearchResult.trigger === undefined) return;

        const searchIndices = findIndicesByValues(
            externalSearchResult.values,
            externalSearchResult.key
        );

        setRerender(prev => ({
            ...prev,
            searchIndices,
            rerender: [Math.random()],
        }));
    }, [
        externalSearchResult.trigger,
        findIndicesByValues
    ]);

    useEffect(() => {
    if (externalHoverResult.trigger === undefined) return;

        const idcs = findIndicesByValues(
            externalHoverResult.values,
            externalHoverResult.key
        );

        setExternalHoverData(prev => ({
            ...prev,
            idcs,
            rerender: [Math.random()],
        }));
    }, [
        externalHoverResult.trigger,
        findIndicesByValues
    ]);

    useEffect(() => {
        if (externalLabelResult.trigger === undefined) return;

        const idcs = findIndicesByValues(
            externalLabelResult.values,
            externalLabelResult.key
        );

        setExternalLabelData(prev => ({
            ...prev,
            idcs,
            rerender: [Math.random()],
        }));
    }, [
        externalLabelResult.trigger,
        findIndicesByValues
    ]);

    // useEffect(() => { 
    //     if (externalSearchResult.trigger === undefined) return
    //     if (!_.isArray(externalSearchResult.values)) return
    //     setRerender(preValues => {return {...preValues, searchIndices : new Set(data.map((d,idx) => externalSearchResult.values.includes(d[externalSearchResult.key]) ? idx : null).filter(idx => idx !== null)), rerender : [Math.random()]}})
    // }, [externalSearchResult.trigger])   
    


    // useEffect(() => { 

    //     if (externalHoverResult.trigger === undefined) return
    //     if (!_.isArray(externalHoverResult.values)) return
    //     const idcs  = new Set(data.map((d,idx) => externalHoverResult.values.includes(d[externalHoverResult.key]) ? idx : null).filter(idx => idx !== null))
    //     setExternalHoverData(prevValues => { return {...prevValues, idcs, rerender : [Math.random()]}})
    //     }, [externalHoverResult.trigger])
       
    // useEffect(() => { 

    //     if (externalLabelResult.trigger === undefined) return
    //     if (!_.isArray(externalLabelResult.values)) return
    //     const idcs  = new Set(data.map((d,idx) => externalLabelResult.values.includes(d[externalLabelResult.key]) ? idx : null).filter(idx => idx !== null))
    //     setExternalLabelData(prevValues => { return {...prevValues, idcs, rerender : [Math.random()]}})
    //     }, [externalLabelResult.trigger])
       
    
    
    const findIndexInRectangle = (chartIdx,minX,minY,maxX,maxY) => {
        // finds the index in a rectangle
        return searchTrees[chartIdx].tree.range(minX,minY,maxX,maxY)
    }

    const findDataInRectangle = (chartIdx,minX,minY,maxX,maxY, ignoreFilterAndSearchIdcs = false) => {
        // returns the data that are in a rectangle. 
        const searchIdx = searchTrees[chartIdx].tree.range(minX, minY, maxX, maxY)
        //transfer back to original data index
        const idcs = new Set(searchIdx.map(idx => searchTrees[chartIdx].data_index[idx]))

        if (!ignoreFilterAndSearchIdcs && (backgroundScatter.searchIndices.size > 0 || backgroundScatter.filterIndices.size > 0)) {
            _.forEach(Array.from(idcs), idx => !backgroundScatter.searchIndices.has(idx) || backgroundScatter.filterIndices.has(idx)? idcs.delete(idx) : null)
        }
        return idcs
    }

    const setHoverDataInRectangle = (chartIdx, minX, minY, maxX, maxY, screenPosition) => {
        //finds data in an rectangle of coordinates and changes the state of hoverData
        const idcs = findDataInRectangle(chartIdx, minX, minY, maxX, maxY)
        //check if the size changed and if hoverData idcs have not changed.
        if (idcs.size == hoverData.idcs.size && _.every(Array.from(idcs), idx => hoverData.idcs.has(idx))) return
        setHoverData({
            rerender: [Math.random()],
            rect: screenPosition,
            idcs,
            hoverChart: chartIdx,
            hoverTags : Array.from(idcs).map(idx => data[idx].tag)
        })
    }
    
    const setHoverDataByDataIndex = (chartIdx, idcs) => {
        let arr = Array.from(idcs).map(idc => data[idc])
        setHoverData({
            data: arr,
            rerender: [Math.random()],
            idcs,
            hoverChart: chartIdx,
            hoverTags : Array.from(idcs).map(idx => data[idx].tag)
        })
    }

    const setTriggerResetAxisZoom = (chartIdx) => {
        setResetAxisZoom(prevValues => {return {...prevValues, [chartIdx] : Math.random()}})
    }

    const handleNumericFilter = (chartIdx, keyName, min = -Infinity, max = Infinity) => {
        let idcs = data.reduce((s, d, idx) => (d[keyName] > min && d[keyName] < max ? s.add(idx) : null, s), new Set());
        //let idcs = data.reduce((group,d,idx) => d[keyName] > min && d[keyName] < max),[])
        
        setRerender({rerender : [Math.random()], filterIndices : idcs, filterRange : [min,max]})
    }

    const handleStringSearch = (keyNames,searchString) => {
        // searching in the data returns a list of indices matching the search
        //check if numeric filter is active then one should only search there, also save idcs and search string, then one can also subset the
        // data first (TO DO)
        if (!(_.isString(keyNames) || _.isArray(keyNames))) return 
        if (searchString === "") {
            // reset rerender if searchString is empty. 
            setRerender(prevValues => { return { ...prevValues, rerender: [Math.random()], searchIndices: new Set() } })
            return
        }
        let filterResults = {idcs : new Set(), data : []}
        if (keyNames.length > 1) {
            filterResults = filterArrayBySearchStringByMultipleKeys({array : data, keyNames, searchString})
        }
        else if (keyNames.length === 1) {
            let keyName = keyNames[0]
            filterResults = filterArrayBySearchStringBySingleKey({array : data, keyName, searchString})
        }
        setRerender(prevValues => {return {...prevValues, rerender : [Math.random()], searchIndices : filterResults.idcs, searchString}})
    }

    const filterDataInKeyByValue = (chartIdx, keyName, value) => {
        let idcs = new Set(data.map((d,idx) => d[keyName] === value ? idx : null).filter(idx => idx !== null)) //reduce((s, d, idx) => (d[keyName] === value ? s.add(idx) : null, s), new Set())
        setRerender(prevValues => { return { ...prevValues, rerender: [Math.random()], searchIndices: idcs } })
    }

    const handleSearchByDataIndex = (chartIdx, idcs) => {
        setRerender(prevValues => {return {...prevValues, rerender : [Math.random()], searchIndices : idcs}})
    }

    const resetSearchIdcs = (chartIdx) => {
        setRerender(prevValues => {return {...prevValues, rerender : [Math.random()], searchIndices : new Set()}})
    }

    const saveIndicesToLocalStorage = async (key, indices) => {
        try {
            const indicesArray = Array.from(indices);
            const { itemFound, itemValue } = getItemFromLocalStorage({ itemName : key, parseJson : true })
            saveInLocalStorage({ itemName: key, itemValue: itemFound ? JSON.stringify({ ...itemValue, [labelIndicesDataKey]: indicesArray }) : JSON.stringify({ [labelIndicesDataKey]: indicesArray }) })
            return true;
        } catch (error) {
            console.error('Error saving indices to localStorage:', error);
            return false;
        }
    }

    const findClosestPoint3 = (chartIdx, minX, minY, maxX, maxY, point) => {

        const idcs = findDataInRectangle(chartIdx, minX, minY, maxX, maxY)
        let labelIdcs = labelData.idcs
        _.forEach(Array.from(idcs), idx => labelIdcs.has(idx) ? labelIdcs.delete(idx) : labelIdcs.add(idx))
        if (_.isFunction(onLabelDataChange)) onLabelDataChange(idcs)
        saveIndicesToLocalStorage(labelIndicesKey, labelIdcs)
        setLabelData({idcs : labelIdcs, labelChart : chartIdx, rerender : [Math.random()], lastSelected : idcs})
    }

    const findClosestPoint = (chartIdx, minX, minY, maxX, maxY, point) => {

            const idcs=findDataInRectangle(
                chartIdx,
                minX,
                minY,
                maxX,
                maxY
            )


            const labelIdcs=new Set(labelData.idcs)


            idcs.forEach(idx=>{
                if(labelIdcs.has(idx))
                    labelIdcs.delete(idx)
                else
                    labelIdcs.add(idx)
            })


            setLabelData(prev=>({
                idcs:labelIdcs,
                labelChart:chartIdx,
                lastSelected:idcs,
                rerender : [Math.random()]
            }))
        }



    
    const chartProps = _.range(numberCharts).map(chartIdx => {
        const {xaxisName, yaxisName } = keyNames[chartIdx]
        return {
            data,
            chartIdx,
            valid: validIndices[chartIdx],
            // initialLayouts,
            xaxisName,
            yaxisName,
            limits,
            findIndexInRectangle,
            findDataInRectangle,
            setHoverDataInRectangle,
            handleNumericFilter,
            handleStringSearch,
            handleSearchByDataIndex,
            filterDataInKeyByValue,
            setTriggerResetAxisZoom,
            setHoverDataByDataIndex,
            findClosestPoint,
            triggerResetAxis: resetAxisZoom[chartIdx],
            externalLabelProps : {externalLabelRerender : externalLabelData.rerender, externalLabelIndices : externalLabelData.idcs},
            externalHoverProps : {externalHoverRerender : externalHoverData.rerender, externalHoverIndices : externalHoverData.idcs},
            hoverProps : {rerenderHover : hoverData.rerender, hoverPosition : hoverData.rect, hoverChart : hoverData.hoverChart, hoverIndices : hoverData.idcs},
            filterProps: { rerenderBackground: backgroundScatter.rerender, filterIndices: backgroundScatter.filterIndices, filterRange: backgroundScatter.filterRange, searchIndices: backgroundScatter.searchIndices, resetSearchIdcs, searchString : backgroundScatter.searchString },
            labelProps: { labelIndices: labelData.idcs, labelRerender: labelData.rerender, labelChart: labelData.labelChart, lastSelected: labelData.lastSelected },
            ...passOnProps
        }
    })  
    
    

    
    return (
            <>
            {children(chartProps)}
            </>
      
    )

}

InteractiveChart.propTypes = {
    data: (props,propName,componentName) => checkChartData(props,propName,componentName,[]),
    keyNames: checkInteractiveChartKeyNames, 
    isPointChart: PropTypes.arrayOf(PropTypes.bool),
    extraLimitNames: PropTypes.arrayOf(PropTypes.string),
    dataName: PropTypes.string 
}


export default InteractiveChart