import { getServerSession } from 'next-auth/next';
import CredentialsProvider from 'next-auth/providers/credentials';
import { MongoDBAdapter } from '@next-auth/mongodb-adapter';
import clientPromise from '@/lib/mongodb';
import { connectDB } from '@/lib/db';
import Employee from '@/models/Employee';
import bcrypt from 'bcrypt';
import { NextResponse } from 'next/server';
import type { AuthOptions } from 'next-auth';

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

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { email, password, currentPassword, name, image } = await req.json();

    await connectDB();

    const employee = await Employee.findOne({ email: session.user.email });
    if (!employee) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update email if changed
    if (email && email !== employee.email) {
      const existing = await Employee.findOne({ email });
      if (existing) {
        return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
      }
      employee.email = email;
    }

    // Update name
    if (name) {
      employee.name = name;
    }

    // Update image URL
    if (image) {
      employee.imageUrl = image;
    }

    // Update password if provided
    if (password) {
      if (!currentPassword) {
        return NextResponse.json({ error: 'Current password is required to change password' }, { status: 400 });
      }

      // Check current password matches
      const isValid = await bcrypt.compare(currentPassword, employee.password);
      if (!isValid) {
        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
      }

      if (password.length < 6) {
        return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
      }
      const hashed = await bcrypt.hash(password, 10);
      employee.password = hashed;
    }

    await employee.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[SETTINGS_UPDATE_ERROR]', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}


