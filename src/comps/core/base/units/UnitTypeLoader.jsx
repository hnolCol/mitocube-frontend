import { useGetUnitsByUnitType } from "../../../../hooks/queries/unittypes.hooks"
import { Loading } from "../states/Loading"
import { FeatureUnitType } from "./FeatureUnitType"
import { UnitTpye } from "./UnitType"
import _ from "lodash"

export function UnitTypeLoader({ attribute_tag, trait_tag, unittype_tag, onChange, value, unit_tag }) {
    const { data, isLoading, isFetching, isSuccess  } = useGetUnitsByUnitType({ tag: unittype_tag })// get traits for attribute is unit 

    return <div>
        {isLoading || isFetching ? <Loading /> : isSuccess ? data.has_feature_value ?
            <FeatureUnitType {...{
                attribute_tag,
                trait_tag,
                unittype_tag,
                unit_tag: _.isString(unit_tag)?unit_tag:data.units[0].tag,
                unit_name: data.text,
                units: data.units,
                value,
                onChange
            }} /> :
            <UnitTpye {...{
                attribute_tag,
                trait_tag,
                unittype_tag,
                unit_tag: _.isString(unit_tag)?unit_tag:data.units[0].tag,
                unit_name: data.text,
                units: data.units,
                value,
                onChange
        }} /> : null}
    </div>
}
   