import { useState } from "react"
import { Dialog } from "@blueprintjs/core"
import { InsertNews } from "@/comps/welcome/dialog/InsertNews"
import { NewsItem } from "@/comps/welcome/News"
import { AddButton } from "../../core/base/buttons/AddButton"
import { api } from "@/api"
import APIError from "../../core/error/APIerror"
import Loading from "../../core/base/loading"
import _ from "lodash"

/**
 * News management page
 */
export function NewsManagement({ authenticationStatus = null }) {
    const [dialogProps, setDialogProps] = useState({ isOpen: false })

    const { data: news, isLoading, isFetching, isError, error, refetch } = api.news.useFindNews(
        { limit: 100, order: "desc" },
        {
            staleTime: 1000 * 60 * 5,
            placeholderData: (prev) => prev || []
        }
    )

    const { data: newsPermissions, isSuccess: permissionIsSuccess } = api.news.useGetNewsPermissions(
        {}, 
        { staleTime: 1000 * 60 * 5 }
    )
    
    const permissionLoaded = _.isObject(newsPermissions) && permissionIsSuccess

    // own research groups, used to hide group-targeted news of other groups client-side
    // (the backend already restricts the list for non-curators)
    const { data: ownUser } = api.users.core.useGetPublicUserByTag(
        { tag: authenticationStatus?.tag },
        { enabled: _.isObject(authenticationStatus) && _.isString(authenticationStatus?.tag), staleTime: 1000 * 60 * 5 }
    )
    const ownResearchGroupTags = _.isArray(ownUser?.research_group_tags) ? ownUser.research_group_tags : []

    return (
        <div
            className="div--expand padding--medium"
            style={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
                minHeight: 0,
            }}
        >
            <div className="flex flex-column padding--medium gap--medium-small" style={{ flex: 1, minHeight: 0 }}>
                <h3>News</h3>
                <div className="flex">
                    <Dialog
                        isOpen={dialogProps.isOpen}
                        onClose={() => {
                            setDialogProps(prevValues => ({ ...prevValues, isOpen: false }))
                        }}
                        canEscapeKeyClose={true}
                        canOutsideClickClose={true}
                        title="Create News"
                        style={{ width: "50vw", height: "70vh", minHeight: "600px", fontSize: "1rem" }}
                    >
                        <InsertNews authenticationStatus={authenticationStatus} onSuccess={() => {
                            refetch()
                            setDialogProps(prevValues => ({ ...prevValues, isOpen: false }))
                        }}/>
                    </Dialog>
                    
                    {permissionLoaded && newsPermissions.create && (
                        <AddButton onSelect={() => setDialogProps(prevValues => ({ ...prevValues, isOpen: true }))} />
                    )}
                </div>
                
                <div className="div--expand padding--medium">
                    {isError ? (
                        <APIError error={error} />
                    ) : isLoading || isFetching ? (
                        <Loading />
                    ) : (
                        <div className="flex flex-column" style={{ 
                            gap: "1rem",
                            overflowY: "auto",      
                            minHeight: 0,
                            maxHeight: "100%",     
                            height: "100%",
                            paddingBottom: "1.5rem"
                        }}
                        >
                            {_.isArray(news) && news.length > 0 ? (
                                _.map(news, news_tag => (
                                    <NewsItem 
                                        key={news_tag} 
                                        news_tag={news_tag} 
                                        authenticationStatus={authenticationStatus}
                                        own_research_group_tags={ownResearchGroupTags}
                                        showEdit={permissionLoaded && newsPermissions.edit} 
                                        showDelete={permissionLoaded && newsPermissions.delete}
                                        onEditSuccess={refetch}       
                                        onDeleteSuccess={refetch}
                                    />
                                ))
                            ) : (
                                <div>No news available.</div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}