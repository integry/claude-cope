import type { MiddlewareHandler } from "hono";
import { getCookie, setCookie } from "hono/cookie";

const COOKIE_NAME = "cope_session_id";

export const sessionMiddleware: MiddlewareHandler = async (c, next) => {
  let sessionId = getCookie(c, COOKIE_NAME);

  if (!sessionId) {
    sessionId = crypto.randomUUID();
    setCookie(c, COOKIE_NAME, sessionId, {
      httpOnly: true,
      secure: true,
      sameSite: "Lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });
  }

  c.set("sessionId", sessionId);
  await next();
};
