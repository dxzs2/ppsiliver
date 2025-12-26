import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, AlertTriangle } from "lucide-react";

// Sample test cases for quick testing
const SAMPLE_CASES = {
  "Pasien Sehat": {
    name: "Rudi Hartono",
    age: "45",
    gender: "male" as const,
    albumin: "4.0",
    alkalinePhosphatase: "70",
    alamiNotransaminase: "30",
    aspartateAminotransaminase: "35",
    bilirubin: "0.8",
    cholesterol: "180",
    albuminglobularRatio: "1.3",
    plateletsCount: "280",
    prothombinTime: "11",
  },
  "Risiko Sedang": {
    name: "Siti Nurhaliza",
    age: "55",
    gender: "female" as const,
    albumin: "3.2",
    alkalinePhosphatase: "120",
    alamiNotransaminase: "80",
    aspartateAminotransaminase: "90",
    bilirubin: "1.5",
    cholesterol: "220",
    albuminglobularRatio: "1.0",
    plateletsCount: "200",
    prothombinTime: "13",
  },
  "Risiko Tinggi": {
    name: "Bambang Sutrisno",
    age: "65",
    gender: "male" as const,
    albumin: "2.8",
    alkalinePhosphatase: "180",
    alamiNotransaminase: "150",
    aspartateAminotransaminase: "160",
    bilirubin: "2.5",
    cholesterol: "280",
    albuminglobularRatio: "0.9",
    plateletsCount: "120",
    prothombinTime: "15",
  },
};

interface FormData {
  name: string;
  age: string;
  gender: "male" | "female";
  albumin: string;
  alkalinePhosphatase: string;
  alamiNotransaminase: string;
  aspartateAminotransaminase: string;
  bilirubin: string;
  cholesterol: string;
  albuminglobularRatio: string;
  plateletsCount: string;
  prothombinTime: string;
}

