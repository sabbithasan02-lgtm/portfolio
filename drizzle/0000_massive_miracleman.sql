CREATE TABLE `contact_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`company` text NOT NULL,
	`message` text NOT NULL,
	`tools` text NOT NULL,
	`project_type` text NOT NULL,
	`budget` text NOT NULL,
	`created_at` integer NOT NULL,
	`sender_hash` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_messages_sender_time` ON `contact_messages` (`sender_hash`,`created_at`);