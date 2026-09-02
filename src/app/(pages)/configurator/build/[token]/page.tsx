import { redirect } from "next/navigation";

interface ConfiguratorBuildPageProps {
  params: Promise<{ token: string }>;
}

export default async function ConfiguratorBuildPage({
  params,
}: ConfiguratorBuildPageProps) {
  const { token } = await params;

  redirect(`/configurator?build=${encodeURIComponent(token)}`);
}
