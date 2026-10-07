import { useState } from "react";
import { Button, Checkbox, Dialog, DialogBody, DialogFooter, Intent, Tooltip } from "@blueprintjs/core";
import _ from "lodash";
import { api } from "@/api";
import { downloadMarkdownFile } from "@/services/downloads/md";

const EXPORT_SECTIONS = [
    { key: "include_metatext", label: "Research aim & metatexts" },
    { key: "include_condition_applications", label: "Condition applications" },
    { key: "include_samples", label: "Samples" },
    { key: "include_protocols", label: "Protocols" },
    { key: "include_runlist", label: "Run lists" },
    { key: "include_timeline", label: "Timeline (state history & events)" },
];

const DEFAULT_SELECTION = {
    ...Object.fromEntries(EXPORT_SECTIONS.map(s => [s.key, true])),
    include_protocol_text: true,
};

export function ExportMarkdownButton({ submission_tag }) {
    const [isOpen, setIsOpen] = useState(false);
    const [selection, setSelection] = useState(DEFAULT_SELECTION);
    const { mutate, isPending, isError } = api.submissions.core.useDownloadSubmissionMarkdownFile()

    const toggle = (key) => setSelection(prev => ({ ...prev, [key]: !prev[key] }));

    const sectionValues = EXPORT_SECTIONS.map(s => selection[s.key]);
    const allSelected = sectionValues.every(Boolean);
    const toggleAll = () => setSelection(prev => ({
        ...prev,
        ...Object.fromEntries(EXPORT_SECTIONS.map(s => [s.key, !allSelected])),
    }));

    const handleExport = () => {
        mutate(
            { tag: submission_tag, ...selection },
            {
                onSuccess: (blob) => {
                    downloadMarkdownFile(blob, `submission_${submission_tag}`)
                    setIsOpen(false)
                }
            }
        )
    }

    return (
        <>
            <Tooltip content="Export metadata (.md)" placement="bottom">
                <Button
                    minimal
                    icon="download"
                    disabled={!_.isString(submission_tag)}
                    onClick={() => setIsOpen(true)}
                />
            </Tooltip>

            <Dialog
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                title="Export submission metadata"
                icon="document"
                style={{ width: 400 }}
            >
                <DialogBody>
                    <p>Select the sections to include in the export. Title and researchers are always included.</p>
                    <Checkbox
                        label="Select all"
                        checked={allSelected}
                        indeterminate={!allSelected && sectionValues.some(Boolean)}
                        onChange={toggleAll}
                    />
                    <div style={{ marginLeft: "1rem" }}>
                        {EXPORT_SECTIONS.map(s => (
                            <div key={s.key}>
                                <Checkbox
                                    label={s.label}
                                    checked={selection[s.key]}
                                    onChange={() => toggle(s.key)}
                                />
                                {s.key === "include_protocols" && (
                                    <Checkbox
                                        style={{ marginLeft: "1.5rem" }}
                                        label="Include protocol text"
                                        checked={selection.include_protocol_text}
                                        disabled={!selection.include_protocols}
                                        onChange={() => toggle("include_protocol_text")}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                    {isError && <p style={{ color: "#c23030" }}>Export failed. Please try again.</p>}
                </DialogBody>
                <DialogFooter
                    actions={
                        <>
                            <Button text="Cancel" onClick={() => setIsOpen(false)} />
                            <Button
                                intent={Intent.PRIMARY}
                                icon="download"
                                text="Download"
                                loading={isPending}
                                disabled={!sectionValues.some(Boolean) && !isPending}
                                onClick={handleExport}
                            />
                        </>
                    }
                />
            </Dialog>
        </>
    )
}