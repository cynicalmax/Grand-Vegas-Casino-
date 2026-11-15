'use strict';
/* ===== V3-Paket aus Max' Drive: eigene Musik je Spiel (Schleifen + Fanfaren), aufgenommene Klangeffekte,
   gerenderte 3D-Effekte, dunkle Themenhintergründe, Wolf-Auftritt im Bau-Bonus.
   Alles ist reine Darstellung: Gewinne, Auslöser und Zufall kommen weiter unverändert aus 01-game.js. ===== */
const V3={buf:{},pend:{},g:null,src:[],gn:[],st:'n',bus:null,on:false,pan:0};
const v3Has=k=>typeof AUD!=='undefined'&&!!AUD[k];
function v3u8(b){const s=atob(b),n=s.length,u=new Uint8Array(n);for(let i=0;i<n;i++)u[i]=s.charCodeAt(i);return u}
/* MP3 erst bei Bedarf entpacken (spart Speicher auf dem iPhone) */
function v3buf(k){if(V3.buf[k])return Promise.resolve(V3.buf[k]);if(!v3Has(k)||!AC)return Promise.resolve(null);
 return V3.pend[k]||(V3.pend[k]=new Promise(res=>{let fin=false;const ok=b=>{if(fin)return;fin=true;V3.buf[k]=b;res(b)},no=()=>{if(fin)return;fin=true;delete V3.pend[k];res(null)};
  try{const p=AC.decodeAudioData(v3u8(AUD[k]).buffer,ok,no);if(p&&p.then)p.then(ok,no)}catch(e){no()}}))}
function v3bus(){if(!V3.bus&&AC&&GR){V3.bus=AC.createGain();V3.bus.gain.value=1.3;V3.bus.connect(GR.mbus)}return V3.bus}
/* ---- Musik: drei vorgemischte Schleifen je Spiel (normal, Spannung, Bonus), synchron, Übergang 450 ms ---- */
const V3MIX={n:[1,0,0],a:[.3,1,0],b:[0,0,1],w:[.45,0,0]},V3LOOP=['n','a','b'];
function v3Stop(){V3.src.forEach(s=>{try{s.stop()}catch(e){}});V3.gn.forEach(g=>{try{g.disconnect()}catch(e){}});V3.src=[];V3.gn=[];V3.g=null}
function v3Level(now){if(!AC)return;const m=V3MIX[V3.st]||V3MIX.n,t=AC.currentTime;V3.gn.forEach((g,i)=>{if(!g)return;g.gain.cancelScheduledValues(t);g.gain.setValueAtTime(g.gain.value,t);g.gain.linearRampToValueAtTime(m[i],t+(now?.8:.45))})}
async function v3Music(g){if(!S.mus||!AC||!GR){v3Stop();return}if(V3.g===g&&V3.src.length)return;v3Stop();V3.g=g;
 const bs=await Promise.all(V3LOOP.map(m=>v3buf(`mu-${g}-${m}`)));if(V3.g!==g||V3.src.length||!bs[0]||!S.mus||!V3.on)return;
 const t=AC.currentTime+.08;bs.forEach((b,i)=>{if(!b)return;const s=AC.createBufferSource(),gn=AC.createGain();s.buffer=b;s.loop=true;s.loopStart=.5;s.loopEnd=Math.min(b.duration,20.5);gn.gain.value=0;s.connect(gn);gn.connect(v3bus());s.start(t,.5);V3.src[i]=s;V3.gn[i]=gn});v3Level(1)}
const _v3setTheme=setTheme,_v3music=music,_v3tension=tension,_v3off=musicOff;
setTheme=function(th){const g=cur&&cur.cfg&&cur.cfg.id;if(th==='lobby'||!g||!v3Has(`mu-${g}-n`)){V3.on=false;v3Stop();return _v3setTheme(th)}
 V3.on=true;_v3off();MU.want=THEME_OF[g]||'lobby';V3.st=th==='feature'?'b':th==='bigwin'?'w':'n';if(V3.g===g&&V3.src.length)v3Level();else v3Music(g)};
