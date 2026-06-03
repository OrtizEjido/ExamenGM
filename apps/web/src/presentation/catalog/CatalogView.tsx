"use client";

import { Alert, Button, Empty, Space, Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useTranslations } from "next-intl";
import type { Product } from "@/domain/catalog/Product";
import { useCatalogViewModel } from "./useCatalogViewModel";

/** MVVM — View del catálogo. Cubre carga / error / vacío. Textos vía i18n. */
export function CatalogView() {
  const { status, products, error, reload } = useCatalogViewModel();
  const t = useTranslations("catalog");
  const tc = useTranslations("common");

  if (status === "error") {
    return (
      <Alert
        type="error"
        showIcon
        message={t("error")}
        description={error ?? tc("unknownError")}
        action={
          <Button size="small" onClick={reload}>
            {tc("retry")}
          </Button>
        }
      />
    );
  }

  const columns: ColumnsType<Product> = [
    { title: t("colSku"), dataIndex: "sku", key: "sku", width: 140 },
    { title: t("colName"), dataIndex: "name", key: "name" },
    { title: t("colCategory"), dataIndex: "category", key: "category", width: 160 },
    {
      title: t("colPrice"),
      dataIndex: "price",
      key: "price",
      width: 140,
      align: "right",
      render: (value: number | null) => (value == null ? "—" : value.toFixed(2)),
    },
  ];

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <Typography.Paragraph type="secondary">{t("subtitle")}</Typography.Paragraph>
      <Table<Product>
        rowKey="id"
        columns={columns}
        dataSource={products}
        loading={status === "loading"}
        locale={{ emptyText: <Empty description={t("empty")} /> }}
        pagination={{ pageSize: 10, showSizeChanger: false }}
      />
    </Space>
  );
}
