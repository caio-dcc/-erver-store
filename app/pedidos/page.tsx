'use client';

import { Container, Title, Text, Stack, Card, Group, Badge, Button, Divider, Loader, Center, Box, Table } from '@mantine/core';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { notifications } from '@mantine/notifications';
import { Package, Truck, RefreshCcw, AlertCircle } from 'lucide-react';

import { useSearchParams } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useDisclosure } from '@mantine/hooks';
import { Modal } from '@mantine/core';
import { MessageCircle } from 'lucide-react';


import { Suspense } from 'react';

function PedidosContent() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const { clearCart } = useCart();
  const [user, setUser] = useState<any>(null);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [modalOpened, { open, close }] = useDisclosure(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function getOrders() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        window.location.href = '/';
        return;
      }
      setUser(session.user);

      if (searchParams.get('session_id')) {
        clearCart();
      }

      // Fetch user profile to check for admin role
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
      const userIsAdmin = profile?.role === 'admin';
      setIsAdmin(userIsAdmin);

      let query = supabase.from('orders').select('*').order('created_at', { ascending: false });
      
      // Strict frontend gating (Assuming RLS allows SELECT true globally now)
      if (!userIsAdmin) {
        query = query.eq('user_id', session.user.id);
      }

      const { data, error } = await query;

      if (error) {
        notifications.show({ title: 'Erro', message: 'Não foi possível carregar seus pedidos.', color: 'red' });
      } else {
        setOrders(data || []);
      }
      setLoading(false);
    }

    getOrders();
  }, []);

  const handleRefundRequest = async (sessionId: string) => {
    try {
      const response = await fetch('/api/refund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, reason: 'requested_by_customer' }),
      });
      const data = await response.json();
      if (data.success) {
        notifications.show({ title: 'Sucesso', message: 'Solicitação de reembolso enviada!', color: 'green' });
        // Refresh orders
        setOrders(prev => prev.map(o => o.stripe_session_id === sessionId ? { ...o, status: 'refunded' } : o));
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      notifications.show({ title: 'Erro', message: err.message, color: 'red' });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid': return <Badge color="green">Pago</Badge>;
      case 'fulfilled': return <Badge color="blue">Enviado</Badge>;
      case 'refunded': return <Badge color="gray">Reembolsado</Badge>;
      case 'cancelled': return <Badge color="red">Cancelado</Badge>;
      default: return <Badge color="orange">Pendente</Badge>;
    }
  };

  if (loading) {
    return (
      <Box style={{ minHeight: '100vh' }}>
        <Center h="60vh"><Loader color="rubyRed" size="xl" /></Center>
      </Box>
    );
  }

  return (
    <Box style={{ color: '#fff' }}>
      <Container size="lg" pt={100} pb={100}>

        <Stack gap="xl">
          <Group justify="space-between" align="center">
            <Box>
              <Title order={1} style={{ fontStyle: 'italic', color: '#991b1b', fontSize: '3rem' }}>
                {isAdmin ? 'TODOS OS PEDIDOS (ADMIN)' : 'MEUS PEDIDOS'}
              </Title>
              <Text c="dimmed">
                {isAdmin ? 'Visão global e gerenciamento de vendas.' : 'Gerencie suas compras e acompanhe o status de entrega.'}
              </Text>
            </Box>
          </Group>

          {orders.length === 0 ? (
            <Card p="xl" radius="lg" withBorder style={{ backgroundColor: '#0b0b0b', borderColor: '#1a1a1a' }}>
              <Center>
                <Stack align="center" gap="xs">
                  <Package size={48} color="#333" />
                  <Text fw={700}>Nenhum pedido encontrado.</Text>
                  <Button variant="outline" color="rubyRed" component="a" href="/colecoes">Ver Coleções</Button>
                </Stack>
              </Center>
            </Card>
          ) : (
            <Stack gap="md">
              {orders.map((order) => (
                <Card 
                  key={order.id} 
                  p="xl" 
                  radius="lg" 
                  withBorder 
                  style={{ 
                    backgroundColor: '#0b0b0b', 
                    borderColor: '#1a1a1a',
                    borderLeft: '4px solid #991b1b'
                  }}
                >
                  <Group justify="space-between" align="flex-start">
                    <Stack gap={5}>
                      <Text size="xs" c="dimmed" tt="uppercase" fw={800}>Pedido #{order.id.slice(0,8)}</Text>
                      <Text size="sm">{new Date(order.created_at).toLocaleDateString('pt-BR')}</Text>
                      {getStatusBadge(order.status)}
                    </Stack>
                    
                    <Stack align="flex-end" gap={5}>
                      <Text size="xs" c="dimmed" tt="uppercase" fw={800}>Total</Text>
                      <Text fw={900} size="xl" style={{ color: '#991b1b' }}>R$ {order.total_amount.toFixed(2)}</Text>
                    </Stack>
                  </Group>

                  <Divider my="md" style={{ borderColor: '#1a1a1a' }} />

                  <Group justify="space-between">
                    <Group gap="xl">
                       <Stack gap={2}>
                        <Text size="xs" c="dimmed" tt="uppercase" fw={800}>Entrega</Text>
                        <Group gap={5}>
                          <Truck size={14} color="#991b1b" />
                          <Text size="xs">{order.shipping_address?.city || 'Brasil'}, {order.shipping_address?.country || 'BR'}</Text>
                        </Group>
                      </Stack>
                    </Group>

                    <Group>
                      {order.status === 'paid' && (
                        <Button 
                          variant="subtle" 
                          color="gray" 
                          size="xs" 
                          leftSection={<RefreshCcw size={14} />}
                          onClick={() => handleRefundRequest(order.stripe_session_id)}
                        >
                          Solicitar Reembolso
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        color="rubyRed" 
                        size="xs"
                        onClick={() => {
                          setSelectedOrder(order);
                          open();
                        }}
                      >
                        Ver Detalhes
                      </Button>
                    </Group>
                  </Group>
                </Card>
              ))}
            </Stack>
          )}
        </Stack>
      </Container>

      {/* Order Details Modal */}
      <Modal
        opened={modalOpened}
        onClose={close}
        title={<Title order={3} c="rubyRed">Detalhes do Pedido</Title>}
        size="lg"
        zIndex={2000}
        overlayProps={{ backgroundOpacity: 0.8, blur: 3 }}
        styles={{ 
          content: { backgroundColor: '#060606', border: '1px solid #1a1a1a', color: '#fff' },
          header: { backgroundColor: '#060606' },
          title: { fontWeight: 900, fontStyle: 'italic' },
          close: { color: '#fff', '&:hover': { backgroundColor: '#1a1a1a' } }
        }}
      >
        {selectedOrder && (
          <Stack gap="md">
            <Group justify="space-between">
              <Text c="dimmed" fw={600}>ID do Pedido:</Text>
              <Text fw={800}>#{selectedOrder.id.slice(0,8)}</Text>
            </Group>
            
            <Group justify="space-between">
              <Text c="dimmed" fw={600}>Data e Horário:</Text>
              <Text fw={700}>
                {new Date(selectedOrder.created_at).toLocaleDateString('pt-BR')} às {new Date(selectedOrder.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </Group>

            <Group justify="space-between">
              <Text c="dimmed" fw={600}>Total / Moeda:</Text>
              <Text fw={900} c="rubyRed">R$ {selectedOrder.total_amount.toFixed(2)} ({selectedOrder.currency})</Text>
            </Group>

            <Group justify="space-between">
              <Text c="dimmed" fw={600}>Forma de Pagamento:</Text>
              <Text fw={700}>Cartão de Crédito (Stripe)</Text>
            </Group>

            <Group justify="space-between">
              <Text c="dimmed" fw={600}>Status:</Text>
              {getStatusBadge(selectedOrder.status)}
            </Group>

            <Divider my="sm" color="#1a1a1a" />

            <Title order={5} c="dimmed">Itens Comprados</Title>
            <Stack gap="xs">
              {selectedOrder.items && selectedOrder.items.length > 0 ? (
                selectedOrder.items.map((item: any, idx: number) => (
                  <Group key={idx} justify="space-between" align="center" style={{ backgroundColor: '#0a0a0a', padding: '10px', borderRadius: '8px', border: '1px solid #1a1a1a' }}>
                    <Group gap="sm">
                      <Box style={{ width: 50, height: 50, borderRadius: 8, overflow: 'hidden', backgroundColor: '#111' }}>
                        {item.image && (
                          <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        )}
                      </Box>
                      <Stack gap={0}>
                        <Text size="sm" fw={700}>{item.name}</Text>
                        <Text size="xs" c="dimmed">Tam: {item.size} {item.width ? `| Largura: ${item.width}` : ''}</Text>
                      </Stack>
                    </Group>
                    <Stack align="flex-end" gap={0}>
                      <Text size="sm" fw={800} c="rubyRed">R$ {(item.price || 0).toFixed(2)}</Text>
                      <Text size="xs" c="dimmed">Qtd: {item.quantity || item.q || 1}</Text>
                    </Stack>
                  </Group>
                ))
              ) : (
                <Text size="sm" c="dimmed">Nenhum item listado.</Text>
              )}
            </Stack>

            <Divider my="sm" color="#1a1a1a" />

            <Button
              fullWidth
              color="teal"
              leftSection={<MessageCircle size={20} />}
              component="a"
              target="_blank"
              rel="noopener noreferrer"
              href={`https://wa.me/5521974026883?text=${encodeURIComponent(`Quero ajudar com pedido #${selectedOrder.id.slice(0,8)}`)}`}
              styles={{ root: { backgroundColor: '#128c7e', '&:hover': { backgroundColor: '#075e54' } } }}
            >
              Suporte via WhatsApp
            </Button>
          </Stack>
        )}
      </Modal>
    </Box>
  );
}

export default function PedidosPage() {
  return (
    <Suspense fallback={<Box style={{ minHeight: '100vh' }}><Center h="60vh"><Loader color="rubyRed" size="xl" /></Center></Box>}>
      <PedidosContent />
    </Suspense>
  );
}
