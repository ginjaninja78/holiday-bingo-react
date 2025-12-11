ALTER TABLE `game_history` ADD `game_id` varchar(13) NOT NULL;--> statement-breakpoint
ALTER TABLE `generated_cards` ADD `batch_id` varchar(64);--> statement-breakpoint
ALTER TABLE `game_history` ADD CONSTRAINT `game_history_game_id_unique` UNIQUE(`game_id`);