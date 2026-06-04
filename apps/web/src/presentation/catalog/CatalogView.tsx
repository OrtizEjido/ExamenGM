"use client";

import { Alert, Button, Card, Col, Empty, Input, Row, Space, Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { SearchOutlined } from "@ant-design/icons";
import { useTranslations } from "next-intl";
import type { Product } from "@/domain/catalog/Product";
import { useCatalogViewModel } from "./useCatalogViewModel";

/** MVVM — View del catálogo. Buscadores (nombre + SKU) + tabla con carga/error/vacío. */
export function CatalogView() {
  const {
    status,
    products,
    error,
    nameQuery,
    skuQuery,
    setNameQuery,
    setSkuQuery,
    reload,
  } = useCatalogViewModel();
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
    {
      title: t("colPrice"),
      dataIndex: "price",
      key: "price",
      width: 140,
      align: "right",
      render: (value: number | null) => (value == null ? "—" : value.toFixed(2)),
    },
    { title: t("colCategory"), dataIndex: "category", key: "category", width: 160 },
  ];

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <Typography.Title level={4} style={{ margin: 0 }}>
        {t("subtitle")}
      </Typography.Title>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={10}>
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder={t("searchName")}
            aria-label={t("searchName")}
            value={nameQuery}
            onChange={(e) => setNameQuery(e.target.value)}
          />
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Input
            allowClear
            inputMode="numeric"
            prefix={<SearchOutlined />}
            placeholder={t("searchSku")}
            aria-label={t("searchSku")}
            value={skuQuery}
            onChange={(e) => setSkuQuery(e.target.value)}
          />
        </Col>
      </Row>

      <Card styles={{ body: { padding: 0 } }}>
        <Table<Product>
          rowKey="id"
          columns={columns}
          dataSource={products}
          loading={status === "loading"}
          locale={{ emptyText: <Empty description={t("empty")} /> }}
          pagination={{ pageSize: 20, showSizeChanger: false }}
        />
      </Card>
    </Space>
  );
}
