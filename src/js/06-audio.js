'use strict';
/* ===== Goldfuchs audio v3: stereo band with FM piano, strings, brass section, 808 metals, delay/reverb; 16-bar A/B songs; casino SFX ===== */
const mvol=()=>typeof S!=='undefined'&&S.vol!=null?S.vol:1;
let AC=null;const MU={theme:'lobby',step:0,next:0,timer:null,want:'lobby',tension:false};
function buildGraph(a){const g={};g.out=a.createDynamicsCompressor();g.out.threshold.value=-12;g.out.ratio.value=3.5;g.out.attack.value=.004;g.out.release.value=.18;g.out.connect(a.destination);
 g.mbus=a.createGain();g.mbus.gain.value=.38*mvol();g.mbus.connect(g.out);g.sbus=a.createGain();g.sbus.gain.value=.9;g.sbus.connect(g.out);
 const len=Math.floor(a.sampleRate*2.6),b=a.createBuffer(2,len,a.sampleRate);for(let c=0;c<2;c++){const d=b.getChannelData(c);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,3.2)*(i<a.sampleRate*.01?i/(a.sampleRate*.01):1)}
 g.rev=a.createConvolver();g.rev.buffer=b;const rg=a.createGain();rg.gain.value=.28;g.rev.connect(rg);rg.connect(g.out);
 g.dly=a.createDelay(1);g.dly.delayTime.value=.36;const fb=a.createGain();fb.gain.value=.32;const dl=a.createBiquadFilter();dl.type='lowpass';dl.frequency.value=2600;const dp=a.createStereoPanner?a.createStereoPanner():null;
 g.dly.connect(dl);dl.connect(fb);fb.connect(g.dly);const dw=a.createGain();dw.gain.value=.2;if(dp){dp.pan.value=.45;dl.connect(dp);dp.connect(dw)}else dl.connect(dw);dw.connect(g.out);
 const nb=a.createBuffer(1,a.sampleRate,a.sampleRate),nd=nb.getChannelData(0);for(let i=0;i<nd.length;i++)nd[i]=Math.random()*2-1;g.noise=nb;
 const mb=a.createBuffer(1,a.sampleRate,a.sampleRate),md=mb.getChannelData(0),fr=[2,3,4.16,5.43,6.79,8.21].map(r=>40*r*7.4);for(let i=0;i<md.length;i++){let v=0;for(const f of fr)v+=((i*f/a.sampleRate)%1<.5?1:-1);md[i]=v/6}g.metal=mb;g.pans=new Map();
 const ws=a.createWaveShaper(),cv=new Float32Array(1024);for(let i=0;i<1024;i++){const x=i/512-1;cv[i]=Math.tanh(x*3.5)}ws.curve=cv;g.dist=ws;const dg=a.createGain();dg.gain.value=.42;const dlp=a.createBiquadFilter();dlp.type='lowpass';dlp.frequency.value=3800;ws.connect(dlp);dlp.connect(dg);dg.connect(g.mbus);return g}
let GR=null,CX=null;
function ac(){if(!AC){try{AC=new(window.AudioContext||window.webkitAudioContext)()}catch(e){return null}GR=buildGraph(AC);CX=AC}if(AC.state==='suspended')AC.resume().catch(()=>{});return AC}
function panNode(dest,p){if(!p||!CX.createStereoPanner)return dest;const q=Math.round(p*10)/10;if(!q)return dest;let m=GR.pans.get(dest);if(!m){m=new Map();GR.pans.set(dest,m)}let n=m.get(q);if(!n){n=CX.createStereoPanner();n.pan.value=q;n.connect(dest);m.set(q,n)}return n}
/* ---- voices ---- */
function vo(type,f,t,d,v,dest,o){o=o||{};const a=CX,os=a.createOscillator(),g=a.createGain();os.type=type;os.frequency.setValueAtTime(f,t);if(o.f2)os.frequency.exponentialRampToValueAtTime(o.f2,t+(o.ft||d));if(o.det)os.detune.value=o.det;
 if(o.vib){const l=a.createOscillator(),lg=a.createGain();l.frequency.value=o.vib;lg.gain.setValueAtTime(0,t);lg.gain.linearRampToValueAtTime(f*(o.vd||.012),t+(o.vt||.25));l.connect(lg);lg.connect(os.frequency);l.start(t);l.stop(t+d+.1)}
 const at=o.a||.005;g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(v,t+at);if(o.sus)g.gain.setValueAtTime(v,t+Math.max(at,d-o.sus));g.gain.exponentialRampToValueAtTime(.0001,t+d);
 let n=os;if(o.lp){const fl=a.createBiquadFilter();fl.type='lowpass';fl.Q.value=o.q||.8;fl.frequency.setValueAtTime(o.lp,t);if(o.lp2)fl.frequency.exponentialRampToValueAtTime(o.lp2,t+(o.lt||d));os.connect(fl);n=fl}
 if(o.hp){const fh=a.createBiquadFilter();fh.type='highpass';fh.frequency.value=o.hp;n.connect(fh);n=fh}
 n.connect(g);g.connect(panNode(dest,o.pan));if(o.rev){const s=a.createGain();s.gain.value=o.rev;g.connect(s);s.connect(GR.rev)}if(o.dl){const s=a.createGain();s.gain.value=o.dl;g.connect(s);s.connect(GR.dly)}os.start(t);os.stop(t+d+.05);return os}
function fm(f,t,d,v,dest,o){o=o||{};const a=CX,c=a.createOscillator(),m=a.createOscillator(),mg=a.createGain(),g=a.createGain();c.frequency.value=f;m.frequency.value=f*(o.ratio||1);mg.gain.setValueAtTime(f*(o.idx||2.2),t);mg.gain.exponentialRampToValueAtTime(f*.05,t+(o.it||.6));
 m.connect(mg);mg.connect(c.frequency);g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(v,t+.004);g.gain.exponentialRampToValueAtTime(.0001,t+d);c.connect(g);g.connect(panNode(dest,o.pan));if(o.rev){const s=a.createGain();s.gain.value=o.rev;g.connect(s);s.connect(GR.rev)}
 c.start(t);m.start(t);c.stop(t+d+.05);m.stop(t+d+.05)}
