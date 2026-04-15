import { api } from "@/api"
import useDebounce from "../../../hooks/useDebounce"
import { useEffect, useState } from "react"
import _ from "lodash"
import { Loading } from "../../core/base/states/Loading"
import { OptionButton } from "../../core/base/buttons/OptionButton"
import { useSearchParams } from "react-router-dom"
import { ExternalServiceContainer } from "./ExternalServiceContainer"
import { AddExternalServiceDialog } from "./AddExternalServiceDialog"
import { AddButton } from "../../core/base/buttons/AddButton"

const LIMIT_OPTIONS = [10, 25, 50, 100]

export function ExternalServiceSearch() {

    const [dialogProps, setDialogProps] = useState({ isOpen: false });
    const [searchString, setSearchString] = useState("")
    const debouncedSearchString = useDebounce(searchString, 300)
    const [externalserviceToDisplay, setExternalServiceToDisplay] = useState([])
    const [searchParams, setSearchParams] = useSearchParams()

    const { data: tag, isLoading, isSuccess, isError, refetch: updateExternalServiceList } =
        api.maintenance.externalservice.queryExternalService.useGetExternalServiceByQuery(
            { search_string: debouncedSearchString, limit: 20 },
            { staleTime: 2000 }
        )

    const selectedLimit = LIMIT_OPTIONS.includes(_.toNumber(searchParams.get("limit")))
        ? _.toNumber(searchParams.get("limit"))
        : LIMIT_OPTIONS[0]

    useEffect(() => {
        if (isSuccess && Array.isArray(tag)) {
            setExternalServiceToDisplay(tag)
        }
    }, [isSuccess, _.join(tag)])

    const updateParam = (key, value) => {
        const newParams = new URLSearchParams(searchParams)
        if (!value) newParams.delete(key)
        else newParams.set(key, value)
        setSearchParams(newParams, { replace: true })
    }

    const handleClose = (updateExternalService = false) => {
        setDialogProps({ isOpen: false });
        if (updateExternalService) updateExternalServiceList();
    }

    return (
        <div className="flex flex-column margin--medium padding--medium" style={{ gap: "0.4rem", overflowY: "scroll" }}>
            <h3>External Service</h3>
            <div className="flex">

            <AddExternalServiceDialog
                            isOpen={dialogProps.isOpen}
                            onClose={handleClose}
                        />
            
             <AddButton onSelect={() => setDialogProps({ isOpen: true })} />
            
            </div>
                    
            <div>
                <input
                    className="search-input"
                    type="text"
                    placeholder="Search External Services..."
                    value={searchString}
                    onChange={(e) => setSearchString(e.target.value)}
                />
            </div>

            <div className="flex">
                {LIMIT_OPTIONS.map(option => (
                    <OptionButton
                        key={option}
                        onClick={() => updateParam("limit", option)}
                        isSelected={option === selectedLimit}
                    >
                        {option}
                    </OptionButton>
                ))}
            </div>

            <div style={{ height: "2rem" }}>
                {isError ? <span>Error in searching for External Services...</span> : isLoading ? <Loading /> : null}
            </div>

            <ExternalServiceContainer 
                tags={externalserviceToDisplay}
                updateExternalServiceList={updateExternalServiceList}
            />
        </div>
    )
}
