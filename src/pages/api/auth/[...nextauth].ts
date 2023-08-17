import { env } from "@/env.mjs";
import { prisma } from "@/server/db";
import { RoleT } from "@prisma/client";
import bcrypt from "bcrypt";
import NextAuth, { type AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    user: {
      id: string;
      userName: string;
      role: RoleT;
    };
  }

  interface DefaultJWT {
    user?: {
      id: string;
      userName: string;
      role: RoleT;
    };
  }
}

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      id: string;
      userName: string;
      role: RoleT;
    };
  }
}

export const authOptions: AuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: env.JWTEXPIREIN,
  },
  secret: env.NEXTAUTH_SECRET,
  providers: [
    /**
     * If you want to pass data such as an Access Token or User ID to the browser when using JSON Web Tokens, you can persist the data in the token when the jwt callback is called, then pass the data through to the browser in the session callback.
     */
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "username" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, _req) {
        if (!credentials) return null;

        const user = await prisma.user.findFirst({
          where: {
            userName: credentials.username,
          },
          select: {
            id: true,
            userName: true,
            password: true,
            role: true,
          },
        });

        if (!user) {
          return null;
        }

        const match = await bcrypt.compare(credentials.password, user.password);

        if (!match) {
          return null;
        }
        const u = {
          id: user.id,
          name: user.userName,
          role: user.role,
        };

        // Any object returned will be saved in `user` property of the JWT
        return u;
      },
    }),
  ],
  debug: env.NODE_ENV === "development",
  callbacks: {
    async session(params) {
      params.session.user.id = params.token.sub;
      params.session.user.userName = params.token.name;
      return params.session;
    },
  },
};

export default NextAuth(authOptions);
