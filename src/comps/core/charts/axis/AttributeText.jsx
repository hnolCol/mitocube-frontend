import { api } from "@/api";
import _ from "lodash";



export function getAttributeText({ tag }) { 
    const { data: attribute, isSuccess } = api.attributes.queryAttributes.useGetAttribute({ tag }, { enabled: !!tag })

    return isSuccess && _.isObject(attribute) && _.isString(attribute?.text) ? attribute.text : " "
}