function nz(t,d,v,dest,type,fq,q,o){o=o||{};const a=CX,s=a.createBufferSource(),f=a.createBiquadFilter(),g=a.createGain();s.buffer=GR.noise;s.loop=true;f.type=type;f.frequency.setValueAtTime(fq,t);if(o.f2)f.frequency.exponentialRampToValueAtTime(o.f2,t+d);f.Q.value=q||1;
 g.gain.setValueAtTime(o.a?.0001:v,t);if(o.a)g.gain.linearRampToValueAtTime(v,t+o.a);g.gain.exponentialRampToValueAtTime(.0001,t+d);s.connect(f);f.connect(g);g.connect(panNode(dest,o.pan));if(o.rev){const r=a.createGain();r.gain.value=o.rev;g.connect(r);r.connect(GR.rev)}s.start(t,Math.random()*.5);s.stop(t+d+.05)}
function metal(t,d,v,dest,hp,pan){const a=CX,s=a.createBufferSource(),g=a.createGain(),f=a.createBiquadFilter();s.buffer=GR.metal;s.loop=true;f.type='highpass';f.frequency.value=hp;f.Q.value=.7;g.gain.setValueAtTime(v*1.6,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);s.connect(f);f.connect(g);g.connect(panNode(dest,pan));s.start(t,Math.random()*.8);s.stop(t+d+.02)}
const mf=m=>440*Math.pow(2,(m-69)/12);
const INST={
 ep(t,m,d,v,B){fm(mf(m),t,Math.max(.6,d*1.2),v*.42,B,{ratio:1,idx:1.6,it:.5,pan:-.25,rev:.25});fm(mf(m)*2,t,.35,v*.08,B,{ratio:3.5,idx:.6,it:.2,pan:-.25})},
 piano(t,m,d,v,B){INST.ep(t,m,d,v,B)},
 brass(t,m,d,v,B){const f=mf(m);[-8,8].forEach((dt,i)=>vo('sawtooth',f,t,d+.1,v*.45,B,{a:.04,lp:650,lp2:3200,lt:.12,rev:.3,det:dt,sus:.07,pan:i?.2:-.2}))},
 trumpet(t,m,d,v,B){const f=mf(m);vo('sawtooth',f,t,d+.12,v*.55,B,{a:.035,lp:1000,lp2:2600,lt:.1,rev:.35,dl:.25,vib:5.5,vt:.3,sus:.08});vo('square',f,t,d+.12,v*.12,B,{a:.035,lp:1800})},
 mallet(t,m,d,v,B){const f=mf(m);vo('sine',f,t,.6,v*.8,B,{rev:.35,dl:.18});vo('sine',f*4,t,.07,v*.3,B);vo('triangle',f*2,t,.2,v*.18,B)},
 lead(t,m,d,v,B){const f=mf(m);vo('square',f,t,d+.06,v*.26,B,{a:.008,lp:2800,rev:.4,dl:.3,vib:6,sus:.05,pan:-.1});vo('sawtooth',f*1.004,t,d+.06,v*.2,B,{a:.008,lp:3400,sus:.05,pan:.1})},
 whistle(t,m,d,v,B){const f=mf(m);vo('sine',f,t,d+.18,v*.8,B,{a:.05,rev:.55,dl:.35,vib:5,vt:.35,sus:.12});vo('sine',f*2,t,d+.12,v*.05,B,{a:.05})},
 pluck(t,m,d,v,B){const f=mf(m);vo('sawtooth',f,t,.5,v*.45,B,{lp:3600,lp2:420,lt:.18,rev:.2,pan:.3});vo('triangle',f*2,t,.25,v*.12,B,{pan:.3})},
 banjo(t,m,d,v,B){const f=mf(m);vo('square',f,t,.32,v*.3,B,{lp:4200,lp2:900,lt:.08,pan:.35});vo('triangle',f*2,t,.18,v*.15,B,{pan:.35})},
 dlead(t,m,d,v,B){const f=mf(m);vo('sawtooth',f,t,d+.1,v*.5,GR.dist,{a:.01,vib:5.5,sus:.06,lp:3200,dl:.2});vo('sawtooth',f*1.005,t,d+.1,v*.3,GR.dist,{a:.01,sus:.06,lp:2400})},
 bass(t,m,d,v,B){const f=mf(m);vo('sawtooth',f,t,d,v*.5,B,{lp:640,lp2:150,lt:.15,sus:.04});vo('sine',f,t,d,v*.7,B,{sus:.04})},
 ubass(t,m,d,v,B){const f=mf(m);vo('triangle',f,t,d,v*.9,B,{lp:900,sus:.03});vo('sine',f*2,t,.07,v*.15,B)},
 stab(t,m,d,v,B){INST.brass(t,m,.18,v*.9,B)},
 organ(t,m,d,v,B){const f=mf(m);[1,2,3,4].forEach((h,i)=>vo('sine',f*h,t,d+.05,v*[.36,.2,.12,.06][i],B,{a:.01,sus:.04,rev:.22,vib:6.5,vd:.004}))},
 power(t,m,d,v,B){const f=mf(m);[1,1.498,2].forEach((h,i)=>vo('sawtooth',f*h,t,d+.05,v*.28,GR.dist,{lp:2400,sus:.04,pan:(i-1)*.3}))},
 sq(t,m,d,v,B){vo('square',mf(m),t,.16,v*.22,B,{lp:3600,lp2:1100,rev:.3,dl:.3,pan:.35})},
 strings(t,m,d,v,B){const f=mf(m);[-11,10].forEach((dt,i)=>vo('sawtooth',f,t,d+.3,v*.22,B,{a:Math.min(.4,d*.3),lp:1800,rev:.45,det:dt,sus:.25,pan:i?.45:-.45}))},
 bell(t,m,d,v,B){const f=mf(m);vo('sine',f,t,1.2,v*.5,B,{rev:.5,dl:.2});vo('sine',f*2.76,t,.4,v*.18,B);vo('sine',f*5.4,t,.12,v*.08,B)}};
