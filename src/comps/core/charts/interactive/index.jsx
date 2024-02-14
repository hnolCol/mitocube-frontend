import { useEffect, useMemo, useState } from "react"
import { addItemToArrayIfNotPresent } from "../../../../services/arrays/transforms"
import _ from "lodash"
import KDBush from 'kdbush';
import { getMinMaxForMultipleKeyNames } from "../../../../services/arrays/boundaries";
import { filterArrayBySearchStringByMultipleKeys, filterArrayBySearchStringBySingleKey } from "../../../../services/arrays/filter";

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
 * 
 * @param {Object} param0 
 * @returns {Array.<import("../../../../types/charts").InteractiveChartResponse>} Returns the interactive response including function to identify points below the mouse using KDBush. 
 */
function InteractiveChart({data = dataTest, keyNames = [{xaxisName : "x", yaxisName  : "y"},{xaxisName : "idx", yaxisName  : ["x","y"]}], isPointChart = [true,false], extraLimitNames = [], children}){ //,{xaxisName : "y", yaxisName  : "x"},,{xaxisName : "y", yaxisName  : "x"},{xaxisName : "y", yaxisName  : "x"}

    const [hoverData, setHoverData] = useState({data : [], idcs : new Set(), rerender : [Math.random()], rect : [], hoverChart : -1})
    //const [selectedItems, setSelectedItems]  = useState()
    const [labelData, setLabelData] = useState({data : [], idcs : new Set(), rerender : [Math.random()], labelChart : -1 })
    const [backgroundScatter, setRerender] = useState({rerender : [Math.random()], filterIndices : new Set(), filterRange : [0,100], searchIndices : new Set(), searchString : ""})
    const numberCharts = keyNames.length
    const keyNamesFlatten = _.flattenDeep(keyNames.map(keys => Object.values(keys)))
    const limits  = getMinMaxForMultipleKeyNames({data,keyNames : _.concat(keyNamesFlatten,extraLimitNames)})
    const validIndices = useMemo(() => {
        const isNumber = _.map(data, (d) => Object.fromEntries(_.map(keyNamesFlatten, keyName => [keyName,_.isNumber(d[keyName])])))
        return Object.fromEntries(_.map(keyNames, ({xaxisName, yaxisName },chartIdx) => {
            return([chartIdx, _.map(isNumber, d => isPointChart[chartIdx] ? d[xaxisName] && d[yaxisName ] : _.every(yaxisName, yName => d[yName]))])
        }))
    },[_.join(keyNamesFlatten)])

    const searchTrees = useMemo(() => {
        //create search trees for fast point finding in the array
        return Object.fromEntries(_.range(numberCharts).filter(chartIdx => isPointChart[chartIdx]).map(chartIdx => {
            const nPoints = data.length 
            const index = new KDBush(nPoints);
            const {xaxisName, yaxisName } = keyNames[chartIdx]
            _.forEach(data, d => index.add(d[xaxisName],d[yaxisName ]))
            index.finish()
            return [chartIdx, {tree : index, xaxisName, yaxisName , limits}]
        }))
    },[_.join(keyNamesFlatten),numberCharts])


    useEffect(() => {
        setRerender(prevValues => { return {...prevValues, rerender: [Math.random()]}})
    },[_.join(keyNamesFlatten),numberCharts])

    const findIndexInRectangle = (chartIdx,minX,minY,maxX,maxY) => {
        // finds the index in a rectangle
        return searchTrees[chartIdx].tree.range(minX,minY,maxX,maxY)
    }

    const findDataInRectangle = (chartIdx,minX,minY,maxX,maxY, ignoreFilterAndSearchIdcs = false) => {
        // returns the data that are in a rectangle. 
        const searchIdx = searchTrees[chartIdx].tree.range(minX, minY, maxX, maxY)
        const idcs = new Set(searchIdx)
        if (!ignoreFilterAndSearchIdcs && (backgroundScatter.searchIndices.size > 0 || backgroundScatter.filterIndices.size > 0)) {
            _.forEach(Array.from(idcs), idx => !backgroundScatter.searchIndices.has(idx) || backgroundScatter.filterIndices.has(idx)? idcs.delete(idx) : null)
        }
        return idcs
    }

    const setHoverDataInRectangle = (chartIdx,minX,minY,maxX,maxY, screenPosition) => {
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

        setLabelData({idcs : labelIdcs, labelChart : chartIdx, rerender : [Math.random()]})
        
    }

    const findClosestPoint2 = (xaxisName = "", yName = "", point = {x : undefined, y : undefined}, tolerance = 0.1) => {
        //find closest point 
    }

    
    const chartProps = _.range(numberCharts).map(chartIdx => {
        const {xaxisName, yaxisName } = keyNames[chartIdx]
        return {
            data,
            chartIdx,
            valid : validIndices[chartIdx],
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
            setHoverDataByDataIndex,
            findClosestPoint,
            hoverProps : {hoverData : hoverData.data,rerenderHover : hoverData.rerender, hoverPosition : hoverData.rect, hoverChart : hoverData.hoverChart, hoverIndices : hoverData.idcs},
            filterProps: { rerenderBackground: backgroundScatter.rerender, filterIndices: backgroundScatter.filterIndices, filterRange: backgroundScatter.filterRange, searchIndices: backgroundScatter.searchIndices, resetSearchIdcs, searchString : backgroundScatter.searchString },
            labelProps : {labelData : labelData.data, labelIndices : labelData.idcs, labelRerender : labelData.rerender, labelChart : labelData.labelChart}
        }
    })  
    
    
    return(
        <>{children(chartProps)}</>
    )

}

export default InteractiveChart