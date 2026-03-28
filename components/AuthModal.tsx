'use client';

import { Modal, TextInput, PasswordInput, Group, Stack, Title, Text, Box, Notification, UnstyledButton, Image } from '@mantine/core';
import { ParticleButton } from './ParticleButton';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

interface AuthModalProps {
  opened: boolean;
  onClose: () => void;
}

export const AuthModal = ({ opened, onClose }: AuthModalProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'user' | 'vendedor'>('user');
  
  const router = useRouter();

  const handleLogin = async () => {
    // Admin bypass
    if (email === 'admin' && password === 'admin') {
      onClose();
      // In a real app we'd set a cookie or JWT, but for this demo we'll just redirect
      router.push('/');
      return;

    }

    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        setError('E-mail ou senha incorretos.');
      } else {
        setError('Erro ao entrar. Tente novamente.');
      }
    } else {

      onClose();
      router.refresh();
      router.push('/');
    }

    setLoading(false);
  };


  const handleRegister = async () => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role,
        }
      }
    });
    if (error) {
      if (error.message.includes('User already registered')) {
        setError('Este e-mail já está cadastrado.');
      } else if (error.message.includes('Password should be at least')) {
        setError('A senha deve ter pelo menos 6 caracteres.');
      } else {
        setError(`Erro ao criar conta: ${error.message}`);
      }
    } else {


      setIsLogin(true);
      setError('Verifique seu e-mail para confirmar o cadastro!');
    }
    setLoading(false);
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      withCloseButton={false}
      size="auto"
      padding={0}
      styles={{
        content: {
          width: '90vw',
          height: '90vh',
          maxWidth: '1400px',
          maxHeight: '1000px',
          borderRadius: '32px',
          overflow: 'hidden',
          backgroundColor: '#0b0b0b',
          border: '1px solid #1a1a1a',
        },

        body: {
          height: '100%',
          padding: 0,
        }
      }}
      overlayProps={{
        backgroundOpacity: 0.8,
        blur: 15,
        color: '#060606',

      }}
    >
      <Group gap={0} h="100%" align="stretch" wrap="nowrap">
        {/* Left Column: Form */}
        <Stack 
          flex={1} 
          p={{ base: 20, sm: 40, md: 60 }} 
          justify="center" 
          style={{ position: 'relative', overflow: 'hidden' }}
        >
          <Box mb={{ base: 20, sm: 40 }}>
            <Title order={1} style={{ fontSize: '2.5rem', color: '#991b1b', lineHeight: 1 }}>Grandsys</Title>


            <Text size="lg" c="dimmed" mt="xs">Sua loja, seu estilo, sua magia.</Text>
          </Box>


          <Box style={{ minHeight: '420px', position: 'relative' }}>
            <AnimatePresence mode="wait" initial={false}>
              {isLogin ? (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 300, 
                    damping: 30,
                    opacity: { duration: 0.2 } 
                  }}
                >

                  <Stack gap="lg">
                    <Title order={2} style={{ fontSize: '2rem' }}>Entrar</Title>
                    {error && <Notification color="red" onClose={() => setError(null)}>{error}</Notification>}
                    <TextInput 
                      label="E-mail" 
                      placeholder="seu@email.com" 
                      size="md" 
                      required 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                    />
                    <PasswordInput 
                      label="Senha" 
                      placeholder="Sua senha" 
                      size="md" 
                      required 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                    />
                    <ParticleButton fullWidth size="lg" onClick={handleLogin}>
                      Entrar
                    </ParticleButton>
                    <Text ta="center" size="sm">


                      Não tem uma conta?{' '}
                      <UnstyledButton 
                        onClick={() => setIsLogin(false)} 
                        style={{ color: '#991b1b', fontWeight: 700 }}


                      >
                        Cadastre-se
                      </UnstyledButton>
                    </Text>
                  </Stack>
                </motion.div>
              ) : (
                <motion.div
                  key="register"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 300, 
                    damping: 30,
                    opacity: { duration: 0.2 } 
                  }}
                >

                  <Stack gap="lg">
                    <Title order={2} style={{ fontSize: '2rem' }}>Criar Conta</Title>
                    {error && <Notification color={error.includes('Verifique') ? 'green' : 'red'} onClose={() => setError(null)}>{error}</Notification>}
                    <TextInput 
                      label="Nome Completo" 
                      placeholder="Seu nome" 
                      size="md" 
                      required 
                      value={fullName} 
                      onChange={(e) => setFullName(e.target.value)} 
                    />
                    <TextInput 
                      label="E-mail" 
                      placeholder="seu@email.com" 
                      size="md" 
                      required 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                    />
                    <PasswordInput 
                      label="Senha" 
                      placeholder="Crie uma senha" 
                      size="md" 
                      required 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                    />
                    <ParticleButton fullWidth size="lg" onClick={handleRegister}>
                      Cadastrar
                    </ParticleButton>

                    <Text ta="center" size="sm">


                      Já tem uma conta?{' '}
                      <UnstyledButton 
                        onClick={() => setIsLogin(true)} 
                        style={{ color: '#991b1b', fontWeight: 700 }}


                      >
                        Entre aqui
                      </UnstyledButton>
                    </Text>
                  </Stack>
                </motion.div>
              )}
            </AnimatePresence>
          </Box>
        </Stack>

        {/* Right Column: Image */}
        <Box 
          visibleFrom="md" 
          flex={1} 
          style={{ 
            backgroundColor: '#060606',

            position: 'relative'
          }}
        >
          <Image 
            src="/auth_side_image.png"
            alt="Grandsys Store"
            h="100%"
            style={{ objectFit: 'cover', opacity: 0.8 }}
            fallbackSrc="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070"
          />
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(to right, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0) 20%)',
            pointerEvents: 'none'
          }} />
        </Box>
      </Group>
    </Modal>
  );
};
