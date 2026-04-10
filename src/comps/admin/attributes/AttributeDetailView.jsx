import hooks from "@mitocube/api-hooks"
import _ from "lodash"
import { useParams, useNavigate } from "react-router"
import { Button, Code, Intent } from "@blueprintjs/core"
import { useState } from "react"
import { useQueryClient } from "react-query"
import { Loading } from "../../core/base/states/Loading"
import APIError from "../../core/error/APIerror"
import { AttributeMinState } from "./AttributeMinState"
import { TraitItem } from "./TraitItem"
import { InsertTraitDialog } from "./InsertTraitDialog"

export function AttributeDetailView() {
    const { tag } = useParams()
    const redirect = useNavigate()
    const queryClient = useQueryClient()
    const [addOpen, setAddOpen] = useState(false)

    const {
        data: attribute,
        isLoading: attributeLoading,
        isError: attributeIsError,
        error: attributeError,
    } = hooks.attributes.useGetAttribute({ tag }, { enabled: !!tag })

    const {
        data: trait_tags,
        isLoading: traitsLoading,
        isError: traitsIsError,
        error: traitsError,
    } = hooks.traits.useGetTraitsByAttributeTag(
        { tag },
        { enabled: !!tag, staleTime: 0 }
    )

    const handleTraitAdded = () => {
        queryClient.invalidateQueries(["traitsByTag", tag])
    }

    return (
        <div
            style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "center",
                background: "#f5f5f5",
            }}
        >
            <div
                style={{
                    width: "90vw",
                    height: "85vh",
                    marginTop: "40px",
                    marginBottom: "40px",
                    padding: 32,
                    background: "#fff",
                    borderRadius: 10,
                    boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
                    display: "flex",
                    flexDirection: "column",
                    minHeight: 0,
                }}
            >
                <div style={{ flexShrink: 0 }}>
                    <div className="flex center-items" style={{ marginBottom: 16 }}>
                        <Button
                            minimal
                            icon="arrow-left"
                            onClick={() => redirect("/admin/attributes")}
                        >
                            Back
                        </Button>
                    </div>

                    {attributeLoading && <Loading />}
                    {attributeIsError && <APIError error={attributeError} />}

                    {_.isObject(attribute) && (
                        <>
                            <h2
                                style={{
                                    fontWeight: 700,
                                    fontSize: 28,
                                    marginBottom: 8,
                                    letterSpacing: -1,
                                }}
                            >
                                {attribute.text}
                            </h2>

                            <div
                                className="flex center-items"
                                style={{
                                    justifyContent: "space-between",
                                    marginBottom: 12,
                                }}
                            >
                                <h3
                                    style={{
                                        fontWeight: 600,
                                        fontSize: 20,
                                        margin: 0,
                                    }}
                                >
                                    Traits{" "}
                                    <span style={{ color: "#aaa", fontWeight: 400 }}>
                                        (
                                        {_.isArray(trait_tags)
                                            ? trait_tags.length
                                            : 0}
                                        )
                                    </span>
                                </h3>
                                <Button
                                    icon="plus"
                                    intent={Intent.PRIMARY}
                                    onClick={() => setAddOpen(true)}
                                >
                                    Add trait
                                </Button>
                            </div>
                        </>
                    )}
                </div>

                <div
                    style={{
                        flex: 1,
                        minHeight: 0,
                        overflowY: "auto",
                        overflowX: "hidden",
                    }}
                >
                    {traitsLoading && <Loading />}
                    {traitsIsError && <APIError error={traitsError} />}

                    {_.isArray(trait_tags) && trait_tags.length === 0 && (
                        <div style={{ color: "#888", padding: 12 }}>
                            No traits defined for this attribute yet.
                        </div>
                    )}
                    {_.isArray(trait_tags) &&
                        trait_tags.map((trait_tag) => (
                            <TraitItem
                                key={trait_tag}
                                tag={trait_tag}
                                attribute_tag={tag}
                            />
                        ))}
                </div>
            </div>

            <InsertTraitDialog
                isOpen={addOpen}
                onClose={() => setAddOpen(false)}
                attribute_tag={tag}
                onSuccess={handleTraitAdded}
            />
        </div>
    )
}