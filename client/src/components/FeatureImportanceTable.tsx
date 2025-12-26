import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp } from "lucide-react";

interface FeatureImportanceTableProps {
  features: Array<{
    name: string;
    importance: number;
  }>;
}

export default function FeatureImportanceTable({ features }: FeatureImportanceTableProps) {
  // Sort features by importance in descending order
  const sortedFeatures = [...features].sort((a, b) => b.importance - a.importance);

  // Normalize importance scores to 0-100 for visualization
  const maxImportance = Math.max(...sortedFeatures.map((f) => f.importance));
  const chartData = sortedFeatures.map((feature) => ({
    name: feature.name,
    importance: (feature.importance / maxImportance) * 100,
    rawImportance: feature.importance,
  }));

  return (
    <Card className="col-span-1 md:col-span-2 border-border shadow-lg">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl">Pentingnya Fitur Model</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Fitur dengan pengaruh terkuat terhadap prediksi model XGBoost
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-8">
        <div className="space-y-8">
          {/* Bar Chart */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">Visualisasi Grafis</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 150, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis type="number" stroke="var(--color-muted-foreground)" />
                <YAxis dataKey="name" type="category" width={140} stroke="var(--color-muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "var(--color-foreground)" }}
                  formatter={(value) => (typeof value === "number" ? value.toFixed(4) : value)}
                />
                <Bar dataKey="importance" fill="var(--color-primary)" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Feature List Table */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">Tabel Detail Fitur</h3>
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Peringkat</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Nama Fitur</th>
                    <th className="text-right py-3 px-4 font-semibold text-foreground">Skor Pentingnya</th>
                    <th className="text-right py-3 px-4 font-semibold text-foreground">Persentase Relatif</th>
                  </tr>
                </thead>
                <tbody>
                  {chartData.map((feature, index) => (
                    <tr
                      key={feature.name}
                      className={`border-b border-border hover:bg-primary/5 transition-colors ${
                        index < 3 ? "bg-gradient-to-r from-primary/10 to-transparent" : ""
                      }`}
                    >
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold text-white ${
                            index === 0
                              ? "bg-gradient-to-br from-yellow-400 to-yellow-600"
                              : index === 1
                                ? "bg-gradient-to-br from-gray-400 to-gray-600"
                                : index === 2
                                  ? "bg-gradient-to-br from-orange-400 to-orange-600"
                                  : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : index + 1}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-medium text-foreground">{feature.name}</td>
                      <td className="py-4 px-4 text-right text-foreground font-mono">
                        {feature.rawImportance.toFixed(4)}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <div className="w-20 h-2.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all"
                              style={{ width: `${feature.importance}%` }}
                            />
                          </div>
                          <span className="text-foreground font-bold w-12 text-right">
                            {feature.importance.toFixed(0)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-2">Total Fitur</p>
              <p className="text-3xl font-bold text-blue-600">{features.length}</p>
              <p className="text-xs text-muted-foreground mt-1">Fitur input model</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-2">Fitur Teratas</p>
              <p className="text-lg font-bold text-purple-600 truncate">{chartData[0]?.name}</p>
              <p className="text-xs text-muted-foreground mt-1">Pengaruh terbesar</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg border border-amber-200">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-2">Skor Tertinggi</p>
              <p className="text-3xl font-bold text-amber-600">{chartData[0]?.rawImportance.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground mt-1">Nilai pentingnya</p>
            </div>
          </div>

          {/* Clinical Interpretation */}
          <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border-l-4 border-emerald-500">
            <p className="text-sm font-semibold text-emerald-900 mb-2">💡 Interpretasi Klinis</p>
            <p className="text-sm text-emerald-800 leading-relaxed">
              Fitur dengan skor pentingnya lebih tinggi memiliki pengaruh lebih besar terhadap prediksi model. Fitur-fitur ini dianggap model sebagai indikator paling kuat untuk diagnosis penyakit hati. Dokter dapat fokus pada fitur dengan skor tinggi saat melakukan penilaian klinis awal.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

