import { api } from "@/api"

export function Instrument({ instrument_tag }) {
    const { data: instrument, isSuccess } = api.instruments.core.useGetInstrument({ tag: instrument_tag }, { enabled: !!instrument_tag, stateTime : "Infinity" })    
    return <div>
        {isSuccess && instrument ?
            <div className="flex flex-column">
                <div className="flex">
                    <div className="flex flex-column">
                        <div>{instrument.text}</div>
                    </div>
                </div>
            </div> : null}

            </div>
}