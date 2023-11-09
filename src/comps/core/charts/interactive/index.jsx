import { useMemo, useState } from "react"
import { addItemToArrayIfNotPresent } from "../../../../services/arrays/transforms"
import _ from "lodash"
import KDBush from 'kdbush';
import { getMinMaxForMultipleKeyNames } from "../../../../services/arrays/boundaries";



let dataTest = _.range(50000).map(idx => {return {x : Math.random() * 1000, y : Math.random() * 5000}})


function InteractiveChart({data = dataTest, keyNames = [{xaxisName : "x", yaxisName  : "y"}], children}){ //,{xaxisName : "y", yaxisName  : "x"},

    const [hoverData, setHoverData] = useState({data : [], idcs : [], rerender : [Math.random()], rect : []})
    const [selectedItems, setSelectedItems]  = useState()
    const [backgroundScatter, setRerender] = useState({rerender : [Math.random()], filterIndices : new Set(), filterRange : [0,100]})
    const numberCharts = keyNames.length
    const keyNamesFlatten = _.flatten(keyNames.map(keys => Object.values(keys)))
    const limits  = getMinMaxForMultipleKeyNames({data,keyNames : keyNamesFlatten})
    
    const validIndices = useMemo(() => {
        const isNumber = _.map(data, (d) => Object.fromEntries(_.map(keyNamesFlatten, keyName => [keyName,_.isNumber(d[keyName])])))
        console.log(isNumber)
        return Object.fromEntries(_.map(keyNames, ({xaxisName, yaxisName },chartIdx) => {
            return([chartIdx, _.map(isNumber, d => d[xaxisName] && d[yaxisName ])])
        }))
    },[_.join(keyNamesFlatten)])

    const searchTrees = useMemo(() => {
        //create search trees for fast point finding in the array
        return Object.fromEntries(_.range(numberCharts).map(chartIdx => {
            const nPoints = data.length 
            const index = new KDBush(nPoints);
            const {xaxisName, yaxisName } = keyNames[chartIdx]
            _.forEach(data, d => index.add(d[xaxisName],d[yaxisName ]))
            index.finish()
            return [chartIdx, {tree : index, xaxisName, yaxisName , limits}]
        }))
    },[_.join(keyNamesFlatten),numberCharts])


    const findIndexInRectangle = (chartIdx,minX,minY,maxX,maxY) => {
        // finds the index in a rectangle
        return searchTrees[chartIdx].tree.range(minX,minY,maxX,maxY)
    }

    const findDataInRectangle = (chartIdx,minX,minY,maxX,maxY) => {
        // returns the data that are in a rectangle. 
        const idcs = searchTrees[chartIdx].tree.range(minX,minY,maxX,maxY)
        return {arr : _.map(idcs, idx => data[idx]), idcs}
    }

    const setHoverDataInRectangle = (chartIdx,minX,minY,maxX,maxY, screenPosition) => {
        //finds data in an rectangle of coordinates and changes the state of hoverData
        const {arr, idcs} = findDataInRectangle(chartIdx,minX,minY,maxX,maxY)
        
        if (idcs.length == hoverData.idcs.length && _.every(idcs, idx => hoverData.idcs.includes(idx))) return

        setHoverData({data : arr, rerender : [Math.random()], rect : screenPosition, idcs})
    }

    const handleItemSelection = (itemIndex = undefined) => {

        //handle item selection by item Index
        let selectedItems = addItemToArrayIfNotPresent({array : data, item : data[itemIndex]})
    }

    const handleNumericFilter = (chartIdx, keyName, min = -Infinity, max = Infinity) => {
        console.log(min,max)
        let idcs = data.reduce((s, d, idx) => (d[keyName] > min && d[keyName] < max ? s.add(idx) : null, s), new Set());
        console.log(idcs)
        //let idcs = data.reduce((group,d,idx) => d[keyName] > min && d[keyName] < max),[])
        
        setRerender({rerender : [Math.random()], filterIndices : idcs, filterRange : [min,max]})


    }


    const findClosestPoint = (xaxisName = "", yName = "", point = {x : undefined, y : undefined}, tolerance = 0.1) => {
        //find closest point 
    }

    const chartProps = _.range(numberCharts).map(chartIdx => {
        const {xaxisName, yaxisName } = keyNames[chartIdx]
        return{
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
            hoverData : hoverData.data,
            rerenderHover : hoverData.rerender,
            hoverPosition : hoverData.rect,
            rerenderBackground : backgroundScatter.rerender,
            filterIndices : backgroundScatter.filterIndices,
            filterRange : backgroundScatter.filterRange
        }
    })  
    

    return(
        <div>
        <>{children(chartProps)}</>
        </div>
    )

}

export default InteractiveChart