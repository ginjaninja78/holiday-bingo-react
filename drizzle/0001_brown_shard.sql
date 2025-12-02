CREATE TABLE `admin_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`session_token` varchar(128) NOT NULL,
	`qr_code` text,
	`expires_at` timestamp NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `admin_sessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `admin_sessions_session_token_unique` UNIQUE(`session_token`)
);
--> statement-breakpoint
CREATE TABLE `bingo_cards` (
	`id` int AUTO_INCREMENT NOT NULL,
	`player_id` int NOT NULL,
	`session_id` int NOT NULL,
	`round_number` int NOT NULL,
	`card_data` json NOT NULL,
	`marked_tiles` json NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `bingo_cards_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bingo_claims` (
	`id` int AUTO_INCREMENT NOT NULL,
	`session_id` int NOT NULL,
	`player_id` int NOT NULL,
	`round_number` int NOT NULL,
	`card_id` int NOT NULL,
	`claim_type` varchar(50) NOT NULL,
	`verified` boolean NOT NULL DEFAULT false,
	`verified_at` timestamp,
	`claimed_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `bingo_claims_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `called_images` (
	`id` int AUTO_INCREMENT NOT NULL,
	`session_id` int NOT NULL,
	`round_number` int NOT NULL,
	`image_id` int NOT NULL,
	`called_at` timestamp NOT NULL DEFAULT (now()),
	`called_order` int NOT NULL,
	CONSTRAINT `called_images_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `game_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`host_id` int NOT NULL,
	`session_code` varchar(16) NOT NULL,
	`status` enum('waiting','active','paused','ended') NOT NULL DEFAULT 'waiting',
	`current_round` int NOT NULL DEFAULT 0,
	`winning_pattern` json,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `game_sessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `game_sessions_session_code_unique` UNIQUE(`session_code`)
);
--> statement-breakpoint
CREATE TABLE `players` (
	`id` int AUTO_INCREMENT NOT NULL,
	`session_id` int NOT NULL,
	`player_uuid` varchar(64) NOT NULL,
	`player_name` varchar(100) NOT NULL,
	`score` int NOT NULL DEFAULT 0,
	`total_bingos` int NOT NULL DEFAULT 0,
	`is_active` boolean NOT NULL DEFAULT true,
	`joined_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `players_id` PRIMARY KEY(`id`),
	CONSTRAINT `players_player_uuid_unique` UNIQUE(`player_uuid`)
);
--> statement-breakpoint
ALTER TABLE `admin_sessions` ADD CONSTRAINT `admin_sessions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bingo_cards` ADD CONSTRAINT `bingo_cards_player_id_players_id_fk` FOREIGN KEY (`player_id`) REFERENCES `players`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bingo_cards` ADD CONSTRAINT `bingo_cards_session_id_game_sessions_id_fk` FOREIGN KEY (`session_id`) REFERENCES `game_sessions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bingo_claims` ADD CONSTRAINT `bingo_claims_session_id_game_sessions_id_fk` FOREIGN KEY (`session_id`) REFERENCES `game_sessions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bingo_claims` ADD CONSTRAINT `bingo_claims_player_id_players_id_fk` FOREIGN KEY (`player_id`) REFERENCES `players`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bingo_claims` ADD CONSTRAINT `bingo_claims_card_id_bingo_cards_id_fk` FOREIGN KEY (`card_id`) REFERENCES `bingo_cards`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `called_images` ADD CONSTRAINT `called_images_session_id_game_sessions_id_fk` FOREIGN KEY (`session_id`) REFERENCES `game_sessions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `game_sessions` ADD CONSTRAINT `game_sessions_host_id_users_id_fk` FOREIGN KEY (`host_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `players` ADD CONSTRAINT `players_session_id_game_sessions_id_fk` FOREIGN KEY (`session_id`) REFERENCES `game_sessions`(`id`) ON DELETE no action ON UPDATE no action;