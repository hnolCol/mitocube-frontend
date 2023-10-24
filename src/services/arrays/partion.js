

export function partitionData({limits = {},xName = "", yName=""}){
    console.log(xName)
    console.log(limits)
    console.log(yName)
    const xRange = limits[xName].max - limits[xName].min
    const yRange = limits[yName].max - limits[yName].min
    return xRange
}   