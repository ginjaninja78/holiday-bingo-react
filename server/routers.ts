import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { gameRouter } from "./gameRouter";
import { adminAuthRouter } from "./adminAuthRouter";
import { galleryRouter } from "./galleryRouter";
import { bingoRouter } from "./bingoRouter";
import { pdfRouter } from "./pdfRouter";
import { playerRouter } from "./routers/playerRouter";
import { gameHistoryRouter } from "./routers/gameHistoryRouter";
import { announcerRouter } from "./announcer/announcerRouter";

export const appRouter = router({
  system: systemRouter,
  game: gameRouter,
  adminAuth: adminAuthRouter,
  gallery: galleryRouter,
  bingo: bingoRouter,
  pdf: pdfRouter,
  player: playerRouter,
  gameHistory: gameHistoryRouter,
  announcer: announcerRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;
