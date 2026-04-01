'use client';

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as PIXI from 'pixi.js';
import { Box, Group, Stack, Text, Flex, Avatar, Title, Badge, Grid, Progress, ActionIcon, Tooltip } from '@mantine/core';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Shield, Zap, Star, ChevronRight, Swords, User } from 'lucide-react';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface CharAttributes {
    for: number; des: number; ap: number;
    int: number; mr: number; armor: number; cos: number;
}

interface CharData {
    id: string;
    instanceId: string;
    name: string;
    isAlly: boolean;
    class: string;
    assetFolder: string;
    attributes: CharAttributes;
    hp: number; maxHp: number;
    mp: number; maxMp: number;
    description?: string;
}

interface CharOverlay extends CharData {
    x: number; y: number;
}

interface SkillDef {
    key: string; icon: React.ReactNode; name: string; description: string; mpCost: number; color: string;
}

// ─── Registry ──────────────────────────────────────────────────────────────────

const BASE_CHARS: Record<string, Omit<CharData, 'instanceId' | 'isAlly' | 'hp' | 'maxHp' | 'mp' | 'maxMp'>> = {
    draulhmur: {
        id: 'draulhmur', name: 'Draulhmur', class: 'Druida', assetFolder: 'druid',
        description: 'Mestre das artes naturais e da cura cósmica. Usa a energia do cosmo para proteção e dano verdejante.',
        attributes: { for: 45, des: 60, ap: 100, int: 85, mr: 75, armor: 40, cos: 90 }
    },
    lulfur: {
        id: 'lulfur', name: 'Lulfur', class: 'Invoker', assetFolder: 'lulfur',
        description: 'Entidade das chamas e do caos. Ataca com velocidade fulminante e queima o alvo além da armadura.',
        attributes: { for: 15, des: 70, ap: 80, int: 30, mr: 20, armor: 10, cos: 5 }
    },
};

function makeChar(id: string, instanceId: string, isAlly: boolean): CharData {
    const base = BASE_CHARS[id];
    return { ...base, instanceId, isAlly, hp: 100, maxHp: 100, mp: 100, maxMp: 100 };
}

const CLASS_COLORS: Record<string, string> = {
    'Druida': '#00ff99',
    'Invoker': '#ff6600',
};

// ─── Skills ────────────────────────────────────────────────────────────────────

const SKILLS: SkillDef[] = [
    { key: '1', icon: <Flame size={16} />, name: 'Ataque Básico', description: 'Um golpe direto no alvo. Causa dano baseado em FOR.', mpCost: 0, color: '#ff5500' },
    { key: '2', icon: <Zap size={16} />, name: 'Rajada de Mana', description: 'Dispara uma rajada de energia mística. Dano baseado em AP.', mpCost: 20, color: '#aa00ff' },
    { key: '3', icon: <Shield size={16} />, name: 'Barreira', description: 'Gera um escudo temporário absorvendo 30% do próximo dano recebido.', mpCost: 30, color: '#00e5ff' },
    { key: '4', icon: <Star size={16} />, name: 'Cura Cósmica', description: 'Recupera HP baseado em COS do personagem.', mpCost: 40, color: '#ffe600' },
    { key: 'E', icon: <ChevronRight size={16} />, name: 'Esquiva', description: 'Próximo ataque tem chance de ser desviado baseado em DES.', mpCost: 15, color: '#888' },
    { key: 'R', icon: <Swords size={14} />, name: 'Prioridade', description: 'O personagem age antes de todos no próximo turno.', mpCost: 50, color: '#ff0044' },
];

// ─── Sub-components ─────────────────────────────────────────────────────────────

