import React from 'react';

const palette = { leaf: '#6e976b', darkLeaf: '#52795a', stem: '#789169', cream: '#fff5d8', yellow: '#efc875', pink: '#dd9a93' };

function Flower({ x, y, scale = 1, color = palette.cream, tilt = 0 }) {
  return <g transform={`translate(${x} ${y}) scale(${scale}) rotate(${tilt})`}>
    <path d="M0 0 Q-3 16 0 34" fill="none" stroke={palette.stem} strokeWidth="2" strokeLinecap="round" />
    <path d="M-1 24 Q-18 10 -15 23 Q-13 30 -1 28M0 20 Q15 6 13 19 Q11 25 0 26" fill={palette.leaf} />
    {[0, 72, 144, 216, 288].map(a => <ellipse key={a} cx="0" cy="-5.4" rx="4.2" ry="7" fill={color} transform={`rotate(${a})`} />)}
    <circle r="4" fill="#d7ab57" />
  </g>;
}

function Grass({ x, y, size = 1, color = '#84a57a' }) {
  return <g transform={`translate(${x} ${y}) scale(${size})`} fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round"><path d="M0 0 Q-2-9-7-14M1 0 Q4-13 9-19M1 0 Q1-14-1-19M3 0 Q10-7 13-8" /></g>;
}

function LeafPlant({ x, y, s = 1, color = '#6b936a' }) {
  return <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M0 0Q-29-10-24-34Q-3-34 0-5M0 0Q28-11 24-33Q4-34 0-5M0-4Q-15-27-3-50Q13-40 0-4" fill={color}/>
    <path d="M0 0L-17-25M0 0L17-24M0 0L-2-37" fill="none" stroke="#507751" strokeWidth="1.1" opacity=".55" />
  </g>;
}

