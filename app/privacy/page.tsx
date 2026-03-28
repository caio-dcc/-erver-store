'use client';

import { Container, Title, Text, Stack, Box, Divider } from '@mantine/core';


export default function PrivacyPage() {
  return (
    <Box style={{ color: '#fff' }}>
      <Container size="md" pt={100} pb={100}>

        <Stack gap="xl">
          <Title order={1} style={{ fontStyle: 'italic', color: '#991b1b' }}>Política de Privacidade</Title>
          <Text c="dimmed">Última atualização: 28 de Março de 2026</Text>
          
          <Divider style={{ borderColor: '#1a1a1a' }} />
          
          <Stack gap="md">
            <Title order={2} size="h3" c="rubyRed">1. Coleta de Informações</Title>
            <Text>Coletamos informações necessárias para o processamento de seus pedidos, incluindo nome, e-mail, e endereço de entrega. Seus dados de pagamento são processados de forma segura e criptografada pelo **Stripe**.</Text>
            
            <Title order={2} size="h3" c="rubyRed">2. Uso de Dados</Title>
            <Text>Seus dados são utilizados exclusivamente para: processar pagamentos, enviar pedidos via Printify, e fornecer suporte ao cliente.</Text>
            
            <Title order={2} size="h3" c="rubyRed">3. Compartilhamento</Title>
            <Text>Compartilhamos dados de entrega com a **Printify** apenas para fins de produção e logística.</Text>
            
            <Title order={2} size="h3" c="rubyRed">4. Segurança</Title>
            <Text>Utilizamos o Supabase Auth para garantir que sua conta e dados pessoais estejam protegidos por protocolos de segurança de nível industrial.</Text>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
