import {AuthOptions} from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import PostgresAdapter from "@auth/pg-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import {Database} from "@/lib/pg/database";
import {UserDAO} from "@/daos/user-dao";

export const authOptions: AuthOptions = {
  adapter: PostgresAdapter(Database.getPool()),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;

        const user = await UserDAO.findUserByEmail(credentials.email);

        if (!user) return null;

        const isValid = await bcrypt.compare(credentials.password, user.password_hash);
        return isValid ? user : null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.sub = String(user.id);
      return token;
    },
    async session({ session, token }) {
      if (session.user) session.user.id = Number(token.sub);
      return session;
    },
  },
  session: { strategy: "jwt" },
  pages: {
    signIn: "/sign-in",
    newUser: "/lists",
    error: "/sign-in",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
