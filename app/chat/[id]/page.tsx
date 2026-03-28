'use client';

import { useEffect, useState, useRef } from 'react';
import { Box, Group, Stack, Text, TextInput, ActionIcon, ScrollArea, Button, Title, FileButton, Flex, Badge, Loader } from '@mantine/core';
import { Send, Upload, Play, Pause, ArrowLeft, VolumeX, Volume2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useParams } from 'next/navigation';
import Link from 'next/link';

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
  
  // Realtime Sync States
  const [channel, setChannel] = useState<any>(null);
  const [onlineUsers, setOnlineUsers] = useState(0);

  // Cinema Mode States
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialization
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setCurrentUser(data.session?.user || null);
    });

    const roomChannel = supabase.channel(roomId, {
      config: {
        broadcast: { ack: false },
        presence: { key: 'user' }
      }
    });

    roomChannel
      .on('broadcast', { event: 'new_message' }, (payload) => {
        setMessages((prev) => [...prev, payload.payload]);
      })
      .on('broadcast', { event: 'sync_cinema' }, (payload) => {
        const { url, play, time } = payload.payload;
        if (url !== undefined) setVideoUrl(url);
        if (videoRef.current) {
          if (time !== undefined && Math.abs(videoRef.current.currentTime - time) > 2) {
            videoRef.current.currentTime = time;
          }
          if (play) videoRef.current.play().catch(() => {});
          else if (play === false) videoRef.current.pause();
        }
      })
      .on('presence', { event: 'sync' }, () => {
        const state = roomChannel.presenceState();
        setOnlineUsers(Object.keys(state).length);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Track user presence
          const { data } = await supabase.auth.getSession();
          roomChannel.track({
            user_id: data.session?.user?.id || 'anonymous',
            online_at: new Date().toISOString()
          });
        }
      });

    setChannel(roomChannel);

    return () => {
      roomChannel.unsubscribe();
    };
  }, [roomId]);

  // Auto-scroll chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Arena Mockup Canvas Render Loop
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId: number;

    const draw = () => {
      // Resize to container
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }

      // Background
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Arena Bounds
      const margin = 50;
      ctx.strokeStyle = '#991b1b';
      ctx.lineWidth = 4;
      ctx.strokeRect(margin, margin, canvas.width - margin * 2, canvas.height - margin * 2);

      // Draw center logo/circle
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, 40, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(153, 27, 27, 0.2)';
      ctx.fill();
      ctx.strokeStyle = '#ff0000';
      ctx.stroke();

      ctx.fillStyle = '#fff';
      ctx.font = '20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Arena Mockup', canvas.width / 2, canvas.height / 2 + 5);

      // Animate a demo dot
      const time = Date.now() / 1000;
      const dotX = canvas.width / 2 + Math.cos(time) * 100;
      const dotY = canvas.height / 2 + Math.sin(time) * 100;
      
      ctx.beginPath();
      ctx.arc(dotX, dotY, 10, 0, Math.PI * 2);
      ctx.fillStyle = '#3B82F6';
      ctx.fill();

      rafId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(rafId);
  }, []);

  const sendMessage = () => {
    if (!inputText.trim() || !channel) return;

    const userName = currentUser?.user_metadata?.full_name?.split(' ')[0] || currentUser?.email?.split('@')[0] || 'Anônimo';
    
    const msg: Message = {
      id: Math.random().toString(36).substr(2, 9),
      user: userName,
      text: inputText,
      timestamp: Date.now(),
    };

    channel.send({
      type: 'broadcast',
      event: 'new_message',
      payload: msg
    });

    setMessages((prev) => [...prev, msg]);
    setInputText('');
  };

  const handleFileUpload = async (file: File | null) => {
    if (!file || !channel) return;
    setUploading(true);
    
    // Fallback if no Storage bucket exists: create a local blob for immediate peer broadcast
    // In production, this uploads to Supabase Storage and broadcasts the public URL.
    try {
      const fileName = `${Date.now()}_${file.name}`;
      const { data, error } = await supabase.storage.from('cinema').upload(`room_${id}/${fileName}`, file);
      
      let finalUrl = '';
      if (error) {
        console.warn('Storage bucket "cinema" might not exist or RLS blocked. Sincronizando apenas a nivel de mockup...', error);
        // Fallback mockup
        finalUrl = URL.createObjectURL(file);
      } else {
        const { data: publicData } = supabase.storage.from('cinema').getPublicUrl(data.path);
        finalUrl = publicData.publicUrl;
      }

      setVideoUrl(finalUrl);
      channel.send({
        type: 'broadcast',
        event: 'sync_cinema',
        payload: { url: finalUrl, play: true, time: 0 }
      });
      setIsPlaying(true);
    } catch (err) {
      console.error(err);
    }
    setUploading(false);
  };

  const syncPlayPause = (play: boolean) => {
    if (!channel || !videoRef.current) return;
    setIsPlaying(play);
    if (play) videoRef.current.play();
    else videoRef.current.pause();

    channel.send({
      type: 'broadcast',
      event: 'sync_cinema',
      payload: { play, time: videoRef.current.currentTime }
    });
  };

  // Completely overlay global layout
  return (
    <Flex style={{ position: 'fixed', inset: 0, zIndex: 1500, backgroundColor: '#000', color: '#fff' }}>
      
      <Box w={{ base: '100%', sm: '20%' }} h="100%" p="md" style={{ borderRight: '1px solid #1a1a1a', backgroundColor: '#060606', display: 'flex', flexDirection: 'column' }}>
        <Title order={2} c="rubyRed" style={{ fontStyle: 'italic' }}>$erver</Title>
        <Badge mt="sm" color="green" variant="dot">{onlineUsers} Online</Badge>
        
        <Stack mt="xl" style={{ flex: 1 }}>
          <Text c="dimmed" size="xs" fw={700} tt="uppercase">Navegação Principal</Text>
          <Button variant="subtle" color="gray" justify="flex-start" component={Link} href="/">Home</Button>
          <Button variant="subtle" color="gray" justify="flex-start" component={Link} href="/colecoes">Vitrine</Button>
          
          <Text c="dimmed" size="xs" fw={700} tt="uppercase" mt="xl">Modo Cinema (Host)</Text>
          
          <FileButton onChange={handleFileUpload} accept="video/mp4,video/webm">
            {(props) => (
              <Button {...props} variant="light" color="rubyRed" leftSection={uploading ? <Loader size={16}/> : <Upload size={16}/>}>
                {uploading ? 'Enviando...' : 'Subir Arquivo (Sync)'}
              </Button>
            )}
          </FileButton>
        </Stack>
        
        <Button fullWidth color="dark" variant="outline" leftSection={<ArrowLeft size={16}/>} component={Link} href="/">
          Voltar à Loja
        </Button>
      </Box>

      {/* Center - Arena / Cinema (50%) */}
      <Box w={{ base: '100%', sm: '50%' }} h="100%" style={{ position: 'relative' }}>
        <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
        
        {videoUrl && (
          <Box style={{ position: 'absolute', inset: 0, backgroundColor: '#000', zIndex: 10, display: 'flex', flexDirection: 'column' }}>
            <video 
              ref={videoRef} 
              src={videoUrl} 
              style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
              onPlay={() => syncPlayPause(true)}
              onPause={() => syncPlayPause(false)}
              controls
            />
          </Box>
        )}
      </Box>

      {/* Right - Chat (30%) */}
      <Box w={{ base: '100%', sm: '30%' }} h="100%" p="md" style={{ borderLeft: '1px solid #1a1a1a', backgroundColor: '#0a0a0a', display: 'flex', flexDirection: 'column' }}>
        <Group justify="space-between" mb="md">
          <Title order={4}>Chat ao Vivo</Title>
          <Badge color="blue" variant="light">#{id}</Badge>
        </Group>

        <ScrollArea viewportRef={scrollRef} style={{ flex: 1, backgroundColor: '#000', borderRadius: '8px', padding: '10px', border: '1px solid #1a1a1a' }}>
          <Stack gap="xs">
            {messages.map((msg) => (
              <Box key={msg.id} style={{ backgroundColor: '#111', padding: '8px 12px', borderRadius: '8px' }}>
                <Group justify="space-between" mb={4}>
                  <Text size="sm" fw={700} c={msg.user === (currentUser?.user_metadata?.full_name?.split(' ')[0] || currentUser?.email?.split('@')[0]) ? 'rubyRed' : 'blue'}>
                    {msg.user}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </Group>
                <Text size="sm">{msg.text}</Text>
              </Box>
            ))}
          </Stack>
        </ScrollArea>

        <Group mt="md" align="center" wrap="nowrap">
          <TextInput 
            placeholder="Digite sua mensagem..." 
            value={inputText}
            onChange={(e) => setInputText(e.currentTarget.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            style={{ flex: 1 }}
            styles={{ input: { backgroundColor: '#111', color: '#fff', borderColor: '#222' } }}
          />
          <ActionIcon color="rubyRed" size="lg" onClick={sendMessage}>
            <Send size={18} />
          </ActionIcon>
        </Group>
      </Box>

    </Flex>
  );
}
