'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Box, Group, Stack, Text, TextInput, ActionIcon, ScrollArea, Button, Title, Flex, Badge, Avatar, UnstyledButton } from '@mantine/core';
import { Send, ArrowLeft, MessageSquare, Briefcase, ChevronLeft, Swords } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import ArenaPixi from '@/components/ArenaPixi';
import TargetCursor from '@/components/TargetCursor';

interface Message {
  id: string;
  user: string;
  text: string;
  timestamp: number;
}

export default function ChatRoom() {
  const { id } = useParams();
  const roomId = `room_${id}`;

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'chat' | 'inventory'>('chat');
  const [battleLog, setBattleLog] = useState<string[]>(['[Sistema] Arena inicializada. Que comecem os combates!']);
  
  // Realtime Sync States
  const [channel, setChannel] = useState<any>(null);
  const [onlineUsers, setOnlineUsers] = useState(0);

  const scrollRef = useRef<HTMLDivElement>(null);
  const logRef = useRef<HTMLDivElement>(null);

  const handleBattleLog = useCallback((entry: string) => {
    setBattleLog(prev => [...prev, entry]);
  }, []);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [battleLog]);

  // Initialization
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setCurrentUser(data.session?.user || null);
    });

    const roomChannel = supabase.channel(roomId, {
      config: { broadcast: { ack: false }, presence: { key: 'user' } }
    });

    roomChannel
      .on('broadcast', { event: 'new_message' }, (payload) => {
        setMessages((prev) => [...prev, payload.payload]);
      })
      .on('presence', { event: 'sync' }, () => {
        const state = roomChannel.presenceState();
        setOnlineUsers(Object.keys(state).length);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          const { data } = await supabase.auth.getSession();
          roomChannel.track({
            user_id: data.session?.user?.id || 'anonymous',
            online_at: new Date().toISOString()
          });
        }
      });

    setChannel(roomChannel);

    // Global Key Listener for 'B' (Inventory)
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key.toLowerCase() === 'b' && document.activeElement?.tagName !== 'INPUT') {
            setActiveTab(prev => prev === 'inventory' ? 'chat' : 'inventory');
        }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      roomChannel.unsubscribe();
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [roomId]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, activeTab]);

  const sendMessage = () => {
    if (!inputText.trim() || !channel) return;
    const userName = currentUser?.user_metadata?.full_name?.split(' ')[0] || currentUser?.email?.split('@')[0] || 'Anônimo';
    const msg: Message = { id: Math.random().toString(36).substr(2, 9), user: userName, text: inputText, timestamp: Date.now() };
    channel.send({ type: 'broadcast', event: 'new_message', payload: msg });
    setMessages((prev) => [...prev, msg]);
    setInputText('');
  };

  const InventoryGrid = () => (
    <Stack gap="md" py="md">
        <Title order={5} c="blue" tt="uppercase" lts="1px">Inventário / Mochila</Title>
        <Flex gap={8} wrap="wrap" justify="center">
            {Array.from({ length: 42 }).map((_, i) => (
                <Box 
                    key={i} 
                    w={48} h={48} 
                    style={{ 
                        backgroundColor: 'rgba(10,10,10,0.85)', 
                        border: '1px solid rgba(255,255,255,0.1)', 
                        borderRadius: '4px',
                        boxShadow: 'inset 0 0 10px rgba(0,0,0,1)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    className="inventory-slot"
                >
                    {/* Mock Icon */}
                    {i === 0 && <Box w="70%" h="70%" style={{ background: 'linear-gradient(45deg, #222, #444)', borderRadius: '2px', border: '1px solid #c5a059' }} />}
                    {i === 1 && <Box w="70%" h="70%" style={{ background: 'linear-gradient(45deg, #111, #800)', borderRadius: '2px', border: '1px solid #ff4444' }} />}
                </Box>
            ))}
        </Flex>
    </Stack>
  );

  return (
    <Flex style={{ position: 'fixed', inset: 0, zIndex: 1500, backgroundColor: '#000', color: '#fff' }}>
      <TargetCursor targetSelector=".cursor-target" />
      
      {/* 1. $T Nav Strip (Aprox 60px) */}
      <Stack w={64} h="100%" p="xs" align="center" style={{ borderRight: '1px solid #1a1a1a', backgroundColor: '#050505', zIndex: 20 }}>
        <Title order={2} c="rubyRed" style={{ fontStyle: 'italic', letterSpacing: '-2px' }}>$T</Title>
        <Stack mt="auto" align="center" gap="xl">
            <UnstyledButton p="sm" style={{ border: '1px solid #333', borderRadius: '4px', backgroundColor: '#111' }} component={Link} href="/">
                <ChevronLeft size={24} color="#fff" />
            </UnstyledButton>
        </Stack>
      </Stack>

      {/* 2. Chat / Inventory Panel (Expanded Area - 22%) */}
      <Box w={{ base: '100%', sm: '22%' }} h="100%" p="md" 
        style={{ 
            borderRight: '1px solid #1a1a1a', 
            background: 'linear-gradient(180deg, #121217 0%, #050505 100%)', 
            display: 'flex', 
            flexDirection: 'column',
            boxShadow: 'inset -20px 0 60px rgba(0,0,0,0.8)',
            position: 'relative',
            overflow: 'hidden'
        }}
      >
        {/* REPLICATE HOME MENU GRAINIENT NOISE */}
        <div style={{
            position: 'absolute', inset: '-200%', width: '400%', height: '400%', opacity: 0.1, pointerEvents: 'none',
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            animation: 'noise 0.2s infinite alternate',
            zIndex: 0
        }} />
        <Group justify="space-between" mb="lg">
            <Flex gap="xs">
                <Button 
                    variant={activeTab === 'chat' ? 'light' : 'subtle'} 
                    color={activeTab === 'chat' ? 'rubyRed' : 'gray'} 
                    size="compact-xs" 
                    leftSection={<MessageSquare size={14} />}
                    onClick={() => setActiveTab('chat')}
                >
                    CHAT
                </Button>
                <Button 
                    variant={activeTab === 'inventory' ? 'light' : 'subtle'} 
                    color={activeTab === 'inventory' ? 'blue' : 'gray'} 
                    size="compact-xs" 
                    leftSection={<Briefcase size={14} />}
                    onClick={() => setActiveTab('inventory')}
                >
                    MOCHILA (B)
                </Button>
            </Flex>
            <Badge mt="sm" color="green" variant="dot">{onlineUsers}</Badge>
        </Group>

        {activeTab === 'chat' ? (
            <Stack style={{ flex: 1, minHeight: 0 }} gap={0}>
                {/* Chat — top 50% */}
                <ScrollArea viewportRef={scrollRef}
                    style={{ flex: 1, minHeight: 0, background: 'linear-gradient(180deg, #000 0%, #080808 100%)', borderRadius: '4px 4px 0 0', padding: '10px', border: '1px solid #1a1a1a' }}
                >
                    <Stack gap="xs">
                        {messages.map((msg) => (
                            <Box key={msg.id} style={{ background: 'linear-gradient(90deg, #0d0d0f 0%, #050505 100%)', padding: '8px 12px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.03)' }}>
                                <Group justify="space-between" mb={4}>
                                    <Text size="sm" fw={700} c={msg.user === (currentUser?.user_metadata?.full_name?.split(' ')[0] || currentUser?.email?.split('@')[0]) ? 'rubyRed' : 'blue'}>{msg.user}</Text>
                                    <Text size="xs" c="dimmed">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                                </Group>
                                <Text size="sm">{msg.text}</Text>
                            </Box>
                        ))}
                    </Stack>
                </ScrollArea>

                <Group mt={6} mb={6} align="center" wrap="nowrap">
                    <TextInput
                        placeholder="Digite sua mensagem..."
                        value={inputText}
                        onChange={(e) => setInputText(e.currentTarget.value)}
                        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                        style={{ flex: 1 }}
                        styles={{ input: { backgroundColor: '#111', color: '#fff', borderColor: '#222' } }}
                    />
                    <ActionIcon color="rubyRed" size="lg" onClick={sendMessage}><Send size={18} /></ActionIcon>
                </Group>

                {/* Battle Log — bottom 50% */}
                <Box style={{ borderTop: '1px solid rgba(0,255,255,0.15)', paddingTop: '8px' }}>
                    <Group gap={6} mb={6} align="center">
                        <Swords size={12} color="#00ffcc" />
                        <Text size="10px" fw={900} c="cyan" lts="2px" tt="uppercase">Log de Batalha</Text>
                    </Group>
                    <Box
                        ref={logRef}
                        style={{
                            height: '160px', overflowY: 'auto',
                            backgroundColor: 'rgba(0,0,0,0.6)',
                            border: '1px solid rgba(0,255,204,0.1)',
                            borderRadius: '4px', padding: '8px'
                        }}
                    >
                        <Stack gap={3}>
                            {battleLog.map((entry, i) => (
                                <Text key={i} size="10px"
                                    style={{
                                        color: entry.startsWith('⚔') ? '#00ffcc' : entry.startsWith('[Sistema]') ? '#888' : '#ccc',
                                        fontFamily: 'monospace',
                                        lineHeight: 1.5
                                    }}
                                >
                                    {entry}
                                </Text>
                            ))}
                        </Stack>
                    </Box>
                </Box>
            </Stack>
        ) : (
            <ScrollArea style={{ flex: 1 }}>
                <InventoryGrid />
            </ScrollArea>
        )}
      </Box>

      {/* 3. Arena Area (Residual flex: 1) */}
      <Box w={{ base: '100%', sm: 'flex-1' }} h="100%" style={{ position: 'relative', flexGrow: 1 }}>
        <ArenaPixi onBattleLog={handleBattleLog} />
      </Box>
    </Flex>
  );
}
