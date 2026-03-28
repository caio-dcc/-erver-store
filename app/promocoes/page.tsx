'use client';

import { Container, Title, SimpleGrid, Card, Image, Text, Badge, Group, Stack, Progress } from '@mantine/core';
import { Navbar } from '@/components/Navbar';
import { ParticleButton } from '@/components/ParticleButton';

export default function PromocoesPage() {
  const promocoes = [
    { id: 1, name: 'Queima de Estoque Verão', discount: '50%', date: 'Até 30/03', color: 'red' },
    { id: 2, name: 'Semana do Consumidor', discount: '30%', date: 'Até 05/04', color: 'blue' },
    { id: 3, name: 'Primeira Compra', discount: '15%', date: 'Válido sempre', color: 'green' },
  ];

  return (
    <main style={{ backgroundColor: '#060606', minHeight: '100vh', color: '#ffffff' }}>

      <Navbar />
      <Container size="xl" py="xl">
        <Title order={1} mb="xl" style={{ borderLeft: '8px solid #991b1b', paddingLeft: '15px' }}>
          Promoções Imperdíveis
        </Title>


        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="xl">
          {promocoes.map((promo) => (
            <Card key={promo.id} shadow="md" padding="xl" radius="lg" withBorder style={{ backgroundColor: '#0b0b0b', borderColor: '#1a1a1a' }}>

              <Stack gap="md">
                <Badge size="xl" variant="filled" color={promo.id === 1 ? 'rubyRed' : 'strongBlue'}>
                  {promo.discount} OFF
                </Badge>

                
                <Title order={3}>{promo.name}</Title>
                
                <Text size="sm" c="dimmed">
                  Aproveite as ofertas exclusivas da semana. Produtos selecionados com descontos incríveis.
                </Text>

                <Group justify="space-between">
                  <Text fw={700}>{promo.date}</Text>
                  <Text c="dimmed" size="xs">Termina em breve!</Text>
                </Group>

                <Progress value={75} color="rubyRed" size="sm" radius="xl" />


                <ParticleButton fullWidth mt="md">
                  Aproveitar Agora
                </ParticleButton>
              </Stack>
            </Card>
          ))}
        </SimpleGrid>
      </Container>
    </main>
  );
}
