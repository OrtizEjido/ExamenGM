"use client";

import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { Alert, Button, Card, Form, Input, Typography, theme as antdTheme } from "antd";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { ThemeToggle } from "@erp/ui";
import { useLoginViewModel } from "./useLoginViewModel";

interface LoginFormValues {
  username: string;
  password: string;
}

/** Vista de inicio de sesión. Llama al backend real y guarda el JWT en localStorage. */
export function LoginView() {
  const { loading, error, submit } = useLoginViewModel();
  const t = useTranslations("login");
  const tApp = useTranslations("app");
  const { token } = antdTheme.useToken();
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  async function handleFinish(values: LoginFormValues) {
    await submit(values.username, values.password);
  }

  return (
    <main
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: token.colorBgLayout,
        padding: 24,
      }}
    >
      <div style={{ position: "absolute", top: 16, right: 16 }}>
        <ThemeToggle
          isDark={isDark}
          onChange={(dark) => setTheme(dark ? "dark" : "light")}
          ariaLabel={tApp("themeToggle")}
        />
      </div>

      <Card style={{ width: 360 }}>
        <Typography.Title level={3} style={{ textAlign: "center", marginBottom: 4 }}>
          {tApp("name")}
        </Typography.Title>
        <Typography.Paragraph type="secondary" style={{ textAlign: "center" }}>
          {t("subtitle")}
        </Typography.Paragraph>

        {error && (
          <Alert
            type="error"
            message={error}
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        <Form<LoginFormValues>
          layout="vertical"
          requiredMark={false}
          initialValues={{ username: "admin", password: "1234" }}
          onFinish={(values) => void handleFinish(values)}
        >
          <Form.Item
            name="username"
            label={t("username")}
            rules={[{ required: true, message: t("usernameRequired") }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder={t("usernamePlaceholder")}
              autoComplete="username"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label={t("password")}
            rules={[{ required: true, message: t("passwordRequired") }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder={t("passwordPlaceholder")}
              autoComplete="current-password"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" block loading={loading}>
              {t("submit")}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </main>
  );
}
