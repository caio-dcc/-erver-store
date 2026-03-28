import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  const { count: storesCount } = await supabase.from('stores').select('*', { count: 'exact', head: true });
  const { count: productsCount } = await supabase.from('products').select('*', { count: 'exact', head: true });
  
  return NextResponse.json({
    stores: storesCount || 0,
    products: productsCount || 0,
    status: 'online'
  });
}
