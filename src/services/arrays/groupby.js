import _ from "lodash"
import { getQuantiles } from "../statistics/quantiles";
import { getStandardDeviationAndAverage } from "../statistics/average";
import { getDomainWithBoundaries } from "./boundaries";


// export function getUniqueValuesInArrayByKeyNames(data = [], keyNames = []){

//     return data.reduce((p, c) => {
//         _.forEach(keyNames, k)
//     }, {})
// }


export function getUniqueValuesFromArrayOfObjectsByKey(data = []) {
    
    return data.reduce((p, c) => {
        let keyNames = Object.keys(c)

        _.forEach(keyNames, keyName => !_.has(p,keyName) ? p[keyName] = [] : null)

        _.forEach(keyNames,keyName => p[keyName] = _.uniq(_.concat(c[keyName],p[keyName])))
       
        return p 
    }, {})
}

export function groupListByProperty(data, propertyName = "id") {
    if (!_.isArray(data) || data.length === 0) return {}
    return data.reduce((groups, item) => ({
        ...groups,
        [item[propertyName]]: [...(groups[item[propertyName]] || []), item]
      }), {});
}

export function arrayOfObjectsToObjectByProperty(data = [], propertyName) {
    return Object.fromEntries(data.map(item => [item[propertyName],item]))
}


export function getUniqueSetsOfAllValuesinArrayOfObjects(data = []) {

    return data.reduce((acc, item) => {
        Object.keys(item).forEach(keyName => acc[keyName] ??= { values: new Set(), counts: {} })
        Object.keys(item).forEach(keyName => {
            item[keyName].forEach(attrValueTag => {
                acc[keyName].counts[attrValueTag] ??= 0
            if (!acc[keyName].values.has(attrValueTag)) {
                acc[keyName].values.add(attrValueTag)
                } 
                acc[keyName].counts[attrValueTag] += 1
            })
        })
        return acc 
        }
    , {})

}


export function getUniqueValuesAndCountsFromList(data) {
    return _.flatten(data).reduce((acc, item) => {
        
        acc.counts[item] ??= 0 
        if (!acc.values.has(item)) {
            acc.values.add(item)
        }
        acc.counts[item] += 1
        return acc
    }, { values: new Set(), counts: {} })
}

export function getCountsByGroups(
    data = [{ Genotype: "KO", T: "0.5", y: 4.2 }, { Genotype: "KO", T: "0.5", y: 4.2 }, { Genotype: "KO", T: "0.5", y: 4.4 }, { Genotype: "WT", T: "0.5", y: 4.2 }],
    keyNames = ["Genotype", "T"],
    yaxisName = undefined) {
    
    const groupedByKeyNames = _.groupBy(data, d => _.join(keyNames.map(keyName => d[keyName]), '//|//'))
    const groups = Object.keys(groupedByKeyNames)
    const groupedAggratedData = groups.map(group => {
        var groupData = groupedByKeyNames[group]
        //var yaxisvalues = groupData.map(d => d[yaxisName])
        console.log(groupData.length,yaxisName)
        return {
            ...Object.fromEntries(keyNames.map(keyName => [keyName, groupData[0][keyName]])),
            N : yaxisName !== undefined ? groupData.filter(d => _.isNumber(d[yaxisName])).length : groupData.length}
    })
    const maxNumber = _.maxBy(groupedAggratedData,"N")["N"]
    const minMaxYDomain = {min : 0, max : maxNumber+maxNumber*0.05}
    return ({ groupedAggratedData, minMaxYDomain})
}


export function getAverageAndErrorByGroups(
    data = [{ Genotype: "KO", T: "0.5", y: 4.2 }, { Genotype: "KO", T: "0.5", y: 4.2 }, { Genotype: "KO", T: "0.5", y: 4.4 }, { Genotype: "WT", T: "0.5", y: 4.2 }],
    keyNames = ["Genotype", "T"],
    yaxisName = "y") {
    
    const minMaxYDomain = getDomainWithBoundaries({ data, keyName: yaxisName, frac : 0.1})
    const groupedByKeyNames = _.groupBy(data, d => _.join(keyNames.map(keyName => d[keyName]), '//|//'))
    const groups = Object.keys(groupedByKeyNames)
    const groupedAggratedData = groups.map(group => {
        var groupData = groupedByKeyNames[group]
        var yaxisvalues = groupData.map(d => d[yaxisName])
        return {
            ...getStandardDeviationAndAverage(yaxisvalues,yaxisName),
            ...Object.fromEntries(keyNames.map(keyName => [keyName, groupData[0][keyName]])),
            N : groupData.filter(d => _.isNumber(d[yaxisName])).length}
    })
    return ({ groupedAggratedData, minMaxYDomain})
}


