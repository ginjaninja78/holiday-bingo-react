import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { galleryImages } from "./drizzle/schema";

const sqlite = new Database(process.env.DATABASE_URL!.replace("file:", ""));
const db = drizzle(sqlite);

const newImages = [
  { url: "/images/gallery/holiday-wreath-door.png", alt: "Holiday wreath on door" },
  { url: "/images/gallery/ice-skating-rink.png", alt: "Ice skating rink scene" },
  { url: "/images/gallery/gingerbread-house.png", alt: "Decorated gingerbread house" },
  { url: "/images/gallery/winter-mittens.png", alt: "Colorful knitted mittens" },
  { url: "/images/gallery/sleigh-ride.png", alt: "Traditional wooden sleigh" },
  { url: "/images/gallery/hot-chocolate-mugs.png", alt: "Hot chocolate with marshmallows" },
  { url: "/images/gallery/pine-cone-collection.png", alt: "Pine cones and evergreen branches" },
  { url: "/images/gallery/winter-lanterns.png", alt: "Glowing lanterns in snow" },
  { url: "/images/gallery/snowflake-macro.png", alt: "Macro snowflake crystal" },
  { url: "/images/gallery/winter-market-stall.png", alt: "Festive winter market stall" },
];

async function addImages() {
  for (const img of newImages) {
    await db.insert(galleryImages).values({
      url: img.url,
      alt: img.alt,
      source: "ai",
    });
    console.log(`✓ Added: ${img.alt}`);
  }
  console.log(`\n✅ Successfully added ${newImages.length} new images!`);
}

addImages().catch(console.error);
