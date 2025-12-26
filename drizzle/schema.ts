import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const modelEvaluations = mysqlTable("model_evaluations", {
  id: int("id").autoincrement().primaryKey(),
  modelType: varchar("modelType", { length: 64 }).notNull().default("XGBoost"),
  datasetName: varchar("datasetName", { length: 255 }).notNull().default("Liver Patient Dataset (LPD)"),
  accuracy: varchar("accuracy", { length: 20 }).notNull(),
  precision: varchar("precision", { length: 20 }).notNull(),
  recall: varchar("recall", { length: 20 }).notNull(),
  f1Score: varchar("f1Score", { length: 20 }).notNull(),
  rocAuc: varchar("rocAuc", { length: 20 }).notNull().default("0"),
  confusionMatrixJson: text("confusionMatrixJson").notNull(),
  rocCurveJson: text("rocCurveJson").notNull(),
  precisionRecallCurveJson: text("precisionRecallCurveJson").notNull(),
  featureImportanceJson: text("featureImportanceJson").notNull(),
  metadataJson: text("metadataJson").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ModelEvaluation = typeof modelEvaluations.$inferSelect;
export type InsertModelEvaluation = typeof modelEvaluations.$inferInsert;

export const patients = mysqlTable("patients", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  age: int("age").notNull(),
  gender: varchar("gender", { length: 10 }).notNull(), // 'male' or 'female'
  albumin: varchar("albumin", { length: 20 }).notNull(),
  alkalinePhosphatase: varchar("alkalinePhosphatase", { length: 20 }).notNull(),
  alamiNotransaminase: varchar("alamiNotransaminase", { length: 20 }).notNull(),
  aspartateAminotransaminase: varchar("aspartateAminotransaminase", { length: 20 }).notNull(),
  bilirubin: varchar("bilirubin", { length: 20 }).notNull(),
  cholesterol: varchar("cholesterol", { length: 20 }).notNull(),
  albuminglobularRatio: varchar("albuminglobularRatio", { length: 20 }).notNull(),
  plateletsCount: varchar("plateletsCount", { length: 20 }).notNull(),
  prothombinTime: varchar("prothombinTime", { length: 20 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Patient = typeof patients.$inferSelect;
export type InsertPatient = typeof patients.$inferInsert;

export const predictions = mysqlTable("predictions", {
  id: int("id").autoincrement().primaryKey(),
  patientId: int("patientId").notNull(),
  userId: int("userId").notNull(),
  prediction: varchar("prediction", { length: 50 }).notNull(), // 'positive' or 'negative'
  confidence: varchar("confidence", { length: 10 }).notNull(),
  riskScore: varchar("riskScore", { length: 10 }).notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Prediction = typeof predictions.$inferSelect;
export type InsertPrediction = typeof predictions.$inferInsert;