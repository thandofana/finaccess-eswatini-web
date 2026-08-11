import { notFound } from "next/navigation";
import { FinAccessExperience } from "../../components/FinAccessExperience";
import { concepts } from "../../data";

export function generateStaticParams() {
  return concepts.map((concept) => ({ concept: concept.key }));
}

export default async function ConceptPage({ params }: { params: Promise<{ concept: string }> }) {
  const { concept: conceptKey } = await params;
  const concept = concepts.find((item) => item.key === conceptKey);
  if (!concept) notFound();
  return <FinAccessExperience concept={concept} />;
}
