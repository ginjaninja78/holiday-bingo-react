CREATE TABLE `gallery_images` (
	`id` int AUTO_INCREMENT NOT NULL,
	`url` text NOT NULL,
	`label` varchar(200) NOT NULL,
	`source` enum('ai_generated','unsplash') NOT NULL DEFAULT 'ai_generated',
	`deleted_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `gallery_images_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `generated_cards` (
	`id` int AUTO_INCREMENT NOT NULL,
	`card_id` varchar(5) NOT NULL,
	`config_id` int NOT NULL,
	`card_data` json NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `generated_cards_id` PRIMARY KEY(`id`),
	CONSTRAINT `generated_cards_card_id_unique` UNIQUE(`card_id`)
);
--> statement-breakpoint
CREATE TABLE `host_game_state` (
	`id` int AUTO_INCREMENT NOT NULL,
	`host_id` int NOT NULL,
	`config_id` int NOT NULL,
	`current_round` int NOT NULL DEFAULT 1,
	`total_rounds` int NOT NULL,
	`wins_per_round` int NOT NULL,
	`status` enum('active','paused','ended') NOT NULL DEFAULT 'active',
	`played_images` json NOT NULL,
	`current_image_index` int NOT NULL DEFAULT -1,
	`started_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `host_game_state_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `unsplash_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`host_id` int NOT NULL,
	`api_key` text NOT NULL,
	`search_tags` text NOT NULL,
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `unsplash_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `unsplash_settings_host_id_unique` UNIQUE(`host_id`)
);
--> statement-breakpoint
ALTER TABLE `generated_cards` ADD CONSTRAINT `generated_cards_config_id_host_game_configs_id_fk` FOREIGN KEY (`config_id`) REFERENCES `host_game_configs`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `host_game_state` ADD CONSTRAINT `host_game_state_host_id_users_id_fk` FOREIGN KEY (`host_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `host_game_state` ADD CONSTRAINT `host_game_state_config_id_host_game_configs_id_fk` FOREIGN KEY (`config_id`) REFERENCES `host_game_configs`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `unsplash_settings` ADD CONSTRAINT `unsplash_settings_host_id_users_id_fk` FOREIGN KEY (`host_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;