import { Button, Callout, Dialog, DialogBody, DialogFooter, FormGroup, InputGroup, TextArea } from "@blueprintjs/core"
import { useEffect, useState } from "react"
import { api } from "@/api"
import APIError from "../../core/error/APIerror"
import Loading from "../../core/base/loading"
import _ from "lodash"
import { AttributesInput } from "../../core/input/api/DatasetAttributeInput"
import { DatasetAttributeView } from "../../core/base/attributes/DatasetAttributeView"
import { TraitsInput } from "../../core/input/api/TraitsInput"
import { findAndInsertTree, findChildrenByPath, findPath, deleteByPath, checkPathExists, addIDToPath, findNode } from "../../submission/new/sample_attributes/select/SamplesAttributeWrapper"

// reference id of the plate-to-be; like the submission tag it scopes the selected traits tree
const PLATE_REFERENCE_ID = "new-plate"

const initPlate = {
    name: "",
    selected_traits: [],   // selected traits tree like the submission dataset attributes
    location: "",
    description: ""
}

/**
 * @description Flattens the selected traits tree into (attribute_tag, trait_tag) pairs. The
 * attribute of a trait is its nearest ancestor attribute node, so child attributes that were
 * entered under a parent trait keep their own attribute tag.
 */
function getSelectedTraitPairs(nodes, attribute_tag = undefined, acc = []) {
    if (!_.isArray(nodes)) return acc
    nodes.forEach(node => {
        if (!_.isObject(node) || !_.isString(node.tag)) return
        if (node.type === "attribute") {
            getSelectedTraitPairs(node.children, node.tag, acc)
        } else if (node.type === "trait") {
            if (_.isString(attribute_tag)) acc.push({ attribute_tag, trait_tag: node.tag })
            getSelectedTraitPairs(node.children, attribute_tag, acc)
        }
    })
    return acc
}

/**
 * @description Like the dataset attributes of a submission: the mandatory attributes of the
 * storage attribute group are entered directly, the other storage attributes can be added via
 * the additional attributes input. The selected traits are rendered below as condition
 * applications (child attributes can be entered under a selected trait) and are stored as
 * condition applications of the plate.
 * The attribute whose traits have values of the form '<rows>x<columns>' is the container format.
 * @param {Object} props
 * @param {Boolean} props.isOpen If the dialog is open.
 * @param {Function} props.onClose Called on close.
 * @param {Function} props.onCreated Called with the created plate.
 */
