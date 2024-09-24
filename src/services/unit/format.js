import _ from "lodash"


/**
 * @description Formats a string that represents the units of an attribute value.
 * @param {} units 
 * @returns 
 */
export function getUnitString(units) {
    const unitString = _.isEmpty(units) ? "" :
        _.join(_.values(units).map(unit => `${unit.value} ${_.has(unit, "prefix") ?
            unit.prefix !== "NA" ? unit.prefix : "" : ""}${unit.unit.tag === "time" ?
                unit.time_unit : unit.unit.unit}`), ", ")
    return unitString
}