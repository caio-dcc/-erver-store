"use client";

import { useEffect, useState } from "react";
import {
  Title,
  Text,
  Container,
  Stack,
  Group,
  Paper,
  Table,
  Button,
  Box,
  Card,
  Image,
  Loader,
  Badge,
  Center,
  Grid,
  Flex
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

import { ParticleButton } from "@/components/ParticleButton";
import { motion } from "framer-motion";
import { Carousel } from "@mantine/carousel";
import "@mantine/carousel/styles.css";
import { supabase } from "@/lib/supabase";
import { PrintifyProductModal } from "@/components/PrintifyProductModal";
import Link from 'next/link';

export default function LandingPage() {
  const [news, setNews] = useState<any[]>([]);
  const [printifyProducts, setPrintifyProducts] = useState<any[]>([]);
  const [loadingPrintify, setLoadingPrintify] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [modalOpened, { open, close }] = useDisclosure(false);

  useEffect(() => {
    async function fetchNews() {
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .order("created_at", { ascending: false });
      if (data && !error) {
        setNews(data);
      } else {
        setNews([
          {
            id: 1,
            title: "Nova Loja: Elegance Fashion",
            created_at: "2026-03-27",
          },
          {
            id: 2,
            title: "Promoção de Inverno começando!",
            created_at: "2026-03-26",
          },
        ]);
      }
    }

    async function fetchPrintify() {
      setLoadingPrintify(true);
      const mockups = [
        {
          id: "m1",
          name: "Cyber Hoodie V1",
          price: 29.9,
          image:
            "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=500",
        },
        {
          id: "m2",
          name: "Neon Street Jacket",
          price: 45.0,
          image:
            "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=500",
        },
        {
          id: "m3",
          name: "Techwear Pants",
          price: 38.5,
          image:
            "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=500",
        },
        {
          id: "m4",
          name: "Midnight Beanie",
          price: 15.0,
          image:
            "https://images.unsplash.com/photo-1576871337622-98d48d1cf531?q=80&w=500",
        },
      ];

      try {
        const res = await fetch("/api/printify/products");
        if (res.ok) {
          const data = await res.json();
          let fetched = data.filter((p: any) => p.image).slice(0, 10);
          if (fetched.length === 0) {
            fetched = mockups;
          }
          setPrintifyProducts(fetched);
        } else {
          setPrintifyProducts(mockups);
        }
      } catch (err) {
        console.error(err);
        setPrintifyProducts(mockups);
      }
      setLoadingPrintify(false);
    }

    fetchNews();
    fetchPrintify();
  }, []);

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "transparent",
        color: "#ffffff",
      }}
    >
      <Container size="xl" py={100}>
        <Stack gap={60}>
          {/* Top Info Grid */}
          <Grid>
            {/* Left Column: Latest News */}
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Card p="md" radius="md" style={{ backgroundColor: 'rgba(0,0,0,0.5)', border: '1px solid #1a1a1a' }}>
                <Title order={4} c="rubyRed" mb="sm" style={{ borderBottom: '1px solid #991b1b', paddingBottom: '4px' }}>Últimas Novidades</Title>
                <Stack gap="xs">
                  {news.slice(0, 3).map((item) => (
                    <Box key={item.id} style={{ borderLeft: '2px solid #333', paddingLeft: '8px' }}>
                      <Text size="sm" fw={600} c="gray.3">{item.title}</Text>
                      <Text size="xs" c="dimmed">{new Date(item.created_at).toLocaleDateString()}</Text>
                    </Box>
                  ))}
                  {news.length === 0 && <Text size="sm" c="dimmed">Nenhuma atualização no momento.</Text>}
                </Stack>
              </Card>
            </Grid.Col>

            {/* Right Column: Login / Chat */}
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Card p="md" radius="md" style={{ backgroundColor: 'rgba(0,0,0,0.5)', border: '1px solid #1a1a1a' }}>
                <Group justify="space-between" align="center" mb="sm" style={{ borderBottom: '1px solid #991b1b', paddingBottom: '4px' }}>
                  <Title order={4} c="rubyRed">Acesso</Title>
                  <Button size="compact-xs" color="rubyRed" variant="light">Login rápido</Button>
                </Group>
                
                <Title order={5} c="dimmed" mt="md" mb="xs">Salas de Bate-Papo</Title>
                <Stack gap="xs">
                  <Box component={Link} href="/chat/streetwear-rj" style={{ textDecoration: 'none' }}>
                    <Group justify="space-between" style={{ backgroundColor: '#111', padding: '8px 12px', borderRadius: '6px', transition: '0.2s', cursor: 'pointer' }} className="chat-hover">
                      <Text size="sm" fw={600} c="white"># Streetwear RJ</Text>
                      <Badge color="green" size="xs" variant="dot">24 online</Badge>
                    </Group>
                  </Box>
                  <Box component={Link} href="/chat/sneakers-br" style={{ textDecoration: 'none' }}>
                    <Group justify="space-between" style={{ backgroundColor: '#111', padding: '8px 12px', borderRadius: '6px', transition: '0.2s', cursor: 'pointer' }} className="chat-hover">
                      <Text size="sm" fw={600} c="white"># Sneakers BR</Text>
                      <Badge color="green" size="xs" variant="dot">12 online</Badge>
                    </Group>
                  </Box>
                  <Box component={Link} href="/chat/suporte" style={{ textDecoration: 'none' }}>
                    <Group justify="space-between" style={{ backgroundColor: '#111', padding: '8px 12px', borderRadius: '6px', transition: '0.2s', cursor: 'pointer' }} className="chat-hover">
                      <Text size="sm" fw={600} c="white"># Suporte Geral</Text>
                      <Badge color="gray" size="xs" variant="dot">Offline</Badge>
                    </Group>
                  </Box>
                </Stack>
              </Card>
            </Grid.Col>
          </Grid>

          {/* Hero Section */}
          <Stack align="center" gap="xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Title
                order={1}
                className="hero-title"
                style={{
                  fontSize: "clamp(2.5rem, 8vw, 5rem)",
                  textAlign: "center",
                  color: "#ffffff",
                  lineHeight: 1.1,
                }}
              >
                <span style={{ color: "#991b1b" }}>Estilos</span> e{" "}
                <span style={{ color: "#991b1b" }}>Pessoas</span>
              </Title>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
            >
              <Text
                size="xl"
                c="dimmed"
                style={{ maxWidth: 800, textAlign: "center" }}
              >
                Acompanhe lojas e vendas, compartilhe de eventos e se aventure
                em nosso $istema.
              </Text>
            </motion.div>

            <Flex 
              direction={{ base: 'column', sm: 'row' }} 
              gap="md" 
              justify="center" 
              align="center" 
              mt="xl" 
              w="100%"
            >
              <ParticleButton size="xl">Começar Agora</ParticleButton>
              <Button
                variant="outline"
                size="xl"
                color="rubyRed"
                styles={{
                  root: {
                    borderWidth: 2,
                    color: "#ffffff",
                    "&:hover": {
                      backgroundColor: "transparent",
                      borderColor: "#991b1b",
                    },
                  },
                }}
              >
                Saiba Mais
              </Button>
            </Flex>
          </Stack>

          {/* Carousel Section: Novos Itens (Printify) */}
          <Stack gap="xl">
            <Title
              order={2}
              style={{ borderLeft: "8px solid #991b1b", paddingLeft: "15px" }}
            >
              Novas Adições (Printify Sync)
            </Title>

            {loadingPrintify ? (
              <Center h={400}>
                <Loader color="rubyRed" size="xl" />
              </Center>
            ) : (
              <Carousel
                withIndicators
                height={460}
                pt="xl"
                pb="xl"
                slideSize={{ base: "100%", sm: "50%", md: "33.333333%" }}
                slideGap="xl"
                styles={{
                  indicator: { backgroundColor: "#991b1b" },
                  control: {
                    backgroundColor: "#000",
                    border: "1px solid #991b1b",
                    color: "#fff",
                    "&:hover": {
                      backgroundColor: "#000",
                    },
                  },
                }}
              >
                {printifyProducts.map((p) => (
                  <Carousel.Slide key={p.id}>
                    <Card
                      p="md"
                      radius="lg"
                      withBorder
                      style={{
                        backgroundColor: "#0b0b0b",
                        borderColor: "#1a1a1a",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <Card.Section>
                        <Image
                          src={p.image}
                          h={250}
                          style={{
                            borderRadius: "10%",
                            objectFit: "cover",
                            margin: "15px",
                            border: "1px solid #1a1a1a",
                          }}
                          fallbackSrc="https://via.placeholder.com/250"
                        />
                      </Card.Section>
                      <Stack
                        gap={4}
                        mt="md"
                        justify="space-between"
                        style={{ flex: 1 }}
                      >
                        <Box>
                          <Text fw={700} lineClamp={1}>
                            {p.name}
                          </Text>
                          <Badge color="strongBlue" variant="light" fz="10px">
                            Printify sync
                          </Badge>
                        </Box>
                        <Group justify="space-between" align="flex-end">
                          <Text c="rubyRed" fw={800} fz="xl">
                            R$ {(p.price * 5).toFixed(2)}
                          </Text>
                          <ParticleButton
                            size="xs"
                            onClick={() => {
                              setSelectedProduct(p);
                              open();
                            }}
                          >
                            Ver Detalhes
                          </ParticleButton>
                        </Group>
                      </Stack>
                    </Card>
                  </Carousel.Slide>
                ))}
              </Carousel>
            )}
          </Stack>

          {/* Novidades Section */}
          <Paper
            id="novidades"
            p="xl"
            radius="lg"
            withBorder
            style={{
              backgroundColor: "#0b0b0b",
              marginTop: "40px",
              borderColor: "#1a1a1a",
            }}
          >
            <Title
              order={2}
              mb="xl"
              style={{
                borderBottom: "2px solid #991b1b",
                display: "inline-block",
                paddingBottom: "5px",
                color: "#ffffff",
              }}
            >
              Novidades
            </Title>

            <Table
              horizontalSpacing="md"
              verticalSpacing="lg"
              style={{ fontSize: "1.1rem" }}
            >
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Título</Table.Th>
                  <Table.Th w={200}>Data</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {news.map((item) => (
                  <Table.Tr key={item.id}>
                    <Table.Td>{item.title}</Table.Td>
                    <Table.Td>
                      {new Date(item.created_at).toLocaleDateString()}
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Paper>
        </Stack>
      </Container>

      {/* Footer-like section */}
      <Box
        p="xl"
        style={{ textAlign: "center", borderTop: "1px solid #1a1a1a" }}
      >
        <Text c="dimmed">© 2026 $erver. Todos os direitos reservados.</Text>
      </Box>

      <PrintifyProductModal
        opened={modalOpened}
        onClose={close}
        product={selectedProduct}
      />
    </main>
  );
}