music=function(th){if(V3.on&&cur){if(S.mus)v3Music(cur.cfg.id);else v3Stop();return}return _v3music(th)};
musicOff=function(){_v3off();v3Stop()};
tension=function(on){_v3tension(on);if(V3.on&&(V3.st==='n'||V3.st==='a')){V3.st=on?'a':'n';v3Level()}};
/* App im Hintergrund: Ton anhalten */
document.addEventListener('visibilitychange',()=>{if(!AC)return;try{if(document.hidden)AC.suspend();else if(S.snd||S.mus)AC.resume()}catch(e){}});
/* ---- Klangeffekte: Aufnahme abspielen, sonst (noch nicht geladen) der bisherige Synthesizer ---- */
function v3Play(k,o){o=o||{};if(!S.snd||!AC||!GR||AC.state!=='running')return false;const b=V3.buf[k];if(!b){v3buf(k);return false}
 try{const s=AC.createBufferSource(),g=AC.createGain();s.buffer=b;g.gain.value=o.v==null?1:o.v;s.connect(g);let n=g;if(o.pan&&AC.createStereoPanner){const p=AC.createStereoPanner();p.pan.value=o.pan;g.connect(p);n=p}n.connect(GR.sbus);s.start(AC.currentTime+.005)}catch(e){return false}return true}
const v3G=()=>cur&&cur.cfg&&cur.cfg.id;
function v3Sting(t){const g=v3G();return!!g&&v3Play(`st-${g}-${t}`,{v:.9})}
const V3SFX={spin:()=>v3Play('sx-spin-start',{v:1.6}),stop:()=>v3Play('sx-reel-stop',{v:1.4,pan:V3.pan}),scatter:n=>v3Play('sx-free-land-'+Math.max(1,Math.min(3,n||1))),
 win:()=>v3Play('sx-small-win'),big:()=>v3Sting('win')||v3Play('sx-big-win'),grand:()=>v3Sting('jackpot')||v3Play('sx-jackpot'),trigger:()=>v3Sting('bonus')||v3Play('sx-bonus-trigger'),
 bonusHit:()=>v3Play('sx-bonus-trigger'),collect:()=>v3Play('sx-collect'),coin:()=>v3Play('sx-coin-single',{v:.8}),click:()=>v3Play('sx-ui-click',{v:1.5}),reset:()=>v3Play('sx-retrigger'),pop:()=>v3Play('sx-card-flip')};
for(const k in V3SFX){const orig=SFX[k];SFX[k]=function(){if(!V3SFX[k].apply(null,arguments))return orig.apply(this,arguments)}}
/* Walzenstopp im Stereobild der Walze; WILD bekommt seinen eigenen Klang */
const _v3reStop=reStop;
reStop=function(ci,final,soft){const p=_v3reStop(ci,final,soft);p.then(()=>{V3.pan=(ci-2)*.28;if(final&&final.some(s=>s&&s.s==='W'))setTimeout(()=>v3Play('sx-wild-land',{v:.7,pan:V3.pan}),40)});return p};
/* nach dem ersten Tippen die kurzen Klänge vorladen; Spielmusik + Fanfaren beim Betreten des Spiels */
let v3pre=false;
function v3Preload(){if(v3pre||!AC)return;v3pre=true;Object.keys(AUD).filter(k=>k.startsWith('sx-')).forEach(v3buf)}
['touchend','click','keydown'].forEach(ev=>document.addEventListener(ev,()=>{if(AC)v3Preload();const g=v3G();if(g&&AC)['win','bonus','jackpot'].forEach(t=>v3buf(`st-${g}-${t}`))},true));
/* ---- gerenderte 3D-Effekte (6×6 Bilder à 192 px, 15 Bilder/s) ---- */
function v3Calm(){return S.lessfx||(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)}
function v3Fx(name,cx,cy,size,o){o=o||{};const im=GFX.img['v3-fx-'+name];if(!im||v3Calm())return Promise.resolve();return new Promise(res=>{
 const c=document.createElement('canvas'),px=Math.round(size*DPR);c.width=c.height=px;c.className='v3fx';Object.assign(c.style,{width:size+'px',height:size+'px',left:(cx-size/2)+'px',top:(cy-size/2)+'px'});if(o.z)c.style.zIndex=o.z;
 document.body.appendChild(c);const x=c.getContext('2d'),fw=im.width/6,fh=im.height/6,N=36,t0=performance.now(),fps=o.fps||15;
 const f=now=>{const i=Math.floor((now-t0)/1000*fps);if(i>=N){c.remove();res();return}x.clearRect(0,0,px,px);if(o.fade&&i>N-8)x.globalAlpha=(N-i)/8;x.drawImage(im,(i%6)*fw,Math.floor(i/6)*fh,fw,fh,0,0,px,px);requestAnimationFrame(f)};requestAnimationFrame(f)})}
