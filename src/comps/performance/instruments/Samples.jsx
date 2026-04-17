
import { api } from "@/api" 
import _ from "lodash" 

export function InstrumentSamplesCount({ tag }) {

    const { data: samplesCount, isLoading, isSuccess } = api.instruments.count.useGetInstrumentSamplesCount({ tag }, { enabled: _.isString(tag), staleTime: 300000 })

    return (
        <div>
            {isSuccess ? <span>Total Samples: <strong>{samplesCount}</strong></span> : null}
        </div>
    )
}