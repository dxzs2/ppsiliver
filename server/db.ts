import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, modelEvaluations, InsertModelEvaluation, patients, InsertPatient, predictions, InsertPrediction } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getLatestModelEvaluation() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get model evaluation: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(modelEvaluations)
    .orderBy(desc(modelEvaluations.createdAt))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function insertModelEvaluation(data: InsertModelEvaluation) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot insert model evaluation: database not available");
    return undefined;
  }

  const result = await db.insert(modelEvaluations).values(data);
  return result;
}

export async function insertPatient(data: InsertPatient) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot insert patient: database not available");
    return undefined;
  }

  const result = await db.insert(patients).values(data);
  return result[0];
}

export async function getPatientById(id: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get patient: database not available");
    return undefined;
  }

  const result = await db.select().from(patients).where(eq(patients.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getPatientsByUserId(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get patients: database not available");
    return [];
  }

  const result = await db.select().from(patients).where(eq(patients.userId, userId)).orderBy(desc(patients.createdAt));
  return result;
}

export async function insertPrediction(data: InsertPrediction) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot insert prediction: database not available");
    return undefined;
  }

  const result = await db.insert(predictions).values(data);
  return result[0];
}

export async function getPredictionsByPatientId(patientId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get predictions: database not available");
    return [];
  }

  const result = await db.select().from(predictions).where(eq(predictions.patientId, patientId)).orderBy(desc(predictions.createdAt));
  return result;
}

export async function getPredictionsByUserId(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get predictions: database not available");
    return [];
  }

  const result = await db.select().from(predictions).where(eq(predictions.userId, userId)).orderBy(desc(predictions.createdAt));
  return result;
}

// TODO: add feature queries here as your schema grows.
