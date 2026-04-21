import { useState } from "react";
import { SubmissionCondition } from "./SubmissionCondition";
import _ from "lodash" 

const DEFAULT_SELECTION = {
    submission_tag: [],
    ca_tag : []
}
export function SubmissionCompare({ }) {
    const [filterSelection, setFilterSelection] = useState({});
    const [filters, setFilters] = useState([]);

    const addFilter = (parentId = null) => {

        let fs = filters.slice() 
        if (parentId === null) {
            fs.push({ id: Date.now(), parentId, type: null, children: [] })
            setFilters(fs)
            return
        }
        const addRecursive = (filterList) => {
            return filterList.map(f => {
                if (f.id === parentId) {
                    return { ...f, children: [...f.children, { id: Date.now(), parentId, type: null, children: [] }] }
                }
                return { ...f, children: addRecursive(f.children) }
            })
        }
        setFilters(addRecursive(fs))

    };

    const handleSelectionChange = (filterId, newSelection) => {
        setFilterSelection(prev => ({ ...prev, [filterId]: newSelection }));
    }

    const removeFilter = (id) => {
        const removeRecursive = (filterList) =>
            filterList
                .filter(f => f.id !== id)
                .map(f => ({ ...f, children: removeRecursive(f.children) }));
        
        setFilters(removeRecursive(filters));
    };

    const clearAllFilters = () => {
        setFilters([]);
    };

    const renderFilters = (filterList, level = 0) => {
        return filterList.map((filter) => (
            <div key={filter.id} className="filter-card" style={{ marginLeft: `${level * 2}rem`, margin: "1rem", width: "30rem" }}>
                <button className="basic-button" onClick={() => removeFilter(filter.id)}>
                    Remove Filter {filter.id}
                </button>
                <button className="basic-button" onClick={() => addFilter(filter.id)}>
                    Add Sub-filter
                </button>
                <div className="margin--little">
                    <SubmissionCondition filterId={filter.id} onSelectionChange={handleSelectionChange} selection={_.has(filterSelection, filter.id) ? filterSelection[filter.id] : DEFAULT_SELECTION} />

                </div>
                {filter.children.length > 0 && renderFilters(filter.children, level + 1)}
            </div>
        ));
    };

    console.log(filters, "current filters") 

    return (
        <div className="filter-builder">
            <button className="basic-button" onClick={() => addFilter()}>
                Add Top-level Filter
            </button>
            <button className="basic-button" onClick={clearAllFilters}>
                Clear All
            </button>
            <div className="filters-container">
                {renderFilters(filters)}
            </div>
        </div>
    );
}
