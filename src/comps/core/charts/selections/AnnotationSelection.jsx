import { useState } from "react"
import { Button, Icon, Dialog, Intent, Divider } from "@blueprintjs/core"

import { AnnotationSelectionMenu } from "../../base/annotations/AnnotationSelectionMenu";

import PropTypes from "prop-types"
import _ from "lodash"


AnnotationSelection.propTypes = {
    onAnnotationSelect: PropTypes.func.isRequired,
    minimal: PropTypes.bool,
}

AnnotationSelection.defaultProps = {
    minimal: true,
}

export function AnnotationSelection({ onAnnotationSelect, minimal }) {
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [selectedAnnotationTags, setSelectedAnnotationTags] = useState([])
    const [selectedColor, setSelectedColor] = useState("#E74C3C")
    const [isLoadingProteins, setIsLoadingProteins] = useState(false)

    const handleAnnotationSelection = (e, tags) => {
        if (_.isArray(tags)) {
            setSelectedAnnotationTags(tags)
        } else {
            setSelectedAnnotationTags([tags])
        }
    }

    const handleAnnotationRemove = (e, tag) => {
        setSelectedAnnotationTags(prev => prev.filter(t => t !== tag))
    }

    const handleConfirm = async () => {
        if (selectedAnnotationTags.length === 0) return
    
        setIsLoadingProteins(true)
        
        try {
            const allProteinTags = []
            
            // Fetch proteins for each selected annotation
            for (const annotationTag of selectedAnnotationTags) {
                try {
                    const response = await fetch(`/api/annotations/${annotationTag}`)
                    if (response.ok) {
                        const annotation = await response.json()
                        
                        // Get protein_tags from the annotation
                        const proteinTags = annotation.protein_tags || []
                        
                        if (_.isArray(proteinTags)) {
                            allProteinTags.push(...proteinTags)
                        }
                        
                        console.log(`Annotation ${annotationTag}: ${proteinTags.length} proteins`)
                    } else {
                        console.error(`Failed to fetch annotation ${annotationTag}:`, response.status)
                    }
                } catch (err) {
                    console.error(`Error fetching annotation ${annotationTag}:`, err)
                }
            }
            
            const uniqueProteinTags = [...new Set(allProteinTags)]

            if (uniqueProteinTags.length === 0) {
                alert("No proteins found for the selected annotations")
                setIsLoadingProteins(false)
                return
            }
            
            onAnnotationSelect(selectedAnnotationTags, selectedColor, uniqueProteinTags)
            setIsDialogOpen(false)
            setSelectedAnnotationTags([])
            setSelectedColor("#E74C3C")
        } catch (error) {
            console.error("Error fetching proteins for annotations:", error)
            alert("Error fetching proteins: " + error.message)
        } finally {
            setIsLoadingProteins(false)
        }
    }

    const colorOptions = [
        { value: "#E74C3C", label: "Red" },
        { value: "#3498DB", label: "Blue" },
        { value: "#2ECC71", label: "Green" },
        { value: "#F39C12", label: "Orange" },
        { value: "#9B59B6", label: "Purple" },
        { value: "#1ABC9C", label: "Turquoise" },
        { value: "#E91E63", label: "Pink" },
        { value: "#FF5722", label: "Deep Orange" }
    ]

    return (
        <>
<Button
    minimal={minimal}
    icon={<Icon icon="tint" />}
    onClick={() => setIsDialogOpen(true)}
    title="Color proteins by annotation"
/>
            
<Dialog
    isOpen={isDialogOpen}
    onClose={() => setIsDialogOpen(false)}
    title="Mark Proteins by Annotation"
    style={{ width: "500px" }}
>
    <div className="bp5-dialog-body">
        {/* Annotation Selection */}
        <div style={{ marginBottom: "1rem" }}>
            <label className="bp5-label">
                Select Annotations
                <div style={{ fontSize: "0.75rem", color: "#5C7080", marginTop: "0.25rem", marginBottom: "0.5rem" }}>
                    Choose annotations to highlight in the plot
                </div>
            </label>
            <AnnotationSelectionMenu
                placeholder="Search annotations..."
                onSelection={handleAnnotationSelection}
                onRemove={handleAnnotationRemove}
                selected_tags={selectedAnnotationTags}
                showTags={true}
            />
        </div>

        <Divider />

       {/* Color Selection */}
<div style={{ marginTop: "1rem", marginBottom: "1rem" }}>
    <label className="bp5-label" style={{ marginBottom: "0.5rem" }}>
        Marker Color
    </label>
    
    <div style={{ 
        display: "flex",
        gap: "6px",
        flexWrap: "wrap",
        alignItems: "center"
    }}>
        {colorOptions.slice(0, 8).map((colorOption) => (
            <button
                key={colorOption.value}
                onClick={() => setSelectedColor(colorOption.value)}
                style={{
                    width: "28px",
                    height: "28px",
                    backgroundColor: colorOption.value,
                    border: selectedColor === colorOption.value 
                        ? "2px solid #000" 
                        : "1px solid #ccc",
                    borderRadius: "4px",
                    cursor: "pointer",
                    padding: 0
                }}
                title={colorOption.label}
            />
        ))}
        
        {/* More colors button - opens system color picker */}
        <label 
            style={{ 
                width: "28px",
                height: "28px",
                border: "1px dashed #ccc",
                borderRadius: "4px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "16px",
                fontWeight: "bold",
                color: "#5C7080",
                position: "relative",
                backgroundColor: "#f9f9f9"
            }}
            title="More colors..."
        >
            +
            <input
                type="color"
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                style={{ 
                    position: "absolute",
                    opacity: 0,
                    width: "100%",
                    height: "100%",
                    cursor: "pointer"
                }}
            />
        </label>
    </div>
</div>

        {/* Summary */}
        {selectedAnnotationTags.length > 0 && (
            <div style={{ 
                padding: "8px 12px", 
                backgroundColor: "#F5F8FA", 
                borderRadius: "3px",
                fontSize: "0.8rem",
                color: "#5C7080",
                display: "flex",
                alignItems: "center",
                gap: "8px"
            }}>
                <span>
                    <strong>{selectedAnnotationTags.length}</strong> annotation{selectedAnnotationTags.length > 1 ? 's' : ''} selected
                </span>
                <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "4px" }}>
                    Color:
                    <span style={{ 
                        display: "inline-block",
                        width: "14px",
                        height: "14px",
                        backgroundColor: selectedColor,
                        border: "1px solid #000",
                        borderRadius: "2px"
                    }} />
                </span>
            </div>
        )}
    </div>

    <div className="bp5-dialog-footer">
        <div className="bp5-dialog-footer-actions">
            <Button onClick={() => setIsDialogOpen(false)}>
                Cancel
            </Button>
            <Button
                intent={Intent.PRIMARY}
                onClick={handleConfirm}
                disabled={selectedAnnotationTags.length === 0 || isLoadingProteins}
                loading={isLoadingProteins}
            >
                {isLoadingProteins ? "Loading..." : "Apply"}
            </Button>
        </div>
    </div>
</Dialog>
        </>
    )
}