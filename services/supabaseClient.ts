import { createClient } from '@supabase/supabase-js';

// These environment variables are assumed to be injected by the environment
const supabaseUrl = (process.env as any).SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = (process.env as any).SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const getCurrentUser = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
};

// Phone number validation - ensures phone has country code
export const validatePhoneNumber = (phone: string): boolean => {
  // Phone should start with + and have at least 10 digits
  const phoneRegex = /^\+[1-9]\d{9,14}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

// Format phone number - adds + if missing, removes spaces
export const formatPhoneNumber = (phone: string): string => {
  let formatted = phone.replace(/\s/g, '');
  if (!formatted.startsWith('+')) {
    formatted = '+' + formatted;
  }
  return formatted;
};

// Send OTP to phone number
export const sendOTP = async (phone: string) => {
  const formattedPhone = formatPhoneNumber(phone);
  if (!validatePhoneNumber(formattedPhone)) {
    throw new Error('Invalid phone number. Please include country code (e.g., +1234567890)');
  }

  const { error } = await supabase.auth.signInWithOtp({
    phone: formattedPhone,
  });

  if (error) throw error;
  return { success: true };
};

// Verify OTP and sign in
export const verifyOTP = async (phone: string, token: string) => {
  const formattedPhone = formatPhoneNumber(phone);
  const { data, error } = await supabase.auth.verifyOtp({
    phone: formattedPhone,
    token,
    type: 'sms',
  });

  if (error) throw error;
  return data;
};

// Send OTP for linking phone (when user is already authenticated)
export const initiatePhoneLinking = async (phone: string) => {
  const formattedPhone = formatPhoneNumber(phone);
  if (!validatePhoneNumber(formattedPhone)) {
    throw new Error('Invalid phone number. Please include country code (e.g., +1234567890)');
  }

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('You must be signed in to link a phone number');
  }

  // Send OTP for linking (use signInWithOtp - when verified while authenticated, it links)
  const { error } = await supabase.auth.signInWithOtp({
    phone: formattedPhone,
  });

  if (error) throw error;
  return { success: true, phone: formattedPhone };
};

// Complete phone linking by verifying OTP (user must be authenticated)
export const completePhoneLinking = async (phone: string, token: string) => {
  const formattedPhone = formatPhoneNumber(phone);
  
  // Verify OTP - if user is authenticated, Supabase will link the phone identity
  const { data, error } = await supabase.auth.verifyOtp({
    phone: formattedPhone,
    token,
    type: 'sms',
  });

  if (error) {
    // Check if phone is already linked to another account
    if (error.message?.includes('already registered') || error.message?.includes('already exists')) {
      throw new Error('This phone number is already associated with another account');
    }
    throw error;
  }

  return data;
};

// Link phone number to existing account (legacy function - uses new helpers)
export const linkPhoneToAccount = async (phone: string, token: string) => {
  return await completePhoneLinking(phone, token);
};

// Link email to existing account (for phone-only users)
export const linkEmailToAccount = async (email: string, password: string) => {
  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('You must be signed in to link an email');
  }

  // Check if email is already in use
  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  // Update user with email and password - this creates/links email identity
  const { data, error } = await supabase.auth.updateUser({
    email,
    password,
  });

  if (error) {
    // Check if email is already linked to another account
    if (error.message?.includes('already registered') || error.message?.includes('already exists')) {
      throw new Error('This email is already associated with another account');
    }
    throw error;
  }

  return data;
};

// Initiate email linking (prepare for linking email)
export const initiateEmailLinking = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('You must be signed in to link an email');
  }
  return { success: true };
};

// Complete email linking
export const completeEmailLinking = async (email: string, password: string) => {
  return await linkEmailToAccount(email, password);
};

// Get user identities
export const getUserIdentities = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Access identities from user object (may need type assertion)
  const userWithIdentities = user as any;

  return {
    email: user.email,
    phone: user.phone,
    identities: userWithIdentities.identities || [],
  };
};
