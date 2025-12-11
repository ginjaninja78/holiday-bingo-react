CREATE TABLE `game_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`host_id` int NOT NULL,
	`game_name` varchar(200),
	`total_rounds` int NOT NULL,
	`completed_rounds` int NOT NULL,
	`patterns` json NOT NULL,
	`played_images` json NOT NULL,
	`player_scores` json NOT NULL,
	`started_at` timestamp NOT NULL,
	`ended_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `game_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `managed_players` (
	`id` int AUTO_INCREMENT NOT NULL,
	`player_uuid` varchar(64) NOT NULL,
	`player_name` varchar(200),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `managed_players_id` PRIMARY KEY(`id`),
	CONSTRAINT `managed_players_player_uuid_unique` UNIQUE(`player_uuid`)
);
--> statement-breakpoint
CREATE TABLE `player_cards` (
	`id` int AUTO_INCREMENT NOT NULL,
	`player_uuid` varchar(64) NOT NULL,
	`card_id` varchar(5) NOT NULL,
	`game_id` int,
	`is_played` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `player_cards_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `game_history` ADD CONSTRAINT `game_history_host_id_users_id_fk` FOREIGN KEY (`host_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `player_cards` ADD CONSTRAINT `player_cards_player_uuid_managed_players_player_uuid_fk` FOREIGN KEY (`player_uuid`) REFERENCES `managed_players`(`player_uuid`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `player_cards` ADD CONSTRAINT `player_cards_card_id_generated_cards_card_id_fk` FOREIGN KEY (`card_id`) REFERENCES `generated_cards`(`card_id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `player_cards` ADD CONSTRAINT `player_cards_game_id_host_game_state_id_fk` FOREIGN KEY (`game_id`) REFERENCES `host_game_state`(`id`) ON DELETE no action ON UPDATE no action;