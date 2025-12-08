CREATE TABLE `host_game_configs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`host_id` int NOT NULL,
	`game_name` varchar(200) NOT NULL,
	`total_rounds` int NOT NULL DEFAULT 1,
	`wins_per_round` int NOT NULL DEFAULT 1,
	`round_patterns` json NOT NULL,
	`image_pool` json NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `host_game_configs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `host_game_configs` ADD CONSTRAINT `host_game_configs_host_id_users_id_fk` FOREIGN KEY (`host_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;