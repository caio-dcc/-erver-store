import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase.from('orders').insert([
      {
        total_amount: 99.99,
        status: 'pending'
      }
    ]).select();

    return NextResponse.json({ success: !error, data, error: error?.message || null });
  } catch (e: any) {
    return NextResponse.json({ error: e.message });
  }
}
