import _ from "lodash"


export function checkChartData(props, propName, componentName, propNameChecks = ["xaxisName", "yaxisName"], relaxNameCheck = false) {
    const data = props[propName] //propName gives the data to check 
    //check if names of propNameChecks are given in data 
    if (!_.isArray(data) || data.length === 0) return new Error(
        'Invalid prop `' + propName + '` supplied to' +
        ' `' + componentName + '`. Must be an array of at least length 1.'
    );
    if (!_.isObject(data[0])) return new Error(
        'Invalid prop `' + propName + '` supplied to' +
        ' `' + componentName + '`. The elements of the array must be an object.'
    );
    
    let propNameValues = propNameChecks.map(propToCheck => props[propToCheck])
    if (relaxNameCheck) {
        //this would only be used if there are many optional propNames that need to be checked.
        propNameValues = _.filter(propNameValues,_.isString)
    }

    if (!relaxNameCheck && !_.every(propNameValues, _.isString)) return new Error(
        `The provided prop names to check their presence in data are not all strings. This does not allow to check the data. Revisit the props ${propNameChecks} `
    );

    if (!_.every(propNameValues, paramValue => _.has(data[0],paramValue))) return new Error(
        'Invalid prop `' + propName + '` supplied to' +
        ' `' + componentName + `The prop name checks ${propNameChecks} and values ${propNameValues} could not be found in the first item of the data.`
    );

}

// Custom prop type checker for Set
export function checkPropIsSet (props, propName, componentName) {
    if (!(props[propName] instanceof Set)) {
      return new Error(
        `Invalid prop \`${propName}\` supplied to \`${componentName}\`. Expected a Set.`
      );
    }
  };
