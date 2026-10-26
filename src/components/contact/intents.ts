export type ContactIntent = "full-time" | "contract" | "project";

export const INTENTS: { value: ContactIntent; label: string; title: string; placeholder: string }[] = [
  {
    value: "full-time",
    label: "Full-time role",
    title: "Full-time opportunity",
    placeholder: "The role, team, location or remote setup, and how to proceed.",
  },
  {
    value: "contract",
    label: "Contract & part-time",
    title: "Contract & part-time enquiry",
    placeholder: "What you need help with, expected hours per week and duration.",
  },
  {
    value: "project",
    label: "Project",
    title: "Start a project",
    placeholder: "What should be built or fixed — an integration, an API, a performance problem…",
  },
];

export const intentInfo = (value: ContactIntent) => INTENTS.find((i) => i.value === value) ?? INTENTS[2];
