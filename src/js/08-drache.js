'use strict';
/* ===== Drachenfeuer: Feuerkugel-Hold-&-Spin-Slot mit Max' eigenen Grafiken (dr_*) =====
   Alles, was dieser Slot braucht, steht in dieser Datei. Die anderen Module bleiben unverändert,
   damit sich parallele Änderungen an der Lobby nicht in die Quere kommen. */
const DRACHE={id:'drache',bm:2.4,name:'Drachenfeuer',sub:'Feuerkugel-Bonus · 4 Jackpots',icon:'🐲',bg:['#ff3d1f','#3a0612'],lvl:3,rows:3,ev:'ways',
 syms:[['🐲',5,.5,1.2,3],['🦚',6,.4,1,2.5],['🏮',7,.3,.8,2],['🥮',8,.25,.6,1.5],['A',11,.1,.25,.6],['K',11,.1,.25,.6],['🪷',12,.08,.2,.5],['🧿',12,.08,.2,.5],['🪭',12,.08,.2,.5]],
 wild:{w:3,reels:[1,2,3],e:'🔥'},scat:{w:2.6,e:'🎡',fs:[8,12,15]},coin:{w:12,need:6,e:'☄️'},hs:{p:.045,nm:['DRACHEN','FEUER'],sub:'Grüne, blaue und violette Kugeln tragen MINI, MINOR und MAJOR. Alle 15 Felder voll = GRAND!'},fmode:{hot:1},
 info:'243 Gewinnwege. 6+ Feuerkugeln starten den Drachenfeuer-Bonus: Alle Kugeln bleiben stehen, 3 Respins, jede neue Kugel setzt sie zurück. Grüne, blaue und violette Kugeln bringen MINI, MINOR und MAJOR, alle 15 Felder voll = GRAND. 3/4/5 FREE-Räder = 8/12/15 Freispiele mit mehr Feuerkugeln.'};
SLOTS.push(DRACHE);
SCALE.drache=2.1425;
FELT.drache=['#5a0a14','#1a0206'];
KEYS.drache={'🐲':'v3-drache-premium','🦚':'dr_phoenix','🏮':'dr_lantern','🥮':'dr_ingot',A:'v3-rank-A',K:'v3-rank-K','🪷':'dr_lotus','🧿':'dr_jade','🪭':'dr_fan',
 W:'v3-drache-wild',S:'v3-drache-free',C:'dr_ball',Cmini:'dr_ball_mini',Cminor:'dr_ball_minor',Cmajor:'dr_ball_major',Cgrand:'dr_ball_grand'};
