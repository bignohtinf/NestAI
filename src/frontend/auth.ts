import { getServerSession } from 'next-auth';
import { authConfig } from './lib/auth';

export const auth = () => getServerSession(authConfig);
export const { handlers, signIn, signOut } = require('next-auth').default(authConfig);
