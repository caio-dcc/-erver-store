import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testInsert() {
  const { data, error } = await supabase.from('orders').insert([
    {
      total_amount: 99.99,
      status: 'pending'
    }
  ]).select();

  if (error) {
    console.error("❌ Insertion Failed:", error.message);
  } else {
    console.log("✅ Insertion Succeeded!", data);
  }
}

testInsert();
