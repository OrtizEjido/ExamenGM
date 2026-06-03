"use client";

import type { ReactNode } from "react";
import { Modal } from "antd";
import { ExclamationCircleFilled } from "@ant-design/icons";

export interface WarningDialogProps {
  open: boolean;
  /** Texto del título (lo provee el consumidor, i18n). */
  title?: ReactNode;
  message?: ReactNode;
  /** Si se omite, Ant Design usa su texto localizado según el locale del ConfigProvider. */
  confirmText?: string;
  cancelText?: string;
  /** Resalta la acción como destructiva (rojo). */
  danger?: boolean;
  confirmLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Ventana de advertencia / confirmación controlada. Agnóstica a idioma: los
 * textos se inyectan por props. Útil para acciones destructivas o irreversibles.
 */
export function WarningDialog({
  open,
  title,
  message,
  confirmText,
  cancelText,
  danger = false,
  confirmLoading = false,
  onConfirm,
  onCancel,
}: WarningDialogProps) {
  return (
    <Modal
      open={open}
      centered
      destroyOnClose
      onOk={onConfirm}
      onCancel={onCancel}
      okText={confirmText}
      cancelText={cancelText}
      confirmLoading={confirmLoading}
      okButtonProps={{ danger }}
      title={
        <span>
          <ExclamationCircleFilled
            aria-hidden
            style={{
              color: danger ? "#ff4d4f" : "#faad14",
              marginInlineEnd: 8,
            }}
          />
          {title}
        </span>
      }
    >
      {message}
    </Modal>
  );
}
