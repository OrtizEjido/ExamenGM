"use client";

import { useState } from "react";
import {
  Alert,
  App,
  Button,
  Card,
  Col,
  Row,
  Skeleton,
  Space,
  Statistic,
  Typography,
} from "antd";
import { useTranslations } from "next-intl";
import { SaveButton, WarningDialog } from "@erp/ui";
import { useDashboardViewModel } from "./useDashboardViewModel";

/**
 * MVVM — View del dashboard. Componente "tonto": solo renderiza según el estado
 * que expone el ViewModel y delega acciones. Cubre carga / error / datos.
 * Todos los textos provienen de i18n.
 */
export function DashboardView() {
  const { status, summary, error, reload } = useDashboardViewModel();
  const t = useTranslations("dashboard");
  const tCommon = useTranslations("common");
  const { message } = App.useApp();
  const [warnOpen, setWarnOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  function handleSave() {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      message.success(t("savedToast"));
    }, 700);
  }

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      

      
    </Space>
  );
}
