"use client";

import {
  Alert, Button, Card, Col, Empty, Input, Row, Select, Space, Table, Tag, Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { CloseCircleOutlined, SearchOutlined } from "@ant-design/icons";
import { useTranslations } from "next-intl";
import type { InventoryItem } from "@/domain/inventory/InventoryItem";
import { useInventoryViewModel } from "./useInventoryViewModel";

export function InventoryView() {
  const {
    status, items, total, page, error,
    warehouses, selectedWarehouse, nameQuery, searchMode,
    setNameQuery, searchByName, filterByWarehouse, clearSearch, setPage,
  } = useInventoryViewModel();
  const t = useTranslations("inventory");
  const tc = useTranslations("common");

  if (status === "error") {
    return (
      <Alert type="error" showIcon message={t("error")} description={error ?? tc("unknownError")}
        action={<Button size="small" onClick={clearSearch}>{tc("retry")}</Button>} />
    );
  }

  const columns: ColumnsType<InventoryItem> = [
    { title: t("colSku"), dataIndex: "sku", key: "sku", width: 140 },
    { title: t("colProduct"), dataIndex: "productName", key: "productName" },
    { title: t("colWarehouse"), dataIndex: "warehouseName", key: "warehouseName", width: 140 },
    { title: t("colRegion"), dataIndex: "warehouseRegion", key: "warehouseRegion", width: 130 },
    {
      title: t("colQuantity"), dataIndex: "quantity", key: "quantity", width: 120, align: "right",
      render: (v: number) => (
        <Tag color={v === 0 ? "error" : v < 20 ? "warning" : "success"}>{v}</Tag>
      ),
    },
  ];

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <Typography.Title level={4} style={{ margin: 0 }}>{t("subtitle")}</Typography.Title>

      <Row gutter={[12, 12]} align="middle">
        {/* Filtro por almacén */}
        <Col xs={24} sm={8} md={6}>
          <Select
            style={{ width: "100%" }}
            placeholder={t("filterWarehouse")}
            allowClear
            value={selectedWarehouse ?? undefined}
            onChange={(v) => filterByWarehouse(v ?? null)}
            options={warehouses.map((w) => ({ value: w.id, label: `${w.name} (${w.region})` }))}
          />
        </Col>

        {/* Búsqueda por nombre */}
        <Col xs={24} sm={10} md={8}>
          <Input
            allowClear prefix={<SearchOutlined />}
            placeholder={t("searchName")}
            value={nameQuery}
            onChange={(e) => setNameQuery(e.target.value)}
            onPressEnter={searchByName}
          />
        </Col>
        <Col xs={12} sm={4} md={3}>
          <Button type="primary" block onClick={searchByName}
            loading={status === "loading" && searchMode === "name"}>
            {t("btnSearch")}
          </Button>
        </Col>

        {searchMode !== "all" && (
          <Col xs={12} sm={2}>
            <Button icon={<CloseCircleOutlined />} onClick={clearSearch} title={t("clearSearch")} />
          </Col>
        )}
      </Row>

      {searchMode !== "all" && status === "ready" && (
        <Tag color="blue">{t("searchResults", { total })}</Tag>
      )}

      <Card styles={{ body: { padding: 0 } }}>
        <Table<InventoryItem>
          rowKey={(r) => `${r.productId}-${r.warehouseId}`}
          columns={columns}
          dataSource={items}
          loading={status === "loading"}
          locale={{ emptyText: <Empty description={t("empty")} /> }}
          pagination={{
            current: page, pageSize: 20, total,
            showSizeChanger: false,
            showTotal: (tot) => t("paginationTotal", { total: tot }),
            onChange: (p) => setPage(p),
          }}
        />
      </Card>
    </Space>
  );
}
