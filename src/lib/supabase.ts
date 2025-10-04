import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface AuthError {
  message: string;
  status?: number;
}

export async function signUp(email: string, password: string): Promise<{ user: User | null; error: AuthError | null }> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return { user: null, error: { message: error.message, status: error.status } };
    }

    return { 
      user: data.user ? {
        id: data.user.id,
        email: data.user.email || '',
        created_at: data.user.created_at || '',
        updated_at: data.user.updated_at || ''
      } : null, 
      error: null 
    };
  } catch (error) {
    return { 
      user: null, 
      error: { message: 'An unexpected error occurred during signup' } 
    };
  }
}

export async function signIn(email: string, password: string): Promise<{ user: User | null; error: AuthError | null }> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { user: null, error: { message: error.message, status: error.status } };
    }

    return { 
      user: data.user ? {
        id: data.user.id,
        email: data.user.email || '',
        created_at: data.user.created_at || '',
        updated_at: data.user.updated_at || ''
      } : null, 
      error: null 
    };
  } catch (error) {
    return { 
      user: null, 
      error: { message: 'An unexpected error occurred during login' } 
    };
  }
}

export async function signOut(): Promise<{ error: AuthError | null }> {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      return { error: { message: error.message, status: error.status } };
    }

    return { error: null };
  } catch (error) {
    return { 
      error: { message: 'An unexpected error occurred during logout' } 
    };
  }
}

export async function getCurrentUser(): Promise<{ user: User | null; error: AuthError | null }> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      return { user: null, error: { message: error.message, status: error.status } };
    }

    return { 
      user: user ? {
        id: user.id,
        email: user.email || '',
        created_at: user.created_at || '',
        updated_at: user.updated_at || ''
      } : null, 
      error: null 
    };
  } catch (error) {
    return { 
      user: null, 
      error: { message: 'An unexpected error occurred while getting user' } 
    };
  }
}

export function onAuthStateChange(callback: (user: User | null) => void) {
  return supabase.auth.onAuthStateChange((event, session) => {
    if (session?.user) {
      callback({
        id: session.user.id,
        email: session.user.email || '',
        created_at: session.user.created_at || '',
        updated_at: session.user.updated_at || ''
      });
    } else {
      callback(null);
    }
  });
}

// Prompt management functions
export interface Prompt {
  id: number;
  created_at: string;
  prompts: string;
  social: 'linkedin' | 'twitter';
}

export async function getPrompts(social: 'linkedin' | 'twitter') {
  const { data, error } = await supabase
    .from('Prompts')
    .select('*')
    .eq('social', social)
    .order('created_at', { ascending: false });
  
  return { prompts: data, error };
}

export async function addPrompt(prompt: string, social: 'linkedin' | 'twitter') {
  const { data, error } = await supabase
    .from('Prompts')
    .insert([{ prompts: prompt, social }])
    .select();
  
  return { prompt: data?.[0], error };
}

export async function deletePrompt(id: number) {
  const { error } = await supabase
    .from('Prompts')
    .delete()
    .eq('id', id);
  
  return { error };
}