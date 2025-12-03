import { Dialog } from "@blueprintjs/core";

export function DeleteSymptomDialog({ isOpen, onClose }) {
  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Note">
      <div className="padding--medium">
        <p>Deleting this symptom will remove it from the list.  
          It will be set <code>is_active = false</code> in the database  
          and not permanently deleted.</p>

        <div className="flex justify-end gap-2 margin-top--small">
        </div>
      </div>
    </Dialog>
  );
}
