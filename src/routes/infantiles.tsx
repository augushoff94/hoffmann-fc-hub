import { createFileRoute } from "@tanstack/react-router";
import { FormularioInfantiles } from "@/components/FormularioInfantiles";

export const Route = createFileRoute("/infantiles")({
  head: () => ({
    meta: [
      { title: "Inscripción Infantiles · Área 93 | Hoffmann FC" },
      { name: "description", content: "Formulario de inscripción para Hoffmann FC Infantiles, sede Área 93." },
      { property: "og:title", content: "Inscripción Infantiles · Área 93 | Hoffmann FC" },
      { property: "og:description", content: "Inscribí a tu hijo o hija en Hoffmann FC Infantiles, sede Área 93." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <FormularioInfantiles
      sede="Área 93"
      whatsapp="5493794668266"
      googleForm="https://docs.google.com/forms/d/e/1FAIpQLSfgY-FQXqma9UY_8kYXl1dxQxEdEXJFK41FOYPOVgCmC9FoVA/formResponse"
    />
  ),
});
