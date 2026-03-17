import { useEffect, useMemo, useState } from "react"
import PropTypes from 'prop-types'
import { addItemToArrayIfNotPresent } from "../../../../services/arrays/transforms"
import _ from "lodash"
import KDBush from 'kdbush';
import { getMinMaxForMultipleKeyNames } from "../../../../services/arrays/boundaries";
import { filterArrayBySearchStringByMultipleKeys, filterArrayBySearchStringBySingleKey } from "../../../../services/arrays/filter";
import { checkChartData } from "../../types/checks/data";
import { checkInteractiveChartKeyNames } from "../../types/checks/chart";
import { Responsive, WidthProvider } from "react-grid-layout"

function makeid(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
}

let dataTest = _.range(2000).map(idx => {return {x : Math.random() * 1000, y : Math.random() * 5000, z : Math.random() * 4500,  label : makeid(5)}})


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
    onLabelDataChange}) {
    
    const numberCharts = keyNames.length

    //hovering data 
    const [hoverData, setHoverData] = useState({data : [], idcs : new Set(), rerender : [Math.random()], rect : [], hoverChart : -1})
    //const [selectedItems, setSelectedItems]  = useState()
    //label data, the data that are annotated. 
    const [labelData, setLabelData] = useState({data : [], idcs : new Set(), rerender : [Math.random()], labelChart : -1, lastSelected : undefined})
    //background scatter indicates hovering over the data points. This allows quick rendering, as all chart components only rerender if the value rerender changes.
    const [backgroundScatter, setRerender] = useState({ rerender: [Math.random()], filterIndices: new Set(), filterRange: [0, 100], searchIndices: new Set(), searchString: "" })

    const [resetAxisZoom, setResetAxisZoom] = useState(_.range(numberCharts).map(idx => { return { chartIdx: undefined } }))


    const keyNamesFlatten = _.flattenDeep(keyNames.map(keys => Object.values(keys)))
    const flattenKeyNames = _.join(keyNamesFlatten)
    const limits  = useMemo(() => getMinMaxForMultipleKeyNames({data, keyNames : _.concat(keyNamesFlatten,extraLimitNames)}), [numberCharts,flattenKeyNames,dataName,_.join(extraLimitNames),data.length, dataUpdateTrigger])
    //get the indices in the data array that are valid (e.g. have valid numbers for xaxisName and yaxisName)
    const validIndices = useMemo(() => {
        const isNumber = _.map(data, (d) => Object.fromEntries(_.map(keyNamesFlatten, keyName => [keyName,_.isNumber(d[keyName])])))
        return Object.fromEntries(_.map(keyNames, ({xaxisName, yaxisName },chartIdx) => {
            return([chartIdx, _.map(isNumber, d => isPointChart[chartIdx] ? d[xaxisName] && d[yaxisName ] : _.every(yaxisName, yName => d[yName]))])
        }))
    },[flattenKeyNames, dataName, data.length, dataUpdateTrigger])

    //create search trees for fast point finding in the array
    const searchTrees = useMemo(() => {
        return Object.fromEntries(_.range(numberCharts).filter(chartIdx => isPointChart[chartIdx]).map(chartIdx => {
            let data_index = _.range(data.length).filter(idx => validIndices[chartIdx][idx])
            let tree_data = data.filter((d,idx) => validIndices[chartIdx][idx])
            const nPoints = tree_data.length 
            const index = new KDBush(nPoints);
            const { xaxisName, yaxisName } = keyNames[chartIdx]
            _.forEach(tree_data, d => index.add(d[xaxisName], d[yaxisName]))
            index.finish()
            return [chartIdx, {tree : index, xaxisName, yaxisName , limits, data_index}]
        }))
    },[flattenKeyNames, numberCharts, dataName, data.length, dataUpdateTrigger])


    useEffect(() => {
        setRerender(prevValues => { return {...prevValues, rerender: [Math.random()]}})
    },[flattenKeyNames,numberCharts,_.join(extraLimitNames),dataName,data.length, dataUpdateTrigger])

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
        setHoverData({data : Array.from(idcs).map(idx => data[idx]), rerender : [Math.random()], rect : screenPosition, idcs, hoverChart : chartIdx})
    }
    
    const setHoverDataByDataIndex = (chartIdx, idcs) => {
        let arr = Array.from(idcs).map(idc => data[idc])
        setHoverData({data : arr, rerender : [Math.random()], idcs, hoverChart : chartIdx })
    }

    const setTriggerResetAxisZoom = (chartIdx) => {
        setResetAxisZoom(prevValues => {return {...prevValues, [chartIdx] : Math.random()}})
    }

    const handleItemSelection = (itemIndex = undefined) => {
        //handle item selection by item Index
        let selectedItems = addItemToArrayIfNotPresent({array : data, item : data[itemIndex]})
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

    const findClosestPoint = (chartIdx, minX, minY, maxX, maxY, point) => {

        const idcs = findDataInRectangle(chartIdx, minX, minY, maxX, maxY)
        let labelIdcs = labelData.idcs
        _.forEach(Array.from(idcs), idx => labelIdcs.has(idx) ? labelIdcs.delete(idx) : labelIdcs.add(idx))

        if (_.isFunction(onLabelDataChange)) onLabelDataChange(idcs)

        setLabelData({idcs : labelIdcs, labelChart : chartIdx, rerender : [Math.random()], lastSelected : idcs})
        
    }

    const findClosestPoint2 = (xaxisName = "", yName = "", point = {x : undefined, y : undefined}, tolerance = 0.1) => {
        //find closest point 
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
            handleItemSelection,
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
            triggerResetAxis : resetAxisZoom[chartIdx],
            hoverProps : {hoverData : hoverData.data, rerenderHover : hoverData.rerender, hoverPosition : hoverData.rect, hoverChart : hoverData.hoverChart, hoverIndices : hoverData.idcs},
            filterProps: { rerenderBackground: backgroundScatter.rerender, filterIndices: backgroundScatter.filterIndices, filterRange: backgroundScatter.filterRange, searchIndices: backgroundScatter.searchIndices, resetSearchIdcs, searchString : backgroundScatter.searchString },
            labelProps : {labelIndices : labelData.idcs, labelRerender : labelData.rerender, labelChart : labelData.labelChart, lastSelected : labelData.lastSelected}
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