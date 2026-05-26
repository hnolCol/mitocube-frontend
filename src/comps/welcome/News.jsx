import APIError from "../core/error/APIerror"
import Loading from "../core/base/loading"
import _, { set } from "lodash"
import { Content, TitleText } from "../core/metrics/ItemBasics"
import { CreatedAt } from "../core/metrics/CreatedAt"
import { FeatureLink } from "../core/links/Feature"
import { Dialog } from "@blueprintjs/core"
import { InsertNews } from "./dialog/InsertNews"
import { Button } from "@blueprintjs/core"
import { EditNews } from "../admin/news/NewsEdit"
import { useState } from "react"
import { MinimalUserIcon } from "../core/base/user"
import { AddButton } from "../core/base/buttons/AddButton"
import { RemoveButton } from "../core/base/buttons/RemoveButton"
import { SubmissionLink } from "../core/links/Submission"

import { api } from "@/api"
export function NewsItem({ 
    news_tag, 
    showDelete = false, 
    showEdit = false,
    onDeleteSuccess = () => {}, 
    onEditSuccess = () => {},
    onDeleteError = console.log 
}) {
    const [editDialogOpen, setEditDialogOpen] = useState(false)

    const { data: news, isLoading, isFetching, isError, error, refetch } = api.news.useGetNewsByTag({ tag: news_tag }, {
        staleTime: 1000 * 60 * 5,
    })

    const { mutate: deleteNews } = api.news.useDeleteNews()

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
        <>
            <Dialog
                isOpen={editDialogOpen}
                onClose={() => setEditDialogOpen(false)}
                canEscapeKeyClose={true}
                canOutsideClickClose={true}
                title="Edit News"
                style={{ width: "50vw", height: "70vh", minHeight: "600px", fontSize: "1rem" }}
            >
                <EditNews 
                    news_tag={news_tag} 
                    onClose={() => setEditDialogOpen(false)}
                    onSuccess={() => {
                        setEditDialogOpen(false)
                        refetch()
                        onEditSuccess()
                    }}
                />
            </Dialog>
            
            <div 
                className="bg--lightgrey margin--little padding--medium div--round"
                style={{ width: "max(20rem,80%)" }}
            >
                <div className="flex center-items justify-space-between">
                    <div>
                        {_.isString(news.title) && <TitleText title={news.title} />}
                        <CreatedAt createdat={news.created_at} />
                    </div>
                    
                    <div className="flex flex-column" style={{ alignItems: "flex-end" }}>
                        <div>
                            <MinimalUserIcon user_tag={news.user_tag} />
                        </div>
                        <div className="flex">
                            {showEdit && (
                                <Button 
                                    icon="edit" 
                                    minimal 
                                    small
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setEditDialogOpen(true)
                                    }} 
                                />
                            )}
                            {showDelete && (
                                <Button 
                                    icon="trash" 
                                    minimal 
                                    small
                                    onClick={handleDelete}
                                />
                            )}
                        </div>
                    </div>
                </div>
                
                <div>
                    <Content text={news.content} />
                </div>
                <div>
                    {news.submission_tags && news.submission_tags.map(tag => <SubmissionLink key={tag} tag={tag} />)}
                </div>
            </div>
        </>
    )

}

/**
 * Displays the latest news items in a scrollable container with an option to insert new news.
 * @returns 
 */
export function NewsView() {

    const [dialogProps, setDialogProps] = useState({ isOpen: false })

    const { data: news, isLoading, isFetching, isError, error, refetch } = api.news.useFindNews({ limit: 5 }, {
        staleTime: 1000 * 60 * 5,
        placeHolderData: (prev) => prev || []
    }) //5 minutes

    const { data: newsPermissions, isSuccess: permissionIsSuccess } = api.news.useGetNewsPermissions({}, { staleTime: 1000 * 60 * 5 })
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
                            <NewsItem key={news_tag} news_tag={news_tag} />) : null}
                        {_.isArray(news) && news.length === 0 ? <div>No news available.</div> : null}
                </div> }
       
        </div>)
}

// <NewsItem key={news_tag} news_tag={news_tag} showDelete={permissionLoaded &&newsPermissions.delete} onDeleteSuccess={refetch} />) : null}