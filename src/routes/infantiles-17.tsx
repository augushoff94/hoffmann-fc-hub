import { createFileRoute } from "@tanstack/react-router";
import { FormularioInfantiles } from "@/components/FormularioInfantiles";

export const Route = createFileRoute("/infantiles-17")({
  head: () => ({
    meta: [
      { title: "Inscripción Infantiles · Barrio 17 de Agosto | Hoffmann FC" },
      { name: "description", content: "Formulario de inscripción para Hoffmann FC Infantiles, sede Barrio 17 de Agosto." },
      { property: "og:title", content: "Inscripción Infantiles · 17 de Agosto | Hoffmann FC" },
      { property: "og:description", content: "Inscribí a tu hijo o hija en Hoffmann FC Infantiles, sede Barrio 17 de Agosto." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <FormularioInfantiles
      sede="Barrio 17 de Agosto"
      whatsapp="5493794862408"
      googleForm="https://docs.google.com/forms/d/e/1FAIpQLSd-2JZ5Sas5d1Do6AyDOhIy2qBSWIfQyCd6gRfS0M_DMOqJEg/formResponse"
    />
  ),
});
