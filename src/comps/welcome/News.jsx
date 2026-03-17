import { useGetNews } from "../../hooks/queries/welcome.hooks"
import APIError from "../core/error/APIerror"
import Loading from "../core/base/loading"
import _, { set } from "lodash"
import { Content, SubmissionLink, TitleText } from "../core/metrics/ItemBasics"
import { CreatedAt } from "../core/metrics/CreatedAt"
import { FeatureLink } from "../core/links/Feature"
import hooks from "@mitocube/api-hooks"
import { Dialog } from "@blueprintjs/core"
import { InsertNews } from "./dialog/InsertNews"
import { useState } from "react"
import { MinimalUserIcon } from "../core/base/user"
import { AddButton } from "../core/base/buttons/AddButton"
import { RemoveButton } from "../core/base/buttons/RemoveButton"
/**
 * 
 * @param {Object} props 
 * @param {string} props.news_tag - The tag of the news item to display.
 * @param {boolean} props.showDelete - Whether to show the delete button.
 * @param {Function} props.onDeleteSuccess - Callback function to be called upon successful deletion of the news item.
 */
export function NewsItem({ news_tag, showDelete = false, onDeleteSuccess = () => {}, onDeleteError = console.log }) {

    const { data: news, isLoading, isFetching, isError, error } = hooks.news.useGetNewsByTag({ tag: news_tag }, {
        staleTime: 1000 * 60 * 5,
    }) //5 minutes

    const { mutate : deleteNews } = hooks.news.useDeleteNews()

    console.log(news)

    const handleDelete = (e) => {
        e.stopPropagation()
        deleteNews({ tag: news_tag }, {
            onSuccess: () => {
                onDeleteSuccess()
            },
            onError: (error) => {
                onDeleteError(error)
            }
        })
    }


    if (isLoading || isFetching) return <Loading />
    if (isError) return <APIError error={error} />
    if (!_.isObject(news)) return <div>News not found</div>
    return (
        <div className="bg--lightgrey margin--little padding--medium div--round"
            style={{ width: "max(20rem,80%)" }}>
            
            <div className="flex center-items justify-space-between">
                <div>
                    {_.isString(news.title) && <TitleText title={news.title} />}
                    <CreatedAt createdat={news.created_at} />
                </div>
                <RemoveButton onRemove={handleDelete}/>
                <MinimalUserIcon user_tag={news.user_tag} />
                </div>
                <div>
                    <Content text={news.content} />
                </div>
                <div>
                    {news.submission_tags.map(tag => <SubmissionLink key={tag} tag={tag} />)}
                </div>
                {_.isArray(news.feature_tags) && news.feature_tags.length > 0 ? <div>
                    <div>Associated Features: </div>
                    {news.feature_tags.map(tag => <FeatureLink key={tag} tag={tag} />)}
                </div> : null}
        </div>
    )

}

/**
 * Displays the latest news items in a scrollable container with an option to insert new news.
 * @returns 
 */
export function NewsView() {

    const [dialogProps, setDialogProps] = useState({ isOpen: false })

    const { data: news, isLoading, isFetching, isError, error, refetch } = hooks.news.useFindNews({ limit: 5 }, {
        staleTime: 1000 * 60 * 5,
        placeHolderData: (prev) => prev || []
    }) //5 minutes

    const { data: newsPermissions, isSuccess: permissionIsSuccess } = hooks.news.permissions.useGetNewsPermissions({}, { staleTime: 1000 * 60 * 5 })
    const permissionLoaded = _.isObject(newsPermissions) && permissionIsSuccess
    return (
        
        <div
            className="bg--lightgrey padding--medium"
            style={{
            minWidth: "max(33vw, 500px)",
            minHeight: "max(20vh,300px)",
            float: "left",
            overflowY: "scroll"
    }}>

        <Dialog isOpen={dialogProps.isOpen}
            onClose={() => setDialogProps(prevValues => ({ ...prevValues, isOpen: false }))}
            canEscapeKeyClose={true}
            canOutsideClickClose={true}
            title="Insert News"
            style={{ width: "50vw", height: "70vh", minHeight: "600px", fontSize: "1rem" }}>
            <InsertNews onSuccess={() => {
                refetch()
            }}/>
        </Dialog>
        <div className = "flex justify-space-between">
            <div>
                    <h3>Latest News</h3>
                </div>
             <div>
            {permissionLoaded  && newsPermissions.create ?
                <AddButton onSelect={() => setDialogProps({ isOpen: true })} /> : null}
        </div>
        </div>
        

        {isError ?
            <APIError error={error} /> :
                isLoading || isFetching ?
                    <Loading /> :
                <div className="flex flex-column" style={{ gap: "1rem" }}>
                        {_.isArray(news) ? _.map(news, news_tag =>
                            <NewsItem key={news_tag} news_tag={news_tag} showDelete={permissionLoaded &&newsPermissions.delete} onDeleteSuccess={refetch} />) : null}
                        {_.isArray(news) && news.length === 0 ? <div>No news available.</div> : null}
                </div> }
       
        </div>)
}