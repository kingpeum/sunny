import React, { useEffect, useRef, useState } from 'react';
import { Leaf, Heart, Volume2, VolumeX, ArrowUpRight, ChevronRight, PawPrint, Sparkles, Sun, X, Cookie, Moon, Hand, Sprout, BookOpen, Check, Feather, Pencil, Wind, HelpCircle } from 'lucide-react';
import GardenScene, { weatherIcons } from './components/GardenScene.jsx';
import Cat from './components/Cat.jsx';
import { useGarden, WEATHER } from './useGarden.js';

function useAmbience(enabled) {
  useEffect(() => {
    if (!enabled) return;
    const Context = window.AudioContext || window.webkitAudioContext;
    if (!Context) return;
    const context = new Context();
    context.resume();
    const buffer = context.createBuffer(1, context.sampleRate * 3, context.sampleRate);
    const values = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < values.length; i++) { last = (last + (Math.random() * 2 - 1) * .03) / 1.03; values[i] = last; }
    const wind = context.createBufferSource(); wind.buffer = buffer; wind.loop = true;
    const filter = context.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 650;
    const volume = context.createGain(); volume.gain.value = .15;
    wind.connect(filter); filter.connect(volume); volume.connect(context.destination); wind.start();
    const chirp = () => {
      const now = context.currentTime;
      const bird = context.createOscillator(), gain = context.createGain();
      bird.type = 'sine'; bird.frequency.setValueAtTime(2300, now); bird.frequency.exponentialRampToValueAtTime(3400, now + .09); bird.frequency.exponentialRampToValueAtTime(2100, now + .2);
      gain.gain.setValueAtTime(0, now); gain.gain.linearRampToValueAtTime(.025, now + .025); gain.gain.exponentialRampToValueAtTime(.001, now + .25);
      bird.connect(gain); gain.connect(context.destination); bird.start(now); bird.stop(now + .3);
    };
    chirp(); const birds = setInterval(chirp, 4200);
    return () => { clearInterval(birds); context.close(); };
  }, [enabled]);
}

function StatBar({ icon: Icon, label, value, color }) {
  return <div className="stat"><div className="stat-label"><span><Icon size={14}/>{label}</span><strong>{Math.round(value)}<small>/ 100</small></strong></div><div className="stat-track" role="meter" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(value)}><span style={{ width: `${value}%`, background: color }}/></div></div>;
}

const behaviorList = [
  { key: 'sleep', title: '식빵 굽는 시간', subtitle: '동그랗게 말아서, 쿨쿨', icon: Moon },
  { key: 'butterfly', title: '나비랑 놀기', subtitle: '폴짝! 앞발을 쭉 뻗어요', icon: Feather },
  { key: 'sniff', title: '풀 내음 맡기', subtitle: '초록빛 정원을 탐색해요', icon: Sprout },
  { key: 'groom', title: '보송보송 그루밍', subtitle: '부드러운 털을 정돈해요', icon: Sparkles },
  { key: 'stretch', title: '느긋한 기지개', subtitle: '앞발부터 꼬리까지 쭈욱', icon: Wind },
  { key: 'paw', title: '앞발 핥기', subtitle: '작은 발도 깨끗하게', icon: PawPrint },
];

