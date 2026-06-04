"use client";

import {
  Alert, Button, Card, Col, Descriptions, Empty, InputNumber,
  Row, Segmented, Space, Table, Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { DownloadOutlined } from "@ant-design/icons";
import { useTranslations } from "next-intl";
import type { CategorySummary, ReportType, SupplierSummary } from "@/domain/reports/Report";
import { useReportsViewModel } from "./useReportsViewModel";

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i);

export function ReportsView() {
  const {
    status, activeReport, year, categoryRows, supplierRows, aggregate, error,
    setActiveReport, setYear, downloadXlsx,
  } = useReportsViewModel();
  const t = useTranslations("reports");
  const tc = useTranslations("common");

  const currency = (n: number) => `$${n.toFixed(2)}`;

  const catColumns: ColumnsType<CategorySummary> = [
    { title: t("colCategory"), dataIndex: "category", key: "category",
      render: (v) => v ?? t("noCategory") },
    { title: t("colSales"), dataIndex: "nSales", key: "nSales", width: 120, align: "right" },
    { title: t("colGross"), dataIndex: "gross", key: "gross", width: 160, align: "right",
      render: (v: number) => currency(v) },
  ];

  const supColumns: ColumnsType<SupplierSummary> = [
    { title: t("colSupplier"), dataIndex: "supplier", key: "supplier",
      render: (v) => v ?? t("noSupplier") },
    { title: t("colSales"), dataIndex: "nSales", key: "nSales", width: 120, align: "right" },
    { title: t("colGross"), dataIndex: "gross", key: "gross", width: 160, align: "right",
      render: (v: number) => currency(v) },
  ];

  const segOptions: { label: string; value: ReportType }[] = [
    { label: t("tabCategory"), value: "category" },
    { label: t("tabSupplier"), value: "supplier" },
    { label: t("tabAggregate"), value: "aggregate" },
  ];

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <Typography.Title level={4} style={{ margin: 0 }}>{t("subtitle")}</Typography.Title>

      <Row gutter={[16, 16]} align="middle">
        <Col>
          <Segmented
            options={segOptions}
            value={activeReport}
            onChange={(v) => setActiveReport(v as ReportType)}
          />
        </Col>
        <Col>
          <InputNumber
            min={2020} max={CURRENT_YEAR + 1}
            value={year}
            onChange={(v) => v && setYear(v)}
            style={{ width: 100 }}
            addonBefore={t("year")}
          />
        </Col>
        <Col>
          <Button
            type="primary" icon={<DownloadOutlined />}
            onClick={() => downloadXlsx(activeReport)}
          >
            {t("exportXlsx")}
          </Button>
        </Col>
      </Row>

      {status === "error" && (
        <Alert type="error" showIcon message={t("error")}
          description={error ?? tc("unknownError")} />
      )}

      {activeReport === "category" && (
        <Card styles={{ body: { padding: 0 } }}>
          <Table<CategorySummary>
            rowKey={(r) => r.category ?? "null"}
            columns={catColumns}
            dataSource={categoryRows}
            loading={status === "loading"}
            locale={{ emptyText: <Empty description={t("empty")} /> }}
            pagination={false}
          />
        </Card>
      )}

      {activeReport === "supplier" && (
        <Card styles={{ body: { padding: 0 } }}>
          <Table<SupplierSummary>
            rowKey={(r) => r.supplier ?? "null"}
            columns={supColumns}
            dataSource={supplierRows}
            loading={status === "loading"}
            locale={{ emptyText: <Empty description={t("empty")} /> }}
            pagination={false}
          />
        </Card>
      )}

      {activeReport === "aggregate" && aggregate && status === "ready" && (
        <Card>
          <Descriptions bordered column={1} size="middle">
            <Descriptions.Item label={t("aggYear")}>{aggregate.year}</Descriptions.Item>
            <Descriptions.Item label={t("aggSales")}>{aggregate.totalSales}</Descriptions.Item>
            <Descriptions.Item label={t("aggQty")}>{aggregate.qtyTotal}</Descriptions.Item>
            <Descriptions.Item label={t("aggSubtotal")}>{currency(aggregate.subtotal)}</Descriptions.Item>
            <Descriptions.Item label={t("aggIva")}>{currency(aggregate.iva)}</Descriptions.Item>
            <Descriptions.Item label={t("aggTotal")}>
              <Typography.Text strong>{currency(aggregate.total)}</Typography.Text>
            </Descriptions.Item>
          </Descriptions>
        </Card>
      )}
    </Space>
  );
}
