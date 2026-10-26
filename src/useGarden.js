import { useCallback, useEffect, useRef, useState } from 'react';

export const WEATHER = {
  sunny: { label: '맑음', description: '햇살이 포근한 오후', temp: '23°', icon: 'sun' },
  cloudy: { label: '흐림', description: '구름이 쉬어가는 오후', temp: '19°', icon: 'cloud' },
  rainy: { label: '비', description: '빗방울이 토닥이는 오후', temp: '17°', icon: 'rain' },
  snowy: { label: '눈', description: '눈송이가 내려앉는 오후', temp: '−2°', icon: 'snow' },
};
export const BEHAVIORS = {
  walk: '정원을 산책해요', sleep: '포근하게 낮잠 자는 중', butterfly: '나비야, 같이 놀자!',
  sniff: '풀 내음이 좋아요', groom: '보송보송 털을 정리해요', stretch: '쭈욱, 기지개를 켜요',
  paw: '앞발을 꼼꼼히 핥아요', 'pet-head': '손길이 정말 좋아요', 'pet-back': '기분 좋은 꼬리 인사', snack: '오독오독, 맛있다!',
};
const initialCat = { x: 510, y: 433, facing: 1, behavior: 'walk', targetX: 610, targetY: 410, until: 0 };
function readSaved() {
  try { const value = JSON.parse(localStorage.getItem('little-garden')); return value?.day === new Date().toDateString() ? value : {}; } catch { return {}; }
}
export function useGarden() {
  const saved = useRef(readSaved()).current;
  const [cat, setCat] = useState(initialCat);
  const model = useRef({ ...initialCat, until: Date.now() + 9000 });
  const [weather, setWeather] = useState('sunny');
  const [autoWeather, setAutoWeather] = useState(false);
  const [paused, setPaused] = useState(false);
  const [minutes, setMinutes] = useState(14 * 60 + 32);
  const [stats, setStats] = useState({ happiness: saved.happiness ?? 86, energy: saved.energy ?? 72, affection: saved.affection ?? 64 });
  const [name, setName] = useState(saved.name || '모모');
  const [treats, setTreats] = useState(saved.treats ?? 3);
  const [touches, setTouches] = useState(saved.touches ?? 0);
  const [events, setEvents] = useState([{ id: 1, text: '정원에서 느긋한 하루를 시작했어요', time: '14:32', icon: 'leaf' }]);
  const time = `${String(Math.floor(minutes / 60) % 24).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
  const addEvent = useCallback((text, icon = 'heart') => setEvents(list => [{ id: Date.now() + Math.random(), text, time, icon }, ...list].slice(0, 30)), [time]);

  useEffect(() => { try { localStorage.setItem('little-garden', JSON.stringify({ ...stats, name, treats, touches, day: new Date().toDateString() })); } catch {} }, [stats, name, treats, touches]);
  useEffect(() => {
    if (paused) return;
    const tick = setInterval(() => {
      const c = model.current;
      if (Date.now() > c.until) {
        const actions = ['walk', 'walk', 'sleep', 'butterfly', 'sniff', 'groom', 'stretch', 'paw'];
        c.behavior = actions[Math.floor(Math.random() * actions.length)];
        c.until = Date.now() + (c.behavior === 'sleep' ? 14000 : 7000 + Math.random() * 5000);
        c.targetX = 290 + Math.random() * 400;
        c.targetY = 350 + Math.random() * 155;
      }
      if (c.behavior === 'walk') {
        const dx = c.targetX - c.x, dy = c.targetY - c.y, distance = Math.hypot(dx, dy);
        if (distance > 3) { c.x += dx / distance * 1.5; c.y += dy / distance * 1.5; c.facing = dx > 0 ? 1 : -1; }
        else c.until = 0;
      }
      setCat({ ...c });
    }, 70);
    const clock = setInterval(() => setMinutes(value => (value + 1) % 1440), 12000);
    const energy = setInterval(() => setStats(value => ({ ...value, energy: Math.min(100, Math.max(10, value.energy + (model.current.behavior === 'sleep' ? 2 : -0.3))) })), 12000);
    return () => { clearInterval(tick); clearInterval(clock); clearInterval(energy); };
  }, [paused]);
  useEffect(() => {
    if (!autoWeather || paused) return;
    const timer = setInterval(() => setWeather(current => { const keys = Object.keys(WEATHER); return keys[(keys.indexOf(current) + 1) % keys.length]; }), 60000);
    return () => clearInterval(timer);
  }, [autoWeather, paused]);

  const act = useCallback((behavior, duration = 5500) => {
    model.current.behavior = behavior;
    model.current.until = Date.now() + duration;
    setCat({ ...model.current });
  }, []);
  const touch = useCallback((part) => {
    if (paused) return;
    act(part === 'head' ? 'pet-head' : 'pet-back');
    setTouches(count => count + 1);
    setStats(value => ({ ...value, happiness: Math.min(100, value.happiness + 2), affection: Math.min(100, value.affection + 3) }));
    addEvent(part === 'head' ? '머리를 쓰다듬자 눈을 지그시 감았어요' : '등을 쓰다듬자 꼬리를 쏙 세웠어요');
  }, [act, addEvent, paused]);
  const feed = useCallback(() => {
    if (!treats || paused) return false;
    setTreats(count => count - 1);
    setStats(value => ({ ...value, happiness: Math.min(100, value.happiness + 5), energy: Math.min(100, value.energy + 8) }));
    act('snack', 6500);
    addEvent('고소한 간식을 오독오독 먹었어요', 'snack');
    return true;
  }, [treats, paused, act, addEvent]);
  const invite = useCallback((behavior) => {
    if (paused) return;
    act(behavior, behavior === 'sleep' ? 16000 : 8500);
    addEvent(BEHAVIORS[behavior], behavior === 'sleep' ? 'moon' : 'paw');
  }, [act, addEvent, paused]);
  return { cat, weather, setWeather, autoWeather, setAutoWeather, paused, setPaused, stats, name, setName, treats, touches, events, time, touch, feed, invite };
}
