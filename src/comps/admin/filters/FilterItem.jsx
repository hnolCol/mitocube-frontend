import { CraetedAt, N, TitleText } from "../../core/metrics/ItemBasics";



/**
 * @description The component that summarizes a filter. 
 * @param {Object} props 
 */
export function FilterItem({ filter }) {
    
    
    return (
        <div className="flex">
            <CraetedAt createdat={filter.created_at} />
            <TitleText title={filter.text} />
            <N N={filter.N} />
        </div>
    )
}