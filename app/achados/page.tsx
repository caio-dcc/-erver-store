'use client';

import { Container, Title, Text, Stack, SimpleGrid, Card, Image, Badge, Box } from '@mantine/core';


const ACHADOS = [
  { name: 'Moletom Tokyo Oversized', origin: 'Japão', price: 'R$ 450,00', image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800' },
  { name: 'Tênis Seoul Techwear', origin: 'Coreia do Sul', price: 'R$ 890,00', image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800' },
  { name: 'Jaqueta Berlin Industrial', origin: 'Alemanha', price: 'R$ 620,00', image: 'https://images.unsplash.com/photo-1544022613-e87ce71c85ca?q=80&w=800' },
];

export default function AchadosPage() {
  return (
    <Box style={{ color: '#fff' }}>
      <Container size="lg" pt={120} pb={80}>

        <Stack gap="xl">
          <Box>
            <Title order={1} style={{ fontStyle: 'italic', color: '#991b1b', fontSize: '3.5rem' }}>ACHADOS IMPORTADOS</Title>
            <Text c="dimmed">Curadoria global de peças raras e tecnológicas. Trazer o mundo para o 021.</Text>
          </Box>

          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="xl">
            {ACHADOS.map((item, i) => (
              <Card key={i} p="md" radius="lg" withBorder style={{ backgroundColor: '#0b0b0b', borderColor: '#1a1a1a' }}>
                <Card.Section>
                  <Image src={item.image} h={300} alt={item.name} />
                </Card.Section>
                <Stack mt="md" gap="xs">
                  <Badge color="blue" variant="filled">{item.origin}</Badge>
                  <Title order={3}>{item.name}</Title>
                  <Text fw={900} size="lg" style={{ color: '#991b1b' }}>{item.price}</Text>
                  <Text size="xs" c="dimmed">Lote limitado. Importação direta.</Text>
                </Stack>
              </Card>
            ))}
          </SimpleGrid>
        </Stack>
      </Container>
    </Box>
  );
}

