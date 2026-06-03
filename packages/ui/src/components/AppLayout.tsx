"use client";

import type { ReactNode } from "react";
import { Layout, Typography, theme } from "antd";

const { Header, Content } = Layout;

export interface AppLayoutProps {
  /** Normalmente un `<Sidebar />`. */
  sidebar: ReactNode;
  headerTitle?: ReactNode;
  headerExtra?: ReactNode;
  children: ReactNode;
}

/** Shell de la aplicación: sidebar + header + área de contenido. */
export function AppLayout({
  sidebar,
  headerTitle,
  headerExtra,
  children,
}: AppLayoutProps) {
  const { token } = theme.useToken();

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {sidebar}
      <Layout>
        <Header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingInline: 24,
            background: token.colorBgContainer,
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
          }}
        >
          <Typography.Title level={4} style={{ margin: 0 }}>
            {headerTitle}
          </Typography.Title>
          <div>{headerExtra}</div>
        </Header>
        <Content style={{ margin: 24 }}>{children}</Content>
      </Layout>
    </Layout>
  );
}