function GardenArt({ weather = 'sunny' }) {
  const snowy = weather === 'snow' || weather === 'snowy';
  return <g className="garden-art">
    <defs>
      <linearGradient id="garden-sky" x1="0" x2="0" y1="0" y2="1"><stop stopColor="#eaf0df"/><stop offset="1" stopColor="#f4f1dd"/></linearGradient>
      <linearGradient id="garden-lawn" x1="0" y1="0" x2=".8" y2="1"><stop stopColor={snowy ? '#d9e4d5' : '#b8cf9f'}/><stop offset=".55" stopColor={snowy ? '#e5e9db' : '#c7d5a8'}/><stop offset="1" stopColor={snowy ? '#ebeddf' : '#d5dcb3'}/></linearGradient>
      <linearGradient id="garden-tree" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#89ac7d"/><stop offset="1" stopColor="#6a946c"/></linearGradient>
      <linearGradient id="garden-pot" x1="0" x2="1"><stop stopColor="#c78c70"/><stop offset=".6" stopColor="#dfa88b"/><stop offset="1" stopColor="#c98d73"/></linearGradient>
      <radialGradient id="garden-light"><stop stopColor="#fff5cf" stopOpacity=".7"/><stop offset="1" stopColor="#fff5cf" stopOpacity="0"/></radialGradient>
      <filter id="garden-shadow"><feGaussianBlur stdDeviation="5"/></filter>
    </defs>
    <path fill="url(#garden-sky)" d="M0 0H1000V680H0Z"/>
    <circle cx="708" cy="106" r="180" fill="url(#garden-light)"/>
    <path d="M0 190Q114 157 263 178T526 173T786 170T1000 157V360H0Z" fill="#c4d2b3" opacity=".65"/>
    <path d="M0 221Q160 179 295 211T567 199T807 204T1000 195V680H0Z" fill="url(#garden-lawn)"/>
    <g opacity=".55" fill="#b2c597"><ellipse cx="510" cy="371" rx="380" ry="58"/><ellipse cx="455" cy="565" rx="340" ry="57" fill="#d4dcb4"/></g>

    {/* A low, gently weathered garden fence. */}
    <g stroke="#c6bf9f" strokeWidth="1.3" strokeLinejoin="round">
      <path d="M32 184L963 166V178L32 197Z M32 232L963 214V226L32 245Z" fill="#dbd6ba"/>
      {Array.from({length: 29}, (_, i) => {
        const x = 30 + i*33; const y = 158-i*.6;
        return <g key={i}><path d={`M${x} ${y+14}L${x+9} ${y}L${x+18} ${y+13}V${y+108}H${x}Z`} fill={i%3 ? '#eee8cf' : '#e6e0c5'}/><path d={`M${x+13} ${y+24}V${y+98}`} stroke="#fff9df" opacity=".55"/><circle cx={x+5} cy={y+37} r="1.1" fill="#b7af91" stroke="none"/></g>;
      })}
      <path d="M25 179L11 170L-2 179V300L25 292Z" fill="#e7dfc0"/>
    </g>
    <path d="M0 271Q85 245 167 265T337 262Q414 266 458 255Q562 240 631 255T791 242T1000 238V275Q840 277 738 266T532 275T310 281T119 283T0 296Z" fill="#a0bd8b"/>
    <g fill="#83a57a">
      <path d="M745 249C718 242 725 215 748 217C746 185 788 188 791 213C809 184 847 198 847 221C884 206 897 239 880 253Z"/>
      <path d="M902 252C879 237 887 208 912 214C915 184 949 186 959 207C981 191 1010 201 1020 231V274Z" fill="#9cba85"/>
    </g>
    <g opacity=".75" fill="#dce6bd"><circle cx="766" cy="224" r="3"/><circle cx="803" cy="214" r="2.7"/><circle cx="848" cy="237" r="3.2"/><circle cx="926" cy="221" r="3"/><circle cx="951" cy="234" r="2.5"/></g>

    {/* Leafy old apple tree and the soft shade below it. */}
    <ellipse cx="173" cy="354" rx="148" ry="27" fill="#688766" opacity=".12" filter="url(#garden-shadow)"/>
    <path d="M137 344Q154 295 147 204L143 137L165 139Q159 246 181 342Q163 352 137 344Z" fill="#a98666"/>
    <path d="M158 256Q182 216 201 191M153 213Q126 192 110 163" fill="none" stroke="#a98666" strokeWidth="13" strokeLinecap="round"/>
    <path d="M149 336Q161 275 152 190M164 271L184 227" fill="none" stroke="#8a735c" strokeWidth="2" opacity=".5"/>
    <path d="M39 176C9 151 25 108 56 102C30 70 62 33 101 42C115 7 166 16 182 43C225 15 267 50 258 84C300 90 311 134 282 159C293 193 258 223 225 209C200 237 155 220 148 205C106 232 71 218 70 196C53 199 42 190 39 176Z" fill="url(#garden-tree)"/>
    <path d="M50 108C60 77 83 76 110 83C105 52 141 38 165 52C186 33 225 51 230 78C252 77 278 94 275 116C250 100 223 115 205 110C187 129 154 126 144 109C116 130 84 120 78 108Z" fill="#9cba88" opacity=".75"/>
    <path d="M39 159Q67 173 88 159M90 198Q119 204 137 185M162 193Q186 211 207 191M218 162Q245 180 263 156" stroke="#527d5d" strokeWidth="2" strokeLinecap="round" opacity=".4" fill="none"/>
    <g fill="#b8cc98" opacity=".75"><ellipse cx="74" cy="103" rx="4" ry="8" transform="rotate(-35 74 103)"/><ellipse cx="129" cy="62" rx="4" ry="8" transform="rotate(35 129 62)"/><ellipse cx="221" cy="86" rx="4" ry="8" transform="rotate(35 221 86)"/><ellipse cx="184" cy="151" rx="4" ry="8" transform="rotate(-35 184 151)"/><ellipse cx="88" cy="158" rx="4" ry="8" transform="rotate(-55 88 158)"/></g>
    <g fill="#dcaa79"><circle cx="101" cy="141" r="6"/><circle cx="233" cy="137" r="6"/><circle cx="172" cy="84" r="5.5"/></g>
    <path d="M100 135l2-4m130 1 2-4m-63-50 1-4" stroke="#607d52" strokeWidth="1.7" strokeLinecap="round"/>
    <LeafPlant x={133} y={354} s={.75}/><LeafPlant x={195} y={351} s={.6} color="#8aab78"/>

    {/* The little stepping stones wind through the planting. */}
    <g fill="#e6dfc5" stroke="#c7c5a4" strokeWidth="1.4">
      <path d="M710 268Q734 252 762 264L769 278Q747 290 720 285Z"/>
      <path d="M751 317Q780 299 809 313L813 330Q788 344 756 338Z"/>
      <path d="M783 380Q817 362 849 379L854 400Q823 414 786 405Z"/>
      <path d="M800 456Q836 438 876 456L880 480Q840 494 803 483Z"/>
      <path d="M813 547Q853 528 898 548L902 573Q857 590 815 575Z"/>
      <path d="M829 650Q871 630 923 652L931 680H832Z"/>
    </g>
    <g stroke="#f8f0d8" strokeWidth="2" fill="none" opacity=".75"><path d="M720 270Q739 263 754 270M760 319Q781 311 800 318M795 381Q818 374 838 382M814 459Q841 450 865 459M826 550Q855 541 884 551"/></g>

    {/* Small raised beds and lush flowering borders. */}
    <path d="M0 351Q80 316 163 346Q199 366 220 420Q151 444 87 429L0 440Z" fill="#9fb88c"/>
    <path d="M0 423Q111 403 215 422L206 438Q92 429 0 450Z" fill="#b5b69a"/>
    <path d="M-14 378Q11 348 41 361Q40 327 71 329Q91 315 111 343Q137 331 151 352Q176 347 181 380L177 408Q84 421-14 409Z" fill="#789e72"/>
    <LeafPlant x={43} y={413} s={1.2} color="#567e60"/><LeafPlant x={128} y={414} s={1.25} color="#8ca879"/>
    <Flower x={34} y={346} scale={.9} color="#e7b29a" tilt={-12}/><Flower x={68} y={330} scale={1.1} color="#f3d080"/><Flower x={100} y={350} scale={.9} color="#fff1cd" tilt={15}/><Flower x={145} y={366} scale={1.05} color="#df9c91" tilt={-12}/><Flower x={171} y={385} scale={.65} color="#f4d58c"/>
    <g fill="#f2ddab"><circle cx="15" cy="382" r="3"/><circle cx="85" cy="375" r="3.5"/><circle cx="116" cy="384" r="3"/><circle cx="151" cy="402" r="2.8"/></g>

    <ellipse cx="922" cy="377" rx="67" ry="12" fill="#76936e" opacity=".15"/>
    <path d="M881 316L892 372Q919 388 949 372L961 316Z" fill="url(#garden-pot)" stroke="#b98066" strokeWidth="1.3"/>
    <path d="M878 311Q918 301 964 311L962 323Q920 331 880 324Z" fill="#dcab8b" stroke="#bd896b" strokeWidth="1.3"/>
    <ellipse cx="921" cy="312" rx="38" ry="7" fill="#8b7d5b"/>
    <LeafPlant x={909} y={312} s={1.3} color="#70986c"/><LeafPlant x={937} y={314} s={.95} color="#89a778"/>
    <Flower x={903} y={255} color="#f5cf83" scale={1.1} tilt={-10}/><Flower x={937} y={264} color="#fff3d5" scale={1.25} tilt={12}/><Flower x={922} y={244} color="#e4a495" scale={.85}/>

    {/* A tiny watering can, waiting in the shade. */}
    <g transform="translate(258 295) rotate(-8)"><path d="M-12-8Q-25-28-32-12Q-38 2-20 9" fill="none" stroke="#8caaa1" strokeWidth="6"/><path d="M-16-11L13-11L17 20Q0 27-19 17Z" fill="#9eb9ae" stroke="#7e9b8e" strokeWidth="1.4"/><path d="M12 5L35-11L38-6L16 17Z" fill="#9eb9ae" stroke="#7e9b8e" strokeWidth="1.4"/><path d="M34-13L42-6" stroke="#8ea99d" strokeWidth="5" strokeLinecap="round"/><path d="M-12-3L8-3" stroke="#c2d1bc" strokeWidth="2"/></g>

    {/* Grasses and loose meadow flowers keep the open lawn alive. */}
    {[[308,322,.7],[394,264,.65],[523,301,.75],[652,287,.7],[706,392,.8],[303,459,1],[624,492,.7],[436,553,.85],[693,587,.9],[266,595,.75],[524,643,.85],[970,435,1.1],[917,489,.8],[72,510,1],[166,556,1],[333,390,.5],[579,390,.5]].map(([x,y,s], i) => <Grass key={i} x={x} y={y} size={s}/>)}
    <Flower x={320} y={274} scale={.48}/><Flower x={691} y={330} scale={.5} color="#f0d080"/><Flower x={226} y={501} scale={.58}/><Flower x={676} y={527} scale={.55}/><Flower x={952} y={450} scale={.7} color="#e8b1a2"/>
    <g fill="#a6ba87" opacity=".75"><ellipse cx="380" cy="430" rx="3" ry="1.5"/><ellipse cx="591" cy="340" rx="3" ry="1.5"/><ellipse cx="554" cy="549" rx="3" ry="1.5"/><ellipse cx="343" cy="551" rx="2" ry="1.5"/><ellipse cx="709" cy="451" rx="3" ry="1.5"/><ellipse cx="461" cy="330" rx="2" ry="1.5"/></g>

    {/* Foreground flowers create a natural frame, leaving room for the cat. */}
    <path d="M-20 638Q37 585 92 617Q111 580 156 604Q205 589 228 630Q256 625 281 680H-20Z" fill="#93af7f"/>
    <LeafPlant x={35} y={680} s={1.55} color="#658e63"/><LeafPlant x={118} y={680} s={1.6} color="#779b6c"/><LeafPlant x={218} y={691} s={1.5} color="#779c6c"/>
    <Flower x={53} y={603} color="#f4d69c" scale={1.2} tilt={-15}/><Flower x={98} y={627} color="#fff2d5" scale={1.05} tilt={9}/><Flower x={163} y={612} color="#e0a18f" scale={1.35} tilt={10}/><Flower x={196} y={647} color="#f6d487" scale={.9} tilt={-15}/>
    <path d="M1000 561Q963 535 951 572Q920 557 907 595Q885 602 895 635Q869 659 881 680H1000Z" fill="#91ad7e"/>
    <LeafPlant x={969} y={664} s={1.6} color="#6d956a"/><LeafPlant x={911} y={680} s={1.25} color="#6d9268"/>
    <Flower x={969} y={567} color="#fff1d1" scale={1.05}/><Flower x={923} y={618} color="#e4aa96" scale={1.1} tilt={-10}/>
  </g>;
}

export default React.memo(GardenArt);
