import { z } from "zod";
import { publicProcedure, router } from "./trpc";
import { predictLiverDisease, validatePatientData, PatientData } from "./liverDiseasePredictor";
import * as db from "../db";

const patientDataSchema = z.object({
  name: z.string().min(1, "Name is required"),
  age: z.number().int().positive().max(150),
  gender: z.enum(["male", "female"]),
  albumin: z.number().positive(),
  alkalinePhosphatase: z.number().nonnegative(),
  alamiNotransaminase: z.number().nonnegative(),
  aspartateAminotransaminase: z.number().nonnegative(),
  bilirubin: z.number().nonnegative(),
  cholesterol: z.number().nonnegative(),
  albuminglobularRatio: z.number().nonnegative(),
  plateletsCount: z.number().nonnegative(),
  prothombinTime: z.number().nonnegative(),
});

// In-memory storage for demo
const inMemoryPatients: Map<number, any> = new Map();
const inMemoryPredictions: Map<number, any> = new Map();
let patientIdCounter = 1;
let predictionIdCounter = 1;

export const predictionRouter = router({
  /**
   * Create a new patient and predict liver disease
   */
  predictForPatient: publicProcedure
    .input(patientDataSchema)
    .mutation(async ({ input, ctx }) => {
      // Validate patient data
      const patientData: PatientData = {
        albumin: input.albumin,
        alkalinePhosphatase: input.alkalinePhosphatase,
        alamiNotransaminase: input.alamiNotransaminase,
        aspartateAminotransaminase: input.aspartateAminotransaminase,
        bilirubin: input.bilirubin,
        cholesterol: input.cholesterol,
        albuminglobularRatio: input.albuminglobularRatio,
        plateletsCount: input.plateletsCount,
        prothombinTime: input.prothombinTime,
        age: input.age,
      };

      const validation = validatePatientData(patientData);
      if (!validation.valid) {
        throw new Error(`Invalid patient data: ${validation.errors.join(", ")}`);
      }

      // Get user ID from context (for demo, use a default)
      const userId = ctx.user?.id || 1;

      // Try to insert into database, but use in-memory if DB not available
      let patientId = patientIdCounter++;

      try {
        const patientInsert = await db.insertPatient({
          userId,
          name: input.name,
          age: input.age,
          gender: input.gender,
          albumin: String(input.albumin),
          alkalinePhosphatase: String(input.alkalinePhosphatase),
          alamiNotransaminase: String(input.alamiNotransaminase),
          aspartateAminotransaminase: String(input.aspartateAminotransaminase),
          bilirubin: String(input.bilirubin),
          cholesterol: String(input.cholesterol),
          albuminglobularRatio: String(input.albuminglobularRatio),
          plateletsCount: String(input.plateletsCount),
          prothombinTime: String(input.prothombinTime),
        });
        if (patientInsert?.insertId) {
          patientId = Number(patientInsert.insertId);
        }
      } catch (e) {
        // Fall back to in-memory storage
        console.warn("[Prediction] Using in-memory storage:", e);
        inMemoryPatients.set(patientId, {
          id: patientId,
          userId,
          name: input.name,
          age: input.age,
          gender: input.gender,
          createdAt: new Date(),
        });
      }

      // Predict
      const result = predictLiverDisease(patientData);

      // Try to insert prediction into database
      try {
        await db.insertPrediction({
          patientId,
          userId,
          prediction: result.prediction,
          confidence: String(result.confidence),
          riskScore: String(result.riskScore),
          notes: `Risk Level: ${result.riskLevel}`,
        });
      } catch (e) {
        // Fall back to in-memory storage
        console.warn("[Prediction] Using in-memory storage for prediction:", e);
        const predId = predictionIdCounter++;
        inMemoryPredictions.set(predId, {
          id: predId,
          patientId,
          userId,
          prediction: result.prediction,
          confidence: String(result.confidence),
          riskScore: String(result.riskScore),
          notes: `Risk Level: ${result.riskLevel}`,
          createdAt: new Date(),
        });
      }

      return {
        patientId,
        ...result,
        patient: input,
      };
    }),

  /**
   * Get all patients for current user
   */
  getPatients: publicProcedure.query(async ({ ctx }) => {
    const userId = ctx.user?.id || 1;

    try {
      const patients = await db.getPatientsByUserId(userId);
      return patients.map(p => ({
        id: p.id,
        name: p.name,
        age: p.age,
        gender: p.gender,
        createdAt: p.createdAt,
      }));
    } catch (e) {
      // Return in-memory patients
      const patients = Array.from(inMemoryPatients.values()).filter(p => p.userId === userId);
      return patients.map(p => ({
        id: p.id,
        name: p.name,
        age: p.age,
        gender: p.gender,
        createdAt: p.createdAt,
      }));
    }
  }),

  /**
   * Get predictions for a specific patient
   */
  getPatientPredictions: publicProcedure
    .input(z.object({ patientId: z.number().int().positive() }))
    .query(async ({ input, ctx }) => {
      const userId = ctx.user?.id || 1;

      try {
        const patient = await db.getPatientById(input.patientId);
        if (!patient || patient.userId !== userId) {
          throw new Error("Patient not found or access denied");
        }

        const predictions = await db.getPredictionsByPatientId(input.patientId);
        return predictions.map(p => ({
          id: p.id,
          prediction: p.prediction,
          confidence: parseFloat(p.confidence),
          riskScore: parseFloat(p.riskScore),
          notes: p.notes,
          createdAt: p.createdAt,
        }));
      } catch (e) {
        // Return in-memory predictions
        const predictions = Array.from(inMemoryPredictions.values()).filter(
          p => p.patientId === input.patientId && p.userId === userId
        );
        return predictions.map(p => ({
          id: p.id,
          prediction: p.prediction,
          confidence: parseFloat(p.confidence),
          riskScore: parseFloat(p.riskScore),
          notes: p.notes,
          createdAt: p.createdAt,
        }));
      }
    }),

  /**
   * Get all predictions for current user
   */
  getAllPredictions: publicProcedure.query(async ({ ctx }) => {
    const userId = ctx.user?.id || 1;

    try {
      const predictions = await db.getPredictionsByUserId(userId);
      return predictions.map(p => ({
        id: p.id,
        patientId: p.patientId,
        prediction: p.prediction,
        confidence: parseFloat(p.confidence),
        riskScore: parseFloat(p.riskScore),
        notes: p.notes,
        createdAt: p.createdAt,
      }));
    } catch (e) {
      // Return in-memory predictions
      const predictions = Array.from(inMemoryPredictions.values()).filter(p => p.userId === userId);
      return predictions.map(p => ({
        id: p.id,
        patientId: p.patientId,
        prediction: p.prediction,
        confidence: parseFloat(p.confidence),
        riskScore: parseFloat(p.riskScore),
        notes: p.notes,
        createdAt: p.createdAt,
      }));
    }
  }),

  /**
   * Predict without saving to database (for demo/testing)
   */
  predictQuick: publicProcedure
    .input(
      z.object({
        albumin: z.number().positive(),
        alkalinePhosphatase: z.number().nonnegative(),
        alamiNotransaminase: z.number().nonnegative(),
        aspartateAminotransaminase: z.number().nonnegative(),
        bilirubin: z.number().nonnegative(),
        cholesterol: z.number().nonnegative(),
        albuminglobularRatio: z.number().nonnegative(),
        plateletsCount: z.number().nonnegative(),
        prothombinTime: z.number().nonnegative(),
        age: z.number().int().positive().max(150),
      })
    )
    .query(({ input }) => {
      const patientData: PatientData = {
        albumin: input.albumin,
        alkalinePhosphatase: input.alkalinePhosphatase,
        alamiNotransaminase: input.alamiNotransaminase,
        aspartateAminotransaminase: input.aspartateAminotransaminase,
        bilirubin: input.bilirubin,
        cholesterol: input.cholesterol,
        albuminglobularRatio: input.albuminglobularRatio,
        plateletsCount: input.plateletsCount,
        prothombinTime: input.prothombinTime,
        age: input.age,
      };

      const validation = validatePatientData(patientData);
      if (!validation.valid) {
        throw new Error(`Invalid patient data: ${validation.errors.join(", ")}`);
      }

      return predictLiverDisease(patientData);
    }),

  /**
   * Predict from CSV data (batch processing)
   */
  predictFromCSV: publicProcedure
    .input(
      z.object({
        csvData: z.string().min(1, "CSV data is required"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user?.id || 1;
      const lines = input.csvData.trim().split('\n');
      
      if (lines.length < 2) {
        throw new Error("CSV must contain header and at least one data row");
      }

      // Parse header
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      // Map expected column names (flexible to handle variations)
      const columnMap: Record<string, string[]> = {
        'age': ['age', 'umur', 'usia'],
        'gender': ['gender', 'jenis kelamin', 'sex'],
        'albumin': ['albumin'],
        'alkalinePhosphatase': ['alkaline phosphatase', 'alkalinephosphatase', 'alk phos', 'alkphos'],
        'alamiNotransaminase': ['alat', 'alanine aminotransferase', 'alt'],
        'aspartateAminotransaminase': ['asat', 'aspartate aminotransferase', 'ast'],
        'bilirubin': ['bilirubin'],
        'cholesterol': ['cholesterol'],
        'albuminglobularRatio': ['albumin/globulin ratio', 'albuminglobularratio', 'a/g ratio'],
        'plateletsCount': ['platelets', 'platelet count', 'platelets count'],
        'prothombinTime': ['prothrombin time', 'prothombintime', 'pt', 'inr'],
        'name': ['name', 'nama', 'patient name', 'patient_name'],
      };

      // Find column indices
      const columnIndices: Record<string, number> = {};
      for (const [key, aliases] of Object.entries(columnMap)) {
        const idx = headers.findIndex(h => aliases.includes(h));
        if (idx !== -1) {
          columnIndices[key] = idx;
        }
      }

      // Required columns
      const requiredColumns = ['age', 'albumin', 'alkalinePhosphatase', 'alamiNotransaminase', 'aspartateAminotransaminase', 'bilirubin', 'cholesterol', 'albuminglobularRatio', 'plateletsCount', 'prothombinTime'];
      const missingColumns = requiredColumns.filter(col => !(col in columnIndices));
      
      if (missingColumns.length > 0) {
        throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
      }

      // Process data rows
      const results = [];
      const errors = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        try {
          const values = line.split(',').map(v => v.trim());
          
          const name = columnIndices['name'] !== undefined ? values[columnIndices['name']] : `Patient ${i}`;
          const age = parseInt(values[columnIndices['age']]);
          const gender = (values[columnIndices['gender']] || 'male').toLowerCase().includes('f') ? 'female' : 'male';
          
          const patientData: PatientData = {
            age,
            albumin: parseFloat(values[columnIndices['albumin']]),
            alkalinePhosphatase: parseFloat(values[columnIndices['alkalinePhosphatase']]),
            alamiNotransaminase: parseFloat(values[columnIndices['alamiNotransaminase']]),
            aspartateAminotransaminase: parseFloat(values[columnIndices['aspartateAminotransaminase']]),
            bilirubin: parseFloat(values[columnIndices['bilirubin']]),
            cholesterol: parseFloat(values[columnIndices['cholesterol']]),
            albuminglobularRatio: parseFloat(values[columnIndices['albuminglobularRatio']]),
            plateletsCount: parseFloat(values[columnIndices['plateletsCount']]),
            prothombinTime: parseFloat(values[columnIndices['prothombinTime']]),
          };

          const validation = validatePatientData(patientData);
          if (!validation.valid) {
            errors.push({ row: i, name, error: validation.errors.join(", ") });
            continue;
          }

          // Predict
          const prediction = predictLiverDisease(patientData);

          // Try to save to database
          let patientId = patientIdCounter++;
          try {
            const patientInsert = await db.insertPatient({
              userId,
              name,
              age,
              gender,
              albumin: String(patientData.albumin),
              alkalinePhosphatase: String(patientData.alkalinePhosphatase),
              alamiNotransaminase: String(patientData.alamiNotransaminase),
              aspartateAminotransaminase: String(patientData.aspartateAminotransaminase),
              bilirubin: String(patientData.bilirubin),
              cholesterol: String(patientData.cholesterol),
              albuminglobularRatio: String(patientData.albuminglobularRatio),
              plateletsCount: String(patientData.plateletsCount),
              prothombinTime: String(patientData.prothombinTime),
            });
            if (patientInsert?.insertId) {
              patientId = Number(patientInsert.insertId);
            }
          } catch (e) {
            console.warn("[CSV Prediction] Using in-memory storage:", e);
            inMemoryPatients.set(patientId, {
              id: patientId,
              userId,
              name,
              age,
              gender,
              createdAt: new Date(),
            });
          }

          // Save prediction
          try {
            await db.insertPrediction({
              patientId,
              userId,
              prediction: prediction.prediction,
              confidence: String(prediction.confidence),
              riskScore: String(prediction.riskScore),
              notes: `Risk Level: ${prediction.riskLevel}`,
            });
          } catch (e) {
            console.warn("[CSV Prediction] Using in-memory storage for prediction:", e);
            const predId = predictionIdCounter++;
            inMemoryPredictions.set(predId, {
              id: predId,
              patientId,
              userId,
              prediction: prediction.prediction,
              confidence: String(prediction.confidence),
              riskScore: String(prediction.riskScore),
              notes: `Risk Level: ${prediction.riskLevel}`,
              createdAt: new Date(),
            });
          }

          results.push({
            row: i,
            name,
            patientId,
            ...prediction,
          });
        } catch (e) {
          errors.push({ row: i, error: e instanceof Error ? e.message : "Unknown error" });
        }
      }

      return {
        totalRows: lines.length - 1,
        successCount: results.length,
        errorCount: errors.length,
        results,
        errors: errors.length > 0 ? errors : undefined,
      };
    }),
});
