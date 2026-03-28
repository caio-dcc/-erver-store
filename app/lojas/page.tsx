'use client';

import { Container, Title, Text, Stack, SimpleGrid, Card, Image, Badge, Box } from '@mantine/core';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

const LOJAS = [
  { name: 'Brechó do Porto', specialty: 'Vintage / 90s', image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=800' },
  { name: 'Carioca Hype', specialty: 'Sneakers / Limited', image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=800' },
  { name: 'Rio Surf Squad', specialty: 'Surfwear / Beach', image: 'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?q=80&w=800' },
];

export default function LojasPage() {
  return (
    <Box style={{ color: '#fff' }}>
      <Container size="lg" pt={120} pb={80}>

        <Stack gap="xl">
          <Box>
            <Title order={1} style={{ fontStyle: 'italic', color: '#991b1b', fontSize: '3.5rem' }}>LOJAS VIZINHAS</Title>
            <Text c="dimmed">Fortalecendo a cena local. Marcas e parceiros que respiram o Rio.</Text>
          </Box>

          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="xl">
            {LOJAS.map((loja, i) => (
              <Card key={i} p="md" radius="lg" withBorder style={{ backgroundColor: '#0b0b0b', borderColor: '#1a1a1a' }}>
                <Card.Section>
                  <Image src={loja.image} h={250} alt={loja.name} />
                </Card.Section>
                <Stack mt="md" gap="xs">
                  <Badge color="rubyRed" variant="outline">{loja.specialty}</Badge>
                  <Title order={3}>{loja.name}</Title>
                  <Text size="sm" c="dimmed">Parceiro oficial do ecossistema $erver.</Text>
                </Stack>
              </Card>
            ))}
          </SimpleGrid>
        </Stack>
      </Container>
    </Box>
  );
}

