import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function POST(req: Request) {
  try {
    const { items, userId } = await req.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Carrinho vazio' }, { status: 400 });
    }

    // SECURITY AUDIT WARNING: 
    // Currently, `item.price` is inherently trusted from the client payload. 
    // In production, an attacker could manipulate this payload (e.g., send { price: 0.01 }) 
    // and successfully buy premium products for 1 cent.
    // PRODUCTION FIX REQUIRED: Do not map `item.price` from the client. Instead, lookup the 
    // authentic price directly from Supabase `public.products` or the Printify API using `item.id`.
    const line_items = items.map((item: any) => ({
      price_data: {
        currency: 'brl',
        product_data: {
          name: `${item.name} - ${item.size || ''} ${item.color || ''}`.trim(),
          images: [item.image].filter(Boolean),
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    // Compress cart for metadata (p = productId, v = variantId, q = quantity)
    const compressedItems = items.map((i: any) => ({ p: i.productId, v: i.variantId, q: i.quantity }));
    const cartItemsJson = JSON.stringify(compressedItems).slice(0, 500);

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: line_items,
      mode: 'payment',
      client_reference_id: userId || undefined,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/pedidos?session_id={CHECKOUT_SESSION_ID}`,

      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/`,
      metadata: {
        cart_items: cartItemsJson,
        user_id: userId || '',
      },

      shipping_address_collection: {

        allowed_countries: ['BR', 'US', 'GB', 'CA'],
      },
    });



    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe Checkout Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
