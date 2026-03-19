import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      image?: string;
      onboardingComplete: boolean;
      age?: number;
      profession?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    onboardingComplete: boolean;
    age?: number;
    profession?: string;
  }
}
