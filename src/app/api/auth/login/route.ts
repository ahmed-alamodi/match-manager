import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    // Initialize the Supabase server client
    const supabase = await createClient();
    const body = await request.json();
    
    // ==========================================
    // 1. Handle Google OAuth Login
    // ==========================================
    if (body.provider === 'google') {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          // The URL to redirect to after successful Google authentication.
          // Ensure NEXT_PUBLIC_SITE_URL is set in your .env.local file.
          redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
        },
      });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      // Return the OAuth redirect URL to the client.
      // The frontend should then navigate the user to this URL (e.g., window.location.href = data.url).
      return NextResponse.json({ url: data.url });
    }

    // ==========================================
    // 2. Handle Email or Phone + Password Login
    // ==========================================
    const { identifier, password } = body;

    // Validate that the required fields are provided
    if (!identifier || !password) {
      return NextResponse.json(
        { error: 'Identifier (email or phone) and password are required' },
        { status: 400 }
      );
    }

    let authResponse;

    // A simple regex to determine if the provided identifier is formatted like an email address
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);

    if (isEmail) {
      // Authenticate using Email and Password
      authResponse = await supabase.auth.signInWithPassword({
        email: identifier,
        password: password,
      });
    } else {
      // Authenticate using Phone Number and Password
      // Note: Supabase expects phone numbers to ideally be in E.164 format (e.g., +1234567890)
      authResponse = await supabase.auth.signInWithPassword({
        phone: identifier,
        password: password,
      });
    }

    const { data, error } = authResponse;

    // Handle authentication errors (e.g., incorrect password, invalid user)
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    // Return success response with user and session data.
    // The Supabase client automatically sets the session cookies via the server client configuration.
    return NextResponse.json({ user: data.user, session: data.session });

  } catch (err) {
    console.error('Login API error:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred during login' },
      { status: 500 }
    );
  }
}
