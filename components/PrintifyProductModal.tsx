'use client';

import { Modal, Group, Stack, Image, Text, Title, Badge, ScrollArea, SimpleGrid, Card, Button, Box, Divider, LoadingOverlay } from '@mantine/core';
import { ParticleButton } from './ParticleButton';
import { useState, useMemo, useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';


import { notifications } from '@mantine/notifications';
import { supabase } from '@/lib/supabase';


interface PrintifyProductModalProps {
  opened: boolean;
  onClose: () => void;
  product: any;
}

export function PrintifyProductModal({ opened, onClose, product }: PrintifyProductModalProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { addToCart } = useCart();

  // Track product view analytics

  useEffect(() => {
    if (opened && product) {
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          productName: product.name
        })
      }).catch(err => console.error('Analytics tracking failed:', err));
    }
  }, [opened, product?.id]);


  const { sizes, colors, images } = useMemo(() => {
    if (!product) return { sizes: [], colors: [], images: [] };

    const variantOptions = product.options || [];
    const sizeOption = variantOptions.find((o: any) => o.name.toLowerCase().includes('size') || o.type === 'size');
    const colorOption = variantOptions.find((o: any) => o.name.toLowerCase().includes('color') || o.type === 'color');

    // Get only enabled (available) values
    const enabledVariants = product.variants?.filter((v: any) => v.is_enabled) || [];
    
    const availableSizes = sizeOption 
      ? sizeOption.values.filter((sv: any) => enabledVariants.some((v: any) => v.options.includes(sv.id))).map((v: any) => v.title)
      : [];
      
    const availableColors = colorOption
      ? colorOption.values.filter((cv: any) => enabledVariants.some((v: any) => v.options.includes(cv.id))).map((v: any) => v.title)
      : [];

    const productImages = product.images?.length > 0 
      ? product.images.map((img: any) => img.src) 
      : [product.image].filter(Boolean);

    return { sizes: availableSizes, colors: availableColors, images: productImages };
  }, [product]);

  if (!product) return null;

  const handleAddToCart = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      notifications.show({ title: 'Acesso Restrito', message: 'Você precisa fazer login para adicionar itens ao carrinho.', color: 'rubyRed' });
      return;
    }

    if (!selectedSize && sizes.length > 0) {
      notifications.show({ title: 'Atenção', message: 'Por favor, selecione um tamanho.', color: 'rubyRed' });
      return;
    }
    if (!selectedColor && colors.length > 0) {
      notifications.show({ title: 'Atenção', message: 'Por favor, selecione uma cor.', color: 'rubyRed' });
      return;
    }

    const variant = product.variants.find((v: any) => {
      const matchesSize = !selectedSize || v.title.includes(selectedSize);
      const matchesColor = !selectedColor || v.title.includes(selectedColor);
      return matchesSize && matchesColor;
    });

    if (!variant) {
      notifications.show({ title: 'Erro', message: 'Variante não encontrada', color: 'red' });
      return;
    }

    addToCart({
      cartItemId: `${product.id}-${variant.id}`,
      productId: product.id,
      variantId: variant.id.toString(),
      name: product.name,
      price: product.price * 5,
      image: images[0],
      quantity: 1,
      size: selectedSize || undefined,
      color: selectedColor || undefined
    });

    notifications.show({ title: 'Adicionado!', message: 'Produto adicionado ao carrinho.', color: 'green' });
    onClose();
  };


  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="xl"
      radius="lg"
      zIndex={2000} // Garantir que fique acima do Navbar (1000)
      overlayProps={{ backgroundOpacity: 0.8, blur: 15, zIndex: 1999 }}

      styles={{ 
        content: { backgroundColor: '#060606', border: '1px solid #1a1a1a', color: '#ffffff' },
        header: { backgroundColor: '#060606', borderBottom: '1px solid #1a1a1a' },
        close: { color: '#ffffff' }
      }}
      title={
        <Group gap={10} style={{ padding: '4px 0' }}>
          <Text fw={800} size="lg" style={{ letterSpacing: '0.5px' }}>{product.name}</Text>
          <Badge color="rubyRed" variant="filled">Printify</Badge>
        </Group>
      }
    >
      <Box style={{ position: 'relative' }}>
        <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ blur: 2, backgroundOpacity: 0.5 }} />
        <ScrollArea h="80vh" offsetScrollbars>
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl" p="md">
            {/* Photos Section */}
            <Stack>
              <Card p="xs" radius="lg" withBorder style={{ backgroundColor: '#0b0b0b', borderColor: '#1a1a1a' }}>
                <Image 
                  src={images[selectedImage]} 
                  radius="md" 
                  h={400} 
                  style={{ objectFit: 'contain', backgroundColor: '#fff' }} 
                  fallbackSrc="https://via.placeholder.com/400"
                />
              </Card>
              <Group gap="xs" justify="center" wrap="wrap">
                {images.slice(0, 8).map((img: any, idx: number) => (
                  <Box 
                    key={idx} 
                    onClick={() => setSelectedImage(idx)}
                    style={{ 
                      cursor: 'pointer',
                      border: selectedImage === idx ? '2px solid #991b1b' : '1px solid #1a1a1a',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      opacity: selectedImage === idx ? 1 : 0.6,
                    }}
                  >
                    <Image src={img} w={50} h={50} style={{ objectFit: 'cover' }} />
                  </Box>
                ))}
              </Group>
            </Stack>

            {/* Details Section */}
            <Stack justify="space-between">
              <Stack gap="xl">
                <Box>
                  <Text size="xs" c="dimmed" tt="uppercase" fw={800} mb={4}>Preço do Item</Text>
                  <Text size="2.5rem" fw={900} style={{ color: '#991b1b', lineHeight: 1 }}>
                    R$ {(product.price * 5).toFixed(2)}
                  </Text>
                </Box>

                {sizes.length > 0 && (
                  <Box>
                    <Text size="xs" c="dimmed" tt="uppercase" fw={800} mb={10}>Selecione o Tamanho</Text>
                    <Group gap="xs">
                      {sizes.map((s: string) => (
                        <Button 
                          key={s} 
                          variant={selectedSize === s ? 'filled' : 'outline'} 
                          color={selectedSize === s ? 'rubyRed' : 'gray'}
                          size="xs"
                          onClick={() => setSelectedSize(s)}
                          styles={{ 
                            root: { 
                              borderWidth: '1px',
                              '&:hover': {
                                backgroundColor: selectedSize === s ? '#991b1b' : 'transparent',
                                color: selectedSize === s ? '#fff' : 'inherit'
                              }
                            }
                          }}
                        >
                          {s}
                        </Button>
                      ))}
                    </Group>
                  </Box>
                )}

                {colors.length > 0 && (
                  <Box>
                    <Text size="xs" c="dimmed" tt="uppercase" fw={800} mb={10}>Cores Disponíveis</Text>
                    <Group gap="xs">
                      {colors.map((c: string) => (
                         <Button 
                          key={c} 
                          variant={selectedColor === c ? 'filled' : 'outline'} 
                          color={selectedColor === c ? 'strongBlue' : 'gray'}
                          size="xs"
                          onClick={() => setSelectedColor(c)}
                          styles={{ 
                            root: { 
                              borderWidth: '1px',
                              '&:hover': {
                                backgroundColor: selectedColor === c ? '#0D1A63' : 'transparent',
                                color: selectedColor === c ? '#fff' : 'inherit'
                              }
                            }
                          }}
                        >
                          {c}
                        </Button>
                      ))}
                    </Group>
                  </Box>
                )}

                <Box>
                  <Text size="xs" c="dimmed" tt="uppercase" fw={800} mb={10}>Descrição do Produto</Text>
                  <ScrollArea h={120} offsetScrollbars>
                    <Text size="sm" style={{ color: '#e0e0e0', lineHeight: 1.6 }}>
                      {product.description?.replace(/<[^>]*>?/gm, '') || 'Produto premium sincronizado via Printify.'}
                    </Text>
                  </ScrollArea>
                </Box>

              </Stack>

              <Divider my="xl" style={{ borderColor: '#1a1a1a' }} />

              <Stack gap="sm">
                <Button 
                  fullWidth 
                  size="lg" 
                  color="gray" 
                  variant="outline"
                  onClick={handleAddToCart}
                >
                  Adicionar ao Carrinho
                </Button>
                <ParticleButton 
                  fullWidth 
                  size="xl" 
                  onClick={handleAddToCart}
                >
                  Comprar Agora
                </ParticleButton>

                <Text size="xs" c="dimmed" ta="center">
                  * Pagamento seguro via Stripe. Entrega estimada em 7 a 15 dias úteis.
                </Text>
              </Stack>
            </Stack>
          </SimpleGrid>
        </ScrollArea>
      </Box>
    </Modal>
  );
}
