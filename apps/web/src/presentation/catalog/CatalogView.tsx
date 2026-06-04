"use client";

import {
  Alert, Button, Card, Col, Empty, Input, Row, Space, Table, Tag, Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { CloseCircleOutlined, SearchOutlined } from "@ant-design/icons";
import { useTranslations } from "next-intl";
import type { Product } from "@/domain/catalog/Product";
import { useCatalogViewModel } from "./useCatalogViewModel";

export function CatalogView() {
  const {
    status, products, total, page, pages, error,
    nameQuery, skuQuery, searchMode,
    setNameQuery, setSkuQuery,
    searchByName, searchBySku, clearSearch,
    setPage,
  } = useCatalogViewModel();
  const t = useTranslations("catalog");
  const tc = useTranslations("common");

  if (status === "error") {
    return (
      <Alert type="error" showIcon message={t("error")} description={error ?? tc("unknownError")}
        action={<Button size="small" onClick={clearSearch}>{tc("retry")}</Button>} />
    );
  }

  const columns: ColumnsType<Product> = [
    { title: t("colSku"), dataIndex: "sku", key: "sku", width: 140 },
    { title: t("colName"), dataIndex: "name", key: "name" },
    {
      title: t("colPrice"), dataIndex: "price", key: "price", width: 140, align: "right",
      render: (v: number | null) => (v == null ? "—" : v.toFixed(2)),
    },
    { title: t("colCategory"), dataIndex: "category", key: "category", width: 160 },
  ];

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <Typography.Title level={4} style={{ margin: 0 }}>
        {t("subtitle")}
      </Typography.Title>

      {/* Buscadores */}
      <Row gutter={[12, 12]} align="middle">
        <Col xs={24} sm={10} md={8}>
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder={t("searchName")}
            value={nameQuery}
            onChange={(e) => setNameQuery(e.target.value)}
            onPressEnter={searchByName}
          />
        </Col>
        <Col xs={12} sm={4} md={3}>
          <Button type="primary" block onClick={searchByName} loading={status === "loading" && searchMode === "name"}>
            {t("btnSearchName")}
          </Button>
        </Col>

        <Col xs={24} sm={10} md={8}>
          <Input
            allowClear
            inputMode="numeric"
            prefix={<SearchOutlined />}
            placeholder={t("searchSku")}
            value={skuQuery}
            onChange={(e) => setSkuQuery(e.target.value)}
            onPressEnter={searchBySku}
          />
        </Col>
        <Col xs={12} sm={4} md={3}>
          <Button type="primary" block onClick={searchBySku} loading={status === "loading" && searchMode === "sku"}>
            {t("btnSearchSku")}
          </Button>
        </Col>

        {searchMode !== "list" && (
          <Col xs={24} sm={4} md={2}>
            <Button icon={<CloseCircleOutlined />} onClick={clearSearch} title={t("clearSearch")} />
          </Col>
        )}
      </Row>

      {/* Badge de resultados cuando hay búsqueda activa */}
      {searchMode !== "list" && status === "ready" && (
        <Tag color="blue">
          {t("searchResults", { total })}
        </Tag>
      )}

      <Card styles={{ body: { padding: 0 } }}>
        <Table<Product>
          rowKey="id"
          columns={columns}
          dataSource={products}
          loading={status === "loading"}
          locale={{ emptyText: <Empty description={t("empty")} /> }}
          pagination={{
            current: page,
            pageSize: 20,
            total,
            showSizeChanger: false,
            showTotal: (tot) => t("paginationTotal", { total: tot }),
            onChange: (p) => setPage(p),
          }}
        />
      </Card>
    </Space>
  );
}
