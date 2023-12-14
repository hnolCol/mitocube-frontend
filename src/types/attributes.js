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



// id : int
//     tag : str 
//     text : str 
//     priority : int = 500 #attributes will be sorted by priority in descending order
//     parent_id : Optional[int] = None #parent attribute shoudl be Attribute type
//     parent_tag : Optional[str] = None #parent tag 
//     group_tag : str # attrbiute grouping
//     mandatory_for_submission : bool = False #must be defined by an attribute value for a submission
//     mandatory_for_active : bool = False #must be defined by an attribute value for an active (published) state 
//     has_features_value : bool = False #if true, features (e.g. proteins) can be selected for this attribute 
//     has_numeric_input : bool = False #if true, attribute can be defined by the user (numeric input)
//     min_state : int = 0 #The minimal state the submission must have in order to define the attribute. 
//     allow_as_qc : bool = True #attributes that are required for qc runs 
//     allow_as_filter : bool = True #attributes allow to filter datasets
//     allow_for_measurement : bool = True #atributes that are required when state of projekt changes to measuring
//     allow_for_genotype : bool = False #attributes that are allowed for specifiying a genotype.
//     allow_for_dataset : bool = False #allow to use this attribute to define a dataset. 
//     allow_for_user : bool = False

//     @field_validator('parent_id', mode="before")


/**
 * @typedef AttributeValue 
 * @type {Object}
 * @property {string} tag - The tag of the attribute value 
 * @property {string} text - The name of the attribute value
 * @property {string} description - The attribute details which are usually shown in a tooltip.
 * @property {Number} attribute_id - The attribute id the value belongs to.  
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