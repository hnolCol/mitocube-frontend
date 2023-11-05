import { useMemo, useState } from "react"
import { addItemToArrayIfNotPresent } from "../../../../services/arrays/transforms"
import _ from "lodash"
import KDBush from 'kdbush';
import { getMinMaxForMultipleKeyNames } from "../../../../services/arrays/boundaries";



let dataTest = _.range(10000).map(idx => {return {x : Math.random(), y : Math.random()}})


function InteractiveChart({data = dataTest, numberCharts = 2, keyNames = [{xaxisName : "x", yaxisName  : "y"},{xaxisName : "y", yaxisName  : "x"},], children}){
    // remove number charts
    const [hoverData, setHoverData] = useState({data : [], rerender : [Math.random()]})
    const [selectedItems, setSelectedItems]  = useState()
    const [rerenderBackground, setRerender] = useState([Math.random()])
    
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
        return _.map(idcs, idx => data[idx])
    }

    const setHoverDataInRectangle = (chartIdx,minX,minY,maxX,maxY) => {
        //finds data in an rectangle of coordinates and changes the state of hoverData
        const hoverData = findDataInRectangle(chartIdx,minX,minY,maxX,maxY)
        setHoverData({data : hoverData, rerender : [Math.random()]})
    }

    const handleItemSelection = (itemIndex = undefined) => {

        //handle item selection by item Index
        let selectedItems = addItemToArrayIfNotPresent({array : data, item : data[itemIndex]})
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
            hoverData : hoverData.data,
            rerenderHover : hoverData.rerender,
            rerenderBackground
        }
    })  
    

    return(
        <div>
        <>{children(chartProps)}</>
        </div>
    )

}

export default InteractiveChart