export function PredictionPage() {
  const predictMutation = trpc.prediction.predictForPatient.useMutation();
  const patientsQuery = trpc.prediction.getPatients.useQuery(undefined, { retry: false });
  const allPredictionsQuery = trpc.prediction.getAllPredictions.useQuery(undefined, { retry: false });

  const [formData, setFormData] = useState<FormData>({
    name: "",
    age: "",
    gender: "male",
    albumin: "3.5",
    alkalinePhosphatase: "60",
    alamiNotransaminase: "25",
    aspartateAminotransaminase: "30",
    bilirubin: "0.7",
    cholesterol: "150",
    albuminglobularRatio: "1.2",
    plateletsCount: "250",
    prothombinTime: "12",
  });

  const [prediction, setPrediction] = useState<any>(null);
  const [error, setError] = useState<string>("");

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const loadSampleCase = (caseName: keyof typeof SAMPLE_CASES) => {
    setFormData(SAMPLE_CASES[caseName]);
    setError("");
    setPrediction(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setPrediction(null);

    try {
      const result = await predictMutation.mutateAsync({
        name: formData.name,
        age: parseInt(formData.age),
        gender: formData.gender,
        albumin: parseFloat(formData.albumin),
        alkalinePhosphatase: parseFloat(formData.alkalinePhosphatase),
        alamiNotransaminase: parseFloat(formData.alamiNotransaminase),
        aspartateAminotransaminase: parseFloat(formData.aspartateAminotransaminase),
        bilirubin: parseFloat(formData.bilirubin),
        cholesterol: parseFloat(formData.cholesterol),
        albuminglobularRatio: parseFloat(formData.albuminglobularRatio),
        plateletsCount: parseFloat(formData.plateletsCount),
        prothombinTime: parseFloat(formData.prothombinTime),
      });

      setPrediction(result);
      patientsQuery.refetch();
      allPredictionsQuery.refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Prediction failed");
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "low":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "high":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPredictionIcon = (pred: string) => {
    return pred === "positive" ? (
      <AlertCircle className="w-5 h-5 text-red-600" />
    ) : (
      <CheckCircle className="w-5 h-5 text-green-600" />
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header Navigation */}
      <nav className="border-b border-border bg-card/95 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-md">
              <AlertCircle className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-bold text-foreground">Liver AI Agent</h2>
              <p className="text-xs text-muted-foreground">Sistem Prediksi Penyakit</p>
            </div>
          </div>
          <a 
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground px-4 py-2 rounded-lg hover:bg-muted transition-colors font-medium"
          >
            Beranda
          </a>
        </div>
      </nav>

      <div className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4 border border-primary/20 w-fit">
              <span className="w-2 h-2 rounded-full bg-primary"></span>
              <span className="text-sm font-semibold text-primary">Halaman Prediksi</span>
            </div>
            <h1 className="text-5xl font-bold text-foreground mb-3">Prediksi Penyakit Hati</h1>
            <p className="text-lg text-muted-foreground">Sistem penilaian berbasis AI menggunakan nilai laboratorium klinis (Model XGBoost - Akurasi 99.77%)</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Prediction Form */}
            <div className="lg:col-span-2">
              <Card className="shadow-lg border-border">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5 border-b border-border">
                  <CardTitle className="text-2xl">Masukkan Data Pasien</CardTitle>
                  <CardDescription>Lengkapi informasi dan nilai laboratorium untuk prediksi</CardDescription>
                </CardHeader>
                <CardContent className="pt-8">
                  <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Patient Info */}
                    <div>
                      <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                        Informasi Pasien
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="name" className="font-medium">Nama Pasien</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={e => handleInputChange("name", e.target.value)}
                            placeholder="Masukkan nama lengkap"
                            required
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label htmlFor="age" className="font-medium">Umur (tahun)</Label>
                          <Input
                            id="age"
                            type="number"
                            value={formData.age}
                            onChange={e => handleInputChange("age", e.target.value)}
                            placeholder="Contoh: 45"
                            required
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label htmlFor="gender" className="font-medium">Jenis Kelamin</Label>
                          <Select value={formData.gender} onValueChange={v => handleInputChange("gender", v as any)}>
                            <SelectTrigger className="mt-2">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="male">Laki-laki</SelectItem>
                              <SelectItem value="female">Perempuan</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* Quick Sample Cases */}
                    <div className="space-y-3 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">🧪</span>
                        <p className="text-sm font-bold text-gray-900">Coba Data Contoh Pasien:</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {Object.keys(SAMPLE_CASES).map((caseName) => (
                          <Button
                            key={caseName}
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => loadSampleCase(caseName as keyof typeof SAMPLE_CASES)}
                            className="text-xs font-medium hover:bg-blue-100 border-blue-300"
                          >
                            {caseName}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Lab Values */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-foreground flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-secondary"></div>
                        Hasil Tes Laboratorium
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="albumin" className="font-medium text-sm">Albumin (g/dL)</Label>
                          <Input
                            id="albumin"
                            type="number"
                            step="0.1"
                            value={formData.albumin}
                            onChange={e => handleInputChange("albumin", e.target.value)}
                            placeholder="3.5"
                            required
                            className="mt-1.5"
                          />
                        </div>
                        <div>
                          <Label htmlFor="alk" className="font-medium text-sm">Alkaline Phosphatase (U/L)</Label>
                          <Input
                            id="alk"
                            type="number"
                            step="0.1"
                            value={formData.alkalinePhosphatase}
                            onChange={e => handleInputChange("alkalinePhosphatase", e.target.value)}
                            placeholder="60"
                            required
                            className="mt-1.5"
                          />
                        </div>
                        <div>
                          <Label htmlFor="alat" className="font-medium text-sm">ALAT/ALT (U/L)</Label>
                          <Input
                            id="alat"
                            type="number"
                            step="0.1"
                            value={formData.alamiNotransaminase}
                            onChange={e => handleInputChange("alamiNotransaminase", e.target.value)}
                            placeholder="25"
                            required
                            className="mt-1.5"
                          />
                        </div>
                        <div>
                          <Label htmlFor="asat" className="font-medium text-sm">ASAT/AST (U/L)</Label>
                          <Input
                            id="asat"
                            type="number"
                            step="0.1"
                            value={formData.aspartateAminotransaminase}
                            onChange={e => handleInputChange("aspartateAminotransaminase", e.target.value)}
                            placeholder="30"
                            required
                            className="mt-1.5"
                          />
                        </div>
                        <div>
                          <Label htmlFor="bilirubin" className="font-medium text-sm">Bilirubin (mg/dL)</Label>
                          <Input
                            id="bilirubin"
                            type="number"
                            step="0.1"
                            value={formData.bilirubin}
                            onChange={e => handleInputChange("bilirubin", e.target.value)}
                            placeholder="0.7"
                            required
                            className="mt-1.5"
                          />
                        </div>
                        <div>
                          <Label htmlFor="cholesterol" className="font-medium text-sm">Kolesterol (mg/dL)</Label>
                          <Input
                            id="cholesterol"
                            type="number"
                            step="0.1"
                            value={formData.cholesterol}
                            onChange={e => handleInputChange("cholesterol", e.target.value)}
                            placeholder="150"
                            required
                            className="mt-1.5"
                          />
                        </div>
                        <div>
                          <Label htmlFor="albumin-globular" className="font-medium text-sm">Rasio Albumin/Globulin</Label>
                          <Input
                            id="albumin-globular"
                            type="number"
                            step="0.1"
                            value={formData.albuminglobularRatio}
                            onChange={e => handleInputChange("albuminglobularRatio", e.target.value)}
                            placeholder="1.2"
                            required
                            className="mt-1.5"
                          />
                        </div>
                        <div>
                          <Label htmlFor="platelets" className="font-medium text-sm">Trombosit (K/uL)</Label>
                          <Input
                            id="platelets"
                            type="number"
                            step="0.1"
                            value={formData.plateletsCount}
                            onChange={e => handleInputChange("plateletsCount", e.target.value)}
                            placeholder="250"
                            required
                            className="mt-1.5"
                          />
                        </div>
                        <div>
                          <Label htmlFor="prothrombin" className="font-medium text-sm">Waktu Protrombin (detik)</Label>
                          <Input
                            id="prothrombin"
                            type="number"
                            step="0.1"
                            value={formData.prothombinTime}
                            onChange={e => handleInputChange("prothombinTime", e.target.value)}
                            placeholder="12"
                            required
                            className="mt-1.5"
                          />
                        </div>
                      </div>
                    </div>

                    {error && (
                      <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <Button type="submit" className="w-full bg-gradient-to-r from-primary to-secondary hover:shadow-lg text-primary-foreground font-semibold py-6 text-base" disabled={predictMutation.isPending}>
                      {predictMutation.isPending ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full"></div>
                          Sedang Memproses...
                        </div>
                      ) : "🔍 Lakukan Prediksi"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Results Panel */}
            <div className="lg:col-span-1">
              {prediction && (
                <Card className={`sticky top-24 shadow-lg border-2 ${prediction.prediction === "positive" ? "border-red-300 bg-gradient-to-br from-red-50 to-rose-50" : "border-green-300 bg-gradient-to-br from-green-50 to-emerald-50"}`}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-xl">
                      {getPredictionIcon(prediction.prediction)}
                      {prediction.prediction === "positive" ? "⚠️ Risiko Terdeteksi" : "✅ Aman"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-muted-foreground">Tingkat Risiko</p>
                      <Badge className={getRiskColor(prediction.riskLevel) + " font-bold text-base px-3 py-1.5"}>
                        {prediction.riskLevel === "low" ? "🟢 RENDAH" : prediction.riskLevel === "medium" ? "🟡 SEDANG" : "🔴 TINGGI"}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-muted-foreground">Skor Risiko Penyakit</p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-4xl font-bold text-foreground">{(prediction.riskScore * 100).toFixed(1)}</p>
                        <p className="text-lg text-muted-foreground">%</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-muted-foreground">Kepercayaan Model</p>
                        <p className="text-sm font-bold text-foreground">{(prediction.confidence * 100).toFixed(0)}%</p>
                      </div>
                      <div className="flex-1 bg-muted rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-primary to-secondary h-3 rounded-full transition-all"
                          style={{ width: `${prediction.confidence * 100}%` }}
                        />
                      </div>
                    </div>

                    <Alert className={prediction.prediction === "positive" ? "border-red-300 bg-red-100/50" : "border-green-300 bg-green-100/50"}>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription className="font-medium">
                        {prediction.prediction === "positive"
                          ? "Indikator risiko tinggi terdeteksi. Segera konsultasi dengan dokter spesialis hati."
                          : "Indikator risiko rendah. Lanjutkan pemeriksaan berkala."}
                      </AlertDescription>
                    </Alert>

                    <div className="text-xs text-muted-foreground pt-4 border-t border-border space-y-1">
                      <p><strong>Pasien:</strong> {prediction.patient.name}</p>
                      <p><strong>Umur:</strong> {prediction.patient.age} tahun</p>
                      <p className="font-semibold text-foreground mt-3">{new Date().toLocaleString("id-ID")}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Patients List */}
          {patientsQuery.data && patientsQuery.data.length > 0 && (
            <Card className="mt-12 shadow-lg border-border">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5 border-b border-border">
                <CardTitle className="text-2xl">Pasien Terbaru</CardTitle>
                <CardDescription>Catatan pasien yang telah diprediksi</CardDescription>
              </CardHeader>
              <CardContent className="pt-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {patientsQuery.data.map(patient => (
                    <Card key={patient.id} className="cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all duration-300 border-border group">
                      <CardContent className="pt-6">
                        <p className="font-semibold text-foreground text-lg group-hover:text-primary transition-colors">{patient.name}</p>
                        <p className="text-sm text-muted-foreground mt-2">Umur: {patient.age} tahun ({patient.gender === "male" ? "Laki-laki" : "Perempuan"})</p>
                        <p className="text-xs text-muted-foreground mt-3 font-medium">
                          📅 {new Date(patient.createdAt).toLocaleDateString("id-ID")}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
