import type { Metadata } from "next";
import { FinAccessExperience } from "./components/FinAccessExperience";
import { concepts } from "./data";

export const metadata: Metadata = {
  title: "Financial Access in Eswatini",
  description: "Financial-access evidence, model research, and explainable assessment for Eswatini.",
};

export default function HomePage() {
  const signal = concepts.find((concept) => concept.key === "signal");
  if (!signal) throw new Error("The selected Signal concept is unavailable.");
  return <FinAccessExperience concept={signal} selected />;
}
