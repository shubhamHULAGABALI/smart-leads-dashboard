import jwt from 'jsonwebtoken';
import { User, IUserDocument } from '../models/user.model';
import { UserRole, JwtPayload } from '../types';

// ─── Interfaces ────────────────────────────────────────────────────────────

interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResult {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  };
}

// ─── Helpers ───────────────────────────────────────────────────────────────

const generateToken = (payload: JwtPayload): string => {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN ?? '7d';

  if (!secret) throw new Error('JWT_SECRET is not configured');

  return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
};

const formatUser = (doc: IUserDocument): AuthResult['user'] => ({
  id: (doc._id as { toString(): string }).toString(),
  name: doc.name,
  email: doc.email,
  role: doc.role,
});

// ─── Service Functions ─────────────────────────────────────────────────────

export const register = async (input: RegisterInput): Promise<AuthResult> => {
  const existing = await User.findOne({ email: input.email });
  if (existing) throw new Error('A user with this email already exists');

  const user = await User.create({
    name: input.name,
    email: input.email,
    password: input.password,
    role: input.role ?? 'sales',
  });

  const token = generateToken({ id: (user._id as { toString(): string }).toString(), role: user.role });
  return { token, user: formatUser(user) };
};

export const login = async (input: LoginInput): Promise<AuthResult> => {
  const user = await User.findOne({ email: input.email }).select('+password');
  if (!user) throw new Error('Invalid email or password');

  const isValid = await user.comparePassword(input.password);
  if (!isValid) throw new Error('Invalid email or password');

  const token = generateToken({ id: (user._id as { toString(): string }).toString(), role: user.role });
  return { token, user: formatUser(user) };
};

export const getMe = async (userId: string): Promise<IUserDocument | null> =>
  User.findById(userId).select('-password');
