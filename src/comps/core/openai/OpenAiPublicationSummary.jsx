import { api } from "@/api"
import _ from "lodash"
import Markdown from "react-markdown";
import remarkGfm from 'remark-gfm'
import { OptionButton } from "../base/buttons/OptionButton";
import { useSearchParams } from "react-router-dom";
import { OpenAIWarning } from "./OpenAIWarning";
import { Protein } from "../base/protein/Protein";
import APIError from "../error/APIerror";

const LIMITS = [5, 10, 20, 100];
const SORT_BY_OPTIONS = ["relevance", "pub_date"];
export function OpenAiPublicationSummary({ feature_tag }) {

    const [searchParams, setSearchParams] = useSearchParams();
    const selectedLimit = LIMITS.includes(Number(searchParams.get("limit"))) ? Number(searchParams.get("limit")) : LIMITS[0];
    const selectedSortBy = SORT_BY_OPTIONS.includes(searchParams.get("sort_by")) ? searchParams.get("sort_by") : SORT_BY_OPTIONS[0];
    const { data: summary, isLoading, isError, error, refetch } = api.openai.cyper.useGetPublicationSummaryForProtein({ tag: feature_tag, limit : selectedLimit, sort_by: selectedSortBy }, { enabled: !!feature_tag && _.isString(feature_tag), staleTime: 60 * 60 * 1000 });

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
        <div style={{marginTop: "2rem"}}>
            <h3>Publication Summary for {feature_tag}</h3>
            <div className="font-size--small"> Downloads the abstract of the latest {selectedLimit} publications sorted by {selectedSortBy} that has the gene name in the title or in the abstract. The publications are then summarized by a large language model. Due to the search in Pubmed, the research articles are not organism specific.</div>
             <div className="flex margin-top--little center-items" style={{ gap: "5px", width: "100%" }}>
                <span>Publications | </span>
                        {LIMITS.map(option => (
                            <OptionButton
                                key={option}
                                isSelected={option === selectedLimit}
                                onClick={() => updateParam("limit", option)}
                            >
                                <span>{option}</span>
                            </OptionButton>
                        ))}
            </div>
             <div className="flex margin-top--little center-items" style={{ gap: "5px", width: "100%" }}>
                <span>Sort by | </span>
                        {SORT_BY_OPTIONS.map(option => (
                            <OptionButton
                                key={option}
                                isSelected={option === selectedSortBy}
                                onClick={() => updateParam("sort_by", option)}
                            >
                                <span>{option}</span>
                            </OptionButton>
                        ))}
            </div>
            <div className="flex" style={{width : "100%", flexGrow : 1, justifyContent : "flex-start"}}>
                <OpenAIWarning />
                <button className="basic-button"
                    onClick={() => refetch()}
                    style={{
                        marginLeft : "1rem",
                        height: "100%",
                        marginTop: "1rem",
                        padding: "0.75rem 1rem"
                    }}>
                    Regenerate
                </button>
                </div>
            <div className="padding--medium bg--lightgrey" style={{marginTop: "1rem", borderRadius: "5px", height : "85vh", overflowY : "scroll"}}>
            <Markdown remarkPlugins={[remarkGfm]}>
                {isLoading ? "Loading summary..." : _.isObject(summary) && _.has(summary, "response") ? isError ? <APIError error={error} />  : summary.response : "No summary available."}
                </Markdown>
            </div>
        </div>
    )
}




