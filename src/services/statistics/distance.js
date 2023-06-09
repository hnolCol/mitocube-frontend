const euclDistance = function({p1,p2,accX,accY,minDistX,minDistY}){
    if (Math.abs(p1[accX] - p2[accX]) > minDistX) return Infinity
    if (Math.abs(p1[accY] - p2[accY]) > minDistY) return Infinity
    return Math.sqrt(Math.pow(p1[accX] - p2[accX], 2) + Math.pow(p1[accY] - p2[accY], 2))
}
