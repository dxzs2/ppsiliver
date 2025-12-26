import { useState, useRef } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getLoginUrl } from "@/const";
import { Brain, BarChart3, TrendingUp, Zap, ArrowRight, CheckCircle, AlertCircle, AlertTriangle, Upload, FileText, CheckCheck, AlertCircle as AlertIcon } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

// Contoh kasus untuk testing cepat
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

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const predictMutation = trpc.prediction.predictForPatient.useMutation();
  const predictFromCSVMutation = trpc.prediction.predictFromCSV.useMutation();
  const formSectionRef = useRef<HTMLDivElement>(null);

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
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvResults, setCsvResults] = useState<any>(null);
  const [csvLoading, setCsvLoading] = useState(false);
  const [csvError, setCsvError] = useState<string>("");
  const csvInputRef = useRef<HTMLInputElement>(null);

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

  const handleCsvFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setCsvError("Ukuran file terlalu besar. Maksimal 5MB.");
        return;
      }
      if (!file.name.endsWith('.csv')) {
        setCsvError("File harus format CSV.");
        return;
      }
      setCsvFile(file);
      setCsvError("");
      setCsvResults(null);
    }
  };

  const handleCsvSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvFile) {
      setCsvError("Pilih file CSV terlebih dahulu.");
      return;
    }

    setCsvLoading(true);
    setCsvError("");
    setCsvResults(null);

    try {
      const fileContent = await csvFile.text();
      const result = await predictFromCSVMutation.mutateAsync({
        csvContent: fileContent,
      });
      setCsvResults(result);
    } catch (err) {
      setCsvError(err instanceof Error ? err.message : "Gagal memproses file CSV");
    } finally {
      setCsvLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/95 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-2 sm:py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-9 sm:w-10 h-9 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-md">
              <Brain className="w-5 sm:w-6 h-5 sm:h-6 text-primary-foreground" />
            </div>
            <div>
              <span className="font-bold text-sm sm:text-lg text-foreground block">Liver AI Agent</span>
              <span className="text-xs text-muted-foreground hidden sm:block">Diagnosis Penyakit Hati</span>
            </div>
          </div>
          <div className="flex gap-2 sm:gap-3">
            <Button
              onClick={() => formSectionRef.current?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-xs sm:text-sm"
              size="sm"
            >
              Prediksi
            </Button>
            {isAuthenticated && (
              <Button
                onClick={() => navigate("/dashboard")}
                className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-medium text-xs sm:text-sm"
                size="sm"
              >
                Dashboard
              </Button>
            )}

          </div>
        </div>
      </nav>


      {/* Tentang / Info Section */}
      <section className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-16 sm:py-20 md:py-28 lg:py-32">
        <div className="space-y-12 sm:space-y-16 md:space-y-20">
          {/* Hero Text Section */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-primary/10 rounded-full mb-6 sm:mb-8 border border-primary/20">
              <span className="w-2 h-2 rounded-full bg-primary"></span>
              <span className="text-xs sm:text-sm font-semibold text-primary">Teknologi AI Terdepan</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 sm:mb-8 leading-tight tracking-tight max-w-4xl">
              Deteksi Dini Penyakit Hati dengan <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Teknologi AI</span> Akurat 99.77%
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground mb-8 sm:mb-12 leading-relaxed max-w-3xl">
              Sistem diagnosis berbasis AI menggunakan model machine learning XGBoost yang telah dilatih dengan akurasi 99.77% untuk mendeteksi risiko penyakit hati berdasarkan data laboratorium klinis.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-4">
              <Button
                onClick={() => formSectionRef.current?.scrollIntoView({ behavior: 'smooth' })}
                size="lg"
                className="bg-gradient-to-r from-primary to-secondary hover:shadow-lg hover:from-primary/90 hover:to-secondary/90 text-primary-foreground font-semibold text-sm sm:text-base py-6 sm:py-5 h-auto sm:h-11"
              >
                Mulai Sekarang <ArrowRight className="ml-2 sm:ml-3 w-4 sm:w-5 h-4 sm:h-5" />
              </Button>
              {isAuthenticated && (
                <Button 
                  onClick={() => navigate("/dashboard")}
                  size="lg" 
                  variant="outline"
                  className="font-semibold text-sm sm:text-base py-6 sm:py-5 h-auto sm:h-11"
                >
                  Dashboard
                </Button>
              )}
            </div>
          </div>

          {/* Metrics Cards Section */}
          <div className="relative">
            <div className="absolute -inset-8 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-3xl blur-2xl opacity-70" />
            <Card className="relative border-2 border-primary/30 shadow-2xl">
              <CardContent className="pt-8 sm:pt-10 md:pt-12">
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-start gap-4 p-4 sm:p-5 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-6 sm:w-7 h-6 sm:h-7 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground font-medium">Tingkat Akurasi Model</p>
                      <p className="text-2xl sm:text-3xl font-bold text-foreground mt-1">99.77%</p>
                      <p className="text-xs text-muted-foreground mt-2">Validasi pada 165 sampel pasien</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 sm:p-5 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-6 sm:w-7 h-6 sm:h-7 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground font-medium">Skor F1 (Keseimbangan)</p>
                      <p className="text-2xl sm:text-3xl font-bold text-foreground mt-1">99.84%</p>
                      <p className="text-xs text-muted-foreground mt-2">Presisi dan recall terukur</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 sm:p-5 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <Zap className="w-6 sm:w-7 h-6 sm:h-7 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground font-medium">Skor ROC-AUC</p>
                      <p className="text-2xl sm:text-3xl font-bold text-foreground mt-1">99.88%</p>
                      <p className="text-xs text-muted-foreground mt-2">Kemampuan diskriminasi sempurna</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Bagian Fitur */}
      <section className="bg-gradient-to-b from-primary/5 to-background border-y border-border py-12 sm:py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-primary/10 rounded-full mb-4 sm:mb-6 border border-primary/20">
              <span className="w-2 h-2 rounded-full bg-primary"></span>
              <span className="text-xs sm:text-sm font-semibold text-primary">Fitur Dashboard</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 sm:mb-4">Alat Analisis Komprehensif</h2>
            <p className="text-xs sm:text-sm md:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
              Dapatkan wawasan mendalam tentang kinerja model dan prediksi risiko penyakit hati dengan visualisasi interaktif
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="hover:shadow-xl hover:border-primary/50 transition-all duration-300 group border-border">
                <CardHeader>
                  <div className={`w-14 h-14 rounded-xl ${feature.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <feature.icon className={`w-7 h-7 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Bagian Formulir Prediksi */}
      <section ref={formSectionRef} className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-12 sm:py-16 md:py-24">
        <div className="mb-8 sm:mb-10 md:mb-12">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-primary/10 rounded-full mb-4 sm:mb-6 border border-primary/20">
            <span className="w-2 h-2 rounded-full bg-primary"></span>
            <span className="text-xs sm:text-sm font-semibold text-primary">Prediksi Instan</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-2 sm:mb-4">Analisis Risiko Penyakit Hati</h2>
          <p className="text-xs sm:text-sm md:text-lg text-muted-foreground">
            Masukkan data laboratorium pasien untuk mendapatkan prediksi risiko penyakit hati secara real-time (Model XGBoost - Akurasi 99.77%)
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Prediction Form */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg border-border">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5 border-b border-border p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-2xl">Masukkan Data Pasien</CardTitle>
                <CardDescription className="text-xs sm:text-base">Lengkapi informasi pasien dan nilai laboratorium untuk prediksi</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 sm:pt-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Info Pasien */}
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

                  {/* Contoh Kasus Cepat */}
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

                  {/* Nilai Laboratorium */}
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

          {/* Panel Hasil */}
          <div className="lg:col-span-1">
            {prediction && (
              <div className="space-y-4 sticky top-24">
                <Card className={`shadow-lg border-2 ${prediction.prediction === "positive" ? "border-red-300 bg-gradient-to-br from-red-50 to-rose-50" : "border-green-300 bg-gradient-to-br from-green-50 to-emerald-50"}`}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-xl">
                      {getPredictionIcon(prediction.prediction)}
                      {prediction.prediction === "positive" ? "⚠️ Risiko Terdeteksi" : "✅ Aman"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-muted-foreground">Tingkat Risiko</p>
                      <Badge className={`${getRiskColor(prediction.riskLevel)} font-bold text-base px-3 py-1.5`}>
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

                {/* Grafik Radar untuk Nilai Laboratorium */}
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg">Analisis Nilai Lab</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <RadarChart data={[
                        { name: "Albumin", value: Math.min(100, Math.max(0, (parseFloat(formData.albumin) / 5) * 100)) },
                        { name: "Alk Phos", value: Math.min(100, (parseFloat(formData.alkalinePhosphatase) / 200) * 100) },
                        { name: "ALAT", value: Math.min(100, (parseFloat(formData.alamiNotransaminase) / 100) * 100) },
                        { name: "ASAT", value: Math.min(100, (parseFloat(formData.aspartateAminotransaminase) / 100) * 100) },
                        { name: "Bilirubin", value: Math.min(100, (parseFloat(formData.bilirubin) / 3) * 100) },
                      ]}>
                        <PolarGrid stroke="var(--color-border)" />
                        <PolarAngleAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <PolarRadiusAxis angle={90} domain={[0, 100]} />
                        <Radar name="Nilai" dataKey="value" stroke="var(--color-primary)" fill="var(--color-primary)" fillOpacity={0.7} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Grafik Bar untuk Metrik */}
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg">Metrik Prediksi</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={[
                        { name: "Kepercayaan", value: Math.round(prediction.confidence * 100) },
                        { name: "Skor Risiko", value: Math.round(prediction.riskScore * 100) },
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                        <XAxis dataKey="name" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip contentStyle={{
                          backgroundColor: "var(--color-card)",
                          border: "1px solid var(--color-border)",
                          borderRadius: "8px",
                        }} />
                        <Bar dataKey="value" fill="var(--color-primary)" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Section Informasi Penyakit Hati */}
      <section className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-12 sm:py-16 md:py-24 border-t border-border">
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-primary/10 rounded-full mb-4 sm:mb-6 border border-primary/20">
            <span className="w-2 h-2 rounded-full bg-primary"></span>
            <span className="text-xs sm:text-sm font-semibold text-primary">Edukasi Kesehatan</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-2 sm:mb-4">Tentang Penyakit Hati</h2>
          <p className="text-xs sm:text-sm md:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
            Memahami penyakit hati dan faktor risiko yang berkontribusi terhadap perkembangan penyakit
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {/* Informasi Umum */}
          <Card className="border-border shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-border">
              <CardTitle className="text-lg sm:text-xl">📋 Apa itu Penyakit Hati?</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Penyakit hati adalah kondisi medis yang mempengaruhi fungsi hati. Hati adalah organ penting yang berperan dalam:
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-3">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Metabolisme lemak, protein, dan karbohidrat</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Detoksifikasi zat berbahaya dalam darah</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Produksi protein dan faktor pembekuan darah</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Penyimpanan vitamin dan mineral</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Faktor Risiko */}
          <Card className="border-border shadow-lg">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 border-b border-border">
              <CardTitle className="text-lg sm:text-xl">⚠️ Faktor Risiko Penyakit Hati</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-3">
                <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-sm font-semibold text-red-900 mb-1">Alkohol</p>
                  <p className="text-xs text-red-800">Konsumsi alkohol berlebihan merusak sel hati</p>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <p className="text-sm font-semibold text-orange-900 mb-1">Hepatitis Viral</p>
                  <p className="text-xs text-orange-800">Infeksi virus (A, B, C) dapat merusak hati</p>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-sm font-semibold text-yellow-900 mb-1">Obesitas & Diabetes</p>
                  <p className="text-xs text-yellow-800">Penyakit metabolik meningkatkan risiko fatty liver</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Section Interpretasi Hasil & Rekomendasi */}
      <section className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-12 sm:py-16 md:py-24 border-t border-border">
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-primary/10 rounded-full mb-4 sm:mb-6 border border-primary/20">
            <span className="w-2 h-2 rounded-full bg-primary"></span>
            <span className="text-xs sm:text-sm font-semibold text-primary">Panduan Interpretasi</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-2 sm:mb-4">Memahami Hasil Prediksi</h2>
          <p className="text-xs sm:text-sm md:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
            Panduan lengkap untuk memahami hasil analisis AI dan rekomendasi tindakan medis
          </p>
        </div>

        {/* Risk Levels */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-12">
          {/* Risiko Rendah */}
          <Card className="border-l-4 border-l-green-500 border-border shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
              <div className="flex items-start gap-3">
                <span className="text-3xl">🟢</span>
                <div>
                  <CardTitle className="text-lg">Risiko Rendah</CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">Fungsi hati normal</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div>
                <p className="text-sm font-semibold text-foreground mb-2">📊 Karakteristik:</p>
                <ul className="text-xs space-y-1 text-muted-foreground">
                  <li>• Semua nilai lab dalam range normal</li>
                  <li>• Tidak ada tanda kerusakan hati</li>
                  <li>• Fungsi hati berfungsi optimal</li>
                </ul>
              </div>
              <div className="pt-3 border-t border-green-200">
                <p className="text-sm font-semibold text-green-900 mb-2">✅ Rekomendasi:</p>
                <ul className="text-xs space-y-1 text-green-800">
                  <li>• Lanjutkan gaya hidup sehat</li>
                  <li>• Hindari alkohol berlebihan</li>
                  <li>• Kontrol berat badan ideal</li>
                  <li>• Pemeriksaan rutin setiap 1-2 tahun</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Risiko Sedang */}
          <Card className="border-l-4 border-l-yellow-500 border-border shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50">
              <div className="flex items-start gap-3">
                <span className="text-3xl">🟡</span>
                <div>
                  <CardTitle className="text-lg">Risiko Sedang</CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">Peningkatan risiko penyakit</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div>
                <p className="text-sm font-semibold text-foreground mb-2">📊 Karakteristik:</p>
                <ul className="text-xs space-y-1 text-muted-foreground">
                  <li>• Beberapa nilai lab abnormal</li>
                  <li>• Kemungkinan awal penyakit hati</li>
                  <li>• Perlu monitoring lebih ketat</li>
                </ul>
              </div>
              <div className="pt-3 border-t border-yellow-200">
                <p className="text-sm font-semibold text-yellow-900 mb-2">⚠️ Rekomendasi:</p>
                <ul className="text-xs space-y-1 text-yellow-800">
                  <li>• Konsultasi ke dokter spesialis hati</li>
                  <li>• Modifikasi diet (kurangi lemak)</li>
                  <li>• Tingkatkan aktivitas fisik</li>
                  <li>• Pemeriksaan ulang dalam 3-6 bulan</li>
                  <li>• Hindari obat hepatotoksik</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Risiko Tinggi */}
          <Card className="border-l-4 border-l-red-500 border-border shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="bg-gradient-to-r from-red-50 to-rose-50">
              <div className="flex items-start gap-3">
                <span className="text-3xl">🔴</span>
                <div>
                  <CardTitle className="text-lg">Risiko Tinggi</CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">Kemungkinan penyakit hati</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div>
                <p className="text-sm font-semibold text-foreground mb-2">📊 Karakteristik:</p>
                <ul className="text-xs space-y-1 text-muted-foreground">
                  <li>• Banyak nilai lab abnormal</li>
                  <li>• Indikasi kerusakan hati signifikan</li>
                  <li>• Memerlukan tindakan segera</li>
                </ul>
              </div>
              <div className="pt-3 border-t border-red-200">
                <p className="text-sm font-semibold text-red-900 mb-2">🚨 Rekomendasi:</p>
                <ul className="text-xs space-y-1 text-red-800">
                  <li>• Segera konsultasi dokter spesialis</li>
                  <li>• Pemeriksaan imaging (USG/CT scan)</li>
                  <li>• Tes fungsi hati lengkap</li>
                  <li>• Screening virus hepatitis</li>
                  <li>• Ketat hindari alkohol</li>
                  <li>• Monitor kesehatan intensif</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lab Values Interpretation */}
        <Card className="border-border shadow-lg">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-border">
            <CardTitle className="text-lg sm:text-xl">🔬 Panduan Nilai Laboratorium</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-foreground">Parameter Utama:</h4>
                <div className="space-y-3">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-xs font-bold text-foreground">Albumin (Normal: 3.5-5.0 g/dL)</p>
                    <p className="text-xs text-muted-foreground mt-1">Menunjukkan kemampuan hati membuat protein. Rendah menandakan gangguan fungsi hati.</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-xs font-bold text-foreground">Bilirubin (Normal: 0.1-1.2 mg/dL)</p>
                    <p className="text-xs text-muted-foreground mt-1">Produk pemecahan hemoglobin. Tinggi menunjukkan kerusakan hati atau sumbatan empedu.</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-xs font-bold text-foreground">ALAT/ASAT (Normal: &lt;40 U/L)</p>
                    <p className="text-xs text-muted-foreground mt-1">Enzim hati. Tinggi menandakan kerusakan hepatosit (sel hati).</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="font-semibold text-foreground">Parameter Pendukung:</h4>
                <div className="space-y-3">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-xs font-bold text-foreground">Alkali Fosfatase (Normal: 40-130 U/L)</p>
                    <p className="text-xs text-muted-foreground mt-1">Enzim yang meningkat pada penyakit saluran empedu.</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-xs font-bold text-foreground">Kolesterol (Normal: &lt;200 mg/dL)</p>
                    <p className="text-xs text-muted-foreground mt-1">Tinggi berhubungan dengan penyakit hati berlemak.</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-xs font-bold text-foreground">Trombosit (Normal: 150-400K)</p>
                    <p className="text-xs text-muted-foreground mt-1">Rendah dapat menandakan sirosis atau portal hipertensi.</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Section FAQ */}
      <section className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-12 sm:py-16 md:py-24 border-t border-border">
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-primary/10 rounded-full mb-4 sm:mb-6 border border-primary/20">
            <span className="w-2 h-2 rounded-full bg-primary"></span>
            <span className="text-xs sm:text-sm font-semibold text-primary">Tanya Jawab</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-2 sm:mb-4">Pertanyaan Umum (FAQ)</h2>
          <p className="text-xs sm:text-sm md:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
            Jawaban untuk pertanyaan yang sering ditanyakan tentang sistem prediksi dan kesehatan hati
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full space-y-3">
            {[
              {
                q: "Seberapa akurat prediksi sistem ini?",
                a: "Sistem menggunakan model XGBoost dengan akurasi 99.77%, precision 100%, recall 100%, dan ROC-AUC 99.88%. Namun, hasil ini bukan pengganti diagnosis medis profesional."
              },
              {
                q: "Apakah saya harus ke dokter jika hasil menunjukkan risiko tinggi?",
                a: "Ya, sangat penting untuk konsultasi dengan dokter spesialis hati (hepatolog) untuk diagnosis lebih lanjut dan rencana treatment yang tepat."
              },
              {
                q: "Apa bedanya risiko rendah, sedang, dan tinggi?",
                a: "Rendah: Fungsi hati normal. Sedang: Ada beberapa abnormalitas yang perlu monitoring. Tinggi: Kemungkinan kerusakan hati signifikan yang memerlukan tindakan segera."
              },
              {
                q: "Berapa sering saya harus melakukan tes?",
                a: "Untuk risiko rendah: setiap 1-2 tahun. Risiko sedang: setiap 3-6 bulan. Risiko tinggi: sesuai rekomendasi dokter, mungkin bulanan."
              },
              {
                q: "Apakah ada obat untuk penyakit hati?",
                a: "Tergantung jenisnya. Beberapa dapat disembuhkan (hepatitis viral), beberapa dapat dikontrol (penyakit hati berlemak), namun sirosis sulit disembuhkan."
              },
              {
                q: "Bagaimana cara mencegah penyakit hati?",
                a: "Hindari alkohol, jaga berat badan, konsumsi makanan sehat, rutin berolahraga, vaksin hepatitis, dan hindari drug use/sharing jarum suntik."
              },
            ].map((item, idx) => (
              <AccordionItem key={idx} value={`item-${idx}`} className="border border-border rounded-lg px-4 bg-card hover:bg-card/80 transition-colors">
                <AccordionTrigger className="font-semibold text-sm sm:text-base text-foreground hover:text-primary">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-xs sm:text-sm text-muted-foreground leading-relaxed pt-2">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Section Author */}
      <section className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-12 sm:py-16 md:py-24 border-t border-border">
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-2 sm:mb-4">Tim Pengembang</h2>
          <p className="text-xs sm:text-sm md:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
            Proyek ini dikembangkan oleh tim profesional yang berdedikasi dalam bidang kesehatan dan teknologi AI
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
          {/* Author 1 */}
          <Card className="hover:shadow-xl transition-all duration-300 text-center border-border">
            <CardContent className="pt-6 sm:pt-8">
              <div className="w-16 sm:w-20 h-16 sm:h-20 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-md">
                <span className="text-2xl sm:text-3xl">👨‍💻</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-foreground mb-1">Dicky Zulkarnaen</h3>
              <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">Lead Developer</p>
              <Badge variant="secondary" className="text-xs">Developer</Badge>
            </CardContent>
          </Card>

          {/* Author 2 */}
          <Card className="hover:shadow-xl transition-all duration-300 text-center border-border">
            <CardContent className="pt-6 sm:pt-8">
              <div className="w-16 sm:w-20 h-16 sm:h-20 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-md">
                <span className="text-2xl sm:text-3xl">👩‍🔬</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-foreground mb-1">Yuli Asti Putri</h3>
              <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">Data Scientist</p>
              <Badge variant="secondary" className="text-xs">Data Science</Badge>
            </CardContent>
          </Card>

          {/* Author 3 */}
          <Card className="hover:shadow-xl transition-all duration-300 text-center border-border">
            <CardContent className="pt-6 sm:pt-8">
              <div className="w-16 sm:w-20 h-16 sm:h-20 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-md">
                <span className="text-2xl sm:text-3xl">👩‍⚕️</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-foreground mb-1">Maria Angel Luisa Makin</h3>
              <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">Medical Advisor</p>
              <Badge variant="secondary" className="text-xs">Healthcare</Badge>
            </CardContent>
          </Card>

          {/* Author 4 */}
          <Card className="hover:shadow-xl transition-all duration-300 text-center border-border">
            <CardContent className="pt-6 sm:pt-8">
              <div className="w-16 sm:w-20 h-16 sm:h-20 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-md">
                <span className="text-2xl sm:text-3xl">👩‍🎨</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-foreground mb-1">Agvina Maharani</h3>
              <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">UI/UX Designer</p>
              <Badge variant="secondary" className="text-xs">Design</Badge>
            </CardContent>
          </Card>

          {/* Author 5 */}
          <Card className="hover:shadow-xl transition-all duration-300 text-center border-border">
            <CardContent className="pt-6 sm:pt-8">
              <div className="w-16 sm:w-20 h-16 sm:h-20 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-md">
                <span className="text-2xl sm:text-3xl">👩‍💼</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-foreground mb-1">Sintia Ariyani</h3>
              <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">Project Manager</p>
              <Badge variant="secondary" className="text-xs">Management</Badge>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 backdrop-blur-sm py-8 sm:py-10 md:py-12">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-9 sm:w-10 h-9 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Brain className="w-5 sm:w-6 h-5 sm:h-6 text-primary-foreground" />
              </div>
              <div>
                <span className="font-bold text-sm sm:text-base text-foreground block">Liver AI Agent</span>
                <span className="text-xs text-muted-foreground hidden sm:block">Sistem Diagnosis Cerdas</span>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground text-center md:text-right">
              © 2025 Liver AI Agent. Model XGBoost dengan akurasi 99.77% untuk deteksi penyakit hati berbasis AI.
            </p>
          </div>
          <div className="border-t border-border mt-6 sm:mt-8 pt-6 sm:pt-8">
            <p className="text-xs text-muted-foreground text-center">
              ⚠️ Disclaimer: Sistem ini adalah alat bantu medis dan bukan pengganti diagnosis profesional. Selalu konsultasi dengan dokter spesialis.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    title: "Metrik Kinerja",
    description: "Lihat metrik model komprehensif termasuk Akurasi, Presisi, Recall, dan Skor F1.",
    icon: BarChart3,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    title: "Prediksi Pasien",
    description: "Prediksi risiko penyakit hati menggunakan nilai laboratorium pasien nyata dengan AI.",
    icon: Brain,
    color: "text-red-600",
    bgColor: "bg-red-50",
  },
  {
    title: "Matriks Kebingungan",
    description: "Visualisasikan true positives, false positives, dan hasil klasifikasi lainnya.",
    icon: TrendingUp,
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  {
    title: "Analisis Kurva ROC",
    description: "Evaluasi kemampuan diskriminasi model dengan visualisasi kurva ROC dan skor AUC.",
    icon: Zap,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  {
    title: "Kurva Presisi-Recall",
    description: "Analisis pertukaran antara presisi dan recall pada ambang batas yang berbeda.",
    icon: BarChart3,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
  },
  {
    title: "Pentingnya Fitur",
    description: "Identifikasi fitur paling berpengaruh yang mendorong prediksi model.",
    icon: Brain,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
  },
];
