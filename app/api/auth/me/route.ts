import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { authenticated: false, user: null },
        {
          status: 401,
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          },
        }
      );
    }

    return NextResponse.json(
      {
        authenticated: true,
        user,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      { authenticated: false, user: null },
      {
        status: 401,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
  }
}
