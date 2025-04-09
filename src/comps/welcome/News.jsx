import { useGetNews } from "../../hooks/queries/welcome.hooks"
import APIError from "../core/error/APIerror"
import Loading from "../core/base/loading"
import _ from "lodash"
import { Content, SubmissionLink, TitleText } from "../core/metrics/ItemBasics"
import { CraetedAt } from "../core/metrics/CreatedAt"
import { FeatureLink } from "../core/links/Feature"

/**
 * 
 * @param {Object} props 
 * @param {import("../../types/news").News} props.news  
 */
export function NewsItem({ news }) {
    
    return (
        <div className="bg--lightgrey margin--little padding--medium div--round"
            style={{ width: "max(20rem,80%)" }}>
                <div className="flex">
                    <TitleText title={news.title} />
                    <CraetedAt createdat={news.created_at} />
                </div>
                <div>
                    <Content text={news.content} />
                </div>
                <div>
                    {news.submission_tags.map(tag => <SubmissionLink key={tag} tag={tag} />)}
                </div>
                <div>
                    <div>Associated Features: </div>
                    {news.feature_tags.map(tag => <FeatureLink key={tag} tag={tag} />)}
                </div>
        </div>
    )

}

export function NewsView() {
    
    const {data : news, isLoading, isFetching, isError, error} = useGetNews()

    return (<div style={{width : "100%", maxHeight : "20%"}}>
        {isError ?
            <APIError error={error} /> :
                isLoading || isFetching ?
                    <Loading /> :
                    <div className="center-items flex flex-column">
                        {_.isArray(news) ? _.map(news, n =>  <NewsItem key={n.tag} news={n} />): null}
                        </div> }

        </div>)
}