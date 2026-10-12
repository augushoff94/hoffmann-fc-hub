import { createFileRoute, redirect } from "@tanstack/react-router";

// Preinscripción discontinuada por ahora: redirige a la inscripción de la sede 17.
// Para reactivarla, renderizar <FormularioInfantiles ... preinscripcion />.
export const Route = createFileRoute("/preinscripcion")({
  beforeLoad: () => {
    throw redirect({ to: "/infantiles-17" });
  },
});
