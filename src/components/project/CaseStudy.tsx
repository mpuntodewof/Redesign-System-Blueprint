import type { CaseStudy as CaseStudyData } from "@/data/projects";

interface CaseStudyProps {
  data: CaseStudyData;
  accent: string;
}

const CaseStudy = ({ data, accent }: CaseStudyProps) => {
  const blocks: { label: string; body: string }[] = [
    { label: "Context", body: data.context },
    { label: "Challenge", body: data.challenge },
    { label: "Approach", body: data.approach },
    { label: "Outcome", body: data.outcome },
  ];

  return (
    <div className="space-y-6">
      {blocks.map((block) => (
        <div key={block.label} className="border-l-2 pl-5" style={{ borderColor: `hsl(${accent} / 0.4)` }}>
          <h3
            className="font-heading text-xs font-semibold tracking-widest uppercase mb-2"
            style={{ color: `hsl(${accent})` }}
          >
            {block.label}
          </h3>
          <p className="text-secondary-foreground leading-relaxed">{block.body}</p>
        </div>
      ))}
    </div>
  );
};

export default CaseStudy;
