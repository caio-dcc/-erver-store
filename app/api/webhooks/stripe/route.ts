import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createPrintifyOrder } from '@/lib/printify';
import { supabase } from '@/lib/supabase';


export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get('stripe-signature') as string;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    console.error('CRITICAL: Webhook signature verification failed.', error.message);
    // Security Fix: Never fallback to JSON.parse in production.
    return NextResponse.json({ error: 'Webhook signature verification failed.' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any;
    
    try {
      console.log('Payment successful. Logging order to Supabase first...');

      // 1. Log order to Supabase for Analytics immediately
      const { data: orderRow, error: dbError } = await supabase.from('orders').insert([{
        user_id: session.metadata?.user_id || session.client_reference_id || null, 
        stripe_session_id: session.id,

        total_amount: session.amount_total ? session.amount_total / 100 : 0,
        currency: session.currency?.toUpperCase() || 'BRL',
        status: 'paid', // Initial payment confirmed
        shipping_address: session.shipping_details?.address || {},
        items: JSON.parse(session.metadata?.cart_items || '[]'),
      }]).select('id').single();

      if (dbError) {
        console.error('Supabase logging error:', dbError.message);
      }

      // 2. Transmit to Printify
      console.log('Creating Printify order...');
      const printifyOrder = await createPrintifyOrder(session);
      const printifyId = printifyOrder?.id || null;
      console.log('Printify order created successfully!');

      // 3. Update Supabase with the Printify ID
      if (orderRow && printifyId) {
        await supabase.from('orders').update({ printify_order_id: printifyId }).eq('id', orderRow.id);
      }

    } catch (error: any) {
      console.error('Webhook execution failed:', error.message);
      // Even if Printify fails, the Stripe session has been logged to our DB.
    }
  }



  return NextResponse.json({ received: true });
}