const DR={
 k(t,v,B){vo('sine',165,t,.32,1*v,B,{f2:42,ft:.11});vo('triangle',110,t,.05,.3*v,B,{f2:60});nz(t,.01,.3*v,B,'highpass',2500)},
 s(t,v,B){nz(t,.18,.34*v,B,'bandpass',2100,.6,{rev:.22});vo('triangle',200,t,.11,.26*v,B,{f2:150});nz(t,.05,.2*v,B,'highpass',5000)},
 c(t,v,B){[0,.012,.026].forEach(o=>nz(t+o,.1,.26*v,B,'bandpass',1500,1.1,{rev:.3,pan:.1}))},
 b(t,v,B){nz(t,.12,.14*v,B,'bandpass',2600,.5,{pan:-.2})},
 h(t,v,B){metal(t,.045,.07*v,B,7000,.3)},o(t,v,B){metal(t,.24,.06*v,B,6500,.3)},
 sh(t,v,B){nz(t,.06,.07*v,B,'bandpass',7000,1.3,{pan:-.35})},r(t,v,B){metal(t,.45,.045*v,B,5000,-.25)},
 t(t,v,B){vo('sine',150,t,.34,.6*v,B,{f2:90,pan:-.3});nz(t,.04,.08*v,B,'lowpass',1200)},T(t,v,B){vo('sine',98,t,.4,.62*v,B,{f2:62,pan:.3})},
 cr(t,v,B){metal(t,1.8,.07*v,B,4200,.2);nz(t,1.5,.08*v,B,'highpass',6000,1,{rev:.4})},
 tim(t,v,B){vo('sine',98,t,.9,.6*v,B,{f2:82});vo('sine',196,t,.4,.15*v,B);nz(t,.1,.12*v,B,'lowpass',600)}};
