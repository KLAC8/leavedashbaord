import { getServerSession } from 'next-auth/next';
import CredentialsProvider from 'next-auth/providers/credentials';
import { MongoDBAdapter } from '@next-auth/mongodb-adapter';
import clientPromise from '@/lib/mongodb';
import { connectDB } from '@/lib/db';
import Employee from '@/models/Employee';
import bcrypt from 'bcrypt';
import type { AuthOptions } from 'next-auth';

export const authOptions: AuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        await connectDB();

        const user = await Employee.findOne({ email: credentials.email }).lean();

        if (user) {
          const isValid = await bcrypt.compare(credentials.password, user.password);
          if (isValid) {
            return {
              id: user._id.toString(),
              name: user.name,
              email: user.email,
              role: user.role ?? 'employee',
            };
          }
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = typeof token.sub === 'string' ? token.sub : '';
        session.user.role = typeof token.role === 'string' ? token.role : 'employee';
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user && typeof user.role === 'string') {
        token.role = user.role;
      }
      return token;
    },
  },
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
};

// Helper function to get server session with authOptions
export const getServerAuthSession = () => getServerSession(authOptions);