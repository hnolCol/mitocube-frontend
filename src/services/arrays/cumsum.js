export function getCumSumFromArray(arr) {
    var sum = 0
    return arr.map(v => sum += v)
}