import type { Metadata } from "next";
import { FinAccessExperience } from "./components/FinAccessExperience";
import { concepts } from "./data";

export const metadata: Metadata = {
  title: "Financial Access in Eswatini",
  description: "Explore financial inclusion, mobile money adoption, and explainable model assessments for Eswatini.",
};

export default function HomePage() {
  const signal = concepts.find((concept) => concept.key === "signal");
  if (!signal) throw new Error("The selected Signal concept is unavailable.");
  return <FinAccessExperience concept={signal} selected />;
}