const MiniBar = ({ val, color, label }: { val: number, color: string, label: string }) => (
    <Group gap={4} wrap="nowrap" align="center">
        <Text size="8px" c="dimmed" fw={700} lts="1px" w={28}>{label}</Text>
        <Box flex={1} h={5} style={{ backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
            <motion.div animate={{ width: `${val}%` }} style={{ height: '100%', backgroundColor: color, borderRadius: 3 }} />
        </Box>
        <Text size="8px" c="dimmed" w={22} ta="right">{val}</Text>
    </Group>
);

const CharCard = ({ char, isSelected, onClick }: { char: CharData, isSelected: boolean, onClick: () => void }) => {
    const col = char.isAlly ? '#00e5ff' : '#ff1744';
    const classCol = CLASS_COLORS[char.class] || '#aaa';
    return (
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={onClick}
            style={{
                background: isSelected ? `linear-gradient(135deg, ${col}18, rgba(0,0,0,0.8))` : 'rgba(10,10,15,0.85)',
                border: `1px solid ${isSelected ? col : 'rgba(255,255,255,0.07)'}`,
                borderRadius: 10, padding: '10px 12px', cursor: 'pointer',
                boxShadow: isSelected ? `0 0 20px ${col}44` : 'none',
            }}
        >
            <Group gap={8} wrap="nowrap" align="flex-start">
                <Box style={{ width: 42, height: 42, borderRadius: 8, overflow: 'hidden', border: `1.5px solid ${isSelected ? col : 'rgba(255,255,255,0.12)'}`, flexShrink: 0 }}>
                    <img
                        src={`/assets/characters/${char.assetFolder}/idle/0.png`}
                        alt={char.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 10%' }}
                    />
                </Box>
                <Stack gap={2} flex={1} style={{ minWidth: 0 }}>
                    <Group justify="space-between" gap={4} wrap="nowrap">
                        <Text size="11px" fw={800} c="white" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{char.name}</Text>
                        <Badge size="xs" variant="outline" style={{ color: classCol, borderColor: classCol, flexShrink: 0, fontSize: 8 }}>{char.class}</Badge>
                    </Group>
                    <MiniBar val={char.hp} color="#00ff66" label="HP" />
                    <MiniBar val={char.mp} color="#1565c0" label="MP" />
                </Stack>
            </Group>
        </motion.div>
    );
};

// ─── Main Component ─────────────────────────────────────────────────────────────

interface ArenaPixiProps {
    onBattleLog?: (entry: string) => void;
}

export const ArenaPixi: React.FC<ArenaPixiProps> = ({ onBattleLog }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const appRef = useRef<PIXI.Application | null>(null);
    const charsRef = useRef<Map<string, PIXI.Container>>(new Map());

    const [overlays, setOverlays] = useState<CharOverlay[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [activeAction, setActiveAction] = useState<string | null>(null);
    const [currentTurnIdx, setCurrentTurnIdx] = useState(0);
    const [turnNumber, setTurnNumber] = useState(1);
    const [turnBanner, setTurnBanner] = useState<string | null>(null);
    const [infoTarget, setInfoTarget] = useState<CharData | SkillDef | null>(null);
    const [infoType, setInfoType] = useState<'char' | 'skill' | null>(null);
    const [combatants, setCombatants] = useState<CharData[]>([]);

    const initialCombatants = useMemo<CharData[]>(() => [
        makeChar('draulhmur', 'draulhmur_1', true),
        makeChar('draulhmur', 'draulhmur_2', true),
        makeChar('lulfur', 'lulfur_1', false),
        makeChar('lulfur', 'lulfur_2', false),
    ], []);

    // Turn order sorted by DEX desc, then by instanceId for tiebreak
    const turnOrder = useMemo(() =>
        [...initialCombatants].sort((a, b) => b.attributes.des - a.attributes.des || a.instanceId.localeCompare(b.instanceId)),
        [initialCombatants]
    );

    // Next 5 from the cycle
    const next5 = useMemo(() =>
        Array.from({ length: 5 }, (_, i) => turnOrder[(currentTurnIdx + i) % turnOrder.length]),
        [turnOrder, currentTurnIdx]
    );

    const activeCombatant = turnOrder[currentTurnIdx % turnOrder.length];

    const log = useCallback((msg: string) => onBattleLog?.(msg), [onBattleLog]);

    const showBanner = useCallback((text: string) => {
        setTurnBanner(text);
        setTimeout(() => setTurnBanner(null), 1800);
    }, []);

    const endTurn = useCallback(() => {
        setCurrentTurnIdx(prev => {
            const nextIdx = (prev + 1) % turnOrder.length;
            const next = turnOrder[nextIdx];
            showBanner(`⚔ ${next.name.toUpperCase()}`);
            log(`[Turno ${turnNumber + 1}] Vez de ${next.name}`);
            setTurnNumber(t => t + 1);
            return nextIdx;
        });
    }, [turnOrder, showBanner, log, turnNumber]);

    // ─── PixiJS Scene ──────────────────────────────────────────────────────────
    useEffect(() => {
        if (!containerRef.current) return;
        const container = containerRef.current;

        const initPixi = async () => {
            const app = new PIXI.Application();
            await app.init({
                resizeTo: container,
                backgroundAlpha: 1,
                backgroundColor: 0x04040e,
                antialias: true,
                resolution: window.devicePixelRatio || 1,
                autoDensity: true,
            });
            if (!containerRef.current) return;
            appRef.current = app;
            container.appendChild(app.canvas);

            const bgLayer = new PIXI.Container();
            const charLayer = new PIXI.Container();
            app.stage.addChild(bgLayer);
            app.stage.addChild(charLayer);

            // ── Background: try cosmic tile, fallback neon stars ──────────────
            let bgLoaded = false;
            try {
                const tex = await PIXI.Assets.load('/assets/environment/arena_cósmica.png');
                const tile = new PIXI.TilingSprite({ texture: tex, width: app.screen.width, height: app.screen.height });
                const scale = Math.max(app.screen.width / tex.width, app.screen.height / tex.height);
                tile.tileScale.set(scale * 0.6);
                tile.alpha = 0.85;
                bgLayer.addChild(tile);
                bgLoaded = true;
            } catch {
                // Fallback: neon star field
                const starC = new PIXI.Container();
                starC.x = app.screen.width / 2;
                starC.y = app.screen.height / 2;
                bgLayer.addChild(starC);
                const neon = [0x00ffff, 0xff00ff, 0x00ff66, 0xffff00, 0x8800ff];
                const stars: { g: PIXI.Graphics; sp: number; ph: number; ba: number }[] = [];
                for (let i = 0; i < 180; i++) {
                    const g = new PIXI.Graphics();
                    const c = neon[Math.floor(Math.random() * neon.length)];
                    const sz = Math.random() * 2 + 0.5;
                    const ba = Math.random() * 0.5 + 0.2;
                    g.circle(0, 0, sz).fill({ color: c, alpha: ba });
                    const ang = Math.random() * Math.PI * 2;
                    const rad = Math.random() * Math.max(app.screen.width, app.screen.height) * 0.6;
                    g.x = Math.cos(ang) * rad;
                    g.y = Math.sin(ang) * rad;
                    starC.addChild(g);
                    stars.push({ g, sp: Math.random() * 0.003 + 0.001, ph: Math.random() * Math.PI * 2, ba });
                }
                let tick = 0;
                app.ticker.add(() => {
                    tick++;
                    starC.rotation += 0.00015;
                    stars.forEach(({ g, sp, ph, ba }) => { g.alpha = ba * (0.5 + 0.5 * Math.sin(tick * sp * 60 + ph)); });
                });
            }

            // Ground line — a thin neon rule; sprites anchor bottom=1 sit exactly on it
            const groundY = Math.round(app.screen.height * 0.94);
            const gfx = new PIXI.Graphics();
            gfx.rect(0, groundY, app.screen.width, 1.5).fill({ color: 0x00ffcc, alpha: 0.3 });
            bgLayer.addChild(gfx);

            // ── Load Characters ───────────────────────────────────────────────
            const configs = [
                { instanceId: 'draulhmur_1', charId: 'draulhmur', xFrac: 0.22, side: 'ally' },
                { instanceId: 'draulhmur_2', charId: 'draulhmur', xFrac: 0.36, side: 'ally' },
                { instanceId: 'lulfur_1',    charId: 'lulfur',    xFrac: 0.64, side: 'enemy' },
                { instanceId: 'lulfur_2',    charId: 'lulfur',    xFrac: 0.78, side: 'enemy' },
            ] as const;

            const newOverlays: CharOverlay[] = [];

            for (const cfg of configs) {
                const charData = initialCombatants.find(c => c.instanceId === cfg.instanceId)!;
                const grp = new PIXI.Container();
                grp.label = cfg.instanceId;
                grp.x = Math.round(app.screen.width * cfg.xFrac);
                grp.y = groundY + 25; // Sunk significantly to be exactly 'under' the line
                charLayer.addChild(grp);
                charsRef.current.set(cfg.instanceId, grp);

                newOverlays.push({ ...charData, x: app.screen.width * cfg.xFrac, y: groundY + 25 });

                const folder = charData.assetFolder;
                const bust = `?inst=${cfg.instanceId}`;
                const isDruid = cfg.charId === 'draulhmur';
                const idleCount = isDruid ? 13 : 17;
                const attackCount = isDruid ? 0 : 12;

                const idlePaths = Array.from({ length: idleCount }, (_, i) => `/assets/characters/${folder}/idle/${i}.png${bust}`);
                const attackPaths = Array.from({ length: attackCount }, (_, i) => `/assets/characters/${folder}/attack/${String(i).padStart(2, '0')}.png${bust}`);

                try {
                    const [idleTex, atkTex] = await Promise.all([
                        Promise.all(idlePaths.map(f => PIXI.Assets.load(f))),
                        attackPaths.length > 0 ? Promise.all(attackPaths.map(f => PIXI.Assets.load(f))) : Promise.resolve([]),
                    ]);

                    const targetH = 145;
                    const idle = new PIXI.AnimatedSprite(idleTex as PIXI.Texture[]);
                    idle.anchor.set(0.5, 1);
                    const sc = targetH / idle.texture.height;
                    idle.scale.set(cfg.side === 'ally' ? sc : -sc, sc);
                    idle.animationSpeed = 0.07;
                    idle.play();
                    grp.addChild(idle);

                    if (atkTex.length > 0) {
                        const atk = new PIXI.AnimatedSprite(atkTex as PIXI.Texture[]);
                        atk.anchor.set(0.5, 1);
                        atk.scale.set(cfg.side === 'ally' ? sc : -sc, sc);
                        atk.animationSpeed = 0.15;
                        atk.loop = false;
                        atk.visible = false;
                        grp.addChild(atk);
                        (grp as any).triggerAttack = () => {
                            idle.visible = false;
                            atk.visible = true;
                            atk.gotoAndPlay(0);
                            atk.onComplete = () => { atk.visible = false; idle.visible = true; idle.play(); };
                        };
                    }
                } catch (e) {
                    console.error(`Asset load failed: ${cfg.instanceId}`, e);
                    const c = cfg.side === 'ally' ? 0x00e5ff : 0xff1744;
                    grp.addChild(new PIXI.Graphics().rect(-22, -70, 44, 70).fill({ color: c, alpha: 0.8 }));
                }
            }

            setOverlays(newOverlays);
            setCombatants(initialCombatants);
        };

        initPixi().catch(console.error);
        return () => { appRef.current?.destroy(true); appRef.current = null; charsRef.current.clear(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ─── Key Events ──────────────────────────────────────────────────────────────
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            const key = e.key.toUpperCase();
            if (document.activeElement?.tagName === 'INPUT') return;
            if (!SKILLS.map(s => s.key).includes(key)) return;
            setActiveAction(key);
            setTimeout(() => setActiveAction(null), 200);
            if (key === '1') {
                const grp = charsRef.current.get(activeCombatant.instanceId);
                if (grp && (grp as any).triggerAttack) (grp as any).triggerAttack();
                const targets = initialCombatants.filter(c => c.isAlly !== activeCombatant.isAlly);
                const target = targets[Math.floor(Math.random() * targets.length)];
                const dmg = Math.floor(Math.random() * 25) + 8;
                log(`⚔ ${activeCombatant.name} atacou ${target.name} causando ${dmg} de dano!`);
                setTimeout(endTurn, 900);
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [activeCombatant, endTurn, initialCombatants, log]);

    // ─── Computed ────────────────────────────────────────────────────────────────
    const selectedChar = overlays.find(o => o.instanceId === selectedId);
    const allies = initialCombatants.filter(c => c.isAlly);
    const enemies = initialCombatants.filter(c => !c.isAlly);

    const handleSelectChar = (char: CharData) => {
        setSelectedId(char.instanceId);
        setInfoTarget(char);
        setInfoType('char');
    };

    const handleSelectSkill = (skill: SkillDef) => {
        setInfoTarget(skill);
        setInfoType('skill');
    };

    // ─── Render ──────────────────────────────────────────────────────────────────
    return (
        <Box style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', backgroundColor: '#04040e' }}>

            {/* ═══════════════════════════════════════════════════════════════════
                TOP 75% — BATTLE VIEWPORT (PixiJS canvas)
            ═══════════════════════════════════════════════════════════════════ */}
            <Box style={{ height: '75%', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
                <div ref={containerRef} style={{ position: 'absolute', inset: 0 }} />

                {/* Turn banner */}
                <AnimatePresence>
                    {turnBanner && (
                        <motion.div key={turnBanner + turnNumber}
                            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                            style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 50 }}
                        >
                            <Text style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '6px', color: '#fff', textShadow: '0 0 30px #00ffcc, 0 0 60px #00ffcc', fontFamily: 'monospace' }}>
                                {turnBanner}
                            </Text>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Character overlays (bars + names + click zones) */}
                <div style={{ position: 'absolute', inset: 0, zIndex: 10, pointerEvents: 'none' }}>
                    {overlays.map(ov => {
                        const isActive = ov.instanceId === activeCombatant?.instanceId;
                        const col = ov.isAlly ? '#00e5ff' : '#ff1744';
                        return (
                            <div key={ov.instanceId} style={{ position: 'absolute', left: ov.x, top: ov.y, width: 0, height: 0 }}>
                                {/* Bars */}
                                <div style={{ position: 'absolute', bottom: 160, left: -48, pointerEvents: 'none' }}>
                                    <Stack gap={2} w={96}>
                                        <Box w="100%" h={7} style={{ backgroundColor: 'rgba(0,0,0,0.9)', borderRadius: 4, border: '1px solid #00ff66', overflow: 'hidden' }}>
                                            <div style={{ width: `${ov.hp}%`, height: '100%', backgroundColor: '#00ff66' }} />
                                        </Box>
                                        <Box w="100%" h={5} style={{ backgroundColor: 'rgba(0,0,0,0.8)', borderRadius: 4, border: '1px solid #1565c0', overflow: 'hidden' }}>
                                            <div style={{ width: `${ov.mp}%`, height: '100%', backgroundColor: '#1565c0' }} />
                                        </Box>
                                        <Text size="9px" fw={800} ta="center" c={isActive ? col : 'rgba(255,255,255,0.5)'} mt={2}
                                            style={{ textShadow: '0 0 6px #000', letterSpacing: '1px', whiteSpace: 'nowrap' }}>
                                            {ov.name}
                                        </Text>
                                    </Stack>
                                </div>
                                {/* Active glow underfoot */}
                                {isActive && (
                                    <div style={{ position: 'absolute', left: -20, bottom: 2, width: 40, height: 8, borderRadius: '50%', backgroundColor: col, filter: 'blur(8px)', opacity: 0.7, pointerEvents: 'none' }} />
                                )}
                                {/* Click zone */}
                                <div
                                    className={`cursor-target ${ov.isAlly ? 'ally-target' : 'enemy-target'}`}
                                    onClick={() => handleSelectChar(ov)}
                                    style={{ position: 'absolute', left: -50, top: -160, width: 100, height: 175, cursor: 'pointer', zIndex: 15, pointerEvents: 'auto' }}
                                >
                                    {selectedId === ov.instanceId && (<>
                                        <div style={{ position: 'absolute', top: 0, left: 0, width: 18, height: 18, borderTop: `1.5px solid ${col}`, borderLeft: `1.5px solid ${col}`, filter: `drop-shadow(0 0 4px ${col})` }} />
                                        <div style={{ position: 'absolute', top: 0, right: 0, width: 18, height: 18, borderTop: `1.5px solid ${col}`, borderRight: `1.5px solid ${col}`, filter: `drop-shadow(0 0 4px ${col})` }} />
                                        <div style={{ position: 'absolute', bottom: 0, left: 0, width: 18, height: 18, borderBottom: `1.5px solid ${col}`, borderLeft: `1.5px solid ${col}`, filter: `drop-shadow(0 0 4px ${col})` }} />
                                        <div style={{ position: 'absolute', bottom: 0, right: 0, width: 18, height: 18, borderBottom: `1.5px solid ${col}`, borderRight: `1.5px solid ${col}`, filter: `drop-shadow(0 0 4px ${col})` }} />
                                    </>)}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Mini selected char HUD — top-left */}
                <AnimatePresence>
                    {selectedChar && (
                        <motion.div key={selectedChar.instanceId}
                            initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -30, opacity: 0 }}
                            style={{ position: 'absolute', top: 8, left: 8, zIndex: 30, pointerEvents: 'none' }}
                        >
                            <Group gap={8} align="center" style={{ backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(12px)', borderRadius: 8, padding: '6px 10px', border: `1px solid ${selectedChar.isAlly ? '#00e5ff33' : '#ff174433'}` }}>
                                <Box style={{ width: 32, height: 32, borderRadius: 6, overflow: 'hidden', border: `1px solid ${selectedChar.isAlly ? '#00e5ff' : '#ff1744'}` }}>
                                    <img src={`/assets/characters/${selectedChar.assetFolder}/idle/0.png`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 10%' }} />
                                </Box>
                                <Stack gap={0}>
                                    <Text size="10px" fw={800} c="white">{selectedChar.name}</Text>
                                    <Text size="8px" c="dimmed">{selectedChar.class}</Text>
                                </Stack>
                                <Stack gap={2} w={60}>
                                    <Box h={4} style={{ backgroundColor: '#111', borderRadius: 2, overflow: 'hidden' }}>
                                        <div style={{ width: `${selectedChar.hp}%`, height: '100%', backgroundColor: '#00ff66' }} />
                                    </Box>
                                    <Box h={4} style={{ backgroundColor: '#111', borderRadius: 2, overflow: 'hidden' }}>
                                        <div style={{ width: `${selectedChar.mp}%`, height: '100%', backgroundColor: '#1565c0' }} />
                                    </Box>
                                </Stack>
                            </Group>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Turn badge — top right */}
                <Box style={{ position: 'absolute', top: 10, right: 10, zIndex: 30, pointerEvents: 'none' }}>
                    <Badge variant="outline" color={activeCombatant?.isAlly ? 'cyan' : 'red'} size="xs" style={{ letterSpacing: '1px', backdropFilter: 'blur(8px)', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                        {activeCombatant?.name} — T{turnNumber}
                    </Badge>
                </Box>
            </Box>

            {/* ── Turn order strip (5 next) — between viewport and UI ───────── */}
            <Box style={{ backgroundColor: 'rgba(0,0,0,0.85)', borderTop: '2px solid rgba(0,255,204,0.15)', borderBottom: '1px solid rgba(0,255,204,0.1)', padding: '4px 16px', flexShrink: 0 }}>
                <Flex align="center" gap={6}>
                    <Text size="8px" fw={900} c="cyan" lts="2px" tt="uppercase" style={{ whiteSpace: 'nowrap' }}>PRÓXIMOS</Text>
                    <Flex gap={6} align="center">
                        {next5.map((c, i) => {
                            const col = c.isAlly ? '#00e5ff' : '#ff1744';
                            return (
                                <motion.div key={`${c.instanceId}-${i}`} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: i * 0.05 }}>
                                    <Group gap={4} align="center">
                                        {i > 0 && <ChevronRight size={10} color="rgba(255,255,255,0.2)" />}
                                        <Tooltip label={`${c.name} (DES ${c.attributes.des})`} withArrow>
                                            <Box style={{ position: 'relative' }}>
                                                <Box style={{ width: i === 0 ? 36 : 28, height: i === 0 ? 36 : 28, borderRadius: '50%', overflow: 'hidden', border: `${i === 0 ? 2 : 1.5}px solid ${col}`, boxShadow: i === 0 ? `0 0 12px ${col}` : 'none', transition: 'all 0.3s' }}>
                                                    <img
                                                        src={`/assets/characters/${c.assetFolder}/idle/0.png`}
                                                        alt={c.name}
                                                        style={{ width: '170%', height: '170%', objectFit: 'cover', objectPosition: 'center 5%', marginLeft: '-35%', marginTop: '-15%' }}
                                                    />
                                                </Box>
                                                {i === 0 && (
                                                    <div style={{ position: 'absolute', bottom: -2, left: '50%', transform: 'translateX(-50%)', width: 4, height: 4, borderRadius: '50%', backgroundColor: col, boxShadow: `0 0 6px ${col}` }} />
                                                )}
                                            </Box>
                                        </Tooltip>
                                    </Group>
                                </motion.div>
                            );
                        })}
                    </Flex>
                </Flex>
            </Box>

            {/* ═══════════════════════════════════════════════════════════════════
                BOTTOM 40% — GAME CONTROL PANEL
            ═══════════════════════════════════════════════════════════════════ */}
            <Box style={{ flex: 1, position: 'relative', overflow: 'hidden', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
                {/* Grainient background */}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #06060f 0%, #0a0a1a 50%, #060610 100%)', zIndex: 0 }} />
                <div style={{ position: 'absolute', inset: '-200%', width: '400%', height: '400%', opacity: 0.04, pointerEvents: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, animation: 'noise 0.15s infinite alternate', zIndex: 1 }} />

                <Flex style={{ position: 'relative', zIndex: 2, flex: 1, minHeight: 0, alignItems: 'stretch' }}>

                    {/* ── ALLIES (Left 22%) ───────────────────────────────── */}
                    <Box w="22%" style={{ borderRight: '1px solid rgba(0,229,255,0.08)', padding: '4px 8px', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                        <Group gap={3} mb={4} align="center">
                            <div style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: '#00e5ff', boxShadow: '0 0 8px #00e5ff' }} />
                            <Text size="7px" fw={900} c="cyan" lts="2px" tt="uppercase">Aliados</Text>
                        </Group>
                        <Stack gap={4}>
                            {allies.map(char => (
                                <CharCard key={char.instanceId} char={char} isSelected={selectedId === char.instanceId} onClick={() => handleSelectChar(char)} />
                            ))}
                        </Stack>
                    </Box>

                    {/* ── SKILLS CENTER (flex 1) ──────────────────────────── */}
                    <Box flex={1} style={{ padding: '4px 12px', borderRight: '1px solid rgba(255,255,255,0.04)', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                        <Group gap={3} mb={4} align="center">
                            <Swords size={8} color="#ff9900" />
                            <Text size="7px" fw={900} c="orange" lts="2px" tt="uppercase">Habilidades</Text>
                            {activeCombatant && <Badge size="8px" variant="dot" color="gray" ml="auto">{activeCombatant.name}</Badge>}
                        </Group>
                        <Grid gutter={4} columns={3}>
                            {SKILLS.map(skill => (
                                <Grid.Col span={1} key={skill.key}>
                                    <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }}
                                        onClick={() => handleSelectSkill(skill)}
                                        style={{
                                            background: activeAction === skill.key ? `${skill.color}22` : 'rgba(10,10,20,0.9)',
                                            border: `1px solid ${activeAction === skill.key ? skill.color : 'rgba(255,255,255,0.06)'}`,
                                            borderRadius: 8, padding: '8px', cursor: 'pointer',
                                            boxShadow: activeAction === skill.key ? `0 0 16px ${skill.color}66` : 'none',
                                            transition: 'all 0.15s ease'
                                        }}
                                    >
                                        <Group gap={6} mb={4} wrap="nowrap">
                                            <Box style={{ color: skill.color }}>{skill.icon}</Box>
                                            <Badge size="xs" variant="outline" style={{ borderColor: 'rgba(255,255,255,0.1)', color: '#888', fontSize: 9 }}>{skill.key}</Badge>
                                        </Group>
                                        <Text size="9px" fw={800} c="white" mb={2} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{skill.name}</Text>
                                        {skill.mpCost > 0 && (
                                            <Group gap={4} align="center">
                                                <div style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: '#1565c0' }} />
                                                <Text size="8px" c="dimmed">{skill.mpCost} MP</Text>
                                            </Group>
                                        )}
                                    </motion.div>
                                </Grid.Col>
                            ))}
                        </Grid>

                        {/* Action bar keys */}
                        <Box mt={10}>
                            <Text size="8px" c="dimmed" lts="1px" tt="uppercase" mb={4}>Ações Rápidas</Text>
                            <Flex gap={4} wrap="wrap">
                                {['T', 'F', 'G', 'V', 'C', 'X'].map(key => (
                                    <Box key={key} w={36} h={36}
                                        style={{ backgroundColor: 'rgba(10,10,20,0.9)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}
                                        className="action-slot"
                                    >
                                        <Text size="10px" fw={900} c="dimmed">{key}</Text>
                                    </Box>
                                ))}
                            </Flex>
                        </Box>
                    </Box>

                    {/* ── ENEMIES + INFO PANEL (Right 28%) ───────────────── */}
                    <Box w="28%" style={{ padding: '4px 8px', display: 'flex', flexDirection: 'column', gap: 4, overflowY: 'auto', flex: 1, minHeight: 0 }}>
                        {/* Enemies */}
                        <Box>
                            <Group gap={3} mb={4} align="center">
                                <div style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: '#ff1744', boxShadow: '0 0 8px #ff1744' }} />
                                <Text size="7px" fw={900} c="red" lts="2px" tt="uppercase">Inimigos</Text>
                            </Group>
                            <Stack gap={4}>
                                {enemies.map(char => (
                                    <CharCard key={char.instanceId} char={char} isSelected={selectedId === char.instanceId} onClick={() => handleSelectChar(char)} />
                                ))}
                            </Stack>
                        </Box>

                        {/* Info Panel */}
                        <Box style={{ flex: 1, borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 8 }}>
                            <Group gap={6} mb={6} align="center">
                                <User size={10} color="#888" />
                                <Text size="9px" fw={900} c="dimmed" lts="2px" tt="uppercase">Detalhes</Text>
                            </Group>

                            <AnimatePresence mode="wait">
                                {infoTarget && (
                                    <motion.div key={'infoType' in infoTarget ? 'skill' : (infoTarget as any).instanceId}
                                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                                        style={{ backgroundColor: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '10px', overflow: 'hidden' }}
                                    >
                                        {infoType === 'char' ? (() => {
                                            const c = infoTarget as CharData;
                                            const col = c.isAlly ? '#00e5ff' : '#ff1744';
                                            const classCol = CLASS_COLORS[c.class] || '#aaa';
                                            return (
                                                <Stack gap={8}>
                                                    {/* Portrait */}
                                                    <Box style={{ width: '100%', height: 100, borderRadius: 8, overflow: 'hidden', border: `1.5px solid ${col}33`, position: 'relative' }}>
                                                        <img src={`/assets/characters/${c.assetFolder}/idle/0.png`} alt={c.name}
                                                            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 5%' }} />
                                                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 30, background: 'linear-gradient(transparent, rgba(0,0,0,0.85))' }} />
                                                    </Box>
                                                    {/* Name + class */}
                                                    <Group justify="space-between" align="center">
                                                        <Text size="13px" fw={900} c="white">{c.name}</Text>
                                                        <Badge size="xs" variant="outline" style={{ color: classCol, borderColor: classCol, fontSize: 8 }}>{c.class}</Badge>
                                                    </Group>
                                                    {/* Description */}
                                                    <Text size="8px" c="dimmed" style={{ lineHeight: 1.6 }}>{c.description}</Text>
                                                    {/* Stats */}
                                                    <Grid gutter={4} columns={2}>
                                                        {([
                                                            { label: 'FOR', val: c.attributes.for },
                                                            { label: 'DES', val: c.attributes.des },
                                                            { label: 'AP',  val: c.attributes.ap  },
                                                            { label: 'INT', val: c.attributes.int  },
                                                            { label: 'MR',  val: c.attributes.mr   },
                                                            { label: 'ARMOR', val: c.attributes.armor },
                                                            { label: 'COS', val: c.attributes.cos  },
                                                        ] as {label:string;val:number}[]).map(s => (
                                                            <Grid.Col span={1} key={s.label}>
                                                                <Group gap={4} align="center">
                                                                    <Text size="8px" c="dimmed" w={28}>{s.label}</Text>
                                                                    <Text size="9px" fw={800} c="white">{s.val}</Text>
                                                                </Group>
                                                            </Grid.Col>
                                                        ))}
                                                    </Grid>
                                                </Stack>
                                            );
                                        })() : (() => {
                                            const sk = infoTarget as SkillDef;
                                            return (
                                                <Stack gap={8}>
                                                    <Group gap={8} align="center">
                                                        <Box style={{ color: sk.color, backgroundColor: `${sk.color}18`, borderRadius: 8, padding: '8px', border: `1px solid ${sk.color}44` }}>{sk.icon}</Box>
                                                        <Stack gap={2}>
                                                            <Text size="11px" fw={800} c="white">{sk.name}</Text>
                                                            <Badge size="xs" variant="outline" style={{ borderColor: 'rgba(255,255,255,0.1)', color: '#666', fontSize: 8 }}>Tecla {sk.key}</Badge>
                                                        </Stack>
                                                    </Group>
                                                    <Text size="9px" c="dimmed" style={{ lineHeight: 1.7 }}>{sk.description}</Text>
                                                    {sk.mpCost > 0 && (
                                                        <Group gap={4} align="center">
                                                            <Box w={8} h={8} style={{ borderRadius: '50%', backgroundColor: '#1565c0' }} />
                                                            <Text size="9px" c="white" fw={700}>{sk.mpCost} MP</Text>
                                                        </Group>
                                                    )}
                                                </Stack>
                                            );
                                        })()}
                                    </motion.div>
                                )}
                                {!infoTarget && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                        <Text size="9px" c="dimmed" ta="center" style={{ paddingTop: 20 }}>
                                            Clique em um personagem<br />ou habilidade para ver detalhes.
                                        </Text>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </Box>
                    </Box>
                </Flex>
            </Box>
        </Box>
    );
};

export default ArenaPixi;
