import type { BusinessValue as BusinessValueData } from "@/data/projects";

interface BusinessValueProps {
  data: BusinessValueData;
  accent: string;
}

const MAX_METRICS = 4;

const BusinessValue = ({ data, accent }: BusinessValueProps) => {
  const metrics = data.metrics.slice(0, MAX_METRICS);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="glass rounded-xl p-5 text-center">
            <p
              className="font-heading text-3xl font-bold mb-1"
              style={{ color: `hsl(${accent})` }}
            >
              {metric.value}
            </p>
            <p className="text-xs text-muted-foreground leading-snug">{metric.label}</p>
          </div>
        ))}
      </div>
      <p className="text-secondary-foreground leading-relaxed">{data.narrative}</p>
    </div>
  );
};

export default BusinessValue;
