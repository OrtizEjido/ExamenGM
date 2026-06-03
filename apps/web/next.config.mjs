import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Los paquetes del monorepo se distribuyen como TypeScript fuente.
  transpilePackages: ["@erp/ui", "@erp/types"],
};

export default withNextIntl(nextConfig);
