import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";
import QRCode from "qrcode";
import * as db from "./db";

/**
 * Admin authentication router
 * Provides QR code login and backup password login
 */
export const adminAuthRouter = router({
  /**
   * Generate QR code for admin login
   */
  generateQRLogin: publicProcedure.mutation(async () => {
    const sessionToken = nanoid(32);
    const qrData = JSON.stringify({
      type: "admin_login",
      token: sessionToken,
      timestamp: Date.now(),
    });

    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
      width: 300,
      margin: 2,
    });

    // Store session with 5-minute expiration
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Note: This creates a pending session - needs to be verified by scanning
    // In production, you'd want to create this only after successful scan
    return {
      sessionToken,
      qrCodeDataUrl,
      expiresAt: expiresAt.toISOString(),
    };
  }),

  /**
   * Verify QR code scan (called from mobile device)
   */
  verifyQRLogin: protectedProcedure
    .input(
      z.object({
        sessionToken: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user is admin
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admin access required",
        });
      }

      // Create admin session
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      await db.createAdminSession({
        userId: ctx.user.id,
        sessionToken: input.sessionToken,
        expiresAt,
      });

      return {
        success: true,
        message: "QR login verified",
      };
    }),

  /**
   * Check QR login status (polling from desktop)
   */
  checkQRLoginStatus: publicProcedure
    .input(
      z.object({
        sessionToken: z.string(),
      })
    )
    .query(async ({ input }) => {
      const session = await db.getAdminSessionByToken(input.sessionToken);

      if (!session) {
        return { verified: false };
      }

      // Check if expired
      if (session.expiresAt < new Date()) {
        return { verified: false, expired: true };
      }

      return {
        verified: true,
        userId: session.userId,
      };
    }),

  /**
   * Backup admin login with username/password
   * Note: In production, implement proper password hashing
   */
  backupLogin: publicProcedure
    .input(
      z.object({
        username: z.string(),
        password: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      // Check environment variable for admin credentials
      const adminUsername = process.env.ADMIN_USERNAME || "admin";
      const adminPassword = process.env.ADMIN_PASSWORD;

      if (!adminPassword) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Admin password not configured",
        });
      }

      if (
        input.username !== adminUsername ||
        input.password !== adminPassword
      ) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid credentials",
        });
      }

      // Create session token
      const sessionToken = nanoid(32);
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      // Get or create admin user
      // Note: This is simplified - in production, you'd have proper user management
      return {
        success: true,
        sessionToken,
        expiresAt: expiresAt.toISOString(),
      };
    }),

  /**
   * Check if current user is admin
   */
  checkAdminStatus: protectedProcedure.query(({ ctx }) => {
    return {
      isAdmin: ctx.user.role === "admin",
      userId: ctx.user.id,
    };
  }),
});