function Modal({ type, close, garden }) {
  const modal = useRef(null);
  const closeButton = useRef(null);
  const [draftName, setDraftName] = useState(garden.name);
  useEffect(() => {
    const previous = document.activeElement;
    closeButton.current?.focus();
    const onKey = (event) => {
      if (event.key === 'Escape') close();
      if (event.key === 'Tab') {
        const items = [...modal.current.querySelectorAll('button, input')];
        const first = items[0], last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('keydown', onKey); previous?.focus(); };
  }, [close]);
  return <div className="modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) close(); }}><section className="modal" ref={modal} role="dialog" aria-modal="true" aria-labelledby="modal-title">
    <button className="modal-close icon-button" onClick={close} ref={closeButton} aria-label="닫기"><X size={20}/></button>
    <span className="eyebrow">LITTLE MOMENTS TOGETHER</span>
    <h2 id="modal-title">{type === 'journal' ? `${garden.name}의 정원 일기` : type === 'name' ? '어떤 이름으로 부를까요?' : type === 'behavior' ? '고양이의 느긋한 하루' : '조금씩, 가까워지는 방법'}</h2>
    {type === 'journal' ? <><p className="modal-intro">함께한 작은 순간들을 모아두었어요.</p><div className="journal-stats"><div><Heart size={18}/><strong>{garden.touches}</strong><span>다정한 손길</span></div><div><Cookie size={18}/><strong>{3 - garden.treats}</strong><span>함께 먹은 간식</span></div></div><div className="journal-entries">{garden.events.map(event => <div className="journal-row" key={event.id}><span className="timeline-dot"/><time>{event.time}</time><p>{event.text}</p></div>)}</div><small className="muted">손길과 간식 기록은 오늘 하루 동안 이 브라우저에 저장돼요.</small></>
    : type === 'name' ? <form className="name-form" onSubmit={event => { event.preventDefault(); if (draftName.trim()) { garden.setName(draftName.trim()); close(); } }}><label htmlFor="cat-name">우리 고양이 이름</label><input id="cat-name" value={draftName} onChange={event => setDraftName(event.target.value)} maxLength={5} placeholder="모모" required/><span className="muted">한 글자부터 다섯 글자까지 지어주세요.</span><button className="primary-button" type="submit"><Check size={16}/>이 이름으로 부를게요</button></form>
    : type === 'behavior' ? <><p className="modal-intro">가만히 지켜봐도 스스로 놀고 쉬어요.<br/>궁금한 행동을 골라 먼저 만나볼 수도 있어요.</p><div className="behavior-list">{behaviorList.map(({ key, title, subtitle, icon: Icon }) => <button key={key} disabled={garden.paused} onClick={() => { garden.invite(key); close(); }}><span className="behavior-icon"><Icon size={21}/></span><span><strong>{title}</strong><small>{subtitle}</small></span><ChevronRight size={17}/></button>)}</div>{garden.paused && <p className="muted">정원을 재생하면 행동을 선택할 수 있어요.</p>}</>
    : <><p className="modal-intro">무언가를 잘 해내지 않아도 괜찮아요.<br/>오늘은 그저 {garden.name} 곁에 머물러 주세요.</p><div className="guide-item"><span>01</span><div><h3>머리를 살며시 쓰다듬어요</h3><p>정원 속 고양이의 머리를 눌러보세요. 고개를 들고 눈을 감으며 꼬리를 살랑거릴 거예요.</p></div></div><div className="guide-item"><span>02</span><div><h3>등에도 다정한 손길을</h3><p>등을 누르면 엉덩이를 들어 올리고 꼬리를 쏙 세워요. 아래의 쓰다듬기 버튼으로도 함께할 수 있어요.</p></div></div><div className="guide-item"><span>03</span><div><h3>고양이의 하루를 바라봐요</h3><p>낮잠, 나비 잡기, 풀 냄새 맡기, 그루밍, 기지개, 앞발 핥기까지. 날씨를 바꾸거나 자연의 소리를 켜보세요.</p></div></div><div className="guide-note"><Leaf size={17}/>느리게 흘러가는 이곳에서, 잠깐 쉬어가세요.</div></>}
  </section></div>;
}

export default function App() {
  const garden = useGarden();
  const [sound, setSound] = useState(false);
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState('');
  const toastTimer = useRef(null);
  const CurrentWeather = weatherIcons[garden.weather];
  useAmbience(sound);
  useEffect(() => () => clearTimeout(toastTimer.current), []);
  function notify(message) { setToast(message); clearTimeout(toastTimer.current); toastTimer.current = setTimeout(() => setToast(''), 3500); }
  function pet(part) { if (garden.paused) { notify('재생 버튼을 눌러 정원의 시간을 이어주세요.'); return; } garden.touch(part); }
  const closeModal = React.useCallback(() => setModal(null), []);
  return <>
    <header className="site-header"><div className="header-inner"><a href="#" className="brand" aria-label="리틀 가든 홈" onClick={event => { event.preventDefault(); setModal(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }}><span className="brand-mark"><Sprout size={23}/></span><span>little garden<span className="brand-dot">.</span></span></a><nav aria-label="메인 메뉴"><button className={!modal ? 'nav-link active' : 'nav-link'} onClick={() => setModal(null)}>나의 정원</button><button className={modal === 'journal' ? 'nav-link active' : 'nav-link'} onClick={() => setModal('journal')}>{garden.name}의 일기</button><button className={modal === 'guide' ? 'nav-link active' : 'nav-link'} onClick={() => setModal('guide')}>함께하는 방법<ArrowUpRight size={13}/></button></nav><button className="mobile-guide" onClick={() => setModal('guide')} aria-label="함께하는 방법"><HelpCircle size={19}/></button><button className={`sound-button ${sound ? 'sound-on' : ''}`} onClick={() => setSound(!sound)} aria-pressed={sound}>{sound ? <Volume2 size={16}/> : <VolumeX size={16}/>}<span>정원의 소리</span><span className="sound-state">{sound ? 'ON' : 'OFF'}</span></button></div></header>
    <main className="page-wrap">
      <section className="page-heading"><div><div className="eyebrow"><span/> A SMALL GARDEN. A SLOWER DAY.</div><h1>고양이와 나의 작은 정원<span className="title-flower">✳</span></h1><p>작은 발걸음, 부드러운 손길. 우리만의 느긋한 하루가 시작돼요.</p></div><div className="today-note"><span className="today-icon"><CurrentWeather size={27} strokeWidth={1.4}/></span><div><span>오늘도, 함께라서 좋은 날</span><p>{WEATHER[garden.weather].description}<span className="tiny-dot"/>{WEATHER[garden.weather].temp}C</p></div></div></section>
      <div className="main-grid"><div className="garden-column"><GardenScene garden={garden}/>
        <section className="weather-panel"><div className="weather-title"><span className="small-section-label">GARDEN WEATHER</span><h3>오늘의 정원은</h3></div><div className="weather-options" aria-label="정원 날씨">{Object.entries(WEATHER).map(([key, value]) => { const Icon = weatherIcons[key]; return <button className={`weather-option ${key === garden.weather ? 'selected' : ''}`} onClick={() => garden.setWeather(key)} key={key} aria-pressed={key === garden.weather}><Icon size={20} strokeWidth={1.6}/><span>{value.label}</span></button>; })}</div><div className="auto-weather"><span>날씨 자동 변화</span><button role="switch" aria-checked={garden.autoWeather} aria-label="날씨 자동 변화" className={`toggle ${garden.autoWeather ? 'on' : ''}`} onClick={() => garden.setAutoWeather(!garden.autoWeather)}><span/></button><small>{garden.autoWeather ? '1분마다 바뀌어요' : '취향대로 골라보세요'}</small></div></section>
        <section className="touch-panel"><div className="touch-icon"><Hand size={23} strokeWidth={1.5}/></div><div className="touch-copy"><h3>조금 더 가까이, 다정한 손길</h3><p>정원 속 {garden.name}의 머리와 등을 살며시 만져보세요.</p></div><div className="touch-actions"><button onClick={() => pet('head')}><Heart size={15}/>머리 쓰다듬기</button><button onClick={() => pet('back')}><Hand size={15}/>등 쓰다듬기</button></div></section>
      </div><aside className="companion-column">
        <section className="profile-card"><div className="card-heading"><span className="small-section-label">YOUR LITTLE COMPANION</span><PawPrint size={16}/></div><div className="portrait-wrap"><span className="portrait-flower">✧</span><svg viewBox="0 0 190 150" className="cat-portrait" aria-label="치즈냥이 초상화"><circle cx="95" cy="75" r="66" fill="#f0e9d8"/><path d="M25 113Q80 97 153 115" stroke="#e2d9c2" fill="none"/><g transform="translate(93 113) scale(1.02)"><Cat behavior="pet-head" miniature/></g><path d="M148 36l3-7m3 12 7-1" stroke="#b8bd91" strokeWidth="2" strokeLinecap="round"/></svg><span className="online-badge"><span/>함께하는 중</span></div><div className="cat-title"><h2>{garden.name}</h2><button onClick={() => setModal('name')} aria-label="고양이 이름 바꾸기" className="edit-name"><Pencil size={12}/></button><span>치즈냥이</span></div><p className="cat-bio">햇살과 나비, 그리고 당신을 좋아해요.</p><div className="profile-divider"/><div className="stats"><StatBar icon={Sun} label="행복" value={garden.stats.happiness} color="#dfb66a"/><StatBar icon={Leaf} label="에너지" value={garden.stats.energy} color="#9caa7c"/><StatBar icon={Heart} label="친밀도" value={garden.stats.affection} color="#d8a390"/></div><button className="treat-button" disabled={!garden.treats || garden.paused} onClick={() => { if (garden.feed()) notify(`${garden.name}에게 작은 행복을 선물했어요!`); }}><Cookie size={18}/><span>{garden.treats ? '작은 간식 선물하기' : '오늘 간식은 충분해요'}</span><span className="treat-count">{garden.treats} / 3</span></button><p className="treat-hint">하루에 세 번, 작은 행복을 선물해요.</p></section>
        <section className="diary-card"><div className="section-heading"><h3><BookOpen size={16}/>{garden.name}의 오늘</h3><span className="day-badge">DAY 01</span></div><div className="daily-events">{garden.events.slice(0, 2).map(event => <div className="daily-event" key={event.id}><span className="event-dot"/><div><time>{event.time}</time><p>{event.text}</p></div></div>)}</div><button className="text-link" onClick={() => setModal('journal')}>작은 순간들 모아보기<ChevronRight size={14}/></button></section>
        <button className="behavior-card" onClick={() => setModal('behavior')}><div className="behavior-card-icon"><PawPrint size={23} strokeWidth={1.5}/></div><div><span>오늘은 무슨 생각을 할까?</span><p>고양이의 하루 들여다보기</p></div><ArrowUpRight size={16}/></button>
      </aside></div>
      <footer className="site-footer"><span className="footer-saying"><Leaf size={13}/>아무것도 하지 않아도, 함께라서 충분한 시간.</span><span>MADE FOR SLOW MOMENTS <span className="footer-heart">♡</span></span></footer>
    </main>
    {modal && <Modal type={modal} close={closeModal} garden={garden}/>}
    <div className={`toast ${toast ? 'visible' : ''}`} role="status"><Heart size={16}/>{toast}</div>
  </>;
}
