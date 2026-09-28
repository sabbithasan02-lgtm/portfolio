CREATE TABLE `portfolio_projects` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`company` text NOT NULL,
	`role` text NOT NULL,
	`status` text NOT NULL,
	`date` text NOT NULL,
	`type` text NOT NULL,
	`summary` text NOT NULL,
	`problem` text NOT NULL,
	`solution` text NOT NULL,
	`workflow` text NOT NULL,
	`technologies` text NOT NULL,
	`screenshots` text NOT NULL,
	`learnings` text NOT NULL,
	`next_steps` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_portfolio_projects_created` ON `portfolio_projects` (`created_at`);
