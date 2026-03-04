// app/api/status/route.ts
// Public endpoint to check application status.
// Returns minimal info - no sensitive data exposed.

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { z } from 'zod';

const schema = z.object({ id: z.string().uuid() });

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  
  const parsed = schema.safeParse({ id });
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid application ID format' }, { status: 400 });
  }

  const supabase = createAdminClient();
  
  const { data, error } = await supabase
    .from('applications')
    .select('status, full_name, created_at, reviewed_at, score')
    .eq('id', parsed.data.id)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ error: 'Application not found' }, { status: 404 });
  }

  // Return only safe, non-sensitive fields
  return NextResponse.json({
    status: data.status,
    full_name: data.full_name,
    created_at: data.created_at,
    reviewed_at: data.reviewed_at,
  });
}
