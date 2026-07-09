import { api } from "@/api"
import _ from "lodash"
import { useState, useEffect } from "react"
import useDebounce from "@/hooks/useDebounce"
import APIError from "@/comps/core/error/APIerror"
import { Loading } from "@/comps/core/base/states/Loading"
import { Tag } from "@blueprintjs/core"
import { motion } from "framer-motion"
import { PhenotypeInput } from "@/comps/core/input/api/PhenotypeInput"
import { GenotypeInput } from "@/comps/core/input/api/GenotypeInput"
import { InsertEditGenotype } from "@/comps/core/genotype/InsertGenotype"
import { AttributesInput } from "@/comps/core/input/api/DatasetAttributeInput"
import { findAndInsertTree, findChildrenByPath, deleteByPath, checkPathExists, addIDToPath } from "@/comps/submission/new/sample_attributes/select/SamplesAttributeWrapper"
import { DatasetAttributeView } from "@/comps/core/base/attributes/DatasetAttributeView"


const INITIAL_STATE = {
    description: "",
    publication: "",
    phenotype_tag: null,
    protein_tag: null,
    protein_gene_name: null,
    genotype_tag: null,
    condition_applications: null,
    disease_tag: null,
    disease_text: "",
    variant_tag: null,
}

export function InsertPhenotypeAssociation({ onClose }) {
    const [form, setForm] = useState(INITIAL_STATE)
    const [proteinSearch, setProteinSearch] = useState("")
    const [mutationInput, setMutationInput] = useState("")
    const [diseaseSearch, setDiseaseSearch] = useState("")
    const [inlineGenotype, setInlineGenotype] = useState(null)
    const [genotypeImportError, setGenotypeImportError] = useState(null)
    const [showManualGenotype, setShowManualGenotype] = useState(false)
    const [conditionTraits, setConditionTraits] = useState([])
    const [showManualPhenotype, setShowManualPhenotype] = useState(false)
    const [newPhenotype, setNewPhenotype] = useState({ text: "", description: "", group_text: "" })

    const debouncedProtein = useDebounce(proteinSearch, 300)
    const debouncedDisease = useDebounce(diseaseSearch, 400)

    const { data: selectedGenotypeText } = api.genotypes.queryGenotypes.useGetGenotypeText(
        { genotype_tag: form.genotype_tag },
        { enabled: !!form.genotype_tag }
    )

    const { data: proteinTags, isLoading: proteinsLoading } = api.features.proteinsQuery.useGetProteinFeatureByQuery(
        { search_string: debouncedProtein, limit: 10 },
        { enabled: debouncedProtein.length > 1 }
    )

    const { data: selectedProtein } = api.features.proteinsQuery.useGetProteinByTag(
        { tag: form.protein_tag },
        { enabled: !!form.protein_tag }
    )

    useEffect(() => {
        if (selectedProtein?.gene_name) {
            setForm(prev => ({ ...prev, protein_gene_name: selectedProtein.gene_name }))
        }
    }, [selectedProtein?.gene_name])

    const { mutate: lookupVariant, data: variantLookupData, isLoading: variantLookupLoading, reset: resetVariantLookup } = api.diseases.clinvar.useVariantLookup()
    const { mutate: variantToGenotype, isLoading: genotypeImportLoading } = api.diseases.clinvar.useVariantToGenotype()

    const { data: clinvarDiseaseData, isLoading: clinvarDiseaseLoading } = api.diseases.clinvar.useSearchDiseases(
        { query: debouncedDisease, limit: 20 },
        { enabled: debouncedDisease.length >= 2 }
    )

    const { mutate: postAssociation, isLoading, isError, error } = api.phenotypes.associations.usePostPhenotypeAssociation()

    const { mutate: postPhenotype, isLoading: phenotypeInsertLoading, isError: phenotypeInsertError, error: phenotypeInsertErrorObj } =
        api.phenotypes.query.usePostPhenotype()

    const handleConditionTraitSelection = (path, enforceSingleVariantPerGroup = true) => {
        path = addIDToPath(path, "pa_condition")
        let traits = conditionTraits.slice()
        const pathExists = checkPathExists(traits, path, true)
        const isValueInput = _.last(path).type === "trait" && _.has(_.last(path), "value") && _.isString(_.last(path).value)
        if (pathExists && !isValueInput) {
            deleteByPath(traits, path, true)
        } else {
            findAndInsertTree(traits, path, { enforceSingleVariantPerGroup })
        }
        setConditionTraits([...traits])
    }
    const handleProteinSelect = (tag) => {
        setForm(prev => ({ ...prev, protein_tag: tag, protein_gene_name: null, variant_tag: null }))
        setProteinSearch("")
        resetVariantLookup()
        setMutationInput("")
        setInlineGenotype(null)
        setGenotypeImportError(null)
    }

    const handleVariantSelect = (variant) => {
        setForm(prev => ({ ...prev, variant_tag: variant.tag }))
        setInlineGenotype(null)
        setGenotypeImportError(null)
    }

    const handleDiseaseSelect = (disease) => {
        setForm(prev => ({ ...prev, disease_tag: disease.tag, disease_text: disease.text }))
        setDiseaseSearch("")
    }

    const handleCreatePhenotype = () => {
        if (!newPhenotype.text.trim()) return
        postPhenotype(
            {
                text: newPhenotype.text.trim(),
                description: newPhenotype.description.trim() || undefined,
                group_text: newPhenotype.group_text.trim() || undefined,
            },
            {
                onSuccess: (tag) => {
                    setForm(prev => ({ ...prev, phenotype_tag: tag }))
                    setShowManualPhenotype(false)
                    setNewPhenotype({ text: "", description: "", group_text: "" })
                }
            }
        )
    }

    const handleVariantLookup = () => {
        if (!form.protein_gene_name || !mutationInput) return
        lookupVariant({ gene: form.protein_gene_name, mutation: mutationInput })
    }

    const handleImportAsGenotype = () => {
        if (!form.variant_tag || !form.protein_tag || !selectedProtein?.proteome_tag) return
        setGenotypeImportError(null)
        variantToGenotype(
            {
                variant_id: form.variant_tag,
                protein_tag: form.protein_tag,
                proteome_tag: selectedProtein.proteome_tag,
            },
            {
                onSuccess: (template) => {
                    setInlineGenotype({ ...template, is_external: true })
                },
                onError: () => {
                    setGenotypeImportError("Failed to fetch genotype template from ClinVar.")
                }
            }
        )
    }

    const handleSubmit = () => {
        if (!form.phenotype_tag || !form.description.trim()) return
        postAssociation({
            description: form.description,
            att_protein_mutation: mutationInput || undefined,
            publication: form.publication || undefined,
            phenotype_tag: form.phenotype_tag,
            protein_tag: form.protein_tag || undefined,
            genotype_tag: form.genotype_tag || undefined,
            genotype: inlineGenotype || undefined,
            condition_applications: conditionTraits.length > 0 ? conditionTraits : undefined,
            disease_tag: form.disease_tag || undefined,
            disease_text: (!form.disease_tag && form.disease_text) ? form.disease_text : undefined,
            variant_tag: form.variant_tag || undefined,
        }, {
            onSuccess: () => {
                setForm(INITIAL_STATE)
                setMutationInput("")
                setInlineGenotype(null)
                setConditionTraits([])
                resetVariantLookup()
                onClose(true)
            }
        })
    }

    const isReady = !!form.phenotype_tag && !!form.description.trim() && !genotypeImportLoading

    return (
        <div className="flex flex-column div--expand" style={{ gap: "1rem" }}>

            <Section title="Description" required>
                <input
                    className="text-input"
                    type="text"
                    placeholder="Short summary of this association"
                    value={form.description}
                    onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                />
            </Section>

            <Section title="Phenotype" required>
                {form.phenotype_tag ? (
                    <div className="flex align-center" style={{ gap: "0.4rem" }}>
                        <Tag intent="success" minimal>{form.phenotype_tag}</Tag>
                        <button className="basic-button" onClick={() => setForm(prev => ({ ...prev, phenotype_tag: null }))}>Clear</button>
                    </div>
                ) : (
                    <div className="flex flex-column" style={{ gap: "0.5rem" }}>
                        {!showManualPhenotype && (
                            <>
                                <PhenotypeInput
                                    selectedItems={[]}
                                    onPhenotypeSelection={(tag) => setForm(prev => ({ ...prev, phenotype_tag: tag }))}
                                    min_search_string_length={2}
                                />
                                <button
                                    className="basic-button flex align-center"
                                    style={{ gap: "0.3rem", color: "#137CBD", alignSelf: "flex-start" }}
                                    onClick={() => setShowManualPhenotype(true)}
                                >
                                    <span style={{ fontSize: "1.1rem", lineHeight: 1 }}>+</span>
                                    <span>Add new phenotype</span>
                                </button>
                            </>
                        )}

                        {showManualPhenotype && (
                            <div className="flex flex-column" style={{ gap: "0.4rem", border: "1px solid #e0e0e0", borderRadius: "6px", padding: "0.75rem" }}>
                                <input
                                    className="text-input"
                                    type="text"
                                    placeholder="Phenotype name (required)"
                                    value={newPhenotype.text}
                                    onChange={(e) => setNewPhenotype(prev => ({ ...prev, text: e.target.value }))}
                                />
                                <input
                                    className="text-input"
                                    type="text"
                                    placeholder="Description (optional)"
                                    value={newPhenotype.description}
                                    onChange={(e) => setNewPhenotype(prev => ({ ...prev, description: e.target.value }))}
                                />
                                <input
                                    className="text-input"
                                    type="text"
                                    placeholder="Group / category (optional)"
                                    value={newPhenotype.group_text}
                                    onChange={(e) => setNewPhenotype(prev => ({ ...prev, group_text: e.target.value }))}
                                />
                                <div className="flex" style={{ gap: "0.4rem" }}>
                                    <button
                                        className="basic-button"
                                        disabled={!newPhenotype.text.trim() || phenotypeInsertLoading}
                                        onClick={handleCreatePhenotype}
                                    >
                                        {phenotypeInsertLoading ? "Creating..." : "Create & select"}
                                    </button>
                                    <button
                                        className="basic-button"
                                        onClick={() => {
                                            setShowManualPhenotype(false)
                                            setNewPhenotype({ text: "", description: "", group_text: "" })
                                        }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                                {phenotypeInsertError && <APIError error={phenotypeInsertErrorObj} />}
                            </div>
                        )}
                    </div>
                )}
            </Section>

            <Section title="Genotype" optional>
                {form.genotype_tag || inlineGenotype ? (
                    <div className="flex align-center" style={{ gap: "0.4rem" }}>
                        {form.genotype_tag
                            ? <Tag intent="warning" minimal>{selectedGenotypeText || form.genotype_tag}</Tag>
                            : <Tag intent="success" minimal>Ready: {inlineGenotype.text}</Tag>
                        }
                        <button className="basic-button" onClick={() => {
                            setForm(prev => ({ ...prev, genotype_tag: null, protein_tag: null, protein_gene_name: null, variant_tag: null }))
                            setInlineGenotype(null)
                            setMutationInput("")
                            resetVariantLookup()
                            setGenotypeImportError(null)
                            setShowManualGenotype(false)
                        }}>Clear</button>
                    </div>
                ) : (
                    <div className="flex flex-column" style={{ gap: "0.5rem" }}>

                        {!showManualGenotype && (
                            <>
                                <GenotypeInput
                                    selectedGenotypes={[]}
                                    onItemSelect={(attribute, tag) => setForm(prev => ({ ...prev, genotype_tag: tag }))}
                                    showSelection={false}
                                    isRequired={false}
                                />
                                <button
                                    className="basic-button flex align-center"
                                    style={{ gap: "0.3rem", color: "#137CBD", alignSelf: "flex-start" }}
                                    onClick={() => setShowManualGenotype(true)}
                                >
                                    <span style={{ fontSize: "1.1rem", lineHeight: 1 }}>+</span>
                                    <span>Add manually</span>
                                </button>
                            </>
                        )}

                        {showManualGenotype && (
                            <div style={{ border: "1px solid #e0e0e0", borderRadius: "6px", padding: "0.75rem" }}>
                                <InsertEditGenotype
                                    onClose={(success, tag) => {
                                        if (success && tag) {
                                            setForm(prev => ({ ...prev, genotype_tag: tag }))
                                        }
                                        setShowManualGenotype(false)
                                    }}
                                />
                            </div>
                        )}

                        {!showManualGenotype && (
                            <>
                                <div className="flex align-center" style={{ gap: "0.4rem" }}>
                                    <div style={{ flex: 1, height: "1px", backgroundColor: "#e0e0e0" }} />
                                    <span style={{ fontSize: "0.72rem", color: "#aaa" }}>or import from ClinVar</span>
                                    <div style={{ flex: 1, height: "1px", backgroundColor: "#e0e0e0" }} />
                                </div>

                                {form.protein_tag ? (
                                    <div className="flex align-center" style={{ gap: "0.4rem" }}>
                                        <Tag intent="primary" minimal>{form.protein_tag}</Tag>
                                        {selectedProtein?.gene_name && (
                                            <span style={{ fontSize: "0.8rem", color: "#555" }}>{selectedProtein.gene_name}</span>
                                        )}
                                        <button className="basic-button" onClick={() => {
                                            setForm(prev => ({ ...prev, protein_tag: null, protein_gene_name: null, variant_tag: null }))
                                            setMutationInput("")
                                            resetVariantLookup()
                                            setGenotypeImportError(null)
                                        }}>Clear</button>
                                    </div>
                                ) : (
                                    <>
                                        <input
                                            className="search-input"
                                            type="text"
                                            placeholder="Search protein..."
                                            value={proteinSearch}
                                            onChange={(e) => setProteinSearch(e.target.value)}
                                        />
                                        {proteinsLoading && <Loading />}
                                        {_.isArray(proteinTags) && proteinSearch.length > 1 && proteinTags.map(tag => (
                                            <motion.button
                                                key={tag}
                                                className="padding--medium"
                                                style={{ border: "none", backgroundColor: "#fefefe", borderRadius: "4px", fontSize: "0.85rem", textAlign: "left", width: "100%" }}
                                                whileHover={{ backgroundColor: "#efefef" }}
                                                onClick={() => handleProteinSelect(tag)}
                                            >
                                                <strong>{tag}</strong>
                                            </motion.button>
                                        ))}
                                    </>
                                )}

                                {form.protein_tag && (
                                    <div className="flex flex-column" style={{ gap: "0.4rem" }}>
                                        <div className="flex align-center" style={{ gap: "0.4rem" }}>
                                            <input
                                                className="text-input"
                                                type="text"
                                                placeholder="Mutation (e.g. G257E, Gly257Glu)"
                                                value={mutationInput}
                                                onChange={(e) => setMutationInput(e.target.value)}
                                                style={{ flex: 1 }}
                                            />
                                            <button
                                                className="basic-button"
                                                disabled={!mutationInput || variantLookupLoading || !form.protein_gene_name}
                                                onClick={handleVariantLookup}
                                                title={!form.protein_gene_name ? "Waiting for gene name..." : ""}
                                            >
                                                {variantLookupLoading ? "Searching..." : "Check ClinVar"}
                                            </button>
                                        </div>

                                        {variantLookupData && (
                                            <div className="flex flex-column" style={{ gap: "0.3rem" }}>
                                                {variantLookupData.found ? (
                                                    <>
                                                        <span style={{ fontSize: "0.78rem", color: "#555" }}>Select a ClinVar match:</span>
                                                        {variantLookupData.variants.map(variant => (
                                                            <motion.button
                                                                key={variant.tag}
                                                                className="padding--medium flex justify-space-between align-center"
                                                                style={{
                                                                    border: form.variant_tag === variant.tag ? "1.5px solid #1a8754" : "1px solid #e0e0e0",
                                                                    borderRadius: "4px",
                                                                    backgroundColor: form.variant_tag === variant.tag ? "#f0faf5" : "#fefefe",
                                                                    fontSize: "0.8rem",
                                                                    cursor: "pointer",
                                                                    width: "100%",
                                                                    textAlign: "left",
                                                                }}
                                                                whileHover={{ backgroundColor: "#f5f5f5" }}
                                                                onClick={() => handleVariantSelect(variant)}
                                                            >
                                                                <div className="flex flex-column" style={{ gap: "0.2rem" }}>
                                                                    <strong>{variant.title}</strong>
                                                                    <span style={{ color: "#888" }}>{variant.gene_symbol ?? "—"}</span>
                                                                </div>
                                                                <Tag minimal intent={variant.clinical_significance === "Pathogenic" ? "danger" : "none"}>
                                                                    {variant.clinical_significance ?? "—"}
                                                                </Tag>
                                                            </motion.button>
                                                        ))}
                                                    </>
                                                ) : (
                                                    <span style={{ fontSize: "0.78rem", color: "#888" }}>No ClinVar match found.</span>
                                                )}
                                            </div>
                                        )}

                                        {inlineGenotype ? (
                                            <div className="flex align-center" style={{ gap: "0.4rem" }}>
                                                <Tag intent="success" minimal>Ready: {inlineGenotype.text}</Tag>
                                                <button className="basic-button" onClick={() => {
                                                    setInlineGenotype(null)
                                                    setForm(prev => ({ ...prev, variant_tag: null }))
                                                }}>Clear</button>
                                            </div>
                                        ) : form.variant_tag && (
                                            <div className="flex align-center" style={{ gap: "0.4rem" }}>
                                                <button
                                                    className="basic-button"
                                                    disabled={genotypeImportLoading || !selectedProtein?.proteome_tag}
                                                    onClick={handleImportAsGenotype}
                                                    title={!selectedProtein?.proteome_tag ? "Proteome not resolved" : ""}
                                                >
                                                    {genotypeImportLoading ? "Importing..." : "Import as Genotype"}
                                                </button>
                                                <button
                                                    className="basic-button"
                                                    onClick={() => setForm(prev => ({ ...prev, variant_tag: null }))}
                                                >
                                                    Clear variant
                                                </button>
                                            </div>
                                        )}

                                        {genotypeImportError && (
                                            <span style={{ fontSize: "0.78rem", color: "#c0392b" }}>{genotypeImportError}</span>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </Section>

            <Section title="Disease" optional>
                {form.disease_tag ? (
                    <div className="flex align-center" style={{ gap: "0.4rem" }}>
                        <Tag intent="primary" minimal>{form.disease_tag}</Tag>
                        <button className="basic-button" onClick={() => setForm(prev => ({ ...prev, disease_tag: null }))}>Clear</button>
                    </div>
                ) : (
                    <div className="flex flex-column" style={{ gap: "0.3rem" }}>
                        <input
                            className="search-input"
                            type="text"
                            placeholder="Search ClinVar diseases..."
                            value={diseaseSearch}
                            onChange={(e) => setDiseaseSearch(e.target.value)}
                        />
                        {clinvarDiseaseLoading && <Loading />}
                        {_.isArray(clinvarDiseaseData?.diseases) && clinvarDiseaseData.diseases.map(d => (
                            <motion.button
                                key={d.tag}
                                className="padding--medium"
                                style={{ border: "none", backgroundColor: "#fefefe", borderRadius: "4px", fontSize: "0.85rem", textAlign: "left", width: "100%" }}
                                whileHover={{ backgroundColor: "#efefef" }}
                                onClick={() => handleDiseaseSelect(d)}
                            >
                                <strong>{d.text}</strong>
                                <span style={{ marginLeft: "0.5rem", color: "#888", fontSize: "0.78rem" }}>{d.tag}</span>
                            </motion.button>
                        ))}
                        <div className="flex flex-column" style={{ gap: "0.3rem", marginTop: "0.4rem" }}>
                            <span style={{ fontSize: "0.72rem", color: "#aaa" }}>Not in ClinVar? Enter manually:</span>
                            <input
                                className="text-input"
                                type="text"
                                placeholder="Disease name (free text)"
                                value={form.disease_text}
                                onChange={(e) => setForm(prev => ({ ...prev, disease_text: e.target.value, disease_tag: null }))}
                            />
                        </div>
                    </div>
                )}
            </Section>

            <Section title="Publication" optional>
                <input
                    className="text-input"
                    type="text"
                    placeholder="PMID (e.g. 12345678)"
                    value={form.publication}
                    onChange={(e) => setForm(prev => ({ ...prev, publication: e.target.value }))}
                />
            </Section>

            <Section title="Experimental Conditions" optional>
                <AttributesInput
                    handleTraitSelection={handleConditionTraitSelection}
                    min_state={0}
                    param_name="allow_for_sample"
                    selected_traits={conditionTraits}
                    showSelection={true}
                    placeHolderText="Search conditions (HEK, HeLa, treatment, ...)"
                />
                {conditionTraits.length > 0 && (
                   <DatasetAttributeView
                   submission_tag={null}
                   attributeTraits={conditionTraits}
                   handleTraitRemove={handleConditionTraitSelection}
                   getSelectionByPath={(path) => {
                       path = addIDToPath(path, "pa_condition")
                       return findChildrenByPath(conditionTraits, path)
                   }}
                   onChildrenSelection={handleConditionTraitSelection}
                   checkAttributeRequiredTraits={() => true}
               />
                )}
            </Section>

            {isError && <APIError error={error} />}

            <div className="flex justify-end" style={{ gap: "0.4rem", marginTop: "auto" }}>
                <button
                    className="dialog-button"
                    style={{ backgroundColor: "#ec7160ff" }}
                    onClick={() => onClose(false)}
                >
                    Close
                </button>
                <button
                    className="dialog-button"
                    disabled={!isReady || isLoading}
                    onClick={handleSubmit}
                >
                    {isLoading ? "Inserting..." : "Insert"}
                </button>
            </div>
        </div>
    )
}

function Section({ title, children, required = false, optional = false }) {
    return (
        <div className="flex flex-column" style={{ gap: "0.4rem" }}>
            <div className="flex align-center" style={{ gap: "0.4rem" }}>
                <span style={{ fontWeight: 600, fontSize: "0.85rem" }}>{title}</span>
                {required && <Tag minimal intent="danger" style={{ fontSize: "0.7rem" }}>required</Tag>}
                {optional && <Tag minimal style={{ fontSize: "0.7rem" }}>optional</Tag>}
            </div>
            {children}
        </div>
    )
}