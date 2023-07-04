import _ from "lodash"


export function getMedian(array) {
    // returns the median of the array.
    return getQuantiles(array,[0.5],1.5,false).values
}

export function getQuantiles (array,qs=[0,0.25,0.5,0.75,1.0],NIQR = 1.8, removeOutlier = true, valueName = "values", labels = ["min","q25","median","q75","max"]) {
    // remove falsly numbers (includes 0!)
    let sortedFilteredArray = _.sortBy(_.filter(array.filter(x => _.isNumber(x)),Boolean))
    let N = sortedFilteredArray.length
    if (removeOutlier){
            //remove outlier before calculating quantiles
            let idxsForIQR = [0.25,0.5,0.75].map(q => (N-1) * q)
            const generousIQR = idxsForIQR.map(idx => {
                let b = Math.floor(idx)
                let r = idx - b 
                if (sortedFilteredArray[b+1]!==undefined) {
                    return sortedFilteredArray[b] + r * (sortedFilteredArray[b + 1] - sortedFilteredArray[b]);
                }
                else {
                    return sortedFilteredArray[b]
                }
            })
            // get min and max values
            const IQR = generousIQR[2] - generousIQR[0]
            const maxValue = generousIQR[1] + NIQR * IQR
            const minValue = generousIQR[1] - NIQR * IQR
            
            //overwrite array and calculate distribution again
            sortedFilteredArray = sortedFilteredArray.filter(x => x <= maxValue && x >= minValue)
        }
    let filteredN = sortedFilteredArray.length
    let idxs = qs.map(q => (filteredN-1) * q)
    const numberOutliers = N - filteredN 
    // return filtered quantiles 
    var caluclatedQuantiles =  idxs.map(idx => {
        let b = Math.floor(idx)
        let r = idx - b 
        if (sortedFilteredArray[b+1]!==undefined) {
            return sortedFilteredArray[b] + r * (sortedFilteredArray[b + 1] - sortedFilteredArray[b]);
        }
        else {
            return sortedFilteredArray[b]
        }
    })    
    if (qs.length === 1) {
        caluclatedQuantiles = caluclatedQuantiles[0]
    }
    return {[valueName]:caluclatedQuantiles, n_removed:numberOutliers, N: sortedFilteredArray.length, quantiles : qs, labels}
}   