/* Truhe im Mini-Preis: Goldtruhe öffnet sich als 3D-Sequenz, danach Münzregen */
function v3Chest(el,gold){const r=el.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2,sz=Math.min(innerWidth*.8,340);v3Play('sx-chest-open');
 if(gold){const im=el.querySelector('img');if(im)im.style.visibility='hidden';v3Fx('chest_open',cx,cy,sz,{z:10050}).then(()=>{if(im)im.style.visibility=''})}
 setTimeout(()=>v3Fx('coin_burst',cx,cy-20,sz*1.1,{z:10051,fade:1}),gold?900:150)}
/* Big Win: Goldregen; Bonusgewinne: Münzstoß */
const _v3cel=celebrate;
celebrate=function(total,o){const p=_v3cel(total,o);try{const C=cur,bet=(o&&o.bet)||(C&&C.busy&&C.bet?C.bet:ROOMS[S.room].bets[S.bet[S.room]]),big=total/bet>=TIERS[0][0];
 const w=Math.min(innerWidth*1.15,560),go=()=>{v3Fx('gold_shower',innerWidth/2,innerHeight*.38,w,{z:9500});if(big)setTimeout(()=>v3Fx('gold_shower',innerWidth/2,innerHeight*.5,w*1.1,{z:9500,fade:1}),1200)};
 if(big||(o&&o.roll))setTimeout(go,big?1700:900);else setTimeout(()=>v3Fx('coin_burst',innerWidth/2,innerHeight*.45,w*.8,{z:9500,fade:1}),300)}catch(e){}return p};
/* ---- Bonus-Auftritte: die neuen FREE-/BONUS-Tafeln statt der alten Bilder, dazu das Bonusportal ---- */
function v3Hero(g,a){const k=KEYS[g]||{};if(a==='wheeltok')return'v3-biber-bonus';if(a==='giftbonus')return'v3-frei-bonus';if(a==='pot2'&&g==='schwein')return'v3-schwein-free';
 if(k.C&&a===k.C&&GFX.img[`v3-${g}-bonus`])return`v3-${g}-bonus`;if(g==='drache'&&a===k.C)return'v3-drache-bonus';return a}
async function v3Wolf(tb){/* Märchen-Moment im Bau-Bonus: der Wolf pustet das Haus um, heraus fallen die Münzen */
 const W=k=>GFX.url['v3-wolf-'+k],d=tb?.5:1;if(!W('blow'))return false;
 const el=ovShow('cine',`<div class="spot"></div><div class="rays"></div><div class="v3wolf"><img src="${W('sneak')}" alt=""></div>`),im=el.querySelector('.v3wolf img'),box=el.querySelector('.v3wolf');
 await sleep(650*d);im.src=W('inhale');await sleep(600*d);im.src=W('blow');box.classList.add('blow');if(!v3Play('sx-wolf-wind'))SFX.whoosh();
 const br=box.getBoundingClientRect(),hs=Math.min(innerWidth*.55,280),hx=Math.min(innerWidth-hs*.38,br.right+hs*.12),hy=br.top+br.height*.42;v3Fx('house_collapse',hx,hy,hs,{z:9500});await sleep(1100*d);
 box.classList.remove('blow');im.src=W('surprised');SFX.stopBig();shake(10,400);v3Fx('coin_burst',hx,hy,hs*1.3,{z:9501,fade:1});await sleep(900*d);im.src=W('laugh');v3Sting('bonus');await sleep(700*d);return true}
cine=async function(asset){const C=cur,tb=C&&C.turbo,g=v3G();
 if(g==='biber'&&asset===(KEYS.biber||{}).C&&!v3Calm()){await starSwirl(tb?600:1100,1);if(await v3Wolf(tb))return}
 const a=v3Hero(g,asset),gem=g==='rubin'&&a==='v3-rubin-bonus';await starSwirl(tb?600:1100,1);ovShow('cine',`<div class="spot"></div><div class="rays"></div><div class="hero">${A(a)}</div>`);SFX.whoosh();
 const s=Math.min(innerWidth*1.1,520);v3Fx(gem?'gem_reveal':'bonus_portal',innerWidth/2,innerHeight*.45,gem?s*.8:s,{z:9500});v3Sting('bonus');
 await sleep(tb?650:1350);fxFlash(innerWidth/2,innerHeight*.45,innerWidth*.9,{life:.5});SFX.stopBig();shake(10,400);await sleep(260)};
/* ---- dunkle Themenhintergründe für alle neun Spiele ---- */
for(const g of ['biber','donner','rubin','frei','glut','schwein','hamster','revier','drache']){const old=SCN[g];SCN[g]=(x,R)=>{const im=GFX.img['v3-bg-'+g];if(im)x.drawImage(im,0,0,400,760);else if(old)old(x,R)}}
