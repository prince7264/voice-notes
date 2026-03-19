import { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";

export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // First sign-in — user object is present
      if (user) {
        token.id = user.id;
        token.onboardingComplete = false;
      }

      // Called when update() is invoked from the client (onboarding / profile edit)
      if (trigger === "update" && session) {
        if (session.name !== undefined) token.name = session.name;
        if (session.age !== undefined) token.age = session.age;
        if (session.profession !== undefined) token.profession = session.profession;
        if (session.onboardingComplete !== undefined)
          token.onboardingComplete = session.onboardingComplete;
      }

      return token;
    },

    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.onboardingComplete = token.onboardingComplete as boolean;
      session.user.age = token.age as number | undefined;
      session.user.profession = token.profession as string | undefined;
      return session;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },
};
