
import hooks from "@mitocube/api-hooks"
import PropTypes from "prop-types"
import useDebounce from "../../../hooks/useDebounce"
import { useEffect, useState } from "react"
import { GenotypeContainer } from "./GenotypeContainer"
import _ from "lodash"
import { Loading } from "../../core/base/states/Loading"
import { OptionButton } from "../../core/base/buttons/OptionButton"
import { useSearchParams } from "react-router-dom";
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

    const [searchString, setSearchString] = useState("")
    const debouncedSearchString = useDebounce(searchString, 300)
    const [genotypesToDisplay, setGenotypesToDisplay] = useState([]) // array of genotype tags to be displayed, saving them allows to have no blinking when typing in search box.
    const [searchParams, setSearchParams] = useSearchParams(); 

    const { data: genotype_tags, isLoading, isSuccess, isError, error } = hooks.genotypes.useGetGenotypesBySearchString({ search_string: debouncedSearchString, limit: 20 }, { staleTime: 2000 });
    console.log(genotype_tags)
    // Determine selected limit from URL params
    const selectedLimit = LIMIT_OPTIONS.includes(_.toNumber(searchParams.get("limit"))) ? _.toNumber(searchParams.get("limit")) : LIMIT_OPTIONS[0];

    
    useEffect(() => {
        if (isSuccess && Array.isArray(genotype_tags)) {
            setGenotypesToDisplay(genotype_tags)
        }
    }, [isSuccess, _.join(genotype_tags)])

       // Handlers to update URL params
    const updateParam = (key, value) => {
        const newParams = new URLSearchParams(searchParams);
        if (value === "" || value === undefined || value === null) {
            newParams.delete(key);
        } else {
            newParams.set(key, value);
        }
        setSearchParams(newParams, { replace: true });
    };

    return (
        <div className="flex flex-column margin--medium padding--medium" style={{ gap: "0.4rem"}}>
            <div><input className="search-input" type="text" placeholder="Search Genotypes..." value={searchString} onChange={(e) => setSearchString(e.target.value)} /></div>
            <div className="flex">{LIMIT_OPTIONS.map(option => <OptionButton key={option} onClick={() => updateParam("limit", option)} isSelected={option === selectedLimit}>{option}</OptionButton> )}</div>
            <div style={{height : "2rem"}}>{isError ? <span>Error in searching for genotypes..</span> : isLoading ? <Loading /> : null}</div>
            {/* Display genotypes  */}
            <GenotypeContainer tags={genotypesToDisplay} />
        </div>
    )
}