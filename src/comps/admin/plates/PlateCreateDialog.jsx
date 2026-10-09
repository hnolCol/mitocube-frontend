import { Button, Callout, Dialog, DialogBody, DialogFooter, FormGroup, HTMLSelect, InputGroup, TextArea } from "@blueprintjs/core"
import { useEffect, useState } from "react"
import { api } from "@/api"
import APIError from "../../core/error/APIerror"
import Loading from "../../core/base/loading"

const initPlate = {
    format_trait_tag: "",
    name: "",
    cold_storage_trait_tag: "",
    plate_type_trait_tag: "",
    vendor_trait_tag: "",
    location: "",
    description: ""
}

/**
 * @description Optional trait select with an empty "–" option.
 */
function TraitSelect({ id, value, options, onChange }) {
    return (
        <HTMLSelect
            id={id}
            fill
            value={value}
            onChange={(e) => onChange(e.target.value)}
            options={[{ value: "", label: "–" }, ...(options || []).map(o => ({ value: o.tag, label: o.text }))]}
        />
    )
}

/**
 * @description Dialog to create a new plate. Format, cold storage, plate type and vendor are traits
 * of the storage attributes and are stored as condition applications of the plate.
 * @param {Object} props
 * @param {Boolean} props.isOpen If the dialog is open.
 * @param {Function} props.onClose Called on close.
 * @param {Function} props.onCreated Called with the created plate.
 */
export function PlateCreateDialog({ isOpen, onClose, onCreated }) {

    const [plate, setPlate] = useState(initPlate)

    const { data: options, isLoading: optionsLoading, isError: optionsIsError, error: optionsError } =
        api.plates.plates.useGetPlateOptions({ enabled: isOpen })

    // preselect 96 wells (or the first format) when the options are loaded
    useEffect(() => {
        if (isOpen && options?.formats?.length > 0 && !plate.format_trait_tag) {
            const preferred = options.formats.find(f => f.rows * f.columns === 96) || options.formats[0]
            setPlate(prev => ({ ...prev, format_trait_tag: preferred.tag }))
        }
    }, [isOpen, options])

    const format = options?.formats?.find(f => f.tag === plate.format_trait_tag)

    const { data: suggestedName, refetch: refetchName } = api.plates.plates.useGetNextPlateName(
        { rows: format?.rows, columns: format?.columns },
        { enabled: isOpen && !!format }
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

    const isFormValid = plate.name.trim().length > 0 && !!format

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
                format_trait_tag: plate.format_trait_tag,
                cold_storage_trait_tag: plate.cold_storage_trait_tag || null,
                plate_type_trait_tag: plate.plate_type_trait_tag || null,
                vendor_trait_tag: plate.vendor_trait_tag || null,
                location: plate.location.trim() || null,
                description: plate.description.trim() || null
            }
        })
    }

    return (
        <Dialog isOpen={isOpen} onClose={handleClose} title="Create Plate" style={{ minWidth: "min(500px,95vw)" }}>
            <DialogBody>
                {optionsLoading ? <Loading /> : optionsIsError ? <APIError error={optionsError} /> : (
                    <>
                        {options?.formats?.length === 0 && (
                            <Callout intent="warning" style={{ marginBottom: "1rem" }}>
                                No plate formats defined. Add traits to the "Plates" attribute (value e.g. 8x12) in the attributes admin view.
                            </Callout>
                        )}

                        <FormGroup label="Format" labelFor="plate-format" labelInfo="(required)">
                            <HTMLSelect
                                id="plate-format"
                                fill
                                value={plate.format_trait_tag}
                                onChange={(e) => handleChange("format_trait_tag", e.target.value)}
                                options={(options?.formats || []).map(f => ({ value: f.tag, label: f.description ? `${f.description} (${f.text})` : f.text }))}
                            />
                        </FormGroup>

                        <FormGroup label="Name" labelFor="plate-name" labelInfo="(required)" helperText="Write this name on the plate label. Must be unique.">
                            <InputGroup
                                id="plate-name"
                                value={plate.name}
                                maxLength={50}
                                onChange={(e) => handleChange("name", e.target.value)}
                            />
                        </FormGroup>

                        <FormGroup label="Cold storage" labelFor="plate-cold-storage" labelInfo="(optional)">
                            <TraitSelect id="plate-cold-storage" value={plate.cold_storage_trait_tag} options={options?.cold_storage}
                                onChange={(v) => handleChange("cold_storage_trait_tag", v)} />
                        </FormGroup>

                        <FormGroup label="Plate type" labelFor="plate-type" labelInfo="(optional)">
                            <TraitSelect id="plate-type" value={plate.plate_type_trait_tag} options={options?.plate_type}
                                onChange={(v) => handleChange("plate_type_trait_tag", v)} />
                        </FormGroup>

                        <FormGroup label="Vendor" labelFor="plate-vendor" labelInfo="(optional)">
                            <TraitSelect id="plate-vendor" value={plate.vendor_trait_tag} options={options?.vendor}
                                onChange={(v) => handleChange("vendor_trait_tag", v)} />
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