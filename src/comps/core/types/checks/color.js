import _ from "lodash"
import { isHex } from "../../../../services/checks/color";

/**
 * @description Checks if a given string is a hex color.
 * @param {Object} props 
 * @param {String} propName 
 * @param {String} componentName 
 * @returns 
 */
export function isPropHexColorString(props, propName, componentName) {
    const colorProp = props[propName]
    if (!_.isString(colorProp)) {
        return new Error(
            'Invalid prop `' + propName + '` supplied to' +
            ' `' + componentName + '`. Must be a string value and match the hex code.'
          );
    }
    if (!isHex(props[propName])) {
        return new Error(
            'Invalid prop `' + propName + '` supplied to' +
            ' `' + componentName + '`. Must be a valid hex color code.'
          );
    }
}