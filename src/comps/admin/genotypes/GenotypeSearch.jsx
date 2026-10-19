import { api } from "@/api"
import PropTypes from "prop-types"
import { useSearchParamState } from "../../../hooks/useSearchParamState"
import { useEffect, useState } from "react"
import { GenotypeContainer } from "./GenotypeContainer"
import _ from "lodash"
import { Loading } from "../../core/base/states/Loading"
import { OptionButton } from "../../core/base/buttons/OptionButton"


GenotypeSearch.propTypes = {
}

GenotypeSearch.defaultProps = {
}

const LIMIT_OPTIONS = [10, 25, 50, 100]

/**
 * @description Genotype Search Component.
 * @param {Object} props 
 * @returns 
 */ 

export function GenotypeSearch({ }) {

    const { searchString, setSearchString, debouncedSearchString, limit: selectedLimit, setLimit } = useSearchParamState({ limitOptions: LIMIT_OPTIONS })
    const [genotypesToDisplay, setGenotypesToDisplay] = useState([]) // array of genotype tags to be displayed, saving them allows to have no blinking when typing in search box.
    const { data: genotype_tags, isLoading, isSuccess, isError, error, refetch : updateGenotypeList } = api.genotypes.queryGenotypes.useGetGenotypesBySearchString(
        { search_string: debouncedSearchString, limit: selectedLimit },
        { staleTime: 6000 }
    );
    
    useEffect(() => {
        if (isSuccess && Array.isArray(genotype_tags)) {
            setGenotypesToDisplay(genotype_tags)
        }
    }, [isSuccess, _.join(genotype_tags)])


    const handleClose = (updateGenotypes = false) => {
        setHotkeysDialogProps({ isOpen: false });
        if (updateGenotypes) updateGenotypeList();
    };

    return (
        <div
            className="flex flex-column padding--medium"
            style={{
                gap: "0.4rem",
                flex: 1,
                minHeight: 0,
            }}
        >
    
            <div>
                <input
                    className="search-input"
                    type="text"
                    placeholder="Search Genotypes..."
                    value={searchString}
                    onChange={(e) => setSearchString(e.target.value)}
                />
            </div>
    
            <div className="flex" >
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
    
            <div style={{ height: "2rem"}}>
                {isError ? <span>Error in searching for genotypes..</span> : isLoading ? <Loading /> : null}
            </div>
    
            <GenotypeContainer tags={genotypesToDisplay} UpdateGenotypeList={updateGenotypeList} />
        </div>
    )
}