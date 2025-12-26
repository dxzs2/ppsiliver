import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from "recharts";

interface ROCCurveChartProps {
  rocData: Array<{ fpr: number; tpr: number }>;
  aucScore: number;
}

export default function ROCCurveChart({ rocData, aucScore }: ROCCurveChartProps) {
  // Transform data for Recharts
  const chartData = rocData.map((point) => ({
    fpr: parseFloat(point.fpr.toFixed(3)),
    tpr: parseFloat(point.tpr.toFixed(3)),
  }));

  return (
    <Card className="col-span-1 md:col-span-2 border-border shadow-lg">
      <CardHeader className="bg-gradient-to-r from-secondary/5 to-primary/5 border-b border-border">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-xl">Kurva ROC (Receiver Operating Characteristic)</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Evaluasi trade-off antara True Positive Rate dan False Positive Rate
            </p>
          </div>
          <div className="text-right bg-white dark:bg-slate-950 px-4 py-3 rounded-lg border border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Skor AUC</p>
            <p className="text-3xl font-bold text-primary">{(aucScore * 100).toFixed(2)}<span className="text-lg">%</span></p>
            <p className="text-xs text-green-600 mt-1 font-medium">Sempurna</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-8">
        <div className="space-y-6">
          {/* Chart */}
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis
                dataKey="fpr"
                type="number"
                domain={[0, 1]}
                label={{ value: "False Positive Rate (Laju Positif Salah)", position: "insideBottomRight", offset: -10 }}
                stroke="var(--color-muted-foreground)"
              />
              <YAxis
                type="number"
                domain={[0, 1]}
                label={{ value: "True Positive Rate (Laju Positif Sejati / Recall)", angle: -90, position: "insideLeft", offset: 10 }}
                stroke="var(--color-muted-foreground)"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "var(--color-foreground)" }}
                formatter={(value) => (typeof value === "number" ? value.toFixed(3) : value)}
              />
              <Legend />
              {/* Diagonal reference line (random classifier) */}
              <ReferenceLine
                stroke="var(--color-muted)"
                strokeDasharray="5 5"
                name="Klasifikasi Acak"
                x1={0}
                y1={0}
                x2={1}
                y2={1}
              />
              {/* ROC Curve */}
              <Line
                type="monotone"
                dataKey="tpr"
                stroke="var(--color-primary)"
                dot={false}
                strokeWidth={3}
                name="Kurva ROC"
                isAnimationActive={true}
              />
            </LineChart>
          </ResponsiveContainer>

          {/* Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
            <div>
              <p className="text-sm font-semibold text-blue-900 mb-2">📊 Interpretasi AUC</p>
              <p className="text-sm text-blue-800">
                AUC (Area Under Curve) skor <strong>{(aucScore * 100).toFixed(2)}%</strong> menunjukkan kemampuan model yang sangat baik dalam membedakan antara kasus positif dan negatif.
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-900 mb-2">📈 Makna Kurva</p>
              <p className="text-sm text-blue-800">
                Kurva yang lebih dekat ke sudut kiri atas berarti model lebih baik. Garis diagonal mewakili klasifikasi acak (AUC = 50%).
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