export function getQuantilesByGroups(
    data = [{ Genotype: "KO", T: "0.5", y: 4.2 }, { Genotype: "KO", T: "0.5", y: 4.2 }, { Genotype: "KO", T: "0.5", y: 4.4 }, { Genotype: "WT", T: "0.5", y: 4.2 }],
    keyNames = ["Genotype", "T"],
    qs = [0.25,0.5,0.75],
    valueName = "y",
    yaxisName = "y") {
    // groups data in an aray of object based on keyNames (keys present in the objects in the data array).
    // then the quantile is calculated using the yaxisName (numeric key name). 
    const groupedByKeyNames = _.groupBy(data, d => _.join(keyNames.map(keyName => d[keyName]), '//|//'))
    const groups = Object.keys(groupedByKeyNames)
    const minMaxYDomain = getDomainWithBoundaries({ data, keyName: yaxisName, frac : 0.1})
    const groupedAggratedData = groups.map(group => {
        var groupData = groupedByKeyNames[group]
        var yaxisvalues = groupData.map(d => d[yaxisName])
        return {
            ...getQuantiles(yaxisvalues,qs,1.8,false,valueName),
            ...Object.fromEntries(keyNames.map(keyName => [keyName,groupData[0][keyName]]))}
    })

    return ({ groupedAggratedData, minMaxYDomain})
    }



export const NormalizationModes = ["raw","log2 fold change", "fold change"]
export const NormalizationPrefixes = {raw:"","log2 fold change":"log2-FC ", "fold change" : "FC"}
export function normalizeDataToGroup(data = [
        { Genotype: "KO", T: "0.5", y: 4.2 }, 
        { Genotype: "KO", T: "0.5", y: 4.2 }, 
        { Genotype: "KO", T: "0.5", y: 4.4 }, 
        { Genotype: "WT", T: "0.5", y: 4.2 }, 
        { Genotype: "WT", T: "0.5", y: 4.5 }, 
        { Genotype: "WT", T: "0.5", y: 8.5 },
        { Genotype: "WT", T: "1h", y: 8.5 }],
    //keyNames = ["Genotype", "T"],
    normalizeTo = {T : "0.5"},
    yaxisName = "y",
    useMedian = false,
    mode = "log2 fold change",
    ) {
    // normalizes and array of objects to a specific group. If normalizeTo is specified with less object keys ans named in keyNames, then the normalization will
    // be performed to the given object props within the group (as identified by the keyNames.)
    
    const handleTransform = (value, normalizationValue) => {
    
        if (mode === "log2 fold change") return value - normalizationValue
        if (mode === "fold change") return Math.pow(2,(value-normalizationValue))
        return value
    }
    const keyNames = Object.keys(normalizeTo)
    const { groupedAggratedData: groupedAverages, minMaxYDomain } = useMedian?getQuantilesByGroups(data,keyNames,[0.5],yaxisName):getAverageAndErrorByGroups(data,keyNames,yaxisName)
    const subsetForNormalization = _.filter(groupedAverages, normalizeTo)
    const normKeys = Object.keys(normalizeTo)

    if (subsetForNormalization.length === 1) {
        let normalizationValue = subsetForNormalization[0][yaxisName]
        
        return data.map(d => {return {...d,[yaxisName] : handleTransform(d[yaxisName],normalizationValue)}})
    }
    else {
        //when there are more keyNames than in normalize the data will be normlaized taking the other keyName(s) into account
        //e.g. filtering on T : 0.5h would lead to a normlization within the Genotype group separately. 
        return _.flatten(subsetForNormalization.map(subsetNorm => {
            
            var filtObject = Object.fromEntries(keyNames.map(normKey => [normKey,subsetNorm[normKey]]))
            var normalizationValue = subsetNorm[yaxisName]
            normKeys.forEach( k => delete filtObject[k]) // delete the keys to filter only by the other keynames (not the ones used for normalization)
            return _.filter(data, filtObject).map(d => {return {...d,[yaxisName] : handleTransform(d[yaxisName],normalizationValue)}})
        }))

    }

}