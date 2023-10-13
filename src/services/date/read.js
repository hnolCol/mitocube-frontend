
import moment from "moment"

export function readDateFromString({ dateString, dateFormat = "YYYYMMDD" }) {
    //reads date from string and returns a noment object
    return moment(dateString, dateFormat)
}


export function readDateFromStringAndReturnDateAndDistToNow({ dateString, dateFormat = "YYYYMMDD" }) {
    
    const m = readDateFromString({ dateString, dateFormat })
    return `${m.format("ll")} (${m.fromNow()})`
}



