import { useParams } from "react-router"
import { InstrumentMenu } from "./Menu"
import hooks from "@mitocube/api-hooks"

import _ from "lodash"
import APIError from "../../core/error/APIerror"
import { Loading } from "../../core/base/states/Loading"

/**
 * @description Details view for a specific instrument. 
 * @param {*} param0 
 */
export function InstrumentView() {
    
    const params = useParams()
    const {data : instrument, isSuccess, error, isError, isLoading} = hooks.instruments.useGetInstrument({tag : params.instrument_tag}, {enabled : _.isObject(params) && _.has(params,"instrument_tag")})

    return <div>
        {isError ? <APIError error={error} /> : null} 
        <InstrumentMenu open_instrument_tag={params.instrument_tag}/>
        {isLoading ? <Loading /> : null}
        {isSuccess && _.isObject(instrument) ? <div>
            <h3>{params.instrument_tag}</h3>
            <h4>{instrument.text}</h4>
            <div>{instrument.description}</div>
        </div> : null}

    </div>

}