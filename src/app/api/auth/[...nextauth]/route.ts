import NextAuth, { AuthOptions, Session, User, SessionStrategy } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectDB } from "@/lib/db";
import Employee, { IEmployee } from "@/models/Employee";
import bcrypt from "bcrypt";
import { JWT } from "next-auth/jwt";

const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log('[Auth] Missing credentials');
          return null;
        }

        try {
          await connectDB();

          const user = await Employee.findOne({ email: credentials.email }).lean<IEmployee | null>();
          console.log('[Auth] User found:', !!user);

          if (user) {
            const isValid = await bcrypt.compare(credentials.password, user.password);
            console.log('[Auth] Password valid:', isValid);
            
            if (isValid) {
              const userData = {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                role: user.role ?? "employee",
              };
              console.log('[Auth] Returning user data:', userData);
              return userData;
            }
          }
        } catch (error) {
          console.error('[Auth] Authorization error:', error);
        }
        
        return null;
      },
    }),
  ],
  
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: User }) {
      if (user) {
        console.log('[Auth] Adding user to token:', user);
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    
    async session({ session, token }: { session: Session; token: JWT }) {
      if (token) {
        console.log('[Auth] Creating session from token:', token);
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  
  session: {
    strategy: "jwt" as SessionStrategy,
    maxAge: 24 * 60 * 60, // 24 hours
  },
  
  pages: {
    signIn: "/login",
    error: "/login",
  },
  
  // Enable debug only in development
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };