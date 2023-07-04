import _ from "lodash"

function getAverage(data, key = undefined) {

    if (key !== undefined) {
        return (data.map(d => d[key]).reduce((acc, val) => acc + val, 0) / data.length)
    }
    
    return (data.reduce((acc, val) => acc + val, 0) / data.length)
}
    

export function getStandardDeviationAndAverage(arr, meanName = "y", errorName = "e", usePopulation = false) {
  const filteredArr = arr.filter(x => _.isNumber(x))
  if (filteredArr.length === 0) return ({[errorName] : NaN, [meanName] : NaN})
  const mean = getAverage(filteredArr)
  
  return ({
        [errorName]: Math.sqrt(
          filteredArr .reduce((acc, val) => acc.concat((val - mean) ** 2), []).reduce((acc, val) => acc + val, 0) /
            (filteredArr.length - (usePopulation ? 0 : 1))
        ), [ meanName]: mean
    })
  };


export function computeMovingAverage(data, period, dataIsSorted = false){
    const movingAverages = [];
      
    const sortedData =  dataIsSorted?data:sortDates(data);
  
    // if the period is greater than the length of the dataset
    // then return the average of the whole dataset
    // returns right sided dates (e.g.)
    if ( sortedData.pop() === undefined) {
      return [{x : undefined, y: undefined}]
    }
    if (period > sortedData.lengt) {
      return [{y : getAverage(data,"y"), x : sortedData.pop().x}];
    }
    for (let x = 0; x + period - 1 < sortedData.length; x += 1) {
      let d = sortedData.slice(x, x + period)
      movingAverages.push({
              y : getAverage(d,"y"),
              x : new Date().setTime(_.sum(d.map(v => v.x.getTime()))/d.length)
          })
      }
    return movingAverages;
  }