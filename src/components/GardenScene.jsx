import React, { useEffect, useRef, useState } from 'react';
import { Maximize, Minimize, Pause, Play, Clock3, Sun, Cloud, CloudRain, Snowflake, Sparkles } from 'lucide-react';
import Cat from './Cat.jsx';
import GardenArt from './GardenArt.jsx';
import { BEHAVIORS, WEATHER } from '../useGarden.js';

export const weatherIcons = { sunny: Sun, cloudy: Cloud, rainy: CloudRain, snowy: Snowflake };

function Butterfly({ x, y, color = '#edb975', delay = 0, active = false }) {
  return <g className={`butterfly ${active ? 'butterfly-close' : ''}`} style={{ '--delay': `${delay}s`, transformOrigin: `${x}px ${y}px` }}>
    <g transform={`translate(${x} ${y}) rotate(-15)`}>
      <g className="butterfly-wings"><path d="M0 0C-27-25-29 8-4 8C-22 20-8 29 0 7" fill={color}/><path d="M0 0C27-25 29 8 4 8C22 20 8 29 0 7" fill={color}/><path d="M-5-1-15-7M5-1 15-7" stroke="#fff9dc" strokeWidth="2"/></g>
      <path d="M0-3V13M0-3-3-7M0-3 4-7" stroke="#69694b" strokeWidth="1.4" fill="none" strokeLinecap="round"/>
    </g>
  </g>;
}

export default function GardenScene({ garden }) {
  const { cat, weather, paused, setPaused, touch, name, time } = garden;
  const scene = useRef(null);
  const [full, setFull] = useState(false);
  useEffect(() => {
    const update = () => setFull(document.fullscreenElement === scene.current);
    document.addEventListener('fullscreenchange', update);
    return () => document.removeEventListener('fullscreenchange', update);
  }, []);
  const WeatherIcon = weatherIcons[weather];
  const petting = cat.behavior.startsWith('pet-');
  async function fullscreen() {
    try { if (!document.fullscreenElement) { await scene.current.requestFullscreen(); setFull(true); } else { await document.exitFullscreen(); setFull(false); } } catch { setFull(value => !value); }
  }
  return <section className={`garden-card ${paused ? 'is-paused' : ''} ${full ? 'expanded' : ''}`} ref={scene} aria-label="고양이가 산책하는 작은 정원">
    <div className={`garden-stage weather-${weather}`}>
      <div className="garden-hud"><span className="garden-label"><span className="live-dot"/> 우리만의 작은 정원</span><span className="time-pill"><Clock3 size={14}/>{time}<span className="pill-divider"/><WeatherIcon size={16}/>{WEATHER[weather].temp}</span></div>
      <svg viewBox="0 0 1000 680" className="garden-svg" role="group" aria-label={`${WEATHER[weather].label} 날씨의 꽃과 나무가 있는 정원, ${name}: ${BEHAVIORS[cat.behavior]}`}>
        <title>치즈냥이 {name}의 작은 정원</title>
        <GardenArt weather={weather}/>
        <g className="ambient-petals" opacity={weather === 'rainy' ? 0.25 : 0.8}><ellipse cx="263" cy="318" rx="3" ry="5" fill="#f2db91"/><ellipse cx="734" cy="371" rx="2.5" ry="4.5" fill="#fff5d4"/><ellipse cx="388" cy="247" rx="3" ry="4" fill="#f2c6b0"/></g>
        <g opacity={weather === 'rainy' || weather === 'snowy' ? 0.25 : 1}>
          <Butterfly x={375} y={305} color="#edb483" delay={0}/><Butterfly x={712} y={335} color="#e6c975" delay={-3}/><Butterfly x={250} y={423} color="#f0c8ab" delay={-7}/>
        </g>
        {cat.behavior === 'butterfly' && <Butterfly x={cat.x + cat.facing * 48} y={cat.y - 114} color="#eac572" active/>}
        <g transform={`translate(${cat.x} ${cat.y})`}>
          <ellipse cx="0" cy="-1" rx="55" ry="10" fill="#4c653b" opacity=".14"/>
          {petting && <g className="pet-hearts" fill="#d88d7b"><path d="M-8-114C-22-126-28-105-8-96C12-105 6-126-8-114Z"/><path d="M28-131C18-139 13-126 28-119C42-126 38-139 28-131Z" transform="scale(.8)"/></g>}
          {cat.behavior === 'sleep' && <text className="sleep-z" x="50" y="-95" fill="#7b8c78" fontSize="17" fontFamily="Georgia,serif">z <tspan dy="-13" fontSize="22">z</tspan></text>}
          <g transform="scale(1.2)"><Cat behavior={cat.behavior === 'snack' ? 'sniff' : cat.behavior} facing={cat.facing} onHeadTouch={() => touch('head')} onBackTouch={() => touch('back')}/></g>
          {cat.behavior === 'snack' && <g transform={`translate(${cat.facing * 60},0)`}><ellipse rx="19" ry="7" fill="#b77956"/><path d="M-19-3H19L14 5H-14Z" fill="#d89468"/><g fill="#79533b"><circle cx="-6" cy="-4" r="3"/><circle cx="3" cy="-5" r="3"/><circle cx="9" cy="-2" r="3"/></g></g>}
          <g className="cat-name-tag" transform="translate(0 30)"><rect x={-Math.max(54, name.length * 13 + 20) / 2} y="-12" width={Math.max(54, name.length * 13 + 20)} height="24" rx="12" fill="#fffff5" fillOpacity=".9"/><text textAnchor="middle" y="4" fill="#686b50" fontSize="12" fontWeight="600">{name}</text></g>
        </g>
        {weather === 'rainy' && <g className="rain" stroke="#d5e5e4" strokeWidth="2" strokeLinecap="round">{Array.from({ length: 65 }, (_, i) => <line key={i} x1={(i * 137) % 1000} y1={(i * 83) % 680 - 100} x2={(i * 137) % 1000 - 9} y2={(i * 83) % 680 - 75} style={{ animationDelay: `${-i * .11}s` }}/>)}</g>}
        {weather === 'snowy' && <g className="snow" fill="#fffef9">{Array.from({ length: 55 }, (_, i) => <circle key={i} cx={(i * 139) % 1000} cy={(i * 97) % 680 - 30} r={2 + i % 3} style={{ animationDelay: `${-i * .38}s`, animationDuration: `${6 + i % 5}s` }}/>)}</g>}
      </svg>
      <div className="garden-bottom"><span className="scene-caption"><Sparkles size={14}/>{paused ? '잠시, 쉬어가는 중이에요' : BEHAVIORS[cat.behavior]}</span><div className="scene-tools"><button className="scene-icon" onClick={() => setPaused(!paused)} title={paused ? '시뮬레이션 재생' : '시뮬레이션 일시정지'} aria-label={paused ? '시뮬레이션 재생' : '시뮬레이션 일시정지'}>{paused ? <Play size={16}/> : <Pause size={16}/>}</button><button className="scene-icon" onClick={fullscreen} title="정원 크게 보기" aria-label="정원 크게 보기">{full ? <Minimize size={16}/> : <Maximize size={16}/>}</button></div></div>
    </div>
    <div className="garden-footnote"><span className="footnote-paw">✧</span><p>서두르지 않아도 괜찮아요. <span>{name}의 속도로 함께해요.</span></p><span className="garden-dimension">A LITTLE GARDEN, A LOT OF LOVE</span></div>
  </section>;
}
