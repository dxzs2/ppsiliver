import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { predictionRouter } from "./_core/predictionRouter";
import { publicProcedure, router } from "./_core/trpc";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  modelEvaluation: router({
    getLatest: publicProcedure.query(async () => {
      const { getLatestModelEvaluation } = await import("./db");
      const evaluation = await getLatestModelEvaluation();
      
      if (!evaluation) {
        return null;
      }

      const confusionMatrix = JSON.parse(evaluation.confusionMatrixJson);

      return {
        id: evaluation.id,
        modelType: evaluation.modelType,
        datasetName: evaluation.datasetName,
        accuracy: parseFloat(evaluation.accuracy),
        precision: parseFloat(evaluation.precision),
        recall: parseFloat(evaluation.recall),
        f1Score: parseFloat(evaluation.f1Score),
        rocAuc: parseFloat(evaluation.rocAuc),
        confusionMatrixTn: confusionMatrix.tn || 0,
        confusionMatrixFp: confusionMatrix.fp || 0,
        confusionMatrixFn: confusionMatrix.fn || 0,
        confusionMatrixTp: confusionMatrix.tp || 0,
        rocCurve: JSON.parse(evaluation.rocCurveJson),
        precisionRecallCurve: JSON.parse(evaluation.precisionRecallCurveJson),
        featureImportance: JSON.parse(evaluation.featureImportanceJson),
        metadata: JSON.parse(evaluation.metadataJson),
        createdAt: evaluation.createdAt,
        updatedAt: evaluation.updatedAt,
      };
    }),
  }),

  prediction: predictionRouter,
});

export type AppRouter = typeof appRouter;
