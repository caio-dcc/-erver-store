import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { sessionId, reason } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ error: 'Stripe Session ID is required' }, { status: 400 });
    }

    // 1. Find the payment intent from the session
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const paymentIntentId = session.payment_intent as string;

    if (!paymentIntentId) {
      throw new Error('No payment intent found for this session');
    }

    // 2. Create the refund in Stripe
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      reason: reason || 'requested_by_customer',
    });

    // 3. Update the order status in Supabase
    const { error: dbError } = await supabase
      .from('orders')
      .update({ status: 'refunded' })
      .eq('stripe_session_id', sessionId);

    if (dbError) {
      console.error('Failed to update order status in DB:', dbError.message);
    }

    return NextResponse.json({ 
      success: true, 
      refundId: refund.id,
      status: refund.status
    });

  } catch (error: any) {
    console.error('Refund error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
