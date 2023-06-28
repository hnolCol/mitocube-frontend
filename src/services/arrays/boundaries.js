import _ from "lodash"



export function getDomainWithBoundaries({ data, keyName, frac = 0.08}) {
    const domain = getBoundariesFromArrayOfObjects({ data , keyName })
    const domainWithMargin = addMarginToBoundaries({ domain: domain, frac })
    return domainWithMargin
            
}

export function getBoundariesFromArrayOfObjects({ data = [{ x: 1 }, { x: 2 }], keyName = "x"}) {
    

    if (_.isArray(keyName)) {
        return (
            {
                min: _.min(data.map(d => _.min(_.map(keyName, key => d[key])))),
                max: _.max(data.map(d => _.max(_.map(keyName, key => d[key]))))
            } 
    )   
    }

    return ( 
        {
            min: _.minBy(data, keyName)[keyName],
            max: _.maxBy(data, keyName)[keyName]
        }
    )
}

export function addMarginToBoundaries({ domain = { min: 1, max: 2 }, frac = 0.08 }) {
    //adds some margin to a domain which can be used for plotting.
    var m = Math.sqrt(Math.pow(domain.max - domain.min, 2)) * frac
    if (m === 0) m+=1 // add 1 if boundary is zero. 
    return (
        {
            min: domain.min - m,
            max : domain.max + m 
        }
    )
}