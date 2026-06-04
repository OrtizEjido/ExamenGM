"use client";

import { Alert, App, Button, Card, Empty, Space, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useLocale, useTranslations } from "next-intl";
import type {
  Notification,
  NotificationStatusCode,
} from "@/domain/notifications/Notification";
import { useNotificationsViewModel } from "./useNotificationsViewModel";

const KIND_COLOR: Record<string, string> = {
  info: "blue",
  warn: "gold",
  alert: "red",
  system: "default",
  marketing: "purple",
};

/** MVVM — View de Notificaciones. Estatus unificado + marcar como leída. */
export function NotificationsView() {
  const { status, notifications, error, markingIds, reload, markRead } =
    useNotificationsViewModel();
  const t = useTranslations("notifications");
  const tc = useTranslations("common");
  const locale = useLocale();
  const { message } = App.useApp();

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

  const statusLabel: Record<NotificationStatusCode, string> = {
    unread: t("status.unread"),
    read: t("status.read"),
  };
  const kindLabel: Record<string, string> = {
    info: t("kind.info"),
    warn: t("kind.warn"),
    alert: t("kind.alert"),
    system: t("kind.system"),
    marketing: t("kind.marketing"),
  };

  const onMarkRead = async (id: number) => {
    try {
      await markRead(id);
      void message.success(t("markReadOk"));
    } catch {
      void message.error(tc("unknownError"));
    }
  };

  const columns: ColumnsType<Notification> = [
    { title: t("colMessage"), dataIndex: "message", key: "message" },
    {
      title: t("colKind"),
      dataIndex: "kind",
      key: "kind",
      width: 140,
      render: (kind: string | null) =>
        kind ? (
          <Tag color={KIND_COLOR[kind] ?? "default"}>
            {kindLabel[kind] ?? kind}
          </Tag>
        ) : (
          "—"
        ),
    },
    {
      title: t("colStatus"),
      dataIndex: "status",
      key: "status",
      width: 130,
      render: (value: NotificationStatusCode) => (
        <Tag color={value === "unread" ? "processing" : "default"}>
          {statusLabel[value]}
        </Tag>
      ),
    },
    {
      title: t("colDate"),
      dataIndex: "createdAt",
      key: "createdAt",
      width: 140,
      render: (value: string | null) =>
        value ? new Date(value).toLocaleDateString(locale) : "—",
    },
    {
      title: t("colActions"),
      key: "actions",
      width: 180,
      render: (_, record) =>
        record.status === "unread" ? (
          <Button
            size="small"
            loading={markingIds.includes(record.id)}
            onClick={() => void onMarkRead(record.id)}
          >
            {t("markRead")}
          </Button>
        ) : null,
    },
  ];

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <Typography.Title level={4} style={{ margin: 0 }}>
        {t("subtitle")}
      </Typography.Title>
      <Card styles={{ body: { padding: 0 } }}>
        <Table<Notification>
          rowKey="id"
          columns={columns}
          dataSource={notifications}
          loading={status === "loading"}
          locale={{ emptyText: <Empty description={t("empty")} /> }}
          pagination={{ pageSize: 20, showSizeChanger: false }}
        />
      </Card>
    </Space>
  );
}
