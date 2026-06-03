"use client";

import { Button } from "antd";
import type { ButtonProps } from "antd";
import { SaveOutlined } from "@ant-design/icons";

export interface SaveButtonProps extends Omit<ButtonProps, "icon"> {
  /** Texto del botón cuando no se pasan children. El texto lo provee el consumidor (i18n). */
  label?: string;
}

/**
 * Botón de guardado estándar (primario + ícono). Agnóstico a idioma: el texto se
 * inyecta vía `children` o `label`. Por defecto es `htmlType="submit"` para
 * integrarse con formularios; usa `loading` para el estado de envío.
 */
export function SaveButton({
  label,
  children,
  type = "primary",
  htmlType = "submit",
  ...rest
}: SaveButtonProps) {
  return (
    <Button type={type} htmlType={htmlType} icon={<SaveOutlined />} {...rest}>
      {children ?? label}
    </Button>
  );
}
