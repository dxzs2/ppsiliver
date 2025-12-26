CREATE TABLE `model_evaluations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`modelType` varchar(64) NOT NULL DEFAULT 'XGBoost',
	`datasetName` varchar(255) NOT NULL DEFAULT 'Liver Patient Dataset (LPD)',
	`accuracy` varchar(20) NOT NULL,
	`precision` varchar(20) NOT NULL,
	`recall` varchar(20) NOT NULL,
	`f1Score` varchar(20) NOT NULL,
	`confusionMatrixJson` text NOT NULL,
	`rocCurveJson` text NOT NULL,
	`precisionRecallCurveJson` text NOT NULL,
	`featureImportanceJson` text NOT NULL,
	`metadataJson` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `model_evaluations_id` PRIMARY KEY(`id`)
);
