import { UseQueryResult } from "react-query";
/**
 * @typedef {UseQueryResult} UseQueryResult
 */

/**
 * @typedef Attribute
 * @type {Object}
 * @property {number} id - The id of the attribute
 * @property {number} parent_id - The id of the attribute that is the parent of the attribute.
 * @property {string} parent_tag
 * @property {Number}  priority - Number defining the priority, defaults to ```500```
 * @property {string} tag - The tag of the attribute value 
 * @property {string} text - The name of the attribute value
 * @property {number} min_state - This attribute is allowed to be defined at a given state. See states types
 * @property {Boolen} mandatory_for_submission - Attribute is required for a submission 
 * @property {Boolean} mandatory_for_active - Attribute is required for a dataset to be set active (e.g. published)
 * @property {Boolean} allow_for_user -If True the attribute can be used for a user definition. 
 * @property {Boolean} allow_for_filter -If True the attribute can be used for filtering the submissions. 
 * @property {Boolean} has_features_value -If True the attribute Values for this attriubte can be a feature (e.g. protein)
 * @property {Boolean} allow_for_genotype -If True the attribute can be used to define the genotype.
 * @property {Boolean} has_numeric_input -If True the attribute can be defined by a numeric input. (e.g. user defined)
 * @property {Boolean} allow_for_dataset -If True the attribute can be define a dataset.
*/

/**
 * @typedef AttributeValue 
 * @type {Object}
 * @property {string} tag - The tag of the attribute value 
 * @property {string} text - The name of the attribute value
 * @property {string} description - The attribute details which are usually shown in a tooltip.
 * @property {Number} attribute_id - The attribute id the value belongs to.  
*/

/**
 * @typedef SampleAttributes
 * @type {Object.<string, SamplesAttribute>} The key value represents the *attribute tag* and the values contains multiple ```SampleAttribute```that hold information about each sample and the *attribute value*.
 * @description 
 */


/**
 * @typedef SamplesAttribute
 * @type {Object}
 * @property {String} name - The name of the sample attributes 
 * @property {Object.<string, Number[]} values - The values of the sample attributes (e.g). Key is an attribute value tag and the values are the sample indices. 
 * @description The samples attribute object. Do not confuse with ```SampleAttributes``` plural which holds multiple ```SampleAttribute``` as values. 
 */




/**
 * @typedef MappedAttributeValueTag
 * @type {Object}
 * @property {AttributeValue[]} attrValues - The mapped attribute values.
 * @property {String} asString - The name of the mapped attribute values. By default joined via a '+' sign.
 * @property {Boolean} isAttrValue - If the input was mapped to an attrValue.
*/

/**
 * @typedef AttributesAPIResponse
 * @type {Object}
 * @property {Attribute[]} attributes 
 * @property {AttributeValue[]} attribute_values
 */

/**
 * @typedef AttributesByTagAPIResponse
 * @type {Object}
 * @property {Object.<string, Attribute[]>} attributes 
 * @property {Object.<string, AttributeValue[]>} attribute_values
 */





export default {}