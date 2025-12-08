ALTER TABLE `generated_cards` DROP FOREIGN KEY `generated_cards_config_id_host_game_configs_id_fk`;
--> statement-breakpoint
ALTER TABLE `generated_cards` ADD `game_id` int;--> statement-breakpoint
ALTER TABLE `generated_cards` ADD `image_ids` json NOT NULL;--> statement-breakpoint
ALTER TABLE `generated_cards` ADD CONSTRAINT `generated_cards_game_id_host_game_state_id_fk` FOREIGN KEY (`game_id`) REFERENCES `host_game_state`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `generated_cards` DROP COLUMN `config_id`;--> statement-breakpoint
ALTER TABLE `generated_cards` DROP COLUMN `card_data`;