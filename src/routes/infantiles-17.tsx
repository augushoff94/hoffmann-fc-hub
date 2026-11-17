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
      // Pegar acá la URL de la "Aplicación web" del Apps Script de la planilla del 17
      appsScript=""
      talles={["6", "8", "10", "12", "14", "16"]}
    />
  ),
});