THEME_OF.drache='rock';
/* Jackpot-Kugeln in eigener Farbe (MINI grün, MINOR blau, MAJOR violett) */
const _drSym=symKey;
symKey=function(s,hs){if(RE.cfg&&RE.cfg.id==='drache'&&s&&s.s==='C'&&s.j&&!s.d){const k=KEYS.drache['C'+s.j];if(k)return k}return _drSym(s,hs)};
LOGO.drache=['DRACHEN','FEUER','gold','red'];
HERO.drache=['dr_dragon','dr_phoenix','dr_ball_grand'];
/* Kulisse: Laternenstraße bei Nacht, für den Bonus der Vulkantempel */
SCN.drache=x=>{const im=GFX.img.dr_bg;if(im)x.drawImage(im,0,0,400,760);else{x.fillStyle='#2a0610';x.fillRect(0,0,400,760)}};
/* Schriftzug als Bild (wie die anderen logo-*), gezeichnet mit der App-Schrift */
function drLogo(){const c=document.createElement('canvas');c.width=890;c.height=360;const x=c.getContext('2d');glossText(x,'DRACHEN',445,150,150,'gold',{max:860});glossText(x,'FEUER',445,330,168,'red',{max:860});return c}
const _drArt=assetCanvas;
assetCanvas=function(k){if(k==='logo-drache'&&!GFX.img[k]&&GFX.ready){try{GFX.img[k]=drLogo()}catch(e){console.warn('logo-drache',e)}}return _drArt(k)};
/* Sprite-Animationen (6×4 Bilder, 2 s) aus Max' Paket */
document.head.insertAdjacentHTML('beforeend',`<style>
.drspr{position:absolute;pointer-events:none;background-size:600% 400%;background-repeat:no-repeat;animation:drx .498s steps(6) infinite,dry 1.992s steps(4) infinite;z-index:2}
@keyframes drx{from{background-position-x:0}to{background-position-x:120%}}
@keyframes dry{from{background-position-y:0}to{background-position-y:133.333%}}
.drtop{filter:drop-shadow(0 4px 10px rgba(0,0,0,.6))}
.drcel{width:min(62vw,300px);height:min(62vw,300px);left:50%;top:6%;transform:translateX(-50%);z-index:0;opacity:.95;animation:drx .498s steps(6) infinite,dry 1.992s steps(4) infinite,drfly 1.2s ease-out}
.drfw{width:100vw;height:66vw;left:0;top:0;z-index:0;opacity:.9}
.drfl{transform:translateX(-50%) scale(1.25);mix-blend-mode:screen;animation:drx .498s steps(6) infinite,dry 1.992s steps(4) infinite}
@keyframes drfly{from{transform:translate(-50%,40vh) scale(.3);opacity:0}to{transform:translateX(-50%);opacity:.95}}
</style>`);
function drSpr(k,cls){return GFX.url[k]?`<div class="drspr ${cls}" style="background-image:url(${GFX.url[k]})"></div>`:''}
let _drHsBg=false;
function drHsBg(on){const s=$('#app .slot');if(!s||!GFX.url.dr_bghs)return;if(on){s.style.backgroundImage=`url(${GFX.url.dr_bghs})`}else s.style.backgroundImage='';_drHsBg=on}
/* Im Slot: Drache und Phönix über dem Schriftzug bewegen sich (statt der festen Bilder) */
const _drLogo=drawLogo;
drawLogo=function(){if(!cur||cur.cfg.id!=='drache')return _drLogo();const keep=HERO.drache;if(!GFX.img._blank){const c=document.createElement('canvas');c.width=c.height=1;GFX.img._blank=c}
 HERO.drache=['_blank','_blank'];try{_drLogo()}finally{HERO.drache=keep}
 const cv=$('#logo'),st=$('.stage');if(!cv||!st)return;st.querySelectorAll('.drtop').forEach(e=>e.remove());if(cv.style.display==='none')return;
 const r=cv.getBoundingClientRect(),q=st.getBoundingClientRect(),h=r.height,z=h*1.05,top=r.top-q.top+h*.5-z/2;
 st.insertAdjacentHTML('beforeend',drSpr('dr_sp_dragon','drtop')+drSpr('dr_sp_phoenix','drtop'));const[l,rt]=st.querySelectorAll('.drtop');
 for(const[e,x]of[[l,r.left-q.left+r.width*.01],[rt,r.right-q.left-r.width*.01-z]])Object.assign(e.style,{width:z+'px',height:z+'px',top:top+'px',left:x+'px'})};
const _drHs=runHs;
runHs=async function(H,o){const on=cur&&cur.cfg.id==='drache';if(on)drHsBg(true);try{return await _drHs(H,o)}finally{if(on)drHsBg(false)}};
const _drCel=celebrate;
celebrate=function(total,o){const p=_drCel(total,o);if(cur&&cur.cfg.id==='drache'){const bet=(o&&o.bet)||(cur.busy&&cur.bet?cur.bet:ROOMS[S.room].bets[S.bet[S.room]]);
 if(total/bet>=TIERS[0][0]){const el=$('#ovl');if(el&&GFX.url.dr_sp_phoenix)el.insertAdjacentHTML('afterbegin',drSpr('dr_fx_fireworks','drfw')+drSpr('dr_fx_flash','drcel drfl')+drSpr('dr_sp_phoenix','drcel'))}}return p};
