import type { BusinessValue as BusinessValueData } from "@/data/projects";

interface BusinessValueProps {
  data: BusinessValueData;
  accent: string;
}

const MAX_METRICS = 4;

/**
 * Column count tracks the metric count so the row never leaves a hole. A fixed
 * 4-column grid renders three metrics as three tiles and one gap, which reads as
 * a missing tile rather than a deliberate layout.
 */
const COLUMNS: Record<number, string> = {
  1: "sm:grid-cols-1",
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
};

const BusinessValue = ({ data, accent }: BusinessValueProps) => {
  const metrics = data.metrics.slice(0, MAX_METRICS);

  return (
    <div className="space-y-6">
      <div className={`grid grid-cols-1 ${COLUMNS[metrics.length] ?? COLUMNS[4]} gap-4`}>
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="glass rounded-xl px-5 py-6 text-center flex flex-col justify-center"
          >
            <p
              className="font-heading text-4xl font-bold leading-none mb-2 tabular-nums"
              style={{ color: `hsl(${accent})` }}
            >
              {metric.value}
            </p>
            <p className="text-xs text-muted-foreground leading-snug text-balance">
              {metric.label}
            </p>
          </div>
        ))}
      </div>
      <p className="text-secondary-foreground leading-relaxed">{data.narrative}</p>
    </div>
  );
};

export default BusinessValue;
