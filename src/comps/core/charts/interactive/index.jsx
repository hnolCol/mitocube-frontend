import { useEffect, useMemo, useState } from "react"
import { addItemToArrayIfNotPresent } from "../../../../services/arrays/transforms"
import _ from "lodash"
import KDBush from 'kdbush';
import { partitionData } from "../../../../services/arrays/partion";

function getMinMaxForMultipleKeyNames({data = [], keyNames = ["x","y"]}){
    // return an object with the keyName and object as value with min max key words.
    console.log(keyNames)
    console.log(data)
    const minMaxByKeyName = Object.fromEntries(keyNames.map(keyName => {return [keyName, {min : Infinity, max : -Infinity}]}))
    return data.reduce((p,c) => {
        
        _.forEach(keyNames, keyName => {
            
            const v = c[keyName]
     
            if (v >  p[keyName].max ) {
                p[keyName].max = v
            }
            if (v < p[keyName].min){
                p[keyName].min = v
            }
            
        })   
        return p 
    },minMaxByKeyName)
}




function InteractiveChart({data = [{"x" : -2, "y" : 1},{"x" : 2, "y" : 3}, {"x" : 5, "y" : 1}], numberCharts = 1, keyNames = [{xName : "x", yName : "y"}], children}){
    
    
    const [hoverData, setHoverData] = useState()
    const [selectedItems, setSelectedItems]  = useState()
    
    
    const keyNamesFlatten = _.flatten(keyNames.map(keys => Object.values(keys)))
    const limits  = getMinMaxForMultipleKeyNames({data,keyNames : keyNamesFlatten})
    const searchTrees = useMemo(() => {
        //create search trees for fast point finding in the array
        return Object.fromEntries(_.range(numberCharts).map(chartIdx => {
            const nPoints = data.length 
            const index = new KDBush(nPoints);
            const {xName, yName} = keyNames[chartIdx]
            _.forEach(data, d => index.add(d[xName],d[yName]))
            index.finish()
            index.range()
            return [chartIdx, {tree : index, xName, yName, limits}]
        }))
    },[_.join(keyNamesFlatten),numberCharts])


    const findIndexInRectangle = (chartIdx,minX,minY,maxX,maxY) => {
        // finds the index in a rectangle
        return searchTrees[chartIdx].tree.range(minX,minY,maxX,maxY)
    }

    const findDataInRectangle = (chartIdx,minX,minY,maxX,maxY) => {
        const idcs = searchTrees[chartIdx].tree.range(minX,minY,maxX,maxY)
        return _.map(idcs, idx => data[idx])
    }

    const setHoverDataInRectangle = (chartIdx,minX,minY,maxX,maxY) => {
        //finds data in an rectangle of coordinates and changes the state of hoverData
        const hoverData = findDataInRectangle(chartIdx,minX,minY,maxX,maxY)
        setHoverData(hoverData)
    }

    const handleItemSelection = (itemIndex = undefined) => {

        //handle item selection by item Index
        let selectedItems = addItemToArrayIfNotPresent({array : data, item : data[itemIndex]})
    }

    const findClosestPoint = (xName = "", yName = "", point = {x : undefined, y : undefined}, tolerance = 0.1) => {
        //find closest point 
    }

    const chartProps = _.range(numberCharts).map((idx,ii) => {
        return{
            index : idx,
            limits,
            handleItemSelection,
            findIndexInRectangle,
            findDataInRectangle,
            setHoverDataInRectangle,
            hoverData
        }
    })  
    

    return(
        <div>
        <>{children(chartProps)}</>
        </div>
    )

}

export default InteractiveChart