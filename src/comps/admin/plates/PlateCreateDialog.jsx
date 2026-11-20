import { Button, Callout, Dialog, DialogBody, DialogFooter, FormGroup, HTMLSelect, InputGroup, TextArea } from "@blueprintjs/core"
import { useEffect, useState } from "react"
import { api } from "@/api"
import APIError from "../../core/error/APIerror"
import Loading from "../../core/base/loading"

const initPlate = {
    name: "",
    trait_tags: {},   // attribute_tag -> selected trait_tag
    location: "",
    description: ""
}

/**
 * @description Optional trait select with an empty "-" option.
 */
function TraitSelect({ id, value, options, onChange }) {
    return (
        <HTMLSelect
            id={id}
            fill
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            options={[{ value: "", label: "\u2013" }, ...(options || []).map(o => ({ value: o.tag, label: o.text }))]}
        />
    )
}

/**
 * @description One attribute of the storage attribute group with its child attributes. Child
 * attributes (e.g. a container material under the container format) only appear once a trait
 * of the parent attribute is selected, like in the condition application selects.
 */
function AttributeSelect({ attribute, trait_tags, onChange, childrenSelects }) {
    const selectedTrait = trait_tags[attribute.tag]
    const isFormat = attribute.is_format
    return (
        <>
            <FormGroup
                label={attribute.text}
                labelFor={`plate-attribute-${attribute.tag}`}
                labelInfo={isFormat ? "(required)" : "(optional)"}
                helperText={attribute.description}
            >
                {isFormat ? (
                    <HTMLSelect
                        id={`plate-attribute-${attribute.tag}`}
                        fill
                        value={selectedTrait || ""}
                        onChange={(e) => onChange(attribute.tag, e.target.value)}
                        options={(attribute.traits || []).map(o => ({ value: o.tag, label: o.description ? `${o.description} (${o.text})` : o.text }))}
                    />
                ) : (
                    <TraitSelect
                        id={`plate-attribute-${attribute.tag}`}
                        value={selectedTrait}
                        options={attribute.traits}
                        onChange={(v) => onChange(attribute.tag, v)}
                    />
                )}
            </FormGroup>
            {childrenSelects && selectedTrait ? <div className="padding-left--medium">{childrenSelects}</div> : null}
        </>
    )
}

/**
 * @description Dialog to create a new plate. The plate is fully defined by the attributes of the
 * storage attribute group: every attribute added to the group (also nested child attributes)
 * is offered as a select and the selected traits are stored as condition applications of the plate.
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

    // preselect 96 wells (or the first format) when the options are loaded
    useEffect(() => {
        if (isOpen && formatAttributes.length > 0) {
            setPlate(prev => {
                const trait_tags = { ...prev.trait_tags }
                for (const attribute of formatAttributes) {
                    if (trait_tags[attribute.tag]) continue
                    const preferred = attribute.traits.find(t => t.rows * t.columns === 96) || attribute.traits[0]
                    if (preferred) trait_tags[attribute.tag] = preferred.tag
                }
                return { ...prev, trait_tags }
            })
        }
    }, [isOpen, options])

    const selectedFormatTrait = formatAttributes
        .map(a => a.traits.find(t => t.tag === plate.trait_tags[a.tag]))
        .find(t => !!t)

    const { data: suggestedName, refetch: refetchName } = api.plates.plates.useGetNextPlateName(
        { rows: selectedFormatTrait?.rows, columns: selectedFormatTrait?.columns },
        { enabled: isOpen && !!selectedFormatTrait?.rows && !!selectedFormatTrait?.columns }
    )

    // fill in the suggested name when the format changes
    useEffect(() => {
        if (isOpen && suggestedName) setPlate(prev => ({ ...prev, name: suggestedName }))
    }, [suggestedName, isOpen])

    const { mutate: postPlate, isLoading, isError, error, reset } = api.plates.plates.usePostPlate({
        onSuccess: (createdPlate) => {
            onCreated?.(createdPlate)
            refetchName()
            handleClose()
        }
    })

    const isFormValid = plate.name.trim().length > 0 && !!selectedFormatTrait?.rows && !!selectedFormatTrait?.columns

    const handleChange = (key, value) => setPlate(prev => ({ ...prev, [key]: value }))

    const handleTraitChange = (attributeTag, traitTag) => setPlate(prev => {
        const trait_tags = { ...prev.trait_tags }
        if (traitTag) trait_tags[attributeTag] = traitTag
        else delete trait_tags[attributeTag]
        return { ...prev, trait_tags }
    })

    const handleClose = () => {
        setPlate(initPlate)
        reset()
        onClose()
    }

    const handleSubmit = () => {
        postPlate({
            plate: {
                name: plate.name.trim(),
                trait_tags: Object.fromEntries(Object.entries(plate.trait_tags).filter(([, t]) => !!t)),
                location: plate.location.trim() || null,
                description: plate.description.trim() || null
            }
        })
    }

    const rootAttributes = attributes.filter(a => !a.parent_tag)
    const childAttributesOf = (attributeTag) => attributes.filter(a => a.parent_tag === attributeTag)

    const renderAttribute = (attribute) => {
        const childTags = childAttributesOf(attribute.tag)
        const childrenSelects = childTags.length > 0 && plate.trait_tags[attribute.tag]
            ? childTags.map(child => renderAttribute(child))
            : null
        return (
            <AttributeSelect
                key={attribute.tag}
                attribute={attribute}
                trait_tags={plate.trait_tags}
                onChange={handleTraitChange}
                childrenSelects={childrenSelects}
            />
        )
    }

    return (
        <Dialog isOpen={isOpen} onClose={handleClose} title="Create Plate" style={{ minWidth: "min(500px,95vw)" }}>
            <DialogBody>
                {optionsLoading ? <Loading /> : optionsIsError ? <APIError error={optionsError} /> : (
                    <>
                        {isOpen && formatAttributes.length === 0 && (
                            <Callout className="margin-bottom--medium" intent="warning">
                                No container format defined. Add traits with values of the form '&lt;rows&gt;x&lt;columns&gt;' (e.g. 8x12)
                                to an attribute of the storage attribute group in the attributes admin view.
                            </Callout>
                        )}

                        {rootAttributes.map(attribute => renderAttribute(attribute))}

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
