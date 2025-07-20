import { getServerSession } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { MongoDBAdapter } from '@next-auth/mongodb-adapter';
import { connectDB } from '@/lib/db';
import clientPromise from '@/lib/mongodb';
import Employee, { IEmployee } from '@/models/Employee';
import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import  { AuthOptions, Session, SessionStrategy, User } from 'next-auth';
import { JWT } from 'next-auth/jwt';

// Inline authOptions definition (no import from lib)
const authOptions: AuthOptions = {
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

        const user = await Employee.findOne({ email: credentials.email }).lean<IEmployee | null>();

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
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.id = typeof token.sub === 'string' ? token.sub : '';
        session.user.role = typeof token.role === 'string' ? token.role : 'employee';
      }
      return session;
    },
    async jwt({ token, user }: { token: JWT; user?: User }) {
      if (user && typeof user.role === 'string') {
        token.role = user.role;
      }
      return token;
    },
  },
  session: {
    strategy: 'jwt' as SessionStrategy,
  },
  pages: {
    signIn: '/login',
  },
};

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();
  const employee = await Employee.findOne({ email: session.user.email }).lean();

  if (!employee) {
    return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
  }

  return NextResponse.json({ employee });
}
