'use client';

import { useEffect, useState } from 'react';
import { 
  Container, 
  Title, 
  Stack, 
  TextInput, 
  Textarea, 
  Button, 
  Group, 
  Box, 
  Paper, 
  ActionIcon, 
  Modal, 
  NumberInput, 
  Loader, 
  Center,
  Image,
  Badge,
  Text
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Navbar } from '@/components/Navbar';
import { ParticleButton } from '@/components/ParticleButton';
import { Plus, Trash, RefreshCw, Package } from 'lucide-react';

import { supabase } from '@/lib/supabase';
import { AnimatedList } from '@/components/AnimatedList';
import { PrintifyProductModal } from '@/components/PrintifyProductModal';


export default function MinhaLojaPage() {
  const [store, setStore] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [printifyProducts, setPrintifyProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [printifyLoading, setPrintifyLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [detailModalOpened, { open: openDetail, close: closeDetail }] = useDisclosure(false);
  const [addModalOpened, { open: openAdd, close: closeAdd }] = useDisclosure(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchStoreData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Fetch store
      const { data: storeData } = await supabase.from('stores')
        .select('*')
        .eq('owner_id', user.id)
        .single();
      
      if (storeData) {
        setStore(storeData);
        // Fetch local products
        const { data: productsData } = await supabase.from('products')
          .select('*')
          .eq('store_id', storeData.id);
        if (productsData) setProducts(productsData);
      } else {
        setStore({ name: 'Minha Loja $erver', description: 'Bem-vindo à minha loja premium.' });
      }
      setLoading(false);
    }
    fetchStoreData();
  }, []);

  const fetchPrintifyProducts = async () => {
    setPrintifyLoading(true);
    try {
      const res = await fetch('/api/printify/products');
      if (res.ok) {
        const data = await res.json();
        setPrintifyProducts(data.filter((p: any) => p.image));
      }
    } catch (err) {
      console.error('Failed to fetch Printify products', err);
    }
    setPrintifyLoading(false);
  };

  useEffect(() => {
    fetchPrintifyProducts();
  }, []);

  const handleSaveStore = async () => {
    if (!store) return;
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('stores').upsert({ ...store, owner_id: user.id });
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <main style={{ backgroundColor: '#060606', minHeight: '100vh' }}>
        <Navbar />
        <Center h={400}><Loader color="rubyRed" size="xl" /></Center>
      </main>
    );
  }

  const allProducts = [
    ...products.map(p => ({ ...p, source: 'Local' })),
    ...printifyProducts.map(p => ({ ...p, source: 'Printify' }))
  ];

  return (
    <main style={{ backgroundColor: '#060606', minHeight: '100vh', color: '#ffffff' }}>
      <Navbar />
      <Container size="lg" py="xl">
        <Stack gap="xl">
          <Paper p="xl" withBorder radius="md" style={{ backgroundColor: '#0b0b0b', borderColor: '#1a1a1a' }}>
            <Title order={3} mb="lg" style={{ color: '#991b1b' }}>Configurações da Loja</Title>

            <Stack>
              <TextInput 
                label="Nome da Loja" 
                value={store?.name || ''} 
                onChange={(e) => setStore({ ...store, name: e.currentTarget.value })} 
                styles={{ input: { backgroundColor: '#060606', border: '1px solid #1a1a1a', color: '#fff' } }}
              />
              <Textarea 
                label="Descrição" 
                value={store?.description || ''} 
                onChange={(e) => setStore({ ...store, description: e.currentTarget.value })} 
                minRows={4}
                styles={{ input: { backgroundColor: '#060606', border: '1px solid #1a1a1a', color: '#fff' } }}
              />
              <Group justify="flex-end">
                <ParticleButton size="sm" onClick={handleSaveStore}>Salvar Alterações</ParticleButton>
              </Group>
            </Stack>
          </Paper>

          <Paper p="xl" withBorder radius="md" style={{ position: 'relative', backgroundColor: '#0b0b0b', borderColor: '#1a1a1a' }}>
            <Group justify="space-between" mb="xl">
              <Stack gap={0}>
                <Title order={3} style={{ color: '#991b1b' }}>Gerenciamento de Inventário</Title>
                <Text size="sm" c="dimmed">Sincronize com Printify ou adicione itens manuais.</Text>
              </Stack>
              <Group>
                <Button 
                  variant="outline" 
                  color="strongBlue" 
                  onClick={fetchPrintifyProducts}
                  loading={printifyLoading}
                  leftSection={<RefreshCw size={18} />}
                >
                  Sync Printify
                </Button>
                <Button leftSection={<Plus size={16} />} color="rubyRed" onClick={openAdd}>
                  Novo Item
                </Button>
              </Group>
            </Group>

            <Stack gap="md">
              <AnimatedList>
                {allProducts.length > 0 ? (
                  allProducts.map((p, idx) => (
                    <Paper 
                      key={`${p.source}-${p.id}-${idx}`} 
                      p="md" 
                      withBorder 
                      radius="md" 
                      style={{ 
                        backgroundColor: '#060606',
                        borderColor: '#1a1a1a',
                        cursor: 'pointer',
                        transition: '0.2s'
                      }}
                      onClick={() => {
                        setSelectedProduct(p);
                        openDetail();
                      }}
                    >
                      <Group justify="space-between">
                        <Group wrap="nowrap" gap="lg">
                          <Image 
                            src={p.image || 'https://via.placeholder.com/80'} 
                            alt={p.name} 
                            h={60} 
                            w={60} 
                            radius="md" 
                            style={{ objectFit: 'cover', border: '1px solid #1a1a1a' }}
                          />
                          <Stack gap={2}>
                            <Text fw={700} style={{ color: '#ffffff' }}>{p.name}</Text>
                            <Badge color={p.source === 'Printify' ? 'strongBlue' : 'rubyRed'} variant="light" size="xs">
                              {p.source}
                            </Badge>
                          </Stack>
                        </Group>
                        <Group>
                          <Text fw={800} size="lg">R$ {(p.source === 'Printify' ? p.price * 5 : p.price).toFixed(2)}</Text>
                          <ActionIcon variant="subtle" color="rubyRed" onClick={(e) => { e.stopPropagation(); }}>
                            <Trash size={18} />
                          </ActionIcon>
                        </Group>
                      </Group>
                    </Paper>
                  ))
                ) : (
                  <Center py={60} style={{ border: '2px dashed #1a1a1a', borderRadius: '12px' }}>
                    <Stack align="center" gap="xs">
                      <Package size={32} color="#333" />
                      <Text c="dimmed" size="sm">Nenhum produto cadastrado.</Text>
                    </Stack>
                  </Center>
                )}
              </AnimatedList>
            </Stack>
          </Paper>
        </Stack>
      </Container>

      <PrintifyProductModal 
        opened={detailModalOpened} 
        onClose={closeDetail} 
        product={selectedProduct} 
      />

      <Modal opened={addModalOpened} onClose={closeAdd} title="Adicionar Produto Local" centered size="lg" styles={{ content: { backgroundColor: '#060606', border: '1px solid #1a1a1a' } }}>
        <Stack>
          <TextInput label="Nome" placeholder="Ex: Camiseta $erver" required />
          <Group grow>
            <NumberInput label="Preço" required decimalScale={2} prefix="R$ " />
            <TextInput label="Tamanho" placeholder="P, M, G, GG" />
          </Group>
          <Textarea label="Descrição" minRows={3} />
          <ParticleButton fullWidth mt="md" onClick={closeAdd}>
            Criar Produto
          </ParticleButton>
        </Stack>
      </Modal>
    </main>
  );
}
