import _ from "lodash"
import { getQuantiles } from "../statistics/quantiles";
import { getStandardDeviationAndAverage } from "../statistics/average";
import { getDomainWithBoundaries } from "./boundaries";

export function getAverageAndErrorByGroups(
    data = [{ Genotype: "KO", T: "0.5", y: 4.2 }, { Genotype: "KO", T: "0.5", y: 4.2 }, { Genotype: "KO", T: "0.5", y: 4.4 }, { Genotype: "WT", T: "0.5", y: 4.2 }],
    keyNames = ["Genotype", "T"],
    yaxisName = "y") {
    const minMaxYDomain = getDomainWithBoundaries({ data, keyName: yaxisName })
    const groupedByKeyNames = _.groupBy(data, d => _.join(keyNames.map(keyName => d[keyName]), '|'))
    const groups = Object.keys(groupedByKeyNames)
    
    const groupedAggratedData = groups.map(group => {
        var groupData = groupedByKeyNames[group]
        var yaxisvalues = groupData.map(d => d[yaxisName])
        return {
            ...getStandardDeviationAndAverage(yaxisvalues),
            ...Object.fromEntries(keyNames.map(keyName => [keyName, groupData[0][keyName]])),
            N : groupData.length}
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
    const groupedByKeyNames = _.groupBy(data, d => _.join(keyNames.map(keyName => d[keyName]), '|'))
    const groups = Object.keys(groupedByKeyNames)
    
    return (groups.map(group => {
        var groupData = groupedByKeyNames[group]
        var yaxisvalues = groupData.map(d => d[yaxisName])
        return {
            ...getQuantiles(yaxisvalues,qs,1.8,false,valueName),
            ...Object.fromEntries(keyNames.map(keyName => [keyName,groupData[0][keyName]]))}
    }))
    }


export function normalizeDataToGroup(data = [
        { Genotype: "KO", T: "0.5", y: 4.2 }, 
        { Genotype: "KO", T: "0.5", y: 4.2 }, 
        { Genotype: "KO", T: "0.5", y: 4.4 }, 
        { Genotype: "WT", T: "0.5", y: 4.2 }, 
        { Genotype: "WT", T: "0.5", y: 4.5 }, 
        { Genotype: "WT", T: "0.5", y: 8.5 },
        { Genotype: "WT", T: "1h", y: 8.5 }],
    keyNames = ["Genotype", "T"],
    normalizeTo = {T : "0.5"},
    yaxisName = "y",
    useMedian = false,
    mode = "subtract") {
    // normalizes and array of objects to a specific group. If normalizeTo is specified with less object keys ans named in keyNames, then the normalization will
    // be performed to the given object props within the group (as identified by the keyNames.)
    
    const { groupedAggratedData: groupedAverages, minMaxYDomain } = useMedian?getQuantilesByGroups(data,keyNames,[0.5],yaxisName):getAverageAndErrorByGroups(data,keyNames,yaxisName)
    const subsetForNormalization = _.filter(groupedAverages, normalizeTo)
    const normKeys = Object.keys(normalizeTo)
    const sub = mode === "subtract"
    if (subsetForNormalization.length === 1) {
        let normalizationValue = subsetForNormalization[0][yaxisName]
        return data.map(d => {return {...d,[yaxisName] : sub?d[yaxisName] - normalizationValue:d[yaxisName] / normalizationValue}})
    }
    else {
        //when there are more keyNames than in normalize the data will be normlaized taking the other keyName(s) into account
        //e.g. filtering on T : 0.5h would lead to a normlization within the Genotype group separately. 
        return _.flatten(subsetForNormalization.map(subsetNorm => {
            
            var filtObject = Object.fromEntries(keyNames.map(normKey => [normKey,subsetNorm[normKey]]))
            var normValue = subsetNorm[yaxisName]
            normKeys.forEach( k => delete filtObject[k]) // delete the keys to filter only by the other keynames (not the ones used for normalization)
            return _.filter(data, filtObject).map(d => {return {...d,[yaxisName] : sub?d[yaxisName] - normValue : d[yaxisName] / normValue}})
        }))

    }

}