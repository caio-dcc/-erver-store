'use client';

import { Drawer, Group, Stack, Text, Title, Button, ActionIcon, NumberInput, Divider, Image, Box, Loader } from '@mantine/core';
import { useCart } from '@/contexts/CartContext';
import { useState } from 'react';
import { Trash, Minus, Plus } from 'lucide-react';
import { notifications } from '@mantine/notifications';
import { supabase } from '@/lib/supabase';

export function CartDrawer() {
  const { items, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity } = useCart();
  const [loading, setLoading] = useState(false);

  const total = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const handleCheckout = async () => {
    if (items.length === 0) return;
    setLoading(true);

    try {
      const { data: { session: authSession } } = await supabase.auth.getSession();
      
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          userId: authSession?.user?.id || null
        }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Erro ao iniciar checkout');
      }
    } catch (error: any) {
      notifications.show({ title: 'Erro', message: error.message, color: 'red' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer
      opened={isCartOpen}
      onClose={() => setIsCartOpen(false)}
      position="right"
      size="md"
      padding="xl"
      title={
        <Text size="xl" fw={900} style={{ fontStyle: 'italic', color: '#991b1b', letterSpacing: '1px' }}>SEU CARRINHO</Text>
      }
      styles={{

        header: { backgroundColor: '#060606', borderBottom: '1px solid #1a1a1a', paddingBottom: '20px' },
        content: { backgroundColor: '#060606' },
        close: { color: '#ffffff' }
      }}
    >
      <Stack justify="space-between" style={{ height: 'calc(100vh - 100px)' }}>
        <Stack gap="xl" style={{ overflowY: 'auto', flex: 1, paddingRight: '10px' }} mt="md">
          {items.length === 0 ? (
            <Text c="dimmed" ta="center" mt="xl">Seu carrinho está vazio.</Text>
          ) : (
            items.map(item => (
              <Box key={item.cartItemId} style={{ borderBottom: '1px solid #1a1a1a', paddingBottom: '15px' }}>
                <Group wrap="nowrap" align="flex-start">
                  <Image src={item.image} w={80} h={80} radius="md" style={{ objectFit: 'cover' }} />
                  <Stack gap={5} style={{ flex: 1 }}>
                    <Group justify="space-between" align="flex-start" wrap="nowrap">
                      <Text fw={700} size="sm" style={{ color: '#fff', lineHeight: 1.2 }}>{item.name}</Text>
                      <ActionIcon variant="subtle" color="red" onClick={() => removeFromCart(item.cartItemId)}>
                        <Trash size={16} />
                      </ActionIcon>
                    </Group>
                    <Group gap="xs">
                      {item.size && <Text size="xs" c="dimmed">Tam: {item.size}</Text>}
                      {item.color && <Text size="xs" c="dimmed">Cor: {item.color}</Text>}
                    </Group>
                    <Group justify="space-between" mt="sm">
                      <Group gap={5} align="center">
                        <ActionIcon size="sm" variant="default" onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}>
                          <Minus size={12} />
                        </ActionIcon>
                        <Text size="sm" w={20} ta="center" style={{ color: '#fff' }}>{item.quantity}</Text>
                        <ActionIcon size="sm" variant="default" onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}>
                          <Plus size={12} />
                        </ActionIcon>
                      </Group>
                      <Text fw={800} style={{ color: '#991b1b' }}>R$ {(item.price * item.quantity).toFixed(2)}</Text>
                    </Group>
                  </Stack>
                </Group>
              </Box>
            ))
          )}
        </Stack>

        <Box style={{ borderTop: '1px solid #1a1a1a', paddingTop: '20px' }}>
          <Group justify="space-between" mb="xl">
            <Text tt="uppercase" fw={800} size="sm" c="dimmed">Total</Text>
            <Text fw={900} size="xl" style={{ color: '#fff' }}>R$ {total.toFixed(2)}</Text>
          </Group>
          <Button 
            fullWidth 
            size="lg" 
            color="rubyRed"
            onClick={handleCheckout}
            disabled={items.length === 0}
            loading={loading}
            styles={{
              root: {
                transition: '0.2s',
                '&:active': {
                  backgroundColor: '#1E3A8A !important',
                  boxShadow: '0 0 20px #1E3A8A'
                }
              }
            }}
          >
            FINALIZAR COMPRA
          </Button>
          <Text size="xs" c="dimmed" ta="center" mt="md">
            Envio internacional grátis. Pagamento 100% seguro.
          </Text>
        </Box>
      </Stack>
    </Drawer>
  );
}