/* ---- composition ---- */
const NN={C:0,D:2,E:4,F:5,G:7,A:9,B:11};
function nm(s){const m=/^([A-G])([#b]?)(-?\d)$/.exec(s);return 12*(+m[3]+1)+NN[m[1]]+(m[2]==='#'?1:m[2]==='b'?-1:0)}
function chordNotes(ch){const m=/^([A-G][#b]?)(.*)$/.exec(ch),r=(NN[m[1][0]]+(m[1][1]==='#'?1:m[1][1]==='b'?-1:0)+12)%12,q=m[2];
 const iv=q==='m'?[0,3,7]:q==='m7'?[0,3,7,10]:q==='7'?[0,4,7,10]:q==='maj7'?[0,4,7,11]:q==='dim'?[0,3,6]:q==='sus'?[0,5,7]:[0,4,7];return{r,iv}}
function voice(ch,base){base=base||60;const{r,iv}=chordNotes(ch);return iv.map(i=>{let n=base+((r+i)%12);if(n>base+7)n-=12;return n}).sort((a,b)=>a-b)}
function mel(str,tr){tr=tr||0;return str.split('|').map(b=>b.trim()?b.trim().split(/\s+/).map(e=>{const p=e.split(':');return[nm(p[0])+tr,+p[1],+p[2]]}):[])}
function trChords(cs,n){if(!n)return cs;const names=['C','C#','D','Eb','E','F','F#','G','Ab','A','Bb','B'];return cs.map(c=>{const m=/^([A-G][#b]?)(.*)$/.exec(c),r=(NN[m[1][0]]+(m[1][1]==='#'?1:m[1][1]==='b'?-1:0)+n+24)%12;return names[r]+m[2]})}
const MEL={
 lobbyA:'A4:0:2 C5:2:2 F5:4:3 E5:7:1 D5:8:2 C5:10:2 A4:12:4|D5:0:2 F5:2:2 A5:4:4 G5:8:2 F5:10:2 D5:12:4|D5:0:2 F5:2:2 Bb5:4:3 A5:7:1 G5:8:2 F5:10:2 D5:12:2 F5:14:2|E5:0:2 G5:2:2 C6:4:6 Bb5:10:2 G5:12:2 E5:14:2|A4:0:2 C5:2:2 F5:4:3 E5:7:1 F5:8:2 A5:10:2 C6:12:4|C6:0:3 A5:3:1 E5:4:4 A5:8:2 G5:10:2 E5:12:4|F5:0:2 D5:2:2 Bb4:4:4 D5:8:2 F5:10:2 Bb5:12:4|C6:0:4 Bb5:4:2 A5:6:2 G5:8:6',
 lobbyB:'D5:0:2 F5:2:2 Bb5:4:4 A5:8:2 G5:10:2 F5:12:4|E5:0:2 G5:2:2 C6:4:4 Bb5:8:2 A5:10:2 G5:12:4|A5:0:3 C6:3:1 E6:4:4 D6:8:2 C6:10:2 A5:12:4|F5:0:2 A5:2:2 D6:4:6 C6:10:2 A5:12:4|G5:0:2 Bb5:2:2 D6:4:4 F6:8:4 D6:12:4|E6:0:4 D6:4:2 C6:6:2 Bb5:8:4 G5:12:4|A5:0:2 C6:2:2 F6:4:4 E6:8:2 D6:10:2 C6:12:4|G5:0:2 A5:2:2 Bb5:4:2 C6:6:2 E6:8:4 G6:12:4',
 buildA:'B4:0:2 D5:2:2 G5:4:2 D5:6:2 B4:8:2 D5:10:2 G5:12:4|E5:0:2 G5:2:2 C6:4:2 G5:6:2 E5:8:2 G5:10:2 C6:12:4|D6:0:2 B5:2:2 G5:4:2 B5:6:2 D6:8:4 B5:12:2 G5:14:2|F#5:0:2 A5:2:2 C6:4:2 A5:6:2 F#5:8:2 D5:10:2 A4:12:4|B4:0:2 D5:2:2 G5:4:2 D5:6:2 B4:8:2 D5:10:2 G5:12:4|E5:0:2 G5:2:2 C6:4:2 E6:6:2 D6:8:2 C6:10:2 G5:12:4|A5:0:2 F#5:2:2 D5:4:2 F#5:6:2 A5:8:2 C6:10:2 B5:12:2 A5:14:2|G5:0:6 D5:6:2 G4:8:6',
 buildB:'E5:0:2 G5:2:2 C6:4:4 E6:8:4 D6:12:4|C6:0:2 B5:2:2 A5:4:2 G5:6:2 E5:8:4 G5:12:4|D5:0:2 G5:2:2 B5:4:4 D6:8:4 B5:12:4|G5:0:4 A5:4:2 B5:6:2 D6:8:8|F#5:0:2 A5:2:2 D6:4:4 C6:8:2 A5:10:2 F#5:12:4|A5:0:4 C6:4:4 B5:8:2 A5:10:2 G5:12:2 F#5:14:2|G5:0:2 B5:2:2 D6:4:4 G6:8:4 D6:12:4|C6:0:2 B5:2:2 A5:4:2 F#5:6:2 D5:8:8',
 westA:'E5:0:6 A5:6:2 C6:8:4 B5:12:2 A5:14:2|E5:0:8 D5:8:2 C5:10:2 D5:12:4|D5:0:6 G5:6:2 B5:8:4 A5:12:2 G5:14:2|E5:0:12|C5:0:2 F5:2:2 A5:4:6 G5:10:2 F5:12:4|D5:0:2 G5:2:2 B5:4:6 A5:10:2 G5:12:4|A5:0:4 C6:4:4 B5:8:2 A5:10:2 E5:12:4|G#5:0:4 B5:4:4 E6:8:8',
 westB:'A5:0:4 C6:4:4 A5:8:4 F5:12:4|B5:0:4 D6:4:4 B5:8:4 G5:12:4|C6:0:6 E6:6:2 G6:8:8|E6:0:4 C6:4:4 A5:8:8|F5:0:2 A5:2:2 C6:4:8 A5:12:4|G5:0:2 B5:2:2 D6:4:8 B5:12:4|G#5:0:4 B5:4:4 E6:8:4 D6:12:4|B5:0:4 G#5:4:4 E5:8:8',
 neonA:'A5:0:2 C6:2:2 E6:4:4 D6:8:2 C6:10:2 B5:12:2 C6:14:2|A5:0:4 F5:4:4 C6:12:2 A5:14:2|G5:0:2 C6:2:2 E6:4:4 G6:8:4 E6:12:4|D6:0:4 B5:4:4 G5:8:4 D6:12:4|A5:0:2 C6:2:2 E6:4:4 D6:8:2 C6:10:2 B5:12:2 C6:14:2|A5:0:4 F5:4:4 C6:12:2 A5:14:2|G5:0:2 C6:2:2 E6:4:4 G6:8:4 E6:12:4|E6:0:4 D6:4:4 B5:8:4 G5:12:4',
 neonB:'C6:0:2 A5:2:2 F5:4:2 A5:6:2 C6:8:4 F6:12:4|D6:0:2 B5:2:2 G5:4:2 B5:6:2 D6:8:4 G6:12:4|E6:0:4 G6:4:4 B6:8:4 G6:12:4|A6:0:6 E6:6:2 C6:8:8|A5:0:2 C6:2:2 F6:4:4 E6:8:2 D6:10:2 C6:12:4|B5:0:2 D6:2:2 G6:4:4 F6:8:2 E6:10:2 D6:12:4|E6:0:4 G#6:4:4 B6:8:4 G#6:12:4|E6:0:8 B5:8:4 G#5:12:4',
 rockA:'E5:0:4 G5:4:2 A5:6:2 B5:8:6 A5:14:2|G5:0:4 E5:4:4 D5:8:4 E5:12:4|E5:0:2 G5:2:2 C6:4:6 B5:10:2 A5:12:4|F#5:0:4 A5:4:4 D6:8:8|E5:0:4 G5:4:2 A5:6:2 B5:8:6 A5:14:2|B5:0:4 G5:4:4 E5:8:8|E5:0:2 G5:2:2 C6:4:6 B5:10:2 A5:12:4|D#6:0:4 B5:4:4 F#5:8:8',
 rockB:'G5:0:4 E5:4:2 G5:6:2 C6:8:6 B5:14:2|A5:0:4 F#5:4:2 A5:6:2 D6:8:8|B5:0:2 G5:2:2 E5:4:4 G5:8:2 B5:10:2 E6:12:4|E6:0:12 D6:12:2 B5:14:2|C6:0:4 B5:4:2 A5:6:2 G5:8:4 E5:12:4|D6:0:4 C6:4:2 B5:6:2 A5:8:4 F#5:12:4|D#6:0:4 F#6:4:4 B6:8:8|A6:0:2 F#6:2:2 D#6:4:2 B5:6:2 F#5:8:8',
 loungeA:'D5:0:3 F5:3:1 Bb5:4:4 A5:8:2 G5:10:2 F5:12:4|G5:0:3 Bb5:3:1 D6:4:4 C6:8:2 Bb5:10:2 G5:12:4|Eb5:0:2 G5:2:2 Bb5:4:4 A5:8:2 G5:10:2 Eb5:12:4|F5:0:2 A5:2:2 C6:4:2 Eb6:6:6 D6:12:4|D5:0:3 F5:3:1 Bb5:4:4 A5:8:2 G5:10:2 F5:12:4|G5:0:3 Bb5:3:1 Eb6:4:4 D6:8:2 C6:10:2 Bb5:12:4|A5:0:2 C6:2:2 F6:4:4 Eb6:8:2 C6:10:2 A5:12:4|Bb5:0:8 F5:8:4 Bb4:12:4',
 loungeB:'G5:0:3 Bb5:3:1 Eb6:4:4 D6:8:2 C6:10:2 Bb5:12:4|G5:0:2 Bb5:2:2 C6:4:2 Eb6:6:6 D6:12:4|D6:0:3 F6:3:1 D6:4:4 Bb5:8:4 F5:12:4|G5:0:2 Bb5:2:2 D6:4:4 F6:8:4 D6:12:4|Eb6:0:4 D6:4:2 C6:6:2 Bb5:8:4 G5:12:4|A5:0:2 C6:2:2 Eb6:4:4 D6:8:2 C6:10:2 A5:12:4|Bb5:0:4 D6:4:4 F6:8:8|F6:0:2 Eb6:2:2 D6:4:2 C6:6:2 A5:8:8',
 featA:'D5:0:2 F5:2:2 A5:4:2 D6:6:2 C6:8:2 A5:10:2 F5:12:4|D5:0:2 F5:2:2 Bb5:4:2 D6:6:2 C6:8:2 Bb5:10:2 F5:12:4|E5:0:2 G5:2:2 C6:4:2 E6:6:2 D6:8:2 C6:10:2 G5:12:4|C#6:0:4 E6:4:4 A6:8:4 G6:12:2 E6:14:2',
 featB:'F5:0:2 Bb5:2:2 D6:4:2 F6:6:2 E6:8:2 D6:10:2 Bb5:12:4|G5:0:2 C6:2:2 E6:4:2 G6:6:2 F6:8:2 E6:10:2 C6:12:4|D6:0:2 F6:2:2 A6:4:4 G6:8:2 F6:10:2 D6:12:4|E6:0:4 C#6:4:4 A5:8:4 E6:12:4',
 bigA:'C5:0:2 E5:2:2 G5:4:2 C6:6:6 G5:12:2 C6:14:2|A5:0:2 C6:2:2 F6:4:6 E6:10:2 D6:12:2 C6:14:2|B5:0:2 D6:2:2 G6:4:6 F6:10:2 E6:12:2 D6:14:2|E6:0:4 G6:4:4 C7:8:8',
 bigB:'A5:0:2 C6:2:2 F6:4:6 E6:10:2 D6:12:2 C6:14:2|B5:0:2 D6:2:2 G6:4:6 F6:10:2 E6:12:2 D6:14:2|E6:0:4 G6:4:4 C7:8:8|C7:0:4 G6:4:4 E6:8:4 C6:12:4'};
const SONGS={
 lobby:{bpm:122,A:'F,Dm7,Bbmaj7,C7,F,Am7,Bb,C7',B:'Bb,C,Am7,Dm7,Gm7,C7,F,C7',mA:'lobbyA',mB:'lobbyB',lead:'brass',lv:.4,dr:{k:'x...x...x...x...',c:'....x.......x...',h:'xxxxxxxxxxxxxxxx',o:'..x...x...x...x.'},bass:'R..O.R.OR..O.R.O',bi:'bass',comp:'..x...x...x..x..',ci:'ep',cl:2,pad:'B'},
 build:{bpm:132,sw:.3,A:'G,C,G,D7,G,C,D7,G',B:'C,C,G,G,D7,D7,G,D7',mA:'buildA',mB:'buildB',lead:'mallet',lv:.5,dr:{k:'x.......x.......',b:'....x.......x...',h:'x.x.x.x.x.x.x.x.',sh:'..x...x...x...x.'},bass:'R.......F.......',bl:4,bi:'ubass',comp:'x.x.x.x.x.x.x.x.',ci:'banjo',cl:1,arpC:1,pad:'B'},
 west:{bpm:104,A:'Am,Am,G,Am,F,G,Am,E',B:'F,G,C,Am,F,G,E,E',mA:'westA',mB:'westB',lead:'whistle',lv:.42,dr:{k:'x.......x.x.....',s:'....x.......x...',sh:'xxxxxxxxxxxxxxxx',t:'..............xx'},bass:'R.RRF.FFR.RRF.FF',bl:1,bi:'bass',comp:'x.....x.x.....x.',ci:'pluck',cl:2,pad:'AB'},
 jungle:{bpm:100,tr:5,A:'Am,Am,G,Am,F,G,Am,E',B:'F,G,C,Am,F,G,E,E',mA:'westA',mB:'westB',lead:'mallet',lv:.55,dr:{k:'x..x......x..x..',t:'......x.......x.',T:'.......x.......x',sh:'x.xxx.xxx.xxx.xx'},bass:'R..R..F.R..R..F.',bl:2,bi:'ubass',comp:'..x...x...x...x.',ci:'mallet',cl:1,pad:'B'},
 neon:{bpm:126,A:'Am,F,C,G,Am,F,C,G',B:'F,G,Em,Am,F,G,E,E',mA:'neonA',mB:'neonB',lead:'lead',lv:.34,dr:{k:'x...x...x...x...',c:'....x.......x...',h:'xxxxxxxxxxxxxxxx',o:'..x...x...x...x.'},bass:'R.R.O.R.R.R.O.R.',bi:'bass',arp:'0123012301230123',ai:'sq',pad:'AB'},
 neon2:{bpm:128,tr:2,A:'Am,F,C,G,Am,F,C,G',B:'F,G,Em,Am,F,G,E,E',mA:'neonA',mB:'neonB',lead:'lead',lv:.34,dr:{k:'x...x...x...x...',c:'....x.......x...',h:'xxxxxxxxxxxxxxxx',o:'..x...x...x...x.'},bass:'R.R.O.R.R.R.O.R.',bi:'bass',arp:'0213021302130213',ai:'sq',pad:'AB'},
 rock:{bpm:112,A:'Em,Em,C,D,Em,Em,C,B',B:'C,D,Em,Em,C,D,B,B',mA:'rockA',mB:'rockB',lead:'dlead',lv:.3,dr:{k:'x.....x.x.x.....',s:'....x.......x...',h:'x.x.x.x.x.x.x.x.',o:'......x.......x.'},bass:'R.R.R.R.R.R.R.R.',bi:'bass',comp:'x..x..x.x..x..x.',ci:'power',cl:2,po:1},
 lounge:{bpm:116,sw:.33,A:'Bb,Gm7,Cm7,F7,Bb,Eb,F7,Bb',B:'Eb,Eb,Bb,Gm7,Cm7,F7,Bb,F7',mA:'loungeA',mB:'loungeB',lead:'trumpet',lv:.42,dr:{k:'x.......x.......',r:'x...x.xxx...x.xx',b:'....x.......x...'},bass:'R...T...F...A...',bl:4,bi:'ubass',comp:'......x.......x.',ci:'ep',cl:2,pad:'B'},
 lounge2:{bpm:112,sw:.33,tr:-2,A:'Bb,Gm7,Cm7,F7,Bb,Eb,F7,Bb',B:'Eb,Eb,Bb,Gm7,Cm7,F7,Bb,F7',mA:'loungeA',mB:'loungeB',lead:'organ',lv:.36,dr:{k:'x.......x.......',r:'x...x.xxx...x.xx',b:'....x.......x...'},bass:'R...T...F...A...',bl:4,bi:'ubass',comp:'......x.......x.',ci:'stab',cl:1,pad:'AB'},
 feature:{bpm:140,A:'Dm,Bb,C,A',B:'Bb,C,Dm,A7',mA:'featA',mB:'featB',lead:'brass',lv:.44,dr:{k:'x...x...x...x...',c:'....x.......x...',h:'xxxxxxxxxxxxxxxx',o:'..x...x...x...x.',tim:'x.......x.......'},bass:'R.R.R.R.R.R.R.R.',bi:'bass',arp:'0123012301230123',ai:'sq',comp:'x..x..x.........',ci:'stab',cl:1,pad:'AB'},
 bigwin:{bpm:150,A:'C,F,G,C',B:'F,G,C,C',mA:'bigA',mB:'bigB',lead:'brass',lv:.5,dr:{k:'x.......x.......',tim:'x.......x.......',s:'....x.......xxxx',h:'x.x.x.x.x.x.x.x.'},bass:'R...R...F...R...',bl:3,bi:'bass',comp:'x.....x.x.......',ci:'stab',cl:1,pad:'AB',bells:1}};
const THEME_OF={lobby:'lobby',biber:'build',donner:'west',rubin:'neon',frei:'neon2',glut:'rock',schwein:'lounge',hamster:'lounge2',revier:'jungle'};
for(const k in SONGS){const s=SONGS[k],a=trChords(s.A.split(','),s.tr||0),b=trChords(s.B.split(','),s.tr||0);s.chords=a.concat(b);s.half=a.length;s.nb=s.chords.length;s.mel=mel(MEL[s.mA],s.tr||0).concat(mel(MEL[s.mB],s.tr||0))}
function playStep(S_,i,t,sd,B){const s=i%16,bar=Math.floor(i/16)%S_.nb,secB=bar>=S_.half,ch=S_.chords[bar],cn=chordNotes(ch),vc=voice(ch),endA=bar===S_.half-1,endB=bar===S_.nb-1,fill=(endA||endB)&&s>=12;
 if(S_.sw&&s%4===2)t+=sd*S_.sw;
 for(const k in S_.dr){if(fill&&(k==='s'||k==='b'))continue;const p=S_.dr[k];if(p[s]==='x')DR[k](t,k==='h'&&s%4?.6:1,B)}
 if(fill){DR.s(t,.5+(s-12)*.15,B);if(s===12)DR.t(t,1,B);if(s===14)DR.T(t,1,B)}
 if(s===0&&(bar===0||bar===S_.half))DR.cr(t,1,B);
 if(MU.tension&&s%4===0){DR.k(t,.5,B);vo('sawtooth',mf(36+cn.r),t,sd*3,.12,B,{lp:400,lp2:1800,lt:sd*3})}
 const bp=S_.bass[s];if(bp&&bp!=='.'){const root=36+cn.r+(cn.r>7?-12:0),nx=chordNotes(S_.chords[(bar+1)%S_.nb]).r,n=bp==='R'?root:bp==='O'?root+12:bp==='F'?root+7:bp==='T'?root+cn.iv[1]:bp==='A'?36+nx+(nx>7?-12:0)-1:root;INST[S_.bi](t,n,sd*(S_.bl||2)*.95,.8,B)}
 if(S_.comp&&S_.comp[s]==='x'){if(S_.po)INST.power(t,40+cn.r+(cn.r>7?-12:0),sd*(S_.cl||1)*1.6,.7,B);else if(S_.arpC){const n=vc[(s/2)%vc.length|0];INST[S_.ci](t,n,sd,.32,B)}else vc.forEach(n=>INST[S_.ci](t,n,sd*(S_.cl||1)*1.5,.3,B))}
 if(S_.arp){const a=+S_.arp[s],n=vc[a%vc.length]+12+(a>=vc.length?12:0);INST[S_.ai](t,n,sd,secB?.6:.45,B)}
 if(s===0&&S_.pad&&S_.pad.includes(secB?'B':'A'))voice(ch,55).forEach(n=>INST.strings(t,n,sd*16,.5,B));
 if(S_.bells&&s%4===0)INST.bell(t,vc[(s/4)%vc.length]+24,.3,.35,B);
 const ml=S_.mel[bar];if(ml)for(const e of ml)if(e[1]===s){INST[S_.lead](t,e[0],e[2]*sd*.92,S_.lv,B);if(secB&&S_.lead!=='dlead'&&e[2]>=4)INST.bell(t,e[0]+12,.3,.12,B)}}
function music(th){if(th)MU.want=th;clearInterval(MU.timer);MU.timer=null;if(!S.mus||!AC)return;MU.theme=MU.want;MU.step=0;MU.next=AC.currentTime+.06;
 MU.timer=setInterval(()=>{if(document.hidden||!AC||AC.state!=='running')return;const S_=SONGS[MU.theme]||SONGS.lobby,sd=60/S_.bpm/4;if(MU.next<AC.currentTime)MU.next=AC.currentTime+.05;
  while(MU.next<AC.currentTime+.22){try{playStep(S_,MU.step,MU.next,sd,GR.mbus)}catch(e){}MU.next+=sd;MU.step++;
   if(MU.step%16===0&&MU.want!==MU.theme){MU.theme=MU.want;MU.step=0}}},60)}
function setTheme(th){const k=SONGS[th]?th:THEME_OF[th]||'lobby';MU.want=k;if(!MU.timer)music()}
function fadeMusic(to,ms){if(!GR||!AC)return;const g=GR.mbus.gain,t=AC.currentTime;g.cancelScheduledValues(t);g.setValueAtTime(g.value,t);g.linearRampToValueAtTime(to,t+(ms||300)/1000)}
function duck(ms){if(!GR||!S.mus)return;fadeMusic(.16*mvol(),90);clearTimeout(MU.dk);MU.dk=setTimeout(()=>fadeMusic(.38*mvol(),600),ms||900)}
function tension(on){MU.tension=!!on}
function musicOff(){clearInterval(MU.timer);MU.timer=null}
/* ---- sound effects ---- */
const sfx=fn=>function(){if(!S.snd)return;const a=ac();if(!a)return;try{fn(a.currentTime+.005,GR.sbus,...arguments)}catch(e){}};
function tone(f,d,type,v,when){if(!S.snd)return;const a=ac();if(!a)return;try{vo(type||'sine',f,a.currentTime+(when||0),d,v||.08,GR.sbus)}catch(e){}}
function bell(f,t,v,B,p){vo('sine',f,t,.8,v,B,{rev:.6,pan:p});vo('sine',f*2.76,t,.3,v*.35,B,{pan:p});vo('triangle',f*5.4,t,.07,v*.18,B,{pan:p})}
const SFX={
 click:sfx((t,B)=>{vo('triangle',1100,t,.05,.07,B,{f2:700});nz(t,.02,.05,B,'highpass',5000)}),
 spin:sfx((t,B)=>{nz(t,.6,.06,B,'bandpass',800,.8,{f2:2600});vo('sine',220,t,.14,.12,B,{f2:110});for(let i=0;i<8;i++)nz(t+.05+i*.045,.02,.045,B,'bandpass',3200-i*180,3,{pan:(i%2?.3:-.3)})}),
 stop:sfx((t,B)=>{vo('sine',140,t,.18,.45,B,{f2:48});nz(t,.04,.16,B,'bandpass',2600,1.5);vo('square',90,t,.03,.05,B)}),
 stopBig:sfx((t,B)=>{vo('sine',120,t,.4,.7,B,{f2:34});nz(t,.1,.28,B,'lowpass',1400);DR.cr(t,.7,B);DR.tim(t,.8,B)}),
 scatter:sfx((t,B,n)=>{n=n||1;const base=[784,988,1175,1568,1976][Math.min(4,n-1)];[1,1.25,1.5,2].forEach((m,i)=>bell(base*m,t+i*.05,.08,B,(i-1.5)*.3));nz(t,.4,.04,B,'highpass',7000)}),
 antic:sfx((t,B,d)=>{d=d||1.4;nz(t,d,.13,B,'bandpass',260,2,{f2:4200,a:d*.85});vo('sawtooth',98,t,d,.08,B,{f2:392,ft:d,lp:700,lp2:3200,a:d*.7});vo('sawtooth',98*1.5,t,d,.05,B,{f2:392*1.5,ft:d,lp:700,lp2:3200,a:d*.7});const n=Math.floor(d/.36);for(let i=0;i<n;i++){const k=.4+.6*i/n;DR.k(t+i*.36*(1-i/n*.3),.5*k,B);DR.k(t+i*.36*(1-i/n*.3)+.13,.3*k,B)}}),
 roll:sfx((t,B,d)=>{d=d||1.5;const n=Math.floor(d/.045);for(let i=0;i<n;i++){const k=i/n;nz(t+i*d/n,.06,.05+.22*k*k,B,'bandpass',1800+800*k,.8,{pan:(i%2?.15:-.15)})}nz(t,d,.06,B,'highpass',3000,1,{a:d});DR.cr(t+d,1,B);DR.tim(t+d,1,B)}),
 rumble:sfx((t,B,d)=>{d=d||2;nz(t,d,.4,B,'lowpass',90,1,{a:d*.8,f2:260});vo('sine',36,t,d,.4,B,{a:d*.6,f2:52})}),
 meteor:sfx((t,B)=>{nz(t,.6,.22,B,'bandpass',3200,1.2,{f2:300});vo('sawtooth',900,t,.5,.05,B,{f2:120,lp:2000});nz(t+.5,.5,.3,B,'lowpass',900,1,{f2:120});vo('sine',90,t+.5,.5,.6,B,{f2:30})}),
 bonusHit:sfx((t,B)=>{[0,4,7,12].forEach(n=>INST.brass(t,nm('C4')+n,.9,.38,B));[0,7,12].forEach(n=>INST.strings(t,nm('C4')+n,1.4,.8,B));DR.cr(t,1,B);DR.tim(t,1.2,B);vo('sine',55,t,.8,.7,B,{f2:32})}),
 coinLand:sfx((t,B)=>{vo('sine',110,t,.25,.55,B,{f2:45});bell(1318,t+.01,.09,B);bell(1976,t+.05,.06,B);nz(t,.05,.12,B,'bandpass',4000,2)}),
 upgrade:sfx((t,B)=>{[660,880,1320,1760].forEach((f,i)=>bell(f,t+i*.05,.07,B))}),
 reset:sfx((t,B)=>{[1046,1318,1568,2093].forEach((f,i)=>vo('triangle',f,t+i*.035,.18,.06,B,{rev:.4}))}),
 last:sfx((t,B)=>{[0,.2,.4].forEach(o=>{vo('square',880,t+o,.12,.05,B,{lp:2000});vo('square',660,t+o+.1,.12,.05,B,{lp:2000})});DR.k(t,.8,B);DR.k(t+.2,.6,B)}),
 tick:sfx((t,B)=>{vo('square',1700,t,.02,.045,B,{hp:900});nz(t,.015,.05,B,'highpass',5000)}),
 count:sfx((t,B,p)=>{const f=900+(p||0)*900;vo('triangle',f,t,.05,.05,B);vo('sine',f*2,t,.03,.025,B)}),
 ding:sfx((t,B,i)=>{const f=880*Math.pow(2,Math.min(24,i||0)/12);bell(f,t,.08,B,((i||0)%3-1)*.3);vo('sine',f/2,t,.12,.06,B)}),
 coin:sfx((t,B)=>{bell(1568,t,.08,B);bell(2093,t+.07,.07,B)}),
 win:sfx((t,B)=>[1047,1319,1568,2093,2637].forEach((f,i)=>bell(f,t+i*.07,.08,B,(i-2)*.2))),
 winMed:sfx((t,B)=>{[0,4,7,12].forEach((n,i)=>INST.brass(t+i*.08,nm('C5')+n,.16,.32,B));[1047,1319,1568,2093,2637,3136].forEach((f,i)=>bell(f,t+.3+i*.05,.06,B,(i-2.5)*.2))}),
 trigger:sfx((t,B)=>{for(let i=0;i<12;i++)bell(523*Math.pow(2,i/7),t+i*.05,.06,B,(i%3-1)*.3);[0,4,7,12].forEach(n=>INST.brass(t+.65,nm('C5')+n,.8,.3,B));DR.cr(t+.65,.8,B);DR.tim(t+.65,1,B)}),
 whoosh:sfx((t,B)=>{nz(t,.7,.22,B,'bandpass',400,1.2,{f2:4200,a:.35});nz(t+.35,.4,.1,B,'highpass',3000,1,{pan:.4})}),
 swirl:sfx((t,B)=>{nz(t,.45,.12,B,'bandpass',600,3,{f2:2400,a:.1});vo('sine',300,t,.4,.05,B,{f2:900})}),
 tier:sfx((t,B)=>{DR.cr(t,1,B);DR.tim(t,1,B);[0,4,7,12].forEach(n=>INST.brass(t,nm('G4')+n,.6,.32,B));vo('sine',60,t,.5,.5,B,{f2:35})}),
 big:sfx((t,B)=>{[[0,4,7],[2,5,9],[4,7,11]].forEach((c,i)=>c.forEach(n=>INST.brass(t+i*.16,nm('C5')+n,.15,.28,B)));[0,4,7,12].forEach(n=>INST.brass(t+.5,nm('C5')+n,1.4,.28,B));[0,7,12].forEach(n=>INST.strings(t+.5,nm('C4')+n,1.8,.7,B));for(let i=0;i<24;i++)bell([1047,1175,1319,1568,1760,2093,2349][Math.floor(Math.random()*7)],t+.5+i*.08,.045,B,(Math.random()-.5)*.8);DR.cr(t+.5,1,B)}),
 collect:sfx((t,B)=>{for(let i=0;i<18;i++)bell(1400+Math.random()*1600,t+i*.045,.05,B,(Math.random()-.5)*.8);vo('sine',200,t,.3,.3,B,{f2:80});nz(t,.5,.06,B,'highpass',6000)}),
 bonus:sfx((t,B)=>{for(let i=0;i<10;i++)bell(523*Math.pow(2,i/6),t+i*.055,.06,B);[784,988,1175].forEach((f,i)=>INST.brass(t+.6,nm('G5')+[0,4,7][i],.7,.3,B))}),
 lock:sfx((t,B)=>{vo('sine',160,t,.16,.45,B,{f2:55});bell(1760,t+.02,.09,B)}),
 pop:sfx((t,B)=>{nz(t,.08,.35,B,'bandpass',1200,.8);vo('sine',600,t,.08,.15,B,{f2:200})}),
 shake:sfx((t,B)=>{for(let i=0;i<8;i++)nz(t+i*.07,.05,.12,B,'bandpass',800+i*150,2)}),
 burst:sfx((t,B)=>{vo('sine',90,t,.5,.7,B,{f2:30});nz(t,.6,.35,B,'lowpass',2000,1,{f2:300});for(let i=0;i<14;i++)bell(1200+Math.random()*1800,t+.1+i*.04,.05,B)}),
 fire:sfx((t,B)=>{nz(t,1.1,.28,B,'bandpass',500,.7,{f2:1800,a:.2});vo('sawtooth',80,t,.8,.12,B,{lp:400});for(let i=0;i<10;i++)nz(t+Math.random()*.9,.03,.12,B,'highpass',3000)}),
 grand:sfx((t,B)=>{for(let k=0;k<3;k++)[0,4,7,12].forEach(n=>INST.brass(t+k*.35,nm('C5')+n+k*2,.3,.3,B));[0,4,7,12,16].forEach(n=>INST.brass(t+1.1,nm('C5')+n,2.2,.28,B));[0,7,12].forEach(n=>INST.strings(t+1.1,nm('C4')+n,2.6,.7,B));DR.cr(t+1.1,1,B);DR.tim(t+1.1,1,B);for(let i=0;i<40;i++)bell(1000+Math.random()*2400,t+1.1+i*.06,.04,B,(Math.random()-.5)*.8)}),
 no:sfx((t,B)=>vo('sawtooth',170,t,.26,.12,B,{f2:85,lp:800})),
 heart:sfx((t,B)=>{DR.k(t,.8,B);DR.k(t+.16,.5,B)})};
/* ---- unlock (tap) + iOS silent-switch workaround ---- */
let silentEl=null;
function unlockAudio(){const a=ac();if(!a)return;try{if(navigator.audioSession)navigator.audioSession.type='playback'}catch(e){}
 try{const s=a.createBufferSource();s.buffer=a.createBuffer(1,1,22050);s.connect(a.destination);s.start(0)}catch(e){}
 if(!silentEl){try{const n=4410,b=new Uint8Array(44+n),dv=new DataView(b.buffer),w=(o,t)=>{for(let i=0;i<t.length;i++)b[o+i]=t.charCodeAt(i)};w(0,'RIFF');dv.setUint32(4,36+n,true);w(8,'WAVEfmt ');dv.setUint32(16,16,true);dv.setUint16(20,1,true);dv.setUint16(22,1,true);dv.setUint32(24,8820,true);dv.setUint32(28,8820,true);dv.setUint16(32,1,true);dv.setUint16(34,8,true);w(36,'data');dv.setUint32(40,n,true);b.fill(128,44);
   silentEl=new Audio(URL.createObjectURL(new Blob([b],{type:'audio/wav'})));silentEl.loop=true;silentEl.setAttribute('playsinline','')}catch(e){}}
 if(silentEl){if(S.snd||S.mus){if(silentEl.paused){const p=silentEl.play();if(p&&p.catch)p.catch(()=>{})}}else silentEl.pause()}
 if(!MU.timer&&S.mus)music()}
['touchend','click','keydown'].forEach(ev=>document.addEventListener(ev,unlockAudio,true));
