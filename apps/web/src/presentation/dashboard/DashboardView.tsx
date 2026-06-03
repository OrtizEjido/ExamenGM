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
      <Typography.Paragraph type="secondary">{t("subtitle")}</Typography.Paragraph>

      {status === "loading" && (
        <Row gutter={16}>
          {[0, 1, 2].map((i) => (
            <Col xs={24} sm={8} key={i}>
              <Card>
                <Skeleton active paragraph={{ rows: 1 }} />
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {status === "error" && (
        <Alert
          type="error"
          showIcon
          message={t("errorTitle")}
          description={error ?? tCommon("unknownError")}
          action={
            <Button size="small" onClick={reload}>
              {tCommon("retry")}
            </Button>
          }
        />
      )}

      {status === "ready" && summary && (
        <Row gutter={16}>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic title={t("statsProducts")} value={summary.productsCount} />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic title={t("statsSales")} value={summary.salesCount} />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic title={t("statsRefunds")} value={summary.refundsCount} />
            </Card>
          </Col>
        </Row>
      )}

      <Card title={t("demoTitle")}>
        <Space wrap>
          <SaveButton htmlType="button" loading={saving} onClick={handleSave}>
            {t("saveButton")}
          </SaveButton>
          <Button danger onClick={() => setWarnOpen(true)}>
            {t("destructiveButton")}
          </Button>
        </Space>
      </Card>

      <WarningDialog
        open={warnOpen}
        danger
        title={t("deleteTitle")}
        message={t("deleteMessage")}
        confirmText={tCommon("delete")}
        cancelText={tCommon("cancel")}
        onConfirm={() => {
          setWarnOpen(false);
          message.warning(t("deletedToast"));
        }}
        onCancel={() => setWarnOpen(false)}
      />
    </Space>
  );
}
