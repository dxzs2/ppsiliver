import MLDashboardLayout from "@/components/MLDashboardLayout";
import MetricsCards from "@/components/MetricsCards";
import ConfusionMatrixChart from "@/components/ConfusionMatrixChart";
import ROCCurveChart from "@/components/ROCCurveChart";
import PrecisionRecallChart from "@/components/PrecisionRecallChart";
import FeatureImportanceTable from "@/components/FeatureImportanceTable";
import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Activity, AlertCircle } from "lucide-react";

export default function Dashboard() {
  const { data: modelData, isLoading, error } = trpc.modelEvaluation.getLatest.useQuery();

  if (isLoading) {
    return (
      <MLDashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-4">
            <div className="relative w-16 h-16 mx-auto">
              <Activity className="w-16 h-16 text-primary animate-spin" />
            </div>
            <p className="text-muted-foreground font-medium">Memuat data evaluasi model...</p>
            <p className="text-xs text-muted-foreground">Harap tunggu sebentar</p>
          </div>
        </div>
      </MLDashboardLayout>
    );
  }

  if (error || !modelData) {
    return (
      <MLDashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Card className="max-w-md w-full border-destructive/50 bg-destructive/5">
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <AlertCircle className="w-8 h-8 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Gagal Memuat Data</h3>
                  <p className="text-sm text-muted-foreground">
                    {error?.message || "Tidak dapat memuat data evaluasi model. Silakan coba lagi."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </MLDashboardLayout>
    );
  }

  const rocData = (modelData.rocCurve as Array<{ fpr: number; tpr: number }>) || [];
  const prData = (modelData.precisionRecallCurve as Array<{ recall: number; precision: number }>) || [];
  const features = (modelData.featureImportance as Array<{ name: string; importance: number }>) || [];

  return (
    <MLDashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="border-b border-border pb-8">
          <div className="flex items-start justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4 border border-primary/20 w-fit">
                <span className="w-2 h-2 rounded-full bg-primary"></span>
                <span className="text-sm font-semibold text-primary">Dashboard Evaluasi Model</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3">Analisis Kinerja XGBoost</h1>
              <p className="text-lg text-muted-foreground mb-4">
                Evaluasi komprehensif model klasifikasi penyakit hati berbasis dataset Liver Patient
              </p>
              {modelData.createdAt && (
                <p className="text-sm text-muted-foreground font-medium">
                  ⏰ Terakhir diperbarui: {new Date(modelData.createdAt).toLocaleString("id-ID")}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Metrics Cards */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
            <span className="text-xl">📊</span>
            Metrik Kinerja Model
          </h2>
          <MetricsCards
            accuracy={modelData.accuracy}
            precision={modelData.precision}
            recall={modelData.recall}
            f1Score={modelData.f1Score}
            rocAuc={modelData.rocAuc}
          />
        </div>

        {/* Charts Grid */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
            <span className="text-xl">📈</span>
            Visualisasi Hasil Evaluasi
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Confusion Matrix */}
            <ConfusionMatrixChart
              trueNegative={modelData.confusionMatrixTn}
              falsePositive={modelData.confusionMatrixFp}
              falseNegative={modelData.confusionMatrixFn}
              truePositive={modelData.confusionMatrixTp}
            />

            {/* ROC Curve */}
            <ROCCurveChart rocData={rocData} aucScore={modelData.rocAuc} />
          </div>
        </div>

        {/* Precision-Recall Curve */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
            <span className="text-xl">🎯</span>
            Kurva Presisi-Recall
          </h2>
          <PrecisionRecallChart prData={prData} />
        </div>

        {/* Feature Importance */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
            <span className="text-xl">⭐</span>
            Pentingnya Fitur Model
          </h2>
          <FeatureImportanceTable features={features} />
        </div>

        {/* Model Info */}
        <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/30 shadow-lg">
          <CardContent className="pt-8">
            <h3 className="text-lg font-bold text-foreground mb-6">Informasi Model</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Jenis Model</p>
                <p className="text-xl font-bold text-foreground">XGBoost Classifier</p>
                <p className="text-xs text-muted-foreground">Gradient Boosting Machine</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Dataset</p>
                <p className="text-xl font-bold text-foreground">Liver Patient</p>
                <p className="text-xs text-muted-foreground">Dataset Pasien Hati (LPD)</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Ukuran Test Set</p>
                <p className="text-xl font-bold text-foreground">
                  {modelData.confusionMatrixTn +
                    modelData.confusionMatrixFp +
                    modelData.confusionMatrixFn +
                    modelData.confusionMatrixTp}{" "}
                </p>
                <p className="text-xs text-muted-foreground">sampel uji</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Status Model</p>
                <p className="text-xl font-bold text-green-600 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-600 animate-pulse"></span>
                  Siap Produksi
                </p>
                <p className="text-xs text-muted-foreground">Akurasi Tinggi</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MLDashboardLayout>
  );
}
