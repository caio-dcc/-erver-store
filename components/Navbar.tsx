'use client';

import { Group, Box, Anchor, Title, Burger, Drawer, Stack, Menu, UnstyledButton, rem, Text, Indicator, ActionIcon, Badge } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { ChevronDown, Store, LogOut, Package, LifeBuoy, ShoppingCart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { AuthModal } from './AuthModal';
import { useCart } from '@/contexts/CartContext';

export const Navbar = () => {

  const { items: cartItems, setIsCartOpen } = useCart();

  const [opened, { toggle, close }] = useDisclosure(false);
  const [authOpened, { open: openAuth, close: closeAuth }] = useDisclosure(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  const getUserDisplayName = () => {
    if (!user) return '';
    if (user.user_metadata && user.user_metadata.full_name) {
      return user.user_metadata.full_name.split(' ')[0];
    }
    return user.email ? user.email.split('@')[0] : 'Usuário';
  };



  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
    router.push('/');
  };

  const links = [
    { link: '/', label: 'Home' },
    { link: '/colecoes', label: 'Coleções' },
    { link: '/promocoes', label: 'Promoções' },
  ];

  const items = links.map((link) => (
    <Anchor
      component={Link}
      key={link.label}
      href={link.link}
      style={{
        color: '#ffffff',
        textDecoration: 'none',
        fontSize: '1rem',
        fontWeight: 500,
      }}
      onClick={close}
    >

      {link.label}
    </Anchor>

  ));

  return (
    <Box 
      component="header" 
      style={{ 
        backgroundColor: '#000000', 
        height: '80px', 
        display: 'flex', 
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        borderBottom: '1px solid #1a1a1a'
      }}
    >
      <style>{`
        .neon-text {
          color: #fff;
          text-shadow: 0 0 5px #fff, 0 0 10px #1E3A8A, 0 0 20px #1E3A8A, 0 0 30px #1E3A8A;
          transition: all 0.3s ease;
        }
        .neon-text:hover {
          text-shadow: 0 0 10px #fff, 0 0 20px #3B82F6, 0 0 40px #3B82F6, 0 0 60px #3B82F6;
        }
        .neon-blink:active {
          background-color: #1E3A8A !important;
          box-shadow: 0 0 15px #1E3A8A, 0 0 30px #1E3A8A, 0 0 50px #1E3A8A !important;
          color: #fff !important;
          transition: 0.05s !important;
        }
        .neon-red {
          color: #ff0000;
          text-shadow: 0 0 5px #ff0000, 0 0 10px #ff0000, 0 0 20px #991b1b, 0 0 30px #991b1b;
          transition: all 0.3s ease;
        }
        .neon-red:hover {
          text-shadow: 0 0 10px #ff0000, 0 0 20px #ff0000, 0 0 40px #991b1b, 0 0 60px #991b1b;
        }
        .neon-blue {
          filter: drop-shadow(0 0 2px #2563eb) drop-shadow(0 0 8px #2563eb);
        }
        .neon-green {
          filter: drop-shadow(0 0 2px #10b981) drop-shadow(0 0 8px #10b981);
        }
        .neon-red-icon {
          filter: drop-shadow(0 0 2px #991b1b) drop-shadow(0 0 8px #991b1b);
        }
        .nav-profile-btn {
          padding: 6px 12px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .nav-profile-btn:hover {
          background-color: rgba(153, 27, 27, 0.15);
          transform: translateY(-2px);
        }
      `}</style>
      <Group justify="space-between" h="100%" px="xl" wrap="nowrap" style={{ width: '100%' }}>

        
        {/* Left: Brand */}
        <Box style={{ flex: 1, display: 'flex', justifyContent: 'flex-start' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <Title order={2} className="neon-red" style={{ 
              fontSize: '1.8rem',

              letterSpacing: '2px',
              fontWeight: 900,
              fontStyle: 'italic',
            }}>$erver</Title>
          </Link>
        </Box>

        {/* Center: Links */}
        <Group gap="xl" visibleFrom="sm" style={{ flex: 2, justifyContent: 'center' }}>
          <Link href="/" className="neon-text" style={{ textDecoration: 'none', fontSize: '1rem', fontWeight: 600, textTransform: 'uppercase' }}>Home</Link>
          <Link href="/colecoes" className="neon-text" style={{ textDecoration: 'none', fontSize: '1rem', fontWeight: 600, textTransform: 'uppercase' }}>Coleções</Link>
          <Link href="/lojas" className="neon-text" style={{ textDecoration: 'none', fontSize: '1rem', fontWeight: 600, textTransform: 'uppercase' }}>Lojas</Link>
          <Link href="/achados" className="neon-text" style={{ textDecoration: 'none', fontSize: '1rem', fontWeight: 600, textTransform: 'uppercase' }}>Achados</Link>
        </Group>

        {/* Right: Cart & Minha Conta (Desktop) / Entrar */}
        <Group justify="flex-end" style={{ flex: 1 }} gap="md">
          
          <Indicator label={cartItems.reduce((acc, i) => acc + i.quantity, 0)} size={16} color="rubyRed" offset={4} disabled={cartItems.length === 0}>
            <ActionIcon 

              variant="subtle" 
              color="gray" 
              size="lg" 
              onClick={() => setIsCartOpen(true)}
              styles={{ root: { color: '#ffffff', '&:hover': { backgroundColor: 'transparent', color: '#3B82F6' } } }}
            >
              <ShoppingCart size={24} />
            </ActionIcon>
          </Indicator>

          <Box visibleFrom="sm">

            {user ? (
              <Menu shadow="md" width={220} trigger="hover" openDelay={50} closeDelay={200} position="bottom-end" zIndex={2000}>
                <Menu.Target>
                  <UnstyledButton className="nav-profile-btn" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Badge color="rubyRed" variant="filled" size="lg" style={{ textTransform: 'none', letterSpacing: '0.5px' }}>
                      Olá, {getUserDisplayName()}
                    </Badge>
                    <ChevronDown size={18} color="#fff" />
                  </UnstyledButton>
                </Menu.Target>

                <Menu.Dropdown style={{ backgroundColor: '#0b0b0b', border: '1px solid #1a1a1a' }}>
                  <Menu.Label style={{ color: '#991b1b' }}>Painel do Usuário</Menu.Label>
                  <Menu.Item 
                    leftSection={<Package className="neon-blue" style={{ width: rem(16), height: rem(16) }} color="#2563eb" />}
                    component={Link}
                    href="/pedidos"
                    style={{ color: '#ffffff', fontWeight: 600 }}
                    styles={{ item: { '&:hover': { backgroundColor: '#1a1a1a' } } }}
                  >
                    Meus Pedidos
                  </Menu.Item>
                  <Menu.Item 
                    leftSection={<Store className="neon-green" style={{ width: rem(16), height: rem(16) }} color="#10b981" />}
                    component={Link}
                    href="/conta"
                    style={{ color: '#ffffff', fontWeight: 600 }}
                    styles={{ item: { '&:hover': { backgroundColor: '#1a1a1a' } } }}
                  >
                    Minha Conta (Perfil)
                  </Menu.Item>
                  <Menu.Divider style={{ borderColor: '#222' }} />
                  <Menu.Item
                    c="rubyRed"
                    leftSection={<LogOut className="neon-red-icon" style={{ width: rem(16), height: rem(16) }} color="#991b1b" />}
                    onClick={handleLogout}
                    style={{ fontWeight: 600 }}
                    styles={{ item: { '&:hover': { backgroundColor: '#2a0a0a' } } }}
                  >
                    Sair
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>


            ) : (
              <UnstyledButton 
                onClick={openAuth}
                className="neon-blink"
                style={{ 
                  color: '#ffffff', 
                  fontSize: '0.85rem', 
                  fontWeight: 800, 
                  textDecoration: 'none',
                  padding: '8px 24px',
                  borderRadius: '4px',
                  backgroundColor: '#991b1b',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  transition: '0.3s ease'
                }}
              >
                Entrar
              </UnstyledButton>

            )}
          </Box>
          <Burger 
            opened={opened} 
            onClick={toggle} 
            hiddenFrom="sm" 
            size="md" 
            color="#ffffff" 
          />
        </Group>
      </Group>

      <Drawer
        opened={opened}
        onClose={close}
        size="100%"
        padding="md"
        title="Menu"
        hiddenFrom="sm"
        styles={{
          header: { backgroundColor: '#000000', color: '#ffffff' },
          content: { backgroundColor: '#0b0b0b' },
          close: { color: '#ffffff' }
        }}
      >
        <Stack gap="xl" mt="xl" align="center">
          <Link href="/" onClick={toggle} style={{ color: '#ffffff', textDecoration: 'none', fontSize: '1.2rem', fontWeight: 700 }}>Home</Link>
          <Link href="/colecoes" onClick={toggle} style={{ color: '#ffffff', textDecoration: 'none', fontSize: '1.2rem', fontWeight: 700 }}>Coleções</Link>
          <Link href="/lojas" onClick={toggle} style={{ color: '#ffffff', textDecoration: 'none', fontSize: '1.2rem', fontWeight: 700 }}>Lojas Vizinhas</Link>
          <Link href="/achados" onClick={toggle} style={{ color: '#ffffff', textDecoration: 'none', fontSize: '1.2rem', fontWeight: 700 }}>Achados Importados</Link>
          {user ? (
            <>
              <Anchor component={Link} href="/minha-loja" style={{ color: '#ffffff', fontSize: '1.25rem', fontWeight: 600 }} onClick={close}>
                Painel do Vendedor
              </Anchor>
              <Anchor component={Link} href="/pedidos" style={{ color: '#ffffff', fontSize: '1.25rem', fontWeight: 600 }} onClick={close}>
                Meus pedidos
              </Anchor>
              <Anchor component={Link} href="/suporte" style={{ color: '#ffffff', fontSize: '1.25rem', fontWeight: 600 }} onClick={close}>
                Suporte
              </Anchor>
              <Anchor onClick={handleLogout} style={{ color: '#ff4d4d', fontSize: '1.25rem', fontWeight: 600 }}>
                Sair
              </Anchor>
            </>
          ) : (
            <Anchor onClick={openAuth} style={{ color: '#ffffff', fontSize: '1.25rem', fontWeight: 600 }}>
              Entrar
            </Anchor>
          )}
        </Stack>
      </Drawer>

      <AuthModal opened={authOpened} onClose={closeAuth} />
    </Box>
  );
};
