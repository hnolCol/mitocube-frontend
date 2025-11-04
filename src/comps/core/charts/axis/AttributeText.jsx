import hooks from "@mitocube/api-hooks";
import _ from "lodash";



export function getAttributeText({ tag }) { 
    const { data: attribute, isSuccess } = hooks.attributes.useGetAttribute({ tag }, { enabled: !!tag })

    return isSuccess && _.isObject(attribute) && _.isString(attribute?.text) ? attribute.text : " "
}