import _ from "lodash"
import { getQuantiles } from "../statistics/quantiles";
import { getStandardDeviationAndAverage } from "../statistics/average";

export function getAverageAndErrorByGroups(
    data = [{ Genotype: "KO", T: "0.5", y: 4.2 }, { Genotype: "KO", T: "0.5", y: 4.2 }, { Genotype: "KO", T: "0.5", y: 4.4 }, { Genotype: "WT", T: "0.5", y: 4.2 }],
    keyNames = ["Genotype", "T"],
    yaxisName = "y") {
    
    const groupedByKeyNames = _.groupBy(data, d => _.join(keyNames.map(keyName => d[keyName]), '|'))
    const groups = Object.keys(groupedByKeyNames)

    return (groups.map(group => {
        var groupData = groupedByKeyNames[group]
        var yaxisvalues = groupData.map(d => d[yaxisName])
        return {
            ...getStandardDeviationAndAverage(yaxisvalues),
            ...Object.fromEntries(keyNames.map(keyName => [keyName,groupData[0][keyName]]))}
    }))
}
    

export function getQuantilesByGroups(
    data = [{ Genotype: "KO", T: "0.5", y: 4.2 }, { Genotype: "KO", T: "0.5", y: 4.2 }, { Genotype: "KO", T: "0.5", y: 4.4 }, { Genotype: "WT", T: "0.5", y: 4.2 }],
    keyNames = ["Genotype", "T"],
    yaxisName = "y") {
    
    const groupedByKeyNames = _.groupBy(data, d => _.join(keyNames.map(keyName => d[keyName]), '|'))
    const groups = Object.keys(groupedByKeyNames)

    return (groups.map(group => {
        var groupData = groupedByKeyNames[group]
        var yaxisvalues = groupData.map(d => d[yaxisName])
        return {
            ...getQuantiles(yaxisvalues),
            ...Object.fromEntries(keyNames.map(keyName => [keyName,groupData[0][keyName]]))}
    }))
    }