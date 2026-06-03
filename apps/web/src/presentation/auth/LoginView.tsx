"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { Button, Card, Form, Input, Typography, theme as antdTheme } from "antd";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { ThemeToggle } from "@erp/ui";

interface LoginFormValues {
  username: string;
  password: string;
}

/**
 * Vista de inicio (entrada a la app). Sin lógica de autenticación todavía: al
 * enviar avanza a la pantalla principal (con sidebar). Las credenciales del seed
 * legacy vienen precargadas para poder entrar de un clic.
 */
export function LoginView() {
  const router = useRouter();
  const t = useTranslations("login");
  const tApp = useTranslations("app");
  const { token } = antdTheme.useToken();
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  function handleFinish(_values: LoginFormValues) {
    router.push("/dashboard");
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

        <Form<LoginFormValues>
          layout="vertical"
          requiredMark={false}
          initialValues={{ username: "admin", password: "1234" }}
          onFinish={handleFinish}
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
            <Button type="primary" htmlType="submit" block>
              {t("submit")}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </main>
  );
}
