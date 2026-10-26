import React, { useId } from 'react';
import './Cat.css';

/** SVG cat. The origin is on the ground, directly below the middle of its body. */
export default function Cat({ behavior = 'walk', facing = 1, onHeadTouch, onBackTouch, miniature = false }) {
  const id = `cat-${useId().replace(/:/g, '')}`;
  const asleep = behavior === 'sleep';
  const petHead = behavior === 'pet-head';
  const petBack = behavior === 'pet-back';
  const closedEyes = asleep || petHead || behavior === 'groom' || behavior === 'paw';
  const headPose = asleep ? 'translate(0,10)' : behavior === 'sniff' ? 'translate(8,14) rotate(12 28 -40)' : petHead ? 'translate(-1,-7) rotate(-9 28 -40)' : behavior === 'groom' ? 'translate(-14,5) rotate(29 28 -40)' : behavior === 'stretch' ? 'translate(12,17)' : '';
  const bodyPose = petBack ? 'rotate(12 24 -17)' : behavior === 'stretch' ? 'translate(-3,0) scale(1.13,1)' : '';
  const tailPath = petBack ? 'M-43-30 C-55-47-50-67-53-79' : asleep ? 'M-39-20 C-54-8-47 1-27-1' : 'M-43-30 C-61-31-71-44-68-59 C-65-70-56-65-59-57';
  const activate = (callback) => (event) => { event.stopPropagation(); callback?.(event); };
  const keyActivate = (callback) => (event) => {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); event.stopPropagation(); callback?.(event); }
  };

  return (
    <g className={`garden-cat cat-is-${behavior}${miniature ? ' cat-miniature' : ''}`} transform={`scale(${facing < 0 ? -1 : 1},1)`}>
      <defs>
        <linearGradient id={`${id}-coat`} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor="#f8bc69" />
          <stop offset="1" stopColor="#e99647" />
        </linearGradient>
        <linearGradient id={`${id}-face`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffc97e" />
          <stop offset="1" stopColor="#f2ab58" />
        </linearGradient>
      </defs>
      <ellipse className="cat-ground-shadow" cx="-5" cy="2" rx={asleep ? 45 : 48} ry="6" fill="#536b3b" opacity=".15" />
      <g className="cat-breathe">
        <g className="cat-tail">
          <path d={tailPath} fill="none" stroke="#ad713e" strokeWidth="14" strokeLinecap="round" />
          <path d={tailPath} fill="none" stroke="#edaa55" strokeWidth="10" strokeLinecap="round" />
          {!asleep && <path d={petBack ? 'M-54-69 l6-1 M-54-59 l6-1 M-55-48 l7-2' : 'M-67-58 l7 2 M-68-47 l7-1 M-62-37 l4-6'} stroke="#cf8740" strokeWidth="4" strokeLinecap="round" />}
        </g>

        <g transform={bodyPose}>
          {!asleep && <g className="cat-rear-leg">
            <path d="M-35-25 Q-42-15-38-2 Q-29 3-23-2 L-18-22" fill="#dd9549" stroke="#b97b44" strokeWidth="1.6" />
            <path d="M-32-1 v-5 M-28-1 v-5" stroke="#b97b44" strokeWidth="1" />
          </g>}
          <path d={asleep ? 'M-48-17 C-49-36-35-45-17-44 C4-44 23-29 28-11 Q24 1 8 1 H-31 Q-46 0-48-17Z' : 'M-45-26 C-47-47-27-53-7-47 C9-47 25-34 25-19 Q22-5 5-8 L-22-9 Q-43-7-45-26Z'} fill={`url(#${id}-coat)`} stroke="#b77b45" strokeWidth="1.8" />
          <path d="M-28-44 Q-21-36-24-31 M-14-46 Q-7-39-10-32 M0-42 Q7-35 4-29" stroke="#d78c3e" strokeWidth="5" fill="none" strokeLinecap="round" />
          {!asleep && <path d="M-38-23 Q-34-27-30-22 M-36-17 l6-1" stroke="#d48b3e" strokeWidth="3" fill="none" strokeLinecap="round" />}
          {!asleep && <g className="cat-near-rear-leg">
            <path d="M-28-25 Q-34-13-28-1 Q-20 3-13-1 L-12-21" fill="#efaa55" stroke="#b77b45" strokeWidth="1.6" />
            <path d="M-23-1 v-4 M-19 0 v-5" stroke="#b77b45" strokeWidth="1" />
          </g>}
          <path d={asleep ? 'M4-26 Q18-29 26-16 L27-4 Q14 2 2-2Z' : 'M10-35 Q27-36 29-19 L25-4 Q18 1 10-6 L8-20Z'} fill="#fff0ce" opacity=".95" />
        </g>

        {!asleep && behavior !== 'butterfly' && behavior !== 'paw' && <g className="cat-front-leg cat-far-front-leg">
          <path d={behavior === 'stretch' ? 'M16-19 L42-3 Q45 2 35 2 L11-7' : 'M21-22 L25-4 Q25 2 15 1 L12-22'} fill="#e9a455" stroke="#b77b45" strokeWidth="1.5" />
        </g>}

        <g className="cat-head-wrapper" transform={headPose}>
          <g className="cat-head">
            <path d="M7-52 L5-77 Q7-80 11-77 L28-64 M35-66 L50-77 Q54-79 54-73 L52-51" fill="#f4b465" stroke="#b77b45" strokeWidth="1.8" strokeLinejoin="round" />
            <path d="M10-72 L13-57 L24-63Z M49-72 L38-63 L50-57Z" fill="#e6a09a" />
            <path d="M5-54 Q8-68 29-68 Q51-68 56-51 Q61-36 50-25 Q40-18 25-21 Q7-22 3-35 Q-1-43 5-54Z" fill={`url(#${id}-face)`} stroke="#b77b45" strokeWidth="1.8" />
            <path d="M23-66 l4 8 4-7 4 8 4-8" fill="none" stroke="#d88c40" strokeWidth="3.8" strokeLinejoin="round" strokeLinecap="round" />
            <path d="M5-51 l8 2 M4-44 l8 1 M52-52 l-6 3 M56-45 l-8 2" stroke="#d68a40" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M14-36 Q19-43 29-36 Q39-42 48-35 Q47-22 30-22 Q16-22 14-36Z" fill="#fff0cf" />
            {closedEyes ? <g fill="none" stroke="#755339" strokeWidth="2.1" strokeLinecap="round">
              <path d={petHead ? 'M14-43 Q19-49 24-44' : 'M14-45 Q19-41 24-45'} />
              <path d={petHead ? 'M36-44 Q41-49 46-44' : 'M36-45 Q41-41 46-45'} />
            </g> : <g>
              <ellipse cx="20" cy="-45" rx="3" ry="4.5" fill="#67523b" /><ellipse cx="41" cy="-45" rx="3" ry="4.5" fill="#67523b" />
              <circle cx="21" cy="-47" r="1" fill="#fff7df" /><circle cx="42" cy="-47" r="1" fill="#fff7df" />
            </g>}
            <path d="M27-36 Q30-38 33-36 L30-33Z" fill="#c98078" />
            <path d="M30-33 v3 M24-30 Q27-27 30-30 Q33-27 36-30" fill="none" stroke="#9c7552" strokeWidth="1.1" strokeLinecap="round" />
            {(behavior === 'groom' || behavior === 'paw') && <path className="cat-tongue" d="M29-28 Q27-20 32-21 Q35-22 33-28" fill="#e6a09a" />}
            <g stroke="#8e7757" strokeWidth=".9" strokeLinecap="round" opacity=".8">
              <path d="M14-34 l-15-2 M13-30 l-16 2 M47-34 l16-3 M47-30 l17 2" />
            </g>
            <ellipse cx="11" cy="-36" rx="4" ry="2" fill="#ec9f7a" opacity=".5" /><ellipse cx="49" cy="-36" rx="4" ry="2" fill="#ec9f7a" opacity=".5" />
          </g>
        </g>

        {!asleep && <g className="cat-front-leg cat-near-front-leg">
          <path d={behavior === 'butterfly' ? 'M16-24 Q14-45 25-53 Q32-57 34-50 Q31-42 28-29 L27-20' : behavior === 'paw' ? 'M15-23 Q23-39 32-34 Q37-28 29-24 L22-15' : behavior === 'stretch' ? 'M12-21 L38-4 Q46-2 43 2 H33 L9-9' : 'M11-24 L10-5 Q7 2 17 2 Q23 2 23-4 L25-23'} fill="#f4b665" stroke="#b77b45" strokeWidth="1.6" strokeLinejoin="round" />
          {behavior !== 'butterfly' && behavior !== 'paw' && <path d={behavior === 'stretch' ? 'M36 1 v-4 M40 1 v-3' : 'M14 1 v-4 M18 1 v-4'} stroke="#b77b45" strokeWidth="1" />}
        </g>}
        {asleep && <path d="M-20-1 Q-13-4-7 0 M-3 0 Q3-3 9 0" fill="none" stroke="#c5955e" strokeWidth="1.4" />}
      </g>

      {!miniature && <>
        <ellipse className="cat-touch-zone cat-back-touch" cx="-18" cy="-35" rx="27" ry="20" fill="transparent" role="button" aria-label="고양이 등 쓰다듬기" tabIndex={0} onClick={activate(onBackTouch)} onKeyDown={keyActivate(onBackTouch)}><title>등을 쓰다듬어 주세요</title></ellipse>
        <ellipse className="cat-touch-zone cat-head-touch" cx="31" cy={asleep ? -36 : -47} rx="28" ry="29" fill="transparent" role="button" aria-label="고양이 머리 쓰다듬기" tabIndex={0} onClick={activate(onHeadTouch)} onKeyDown={keyActivate(onHeadTouch)}><title>머리를 쓰다듬어 주세요</title></ellipse>
      </>}
      {asleep && <g className="cat-sleep-symbol" fill="#748567" fontFamily="Georgia, serif" fontStyle="italic"><text x="52" y="-63" fontSize="14">z</text><text x="63" y="-77" fontSize="11">z</text></g>}
      {petHead && <path className="cat-love-heart" d="M34-91 C28-100 17-91 34-80 C51-91 40-100 34-91Z" fill="#e5998b" />}
    </g>
  );
}
