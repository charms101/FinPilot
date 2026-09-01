import type { NextConfig } from "next";

const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1];
const isProjectPagesBuild = Boolean(process.env.GITHUB_ACTIONS && repositoryName);

const nextConfig: NextConfig = {
  output: "export",
  basePath: isProjectPagesBuild ? `/${repositoryName}` : undefined,
  assetPrefix: isProjectPagesBuild ? `/${repositoryName}/` : undefined,
};

export default nextConfig;
