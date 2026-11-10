import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      schoolId: string;
      schoolCode: string;
      role: string;
      userType: string;
    };
  }
  interface User {
    schoolId: string;
    schoolCode: string;
    role: string;
    userType: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string; // ADDED
    schoolId?: string;
    schoolCode?: string; // ADDED
    role?: string;
    userType?: string;
  }
}
