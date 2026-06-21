import { Suspense } from "react";
import Configurator from "@/components/configurator/Configurator";
import AtHomeLoader from "@/components/shared/AtHomeLoader";

export default function ConfiguratorPage() {
  return (
    <Suspense fallback={<AtHomeLoader variant="page" />}>
      <Configurator />
    </Suspense>
  );
}
