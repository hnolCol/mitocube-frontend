import { api } from "@/api";
import { useSearchParamState } from "../../../hooks/useSearchParamState"
import { useEffect, useState } from "react"
import _ from "lodash"
import { Loading } from "../../core/base/states/Loading"
import { OptionButton } from "../../core/base/buttons/OptionButton"
import { SparepartContainer } from "./SparepartContainer"
import { AddSparepartDialog } from "./AddSparepartDialog"
import { AddButton } from "../../core/base/buttons/AddButton"

const LIMIT_OPTIONS = [10, 25, 50, 100]

export function SparepartSearch() {

    const [dialogProps, setDialogProps] = useState({ isOpen: false });
    const { searchString, setSearchString, debouncedSearchString, limit: selectedLimit, setLimit } = useSearchParamState({ limitOptions: LIMIT_OPTIONS })
    const [sparepartToDisplay, setSparepartToDisplay] = useState([])

    const { data: tag, isLoading, isSuccess, isError, refetch: updateSparepartList } =
    api.maintenance.spareparts.querySpareParts.useGetSparePartByQuery(
        { search_string: debouncedSearchString, limit: selectedLimit },
        { staleTime: 2000 }
    )

    useEffect(() => {
        if (isSuccess && Array.isArray(tag)) {
            setSparepartToDisplay(tag)
        }
    }, [isSuccess, _.join(tag)])


    const handleClose = (updateSpareparts = false) => {
        setDialogProps({ isOpen: false });
        if (updateSpareparts) updateSparepartList();
    }

    return (
        <div className="flex flex-column margin--medium padding--medium" style={{ gap: "0.4rem", overflowY: "scroll" }}>
            <h3>Spare parts</h3>
            <div className="flex">

            <AddSparepartDialog
                            isOpen={dialogProps.isOpen}
                            onClose={handleClose}
                        />
            
             <AddButton onSelect={() => setDialogProps({ isOpen: true })} />
            
            </div>
                    
            <div>
                <input
                    className="search-input"
                    type="text"
                    placeholder="Search Spare parts..."
                    value={searchString}
                    onChange={(e) => setSearchString(e.target.value)}
                />
            </div>

            <div className="flex">
                {LIMIT_OPTIONS.map(option => (
                    <OptionButton
                        key={option}
                        onClick={() => setLimit(option)}
                        isSelected={option === selectedLimit}
                    >
                        {option}
                    </OptionButton>
                ))}
            </div>

            <div style={{ height: "2rem" }}>
                {isError ? <span>Error in searching for spare parts...</span> : isLoading ? <Loading /> : null}
            </div>

            <SparepartContainer 
                tags={sparepartToDisplay}
                updateSparepartList={updateSparepartList}
            />
        </div>
    )
}
