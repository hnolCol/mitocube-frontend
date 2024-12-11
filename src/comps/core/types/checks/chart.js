import _ from "lodash"


export function checkInteractiveChartKeyNames(props, propName, componentName) {
    const keyNames = props[propName] //propName gives the data to check 
    //check if names of propNameChecks are given in data
    if (!_.isArray(keyNames)) return new Error ('Invalid prop `' + propName + '` supplied to' +
        ' `' + componentName + '`. Must be an array.'
    );

    if (!_.every(_.values(keyNames), keyNameProps => _.isObject(keyNameProps) && _.has(keyNameProps, "xaxisName") && _.has(keyNameProps, "yaxisName"))){
        return new Error('Invalid prop `' + propName + '` supplied to' +
        ' `' + componentName + '`. All items in the array must be objects and must have "xaxisName" and "yaxisName" as keys. '
    );
    }
}


/**
 * @description Check if the margins are complete and contain the keys 'left', 'right', 'bottom' and 'top'. 
 * @param {Object} props 
 * @param {String} propName 
 * @param {String} componentName 
 */
export function checkFullMargin(props, propName, componentName) {
    const margins = props[propName]


    if (!_.every(["left", "right", "bottom", "top"], marginName => _.has(margins, marginName) && _.isNumber(margins[marginName]))){
        return new Error('Invalid prop `' + propName + '` supplied to' +
        ' `' + componentName + '`. The margin object must contain the keys "left", "right", "top", and "bottom". All values must be numbers.'
    );}
}

