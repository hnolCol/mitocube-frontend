import { Dialog } from "@blueprintjs/core";

export function DeleteAnnotationsDialog({ isOpen, onClose, onSuccess }) {
  return (
    <Dialog isOpen={isOpen} onClose={onClose} onSuccess={onSuccess} title="Note">
      <div className="padding--medium">
        <p>Deleting this annotation will permanently remove it from all associated proteins.</p>

        <div className="flex justify-end gap-2 margin-top--small">
        </div>
      </div>
    </Dialog>
  );
}
