import "next-auth";

declare module "next-auth" {
  interface User {
    role?: string;
    position?: string | null;
  }
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      position?: string | null;
    };
  }
}
