import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { productId, productName } = await req.json();

    if (!productId) {
      return NextResponse.json({ error: 'product_id is required' }, { status: 400 });
    }

    // Upsert analytics: If product exists, increment view_count, otherwise insert
    const { data, error } = await supabase
      .from('product_analytics')
      .select('id, view_count')
      .eq('product_id', productId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows found"
       throw error;
    }

    if (data) {
      // Update existing
      await supabase
        .from('product_analytics')
        .update({ 
          view_count: data.view_count + 1,
          last_viewed_at: new Date().toISOString(),
          product_name: productName || null
        })
        .eq('id', data.id);
    } else {
      // Insert new
      await supabase
        .from('product_analytics')
        .insert([{
          product_id: productId,
          product_name: productName,
          view_count: 1
        }]);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Analytics error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
