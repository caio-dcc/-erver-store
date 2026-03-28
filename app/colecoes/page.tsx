'use client';

import { Container, Title, SimpleGrid, Card, Image, Text, Badge, Group, Stack, Loader, Center, Box, Button } from '@mantine/core';

import { useDisclosure } from '@mantine/hooks';
import { ParticleButton } from '@/components/ParticleButton';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { PrintifyProductModal } from '@/components/PrintifyProductModal';

export default function ColecoesPage() {
  const [lojas, setLojas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [detailModalOpened, { open: openDetail, close: closeDetail }] = useDisclosure(false);
  const [storeProducts, setStoreProducts] = useState<any[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [storeModalOpened, { open: openStore, close: closeStore }] = useDisclosure(false);
  const [currentStore, setCurrentStore] = useState<any>(null);

  useEffect(() => {
    async function fetchLojas() {
      const { data, error } = await supabase.from('stores')
        .select(`
          *,
          profiles (full_name)
        `);
      if (data && !error) {
        setLojas(data);
      } else {
        setLojas([
          { id: 1, name: 'Elegance Fashion', profiles: { full_name: 'Maria Silva' }, description: 'Coleção exclusiva de peças atemporais e sofisticadas.' },
          { id: 2, name: 'Urban Street', profiles: { full_name: 'João Pedro' }, description: 'O melhor do streetwear contemporâneo.' }
        ]);
      }
      setLoading(false);
    }
    fetchLojas();
  }, []);

  const handleViewStore = async (loja: any) => {
    setCurrentStore(loja);
    openStore();
    setProductsLoading(true);
    // Fetch products for this store
    const { data } = await supabase.from('products').select('*').eq('store_id', loja.id);
    if (data && data.length > 0) {
      setStoreProducts(data);
    } else {
      // Fetch some Printify products as fallback/mock for the "Collection" feel
      try {
        const res = await fetch('/api/printify/products');
        if (res.ok) {
          const pData = await res.json();
          setStoreProducts(pData.slice(0, 6));
        }
      } catch (err) {
        console.error(err);
      }
    }
    setProductsLoading(false);
  };

  return (
    <Box style={{ color: '#fff' }}>
      <Container size="lg" pt={100} pb={100}>

        <Title order={1} mb={40} style={{ borderLeft: '8px solid #991b1b', paddingLeft: '15px', letterSpacing: '1px' }}>
          Coleções $erver
        </Title>

        {loading ? (
          <Center h={400}><Loader color="rubyRed" size="xl" /></Center>
        ) : (
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing={30}>
            {lojas.map((loja) => (
              <Card 
                key={loja.id} 
                shadow="md" 
                padding="xl" 
                radius="lg" 
                withBorder 
                style={{ 
                  backgroundColor: '#0b0b0b', 
                  borderColor: '#1a1a1a',
                }}

              >
                <Card.Section>
                  <Box style={{ height: '200px', backgroundColor: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid #1a1a1a' }}>
                    <Title order={2} style={{ color: '#991b1b', opacity: 0.8 }}>{loja.name[0]}</Title>
                  </Box>
                </Card.Section>

                <Stack mt="md" gap="xs">
                  <Group justify="space-between">
                    <Text fw={800} size="xl" style={{ color: '#ffffff' }}>{loja.name}</Text>
                    <Badge variant="dot" color="rubyRed">Premium</Badge>
                  </Group>

                  <Text size="sm" c="dimmed" lineClamp={2} style={{ height: '40px' }}>
                    {loja.description}
                  </Text>

                  <Text size="xs" c="dimmed" mt="sm">
                    Curadoria por: <span style={{ color: '#ffffff', fontWeight: 600 }}>{loja.profiles?.full_name || '$erver Editor'}</span>
                  </Text>

                  <Box mt="xl">
                    <ParticleButton fullWidth onClick={() => handleViewStore(loja)}>
                      Explorar Coleção
                    </ParticleButton>
                  </Box>

                </Stack>
              </Card>
            ))}
          </SimpleGrid>
        )}
      </Container>

      {/* Store Collection Modal */}
      <PrintifyProductModal 
        opened={detailModalOpened} 
        onClose={closeDetail} 
        product={selectedProduct} 
      />

      {currentStore && (
        <Box 
          component="div" 
          style={{ 
            position: 'fixed', 
            top: storeModalOpened ? 0 : '100%', 
            left: 0, 
            width: '100%', 
            height: '100%', 
            backgroundColor: '#060606', 
            zIndex: 1000, 
            transition: '0.4s ease-in-out',
            padding: '40px'
          }}
        >
          <Container size="xl">
            <Group justify="space-between" mb="xl">
              <Stack gap={0}>
                <Title order={1} style={{ color: '#991b1b' }}>{currentStore.name}</Title>
                <Text c="dimmed">{currentStore.description}</Text>
              </Stack>
              <Button 
                variant="subtle" 
                color="gray" 
                size="lg" 
                onClick={closeStore}
                styles={{
                  root: {
                    '&:hover': {
                      backgroundColor: 'transparent'
                    }
                  }
                }}
              >
                Fechar
              </Button>

            </Group>

            {productsLoading ? (
              <Center h={400}><Loader color="rubyRed" /></Center>
            ) : (
              <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="xl">
                {storeProducts.map((p) => (
                  <Card key={p.id} withBorder p="md" radius="lg" style={{ backgroundColor: '#0b0b0b', borderColor: '#1a1a1a' }}>
                    <Card.Section>
                      <Image src={p.image} h={200} style={{ objectFit: 'cover' }} />
                    </Card.Section>
                    <Stack mt="md" gap="xs">
                      <Text fw={700} lineClamp={1}>{p.name}</Text>
                      <Text c="rubyRed" fw={800}>R$ {(p.price * 1).toFixed(2)}</Text>
                      <ParticleButton 
                        size="xs" 
                        onClick={() => {
                          setSelectedProduct(p);
                          openDetail();
                        }}
                      >
                        Ver Detalhes
                      </ParticleButton>
                    </Stack>
                  </Card>
                ))}
              </SimpleGrid>
            )}
          </Container>
        </Box>
      )}
    </Box>
  );
}

