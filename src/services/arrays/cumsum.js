
/**
 * @description Calculate the cumulative sum of an array.
 * @param {Number[]} arr - The array of numbers to calculate the cumulative sum.
 * @return  {Number[]} - Returns the cumulative sum. Array has the same length.
 */
export function getCumSumFromArray(arr) {
    var sum = 0
    return arr.map(v => sum += v)
}