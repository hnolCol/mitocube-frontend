import { useParams } from "react-router"
import { InstrumentMenu } from "./Menu"
import hooks from "@mitocube/api-hooks"

import _ from "lodash"
import APIError from "../../core/error/APIerror"
import { Loading } from "../../core/base/states/Loading"
import { InstrumentStateHistory } from "./StateHistory"
import { InstrumentCosts } from "./Costs"
import { InsertMaintenanceEvent } from "../maintenance/InsertMaintenanceEvent"
import { MaintenanceView } from "../maintenance/MaintenanceView"
import { CurrentInstrumentState, InstrumentStates } from "./States"
import { InstrumentSamplesCount } from "./Samples"
import { useState } from "react"

/**
 * @description Details view for a specific instrument. 
 * @param {*} param0 
 */
export function InstrumentView() {
    
    const [refetchInstrumentStateTrigger, setRefetchInstrumentStateTrigger] = useState(undefined)
    const params = useParams() // get the instrument tag from the URL
    const {data : instrument, isSuccess, error, isError, isLoading} = hooks.instruments.useGetInstrument({tag : params.instrument_tag}, {enabled : _.isObject(params) && _.has(params,"instrument_tag")})

    return <div>
        {isError ? <APIError error={error} /> : null} 
        <div className="flex">
            <InstrumentMenu open_instrument_tag={params.instrument_tag} />

            <div className="margin-left--medium">
                {isLoading ? <Loading /> : null}
                {isSuccess && _.isObject(instrument) ? <div>
                    
                    <h4>{instrument.text}</h4>
                    
                    <div className="font-size--small">{instrument.description}</div>
                    <InstrumentCosts tag={params.instrument_tag} />
                    <InstrumentSamplesCount tag={params.instrument_tag} />
                    {/* <InstrumentStates instrument_tag={params.instrument_tag} /> */}
                    <CurrentInstrumentState instrument_tag={params.instrument_tag} refetchInstrumentStateTrigger={refetchInstrumentStateTrigger} />
                    <InsertMaintenanceEvent instrument_tag={params.instrument_tag} />

                    
                </div> : null}
                <div className="margin-top--medium">
                <h4>Maintenance Events</h4>
                    <MaintenanceView instrument_tag={params.instrument_tag} setRefetchInstrumentStateTrigger={setRefetchInstrumentStateTrigger} />
                </div>
            </div>
        </div>
        


    </div>

}