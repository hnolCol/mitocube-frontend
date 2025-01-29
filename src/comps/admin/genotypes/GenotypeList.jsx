import { Loading } from "../../core/base/states/Loading";

/**
 * @description Display a list of genotypes. 
 * @param {} props 
 * @param {String[]} props.tags - List of genotype tags to be displayed.  
 * @param {Boolean} props.isLoading - Controlled mode of loading
 * @param {Function} props.onGenotypeSelect 
 * @returns 
 */
export function GenotypeList({ tags, isLoading, onGenotypeSelect }) {
    
    



    return <div>
        {isLoading ? <Loading /> : <div className="flex">
        
        </div>}

    </div>
}