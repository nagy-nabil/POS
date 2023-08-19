import { type GetServerSidePropsContext } from "next";
import { env } from "@/env.mjs";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { RoleT } from "@prisma/client";
// import { prisma } from "@/server/db";
import jwt from "jsonwebtoken";
import { getServerSession } from "next-auth";
import { z } from "zod";

export const UserPayloadSchema = z.object({
  id: z.string(),
  role: z.nativeEnum(RoleT),
});

export type UserPayload = z.infer<typeof UserPayloadSchema>;

/**
 * create tokken , send it to the user [payload is the user id]
 * user concern to save the tokken [the front end will save it in the local storage]
 * verify the tokken
 * search for user with the tokken
 * check email password [if needed with sign in ]
 * protect assign the user to the req[middleware]
 */

export function newToken<T extends UserPayload>(user: T): string {
  const payload = {
    id: user.id,
    role: user.role,
  };
  return jwt.sign(payload, env.JWTSECRET, {
    expiresIn: env.JWTEXPIREIN,
    algorithm: "HS256",
  });
}

/**
 * verify token and return payload or throw an error
 * @param token string
 * @returns UserPayload
 */
export function verifyToken(token: string): UserPayload {
  const payload = jwt.verify(token, env.JWTSECRET, { algorithms: ["HS256"] });
  UserPayloadSchema.parse(payload);
  return payload as UserPayload;
}

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};
