"use client";

import { Alert, Button, Card, Empty, Select, Space, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { CloseCircleOutlined } from "@ant-design/icons";
import { useLocale, useTranslations } from "next-intl";
import type { Refund, RefundStatusCode } from "@/domain/refunds/Refund";
import { useRefundsViewModel } from "./useRefundsViewModel";

const STATUS_COLOR: Record<RefundStatusCode, string> = {
  pending: "gold", approved: "green", rejected: "red", done: "blue",
};

export function RefundsView() {
  const { status, refunds, error, filterMode, selectedStatus, filterByStatus, clearFilter } =
    useRefundsViewModel();
  const t = useTranslations("refunds");
  const tc = useTranslations("common");
  const locale = useLocale();

  if (status === "error") {
    return (
      <Alert type="error" showIcon message={t("error")} description={error ?? tc("unknownError")}
        action={<Button size="small" onClick={clearFilter}>{tc("retry")}</Button>} />
    );
  }

  const statusLabel: Record<RefundStatusCode, string> = {
    pending: t("status.pending"), approved: t("status.approved"),
    rejected: t("status.rejected"), done: t("status.done"),
  };

  const columns: ColumnsType<Refund> = [
    { title: t("colId"), dataIndex: "id", key: "id", width: 70 },
    { title: t("colSaleId"), dataIndex: "saleId", key: "saleId", width: 100 },
    { title: t("colReason"), dataIndex: "reason", key: "reason" },
    {
      title: t("colAmount"), dataIndex: "amount", key: "amount", width: 130, align: "right",
      render: (v: number | null) => v == null ? "—" : `$${v.toFixed(2)}`,
    },
    {
      title: t("colStatus"), dataIndex: "status", key: "status", width: 140,
      render: (v: RefundStatusCode) => (
        <Tag color={STATUS_COLOR[v]}>{statusLabel[v]}</Tag>
      ),
    },
    {
      title: t("colDate"), dataIndex: "createdAt", key: "createdAt", width: 130,
      render: (v: string | null) => v ? new Date(v).toLocaleDateString(locale) : "—",
    },
  ];

  const statusOptions: RefundStatusCode[] = ["pending", "approved", "rejected", "done"];

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <Typography.Title level={4} style={{ margin: 0 }}>{t("subtitle")}</Typography.Title>

      <Space>
        <Select
          style={{ width: 200 }}
          placeholder={t("filterStatus")}
          allowClear
          value={selectedStatus ?? undefined}
          onChange={(v) => filterByStatus((v as RefundStatusCode) ?? null)}
          options={statusOptions.map((s) => ({ value: s, label: statusLabel[s] }))}
        />
        {filterMode !== "all" && (
          <Button icon={<CloseCircleOutlined />} onClick={clearFilter} title={t("clearFilter")} />
        )}
      </Space>

      <Card styles={{ body: { padding: 0 } }}>
        <Table<Refund>
          rowKey="id"
          columns={columns}
          dataSource={refunds}
          loading={status === "loading"}
          locale={{ emptyText: <Empty description={t("empty")} /> }}
          pagination={{ pageSize: 20, showSizeChanger: false }}
        />
      </Card>
    </Space>
  );
}
