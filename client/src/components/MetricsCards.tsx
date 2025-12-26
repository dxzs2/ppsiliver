import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, CheckCircle, AlertCircle, Zap } from "lucide-react";

interface MetricsCardsProps {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  rocAuc?: number;
}

export default function MetricsCards({
  accuracy,
  precision,
  recall,
  f1Score,
  rocAuc,
}: MetricsCardsProps) {
  const metrics = [
    {
      title: "Akurasi",
      value: (accuracy * 100).toFixed(2),
      unit: "%",
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100",
      description: "Tingkat kebenaran prediksi keseluruhan",
    },
    {
      title: "Presisi",
      value: (precision * 100).toFixed(2),
      unit: "%",
      icon: AlertCircle,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      description: "Positif sejati dari prediksi positif",
    },
    {
      title: "Recall (Sensitivitas)",
      value: (recall * 100).toFixed(2),
      unit: "%",
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      description: "Positif sejati dari kasus positif sebenarnya",
    },
    {
      title: "Skor F1",
      value: (f1Score * 100).toFixed(2),
      unit: "%",
      icon: Zap,
      color: "text-amber-600",
      bgColor: "bg-amber-100",
      description: "Rata-rata harmonis presisi dan recall",
    },
  ];

  if (rocAuc !== undefined) {
    metrics.push({
      title: "ROC-AUC",
      value: (rocAuc * 100).toFixed(2),
      unit: "%",
      icon: TrendingUp,
      color: "text-indigo-600",
      bgColor: "bg-indigo-100",
      description: "Luas di bawah kurva ROC",
    });
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <Card key={metric.title} className="hover:shadow-lg hover:border-primary/50 transition-all duration-300 border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  {metric.title}
                </CardTitle>
                <div className={`${metric.bgColor} p-2 rounded-lg`}>
                  <Icon className={`w-4 h-4 ${metric.color}`} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-bold text-foreground">{metric.value}</span>
                <span className="text-sm text-muted-foreground font-medium">{metric.unit}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2.5 leading-relaxed">{metric.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
