import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface PrecisionRecallChartProps {
  prData: Array<{ recall: number; precision: number }>;
}

export default function PrecisionRecallChart({ prData }: PrecisionRecallChartProps) {
  // Transform data for Recharts
  const chartData = prData.map((point) => ({
    recall: parseFloat(point.recall.toFixed(3)),
    precision: parseFloat(point.precision.toFixed(3)),
  }));

  // Calculate average precision (area under PR curve)
  let auc = 0;
  for (let i = 1; i < chartData.length; i++) {
    const dx = chartData[i].recall - chartData[i - 1].recall;
    const avgPrecision = (chartData[i].precision + chartData[i - 1].precision) / 2;
    auc += dx * avgPrecision;
  }

  return (
    <Card className="col-span-1 md:col-span-2 border-border shadow-lg">
      <CardHeader className="bg-gradient-to-r from-teal-5 to-cyan-5 border-b border-border">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-xl">Kurva Presisi-Recall</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Evaluasi trade-off antara presisi dan recall pada berbagai ambang batas keputusan
            </p>
          </div>
          <div className="text-right bg-white dark:bg-slate-950 px-4 py-3 rounded-lg border border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Presisi Rata-Rata</p>
            <p className="text-3xl font-bold text-secondary">{(auc * 100).toFixed(2)}<span className="text-lg">%</span></p>
            <p className="text-xs text-teal-600 mt-1 font-medium">Sangat Baik</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-8">
        <div className="space-y-8">
          {/* Chart */}
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis
                dataKey="recall"
                type="number"
                domain={[0, 1]}
                label={{ value: "Recall (Sensitivitas) - Proporsi kasus positif yang terdeteksi", position: "insideBottomRight", offset: -10 }}
                stroke="var(--color-muted-foreground)"
              />
              <YAxis
                type="number"
                domain={[0, 1]}
                label={{ value: "Presisi - Akurasi prediksi positif", angle: -90, position: "insideLeft", offset: 10 }}
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
              {/* Precision-Recall Curve */}
              <Line
                type="monotone"
                dataKey="precision"
                stroke="var(--color-secondary)"
                dot={false}
                strokeWidth={3}
                name="Kurva Presisi-Recall"
                isAnimationActive={true}
              />
            </LineChart>
          </ResponsiveContainer>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Presisi Maksimal</p>
              <p className="text-3xl font-bold text-blue-600">
                {(Math.max(...chartData.map((d) => d.precision)) * 100).toFixed(1)}<span className="text-lg">%</span>
              </p>
              <p className="text-xs text-muted-foreground mt-2">Nilai presisi tertinggi</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Recall Maksimal</p>
              <p className="text-3xl font-bold text-purple-600">
                {(Math.max(...chartData.map((d) => d.recall)) * 100).toFixed(1)}<span className="text-lg">%</span>
              </p>
              <p className="text-xs text-muted-foreground mt-2">Nilai recall tertinggi</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Presisi Rata-Rata</p>
              <p className="text-3xl font-bold text-green-600">
                {(auc * 100).toFixed(1)}<span className="text-lg">%</span>
              </p>
              <p className="text-xs text-muted-foreground mt-2">Luas di bawah kurva</p>
            </div>
          </div>

          {/* Interpretation */}
          <div className="p-4 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg border-l-4 border-teal-500">
            <p className="text-sm font-semibold text-teal-900 mb-2">💡 Interpretasi Klinis</p>
            <p className="text-sm text-teal-800 leading-relaxed">
              <strong>Presisi</strong> menunjukkan dari semua prediksi positif, berapa persen yang benar-benar positif.
              <strong className="ml-3">Recall</strong> menunjukkan dari semua kasus positif sebenarnya, berapa persen yang terdeteksi model.
              Kurva ini membantu memilih ambang batas optimal untuk diagnosis berdasarkan prioritas klinis.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
