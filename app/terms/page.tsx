'use client';

import { Container, Title, Text, Stack, Box, Divider } from '@mantine/core';


export default function TermsPage() {
  return (
    <Box style={{ color: '#fff' }}>
      <Container size="md" pt={100} pb={100}>

        <Stack gap="xl">
          <Title order={1} style={{ fontStyle: 'italic', color: '#991b1b' }}>Termos de Serviço</Title>
          <Divider style={{ borderColor: '#1a1a1a' }} />
          
          <Stack gap="md">
            <Title order={2} size="h3" c="rubyRed">1. Objeto</Title>
            <Text>Estes termos regem o uso da plataforma $erver para a aquisição de produtos de vestuário e acessórios.</Text>
            
            <Title order={2} size="h3" c="rubyRed">2. Política de Entrega</Title>
            <Text>Nossos produtos são produzidos sob demanda via Printify. O prazo de entrega varia de 7 a 20 dias úteis dependendo da localização e logística internacional.</Text>
            
            <Title order={2} size="h3" c="rubyRed">3. Cancelamentos e Reembolsos</Title>
            <Text>Cancelamentos podem ser solicitados em até 24h após a compra. Reembolsos são processados via Stripe e podem levar até 5-10 dias úteis para aparecer na sua fatura.</Text>
            
            <Title order={2} size="h3" c="rubyRed">4. Limitação de Responsabilidade</Title>
            <Text>A $erver não se responsabiliza por atrasos logísticos causados por terceiros ou alfândega.</Text>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
