"use client";

import type { ReactNode } from "react";

 type ModalProps = {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
};

export function Modal({ open, title, children, onClose }: ModalProps) {
  if (!open) return null;

  return (
    <div className="ui-modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="ui-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" onMouseDown={(event) => event.stopPropagation()}>
        <div className="ui-modal-header"><h2 id="modal-title">{title}</h2><button className="close-button" type="button" onClick={onClose} aria-label={`Close ${title}`}>×</button></div>
        {children}
      </section>
    </div>
  );
}
