"use client";

import { Card, Empty } from "antd";
import { useTranslations } from "next-intl";

export function ComingSoon({ module }: { module: string }) {
  const t = useTranslations("comingSoon");
  return (
    <Card>
      <Empty description={t("message", { module })} />
    </Card>
  );
}
