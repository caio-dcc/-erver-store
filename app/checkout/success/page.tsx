'use client';

import { Container, Title, Text, Stack, Button, Box, ThemeIcon } from '@mantine/core';
import { Check, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutSuccessPage() {
  return (
    <Container size="sm" py={100}>
      <Stack align="center" gap="xl">
        <ThemeIcon size={80} radius={100} color="green" variant="light">
          <Check size={40} />
        </ThemeIcon>

        <Stack align="center" gap="xs">
          <Title order={1} style={{ color: '#ffffff', textAlign: 'center' }}>
            Pagamento Confirmado!
          </Title>
          <Text c="dimmed" ta="center" size="lg">
            Seu pedido foi processado e enviado para a Printify.
            Você receberá um e-mail com as atualizações de rastreio em breve.
          </Text>
        </Stack>

        <Box mt="xl">
          <Button 
            component={Link} 
            href="/" 
            size="lg" 
            color="rubyRed"
            leftSection={<ShoppingBag size={20} />}
          >
            Voltar para a Loja
          </Button>
        </Box>
      </Stack>
    </Container>
  );
}
