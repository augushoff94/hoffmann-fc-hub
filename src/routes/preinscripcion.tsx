import { createFileRoute } from "@tanstack/react-router";
import { FormularioInfantiles } from "@/components/FormularioInfantiles";

export const Route = createFileRoute("/preinscripcion")({
  head: () => ({
    meta: [
      { title: "Preinscripción Infantiles · Sede 17 de Agosto | Hoffmann FC" },
      { name: "description", content: "Formulario de preinscripción para la sede Barrio 17 de Agosto de Hoffmann FC Infantiles." },
      { property: "og:title", content: "Preinscripción Infantiles · Sede 17 de Agosto | Hoffmann FC" },
      { property: "og:description", content: "Preinscribí a tu hijo o hija en la sede Barrio 17 de Agosto de Hoffmann FC." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Preinscripcion,
});

function Preinscripcion() {
  return <FormularioInfantiles sede="Barrio 17 de Agosto" whatsapp="5493794862408" preinscripcion />;
}
