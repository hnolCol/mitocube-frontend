import hooks from "@mitocube/api-hooks"

export function Instrument({ instrument_tag }) {
    const { data: instrument, isSuccess } = hooks.instruments.useGetInstrument({ tag: instrument_tag }, { enabled: !!instrument_tag, stateTime : "Infinity" })    
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