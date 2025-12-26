import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";

interface ConfusionMatrixChartProps {
  trueNegative: number;
  falsePositive: number;
  falseNegative: number;
  truePositive: number;
}

export default function ConfusionMatrixChart({
  trueNegative,
  falsePositive,
  falseNegative,
  truePositive,
}: ConfusionMatrixChartProps) {
  const data = [
    {
      name: "Negatif",
      "Negatif Sejati": trueNegative,
      "Positif Salah": falsePositive,
    },
    {
      name: "Positif",
      "Negatif Salah": falseNegative,
      "Positif Sejati": truePositive,
    },
  ];

  const total = trueNegative + falsePositive + falseNegative + truePositive;
  const tnPercent = ((trueNegative / total) * 100).toFixed(1);
  const fpPercent = ((falsePositive / total) * 100).toFixed(1);
  const fnPercent = ((falseNegative / total) * 100).toFixed(1);
  const tpPercent = ((truePositive / total) * 100).toFixed(1);

  return (
    <Card className="col-span-1 md:col-span-2 border-border shadow-lg">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5 border-b border-border">
        <CardTitle className="text-xl">Matriks Kebingungan (Confusion Matrix)</CardTitle>
        <p className="text-sm text-muted-foreground mt-2">
          Perbandingan prediksi model dengan nilai sebenarnya
        </p>
      </CardHeader>
      <CardContent className="pt-8">
        <div className="space-y-8">
          {/* Chart */}
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="name" stroke="var(--color-muted-foreground)" />
              <YAxis stroke="var(--color-muted-foreground)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "var(--color-foreground)" }}
              />
              <Legend />
              <Bar dataKey="Negatif Sejati" stackId="a" fill="var(--color-chart-1)" />
              <Bar dataKey="Positif Salah" stackId="a" fill="var(--color-chart-4)" />
              <Bar dataKey="Negatif Salah" stackId="a" fill="var(--color-chart-5)" />
              <Bar dataKey="Positif Sejati" stackId="a" fill="var(--color-primary)" />
            </BarChart>
          </ResponsiveContainer>

          {/* Matrix Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Negatif Sejati (TN)</p>
              <p className="text-3xl font-bold text-green-700">{trueNegative}</p>
              <p className="text-xs text-green-600 mt-2 font-medium">✓ {tnPercent}% dari total</p>
            </div>
            <div className="border-2 border-red-200 bg-gradient-to-br from-red-50 to-rose-50 p-5 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Positif Salah (FP)</p>
              <p className="text-3xl font-bold text-red-700">{falsePositive}</p>
              <p className="text-xs text-red-600 mt-2 font-medium">✗ {fpPercent}% dari total</p>
            </div>
            <div className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-5 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Negatif Salah (FN)</p>
              <p className="text-3xl font-bold text-amber-700">{falseNegative}</p>
              <p className="text-xs text-amber-600 mt-2 font-medium">✗ {fnPercent}% dari total</p>
            </div>
            <div className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 p-5 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Positif Sejati (TP)</p>
              <p className="text-3xl font-bold text-blue-700">{truePositive}</p>
              <p className="text-xs text-blue-600 mt-2 font-medium">✓ {tpPercent}% dari total</p>
            </div>
          </div>

          {/* Summary Info */}
          <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
            <p className="text-sm font-semibold text-blue-900 mb-2">💡 Penjelasan</p>
            <p className="text-sm text-blue-800">
              <strong>TN (Benar Negatif):</strong> Model dengan benar memprediksi tidak ada penyakit. 
              <strong className="ml-3">FP (Positif Salah):</strong> Model salah memprediksi ada penyakit.
              <strong className="ml-3">FN (Negatif Salah):</strong> Model salah memprediksi tidak ada penyakit.
              <strong className="ml-3">TP (Benar Positif):</strong> Model dengan benar memprediksi ada penyakit.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
