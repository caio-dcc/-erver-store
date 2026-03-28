'use client';

import { Container, Group, Text, Anchor, Stack, Divider, Box } from '@mantine/core';
import Link from 'next/link';
import { Globe, Zap, ShoppingBag } from 'lucide-react';


export function Footer() {
  return (
    <Box component="footer" style={{ backgroundColor: '#060606', borderTop: '1px solid #1a1a1a', padding: '60px 0 30px 0' }}>
      <Container size="lg">
        <Group justify="space-between" align="flex-start">
          <Stack gap="xs" style={{ maxWidth: '300px' }}>
            <Text fw={900} size="xl" style={{ color: '#991b1b', fontStyle: 'italic', letterSpacing: '-1px' }}>$ERVER</Text>
            <Text size="sm" c="dimmed">
              A marca definitiva de Streetwear no Rio de Janeiro. Cultura urbana, lifestyle carioca e inteligência em moda 021.
            </Text>
            <Group gap="md" mt="md">
              <Globe size={20} color="#991b1b" style={{ cursor: 'pointer' }} />
              <Zap size={20} color="#991b1b" style={{ cursor: 'pointer' }} />
              <ShoppingBag size={20} color="#991b1b" style={{ cursor: 'pointer' }} />
            </Group>

          </Stack>

          <Group gap={80} align="flex-start">
            <Stack gap="sm">
              <Text fw={800} size="sm" tt="uppercase" style={{ color: '#991b1b' }}>Shopping</Text>
              <Anchor component={Link} href="/colecoes" size="sm" c="dimmed" underline="never" style={{ '&:hover': { color: '#fff' } }}>Coleções</Anchor>
              <Anchor component={Link} href="/pedidos" size="sm" c="dimmed" underline="never">Meus Pedidos</Anchor>
              <Anchor component={Link} href="/suporte" size="sm" c="dimmed" underline="never">Suporte</Anchor>
            </Stack>

            <Stack gap="sm">
              <Text fw={800} size="sm" tt="uppercase" style={{ color: '#991b1b' }}>Legal</Text>
              <Anchor component={Link} href="/terms" size="sm" c="dimmed" underline="never">Termos de Uso</Anchor>
              <Anchor component={Link} href="/privacy" size="sm" c="dimmed" underline="never">Privacidade</Anchor>
              <Anchor component={Link} href="/reembolso" size="sm" c="dimmed" underline="never">Política de Reembolso</Anchor>
            </Stack>
          </Group>
        </Group>

        <Divider my="xl" style={{ borderColor: '#111' }} />

        <Group justify="space-between">
          <Text size="xs" c="dimmed">
            © {new Date().getFullYear()} $erver Store. Rio de Janeiro, Brasil. Todos os direitos reservados.
          </Text>
          <Group gap="xs">
            <Text size="xs" c="dimmed">Pagamento Seguro via</Text>
            <Text size="xs" fw={700} c="white">Stripe</Text>
          </Group>
        </Group>
      </Container>
    </Box>
  );
}
