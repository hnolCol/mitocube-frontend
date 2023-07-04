import { useOutletContext, useParams } from "react-router";
import MultipleMetrices from "../../core/metrics/collection";
import { useMemo } from "react";
import { Header } from "../../core/base/Header";
import _ from "lodash"
import GroupingTable from "../../core/base/groupings/table";

function AuthorList({
    authors = [{ name: "Hendrik Nolte", email: "h.nolte@age.mpg.de", owner: true }, { name: "Andreas Lindner", email: "a.l@uni-bonn.de", owner: false }],
    emailSubject = "" }) {
    
    return (
        <div className="flex">
            {authors.map((authorProps, idx) => {
                return (
                    <div className="flex intent-margin-right--little bg--lightgrey padding--little div--round" key={`${authorProps.email}-${idx}`}>
                        <div>
                            {authorProps.name}
                        </div>
                        <div className="intent-margin-left--little">
                            (<a
                                href={`mailto:${authorProps.email}?cc=${_.join(authors.filter(author => author.email !== authorProps.email).map(author => author.email), ", ")}&subject=${emailSubject}`}
                                className="router-link">{authorProps.email}</a>)
                        </div>
                    </div>
                )
            })}
            
        </div>
    )
}


function DatasetOverview({ }) {
    const {data, dataID, isLoading, isFetched } = useOutletContext()
    console.log(data)
    
    const keyfigureMetrices = useMemo(() => {
        if (!_.isObject(data)) return []
        return data.keyFigureNames.map(figureName => {return {label : figureName, metric : data.info[figureName]}})
    }, [dataID,isFetched])

    if (isLoading) return <div>Loading...</div>
    return (
        <div>
            <div className="intent-margin-bottom--medium">
                
                <Header text={data.info.Title} fontSize="1.8rem" />

                <AuthorList emailSubject={`Related to dataset '${data.info.Title}'`} />
            </div>
            <MultipleMetrices metrices={keyfigureMetrices}/>

            <p>Groupings</p>
            <GroupingTable grouping={data.info.groupings} />
            
            <div className="accordions__header">Research Aim</div>


            <p>Raw files</p>
        </div>
    )
}


export default DatasetOverview