export function PlateCreateDialog({ isOpen, onClose, onCreated }) {

    const [plate, setPlate] = useState(initPlate)

    const { data: options, isLoading: optionsLoading, isError: optionsIsError, error: optionsError } =
        api.plates.plates.useGetPlateOptions({ enabled: isOpen })

    const attributes = options?.attributes || []
    const formatAttributes = attributes.filter(a => a.is_format)
    // attributes that are also part of the mandatory attribute group are entered directly;
    // the mandatory flag comes from the database (storage group + mandatory group membership)
    const mandatoryAttributes = attributes.filter(a => a.mandatory && !a.parent_tag)

    const getSelectionByPath = (path) => findChildrenByPath(plate.selected_traits, path)

    const findDataForPath = (path) => {
        path = addIDToPath(path, PLATE_REFERENCE_ID)
        return findPath(plate.selected_traits, path)
    }

    const handleTraitSelectionHierarchy = (path, rowIndex, enforceSingleVariantPerGroup = false, replaceChildrenAtLeaf = false, singleTrait = false, checkExists = false) => {
        //row index is just for the table, not used here.
        path = addIDToPath(path, PLATE_REFERENCE_ID)
        let selected_traits = plate.selected_traits.slice()
        const pathExists = checkPathExists(selected_traits, path, true)
        const isValueInput = _.has(_.last(path), "value") && _.isString(_.last(path).value)
        if (checkExists && pathExists && !isValueInput) {
            deleteByPath(selected_traits, path, true)
        } else {
            findAndInsertTree(selected_traits, path, {
                enforceSingleVariantPerGroup,
                replaceChildrenAtLeaf,
                singleTrait
            })
        }
        setPlate(prevValues => { return { ...prevValues, selected_traits } })
    }

    const mandatoryTraitSelect = (path, rowIndex, enforceSingleVariantPerGroup = false, replaceChildrenAtLeaf = false, singleTrait = false) => {
        handleTraitSelectionHierarchy(path, rowIndex, enforceSingleVariantPerGroup, replaceChildrenAtLeaf, singleTrait, true)
    }

    const handleTraitRemove = (path) => {
        let selected_traits = plate.selected_traits.slice()
        deleteByPath(selected_traits, path, false)
        setPlate(prevValues => { return { ...prevValues, selected_traits } })
    }

    // clicking a selected trait in the additional attributes menu removes it again
    const handleTraitDeselect = (path) => {
        let selected_traits = plate.selected_traits.slice()
        deleteByPath(selected_traits, addIDToPath(path, PLATE_REFERENCE_ID), true)
        setPlate(prevValues => { return { ...prevValues, selected_traits } })
    }

    const checkAttributeRequiredTraits = (attribute_tag, trait_tags) => {
        const selected_traits = plate.selected_traits.slice()
        const foundNode = trait_tags.map(trait_tag => findNode(selected_traits, "trait", trait_tag, PLATE_REFERENCE_ID))
        return _.some(foundNode)
    }

    const selectedPairs = getSelectedTraitPairs(plate.selected_traits)
    // the plate API expects one trait per attribute
    const trait_tags = Object.fromEntries(selectedPairs.map(p => [p.attribute_tag, p.trait_tag]))

    // a mandatory attribute must have a selected trait as soon as it is reachable, i.e. its
    // parent chain is selected (mandatory child attributes only apply under a selected parent,
    // like in the backend insert validation); mandatory root attributes always apply
    const hasSelectedTrait = (attribute_tag) => _.isString(trait_tags[attribute_tag])
    const isParentChainSelected = (attribute) => {
        let parent_tag = attribute.parent_tag
        while (_.isString(parent_tag)) {
            if (!hasSelectedTrait(parent_tag)) return false
            parent_tag = attributes.find(a => a.tag === parent_tag)?.parent_tag
        }
        return true
    }
    const missingMandatoryAttributes = attributes
        .filter(a => a.mandatory && !hasSelectedTrait(a.tag) && isParentChainSelected(a))

    const selectedFormatTrait = formatAttributes
        .flatMap(a => a.traits.map(t => ({ ...t, attribute_tag: a.tag })))
        .find(t => trait_tags[t.attribute_tag] === t.tag) || null


    // preselect 96 wells (or the first format) when the options are loaded
    useEffect(() => {
        if (isOpen && formatAttributes.length > 0) {
            const formatAttribute = formatAttributes[0]
            const preferred = formatAttribute.traits.find(t => t.rows * t.columns === 96) || formatAttribute.traits[0]
            if (preferred && !trait_tags[formatAttribute.tag]) {
                handleTraitSelectionHierarchy([
                    { type: "attribute", tag: formatAttribute.tag },
                    { type: "trait", tag: preferred.tag, id: PLATE_REFERENCE_ID }
                ])
            }
        }
    }, [isOpen, options])

    const { data: suggestedName, refetch: refetchName } = api.plates.plates.useGetNextPlateName(
        { rows: selectedFormatTrait?.rows, columns: selectedFormatTrait?.columns },
        { enabled: isOpen && !!selectedFormatTrait?.rows && !!selectedFormatTrait?.columns }
    )

    // fill in the suggested name when the format changes
    useEffect(() => {
        if (isOpen && suggestedName) setPlate(prevValues => ({ ...prevValues, name: suggestedName }))
    }, [suggestedName, isOpen])

    const { mutate: postPlate, isLoading, isError, error, reset } = api.plates.plates.usePostPlate({
        onSuccess: (createdPlate) => {
            onCreated?.(createdPlate)
            refetchName()
            handleClose()
        }
    })

    const isFormValid = plate.name.trim().length > 0 && !!selectedFormatTrait?.rows && !!selectedFormatTrait?.columns
        && missingMandatoryAttributes.length === 0

    const handleChange = (key, value) => setPlate(prev => ({ ...prev, [key]: value }))

    const handleClose = () => {
        setPlate(initPlate)
        reset()
        onClose()
    }

    const handleSubmit = () => {
        postPlate({
            plate: {
                name: plate.name.trim(),
                trait_tags: trait_tags,
                location: plate.location.trim() || null,
                description: plate.description.trim() || null
            }
        })
    }

    return (
        <Dialog isOpen={isOpen} onClose={handleClose} title="Create Plate" style={{ minWidth: "min(650px,95vw)" }}>
            <DialogBody>
                {optionsLoading ? <Loading /> : optionsIsError ? <APIError error={optionsError} /> : (
                    <>
                        {isOpen && formatAttributes.length === 0 && (
                            <Callout className="margin-bottom--medium" intent="warning">
                                No container format defined. Add traits with values of the form '&lt;rows&gt;x&lt;columns&gt;' (e.g. 8x12)
                                to an attribute of the storage attribute group in the attributes admin view.
                            </Callout>
                        )}

                        <FormGroup label="Name" labelFor="plate-name" labelInfo="(required)" helperText="Write this name on the plate label. Must be unique.">
                            <InputGroup
                                id="plate-name"
                                value={plate.name}
                                maxLength={50}
                                onChange={(e) => handleChange("name", e.target.value)}
                            />
                        </FormGroup>

                        <FormGroup label="Location" labelFor="plate-location" labelInfo="(optional)">
                            <InputGroup
                                id="plate-location"
                                value={plate.location}
                                maxLength={200}
                                onChange={(e) => handleChange("location", e.target.value)}
                            />
                        </FormGroup>

                        <FormGroup label="Description" labelFor="plate-description" labelInfo="(optional)">
                            <TextArea
                                id="plate-description"
                                fill
                                value={plate.description}
                                onChange={(e) => handleChange("description", e.target.value)}
                            />
                        </FormGroup>

                        {mandatoryAttributes.map(attribute => {
                            const path = [{ type: "attribute", tag: attribute.tag, id: attribute.tag }]
                            const selection = findDataForPath(path)
                            return (
                                <TraitsInput
                                    key={attribute.tag}
                                    attribute_tag={attribute.tag}
                                    onItemSelect={mandatoryTraitSelect}
                                    path={path}
                                    isMandatory={true}
                                    referenceID={PLATE_REFERENCE_ID}
                                    selected_traits={_.isObject(selection) && _.isArray(selection.children) && selection.children.length > 0
                                        ? selection.children.map(c => c.tag)
                                        : []}
                                />
                            )
                        })}
                        {missingMandatoryAttributes.length > 0 && (
                            <Callout className="margin-bottom--medium" intent="warning">
                                Select a trait for: {missingMandatoryAttributes.map(a => a.text).join(", ")}.
                            </Callout>
                        )}

                        <h4>Additional Attributes</h4>
                        <AttributesInput
                            handleTraitSelection={handleTraitSelectionHierarchy}
                            handleTraitDeselect={handleTraitDeselect}
                            min_state={0}
                            selected_traits={plate.selected_traits}
                            checkMandatoryAttributes={false}
                            attribute_tags={attributes.map(a => a.tag)}
                            placeHolderText="Search storage attribute (format, storage, vendor, container, ...)"
                        />
                        <span className="font-size--smallest">Vendor, plate type, color, ... anything that describes the storage of the plate.</span>
                        <DatasetAttributeView
                            getSelectionByPath={getSelectionByPath}
                            attributeTraits={plate.selected_traits}
                            onChildrenSelection={handleTraitSelectionHierarchy}
                            handleTraitRemove={handleTraitRemove}
                            checkAttributeRequiredTraits={checkAttributeRequiredTraits}
                        />

                        {isError && <APIError error={error} />}
                    </>
                )}
            </DialogBody>

            <DialogFooter minimal={true} actions={<div>
                <Button text="Create" icon="add" intent="primary" onClick={handleSubmit} loading={isLoading} disabled={isLoading || !isFormValid} />
                <Button text="Cancel" onClick={handleClose} disabled={isLoading} />
            </div>} />
        </Dialog>
    )
}
