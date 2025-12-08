import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { galleryImages } from "../drizzle/schema";
import { eq, isNull, isNotNull } from "drizzle-orm";

export const galleryRouter = router({
  /**
   * Get all gallery images (excluding soft-deleted)
   */
  getAll: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    
    const images = await db
      .select()
      .from(galleryImages)
      .where(isNull(galleryImages.deletedAt))
      .orderBy(galleryImages.createdAt);
    
    return images;
  }),

  /**
   * Get recently deleted images (soft-deleted within 30 days)
   */
  getDeleted: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const deleted = await db
      .select()
      .from(galleryImages)
      .where(isNotNull(galleryImages.deletedAt))
      .orderBy(galleryImages.deletedAt);
    
    // Filter to only include items deleted within 30 days
    return deleted.filter((img: any) => 
      img.deletedAt && img.deletedAt > thirtyDaysAgo
    );
  }),

  /**
   * Soft delete images
   */
  delete: publicProcedure
    .input(z.object({
      imageIds: z.array(z.number()),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      const now = new Date();
      
      for (const id of input.imageIds) {
        await db
          .update(galleryImages)
          .set({ deletedAt: now })
          .where(eq(galleryImages.id, id));
      }
      
      return { success: true, deletedCount: input.imageIds.length };
    }),

  /**
   * Restore soft-deleted images
   */
  restore: publicProcedure
    .input(z.object({
      imageIds: z.array(z.number()),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      for (const id of input.imageIds) {
        await db
          .update(galleryImages)
          .set({ deletedAt: null })
          .where(eq(galleryImages.id, id));
      }
      
      return { success: true, restoredCount: input.imageIds.length };
    }),

  /**
   * Permanently delete images
   */
  permanentDelete: publicProcedure
    .input(z.object({
      imageIds: z.array(z.number()),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      for (const id of input.imageIds) {
        await db
          .delete(galleryImages)
          .where(eq(galleryImages.id, id));
      }
      
      return { success: true, deletedCount: input.imageIds.length };
    }),
});
