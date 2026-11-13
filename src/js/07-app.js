'use strict';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],sleep=ms=>new Promise(r=>setTimeout(r,ms));
const KEY='goldfuchs_casino_v1',view=$('#view');
const ROOMS=[{n:'Low Roller',e:'🌱',bets:[1e3,2e3,5e3,1e4,25e3],k:1},{n:'Classic',e:'🎰',bets:[5e4,1e5,25e4,5e5,1e6],k:1.5},{n:'High Roller',e:'👑',bets:[25e5,5e6,1e7,25e6,5e7],k:3,lock:1}];
const VIP=[['Bronze',0,'🥉'],['Silber',100,'🥈'],['Gold',500,'🥇'],['Platin',2000,'💎'],['Diamant',10000,'👑']];
const SQ=[50,200,500,1500,5000];
const QT=[{k:'spins',t:n=>`Drehe ${n}×`,n:[50,100,200]},{k:'wins',t:n=>`Gewinne ${n} Drehs`,n:[20,40,80]},{k:'feat',t:n=>`Löse ${n} Bonus-Features aus`,n:[1,3,5]},{k:'big',t:n=>`Lande ${n}× einen Big Win (10×+)`,n:[1,2,3]},{k:'max',t:n=>`Drehe ${n}× mit Max-Einsatz`,n:[10,25,50]}];
const BN=['Lena','Maxi','Jonas','Mia','Paul','Emma','Felix','Hannah','Luca','Sophie','Ben','Lea','Tim','Anna','Noah','Clara','Finn','Marie','Jan'];
const PETS=['🥚','🐣','🐥','🐲','🐉'],PETN=['Rohstein','Saphir','Smaragd','Rubin','Kronjuwel'];
const TIPS=['Ich bin Goldie! Tipp mich an, wenn du einen Rat brauchst.','Jeder Dreh hat exakt dieselbe Gewinnchance – versprochen. Nur der Booster hebt die Gewinne offen an.','Im High-Roller-Raum gibt es 3× XP und doppelte Pass-Punkte.','Dein Glücksjuwel erhöht alle Bonus-Münzen. Schleifen lohnt sich!','Komplette Kartensets bringen dicke Belohnungen.','Das Tagesrad wächst mit deiner Serie – komm jeden Tag vorbei!','Platz den Ballon-Deal: Er hebt alle Shop-Pakete eine Stunde lang an.'];
const LOGO={biber:['GOLDENER','BAUMEISTER','white','gold'],donner:['DONNER','HUF','orange','gold'],rubin:['BLITZ-TREFFER','RUBIN','white','red'],frei:['BLITZ-TREFFER','GRENZENLOS','white','cyan'],glut:['GLUTKETTE','DOPPELKNALL','orange','red'],schwein:['DREI','GOLDTÖPFE','pink','gold'],hamster:['GOLDTRESOR','ROYAL','gold','white'],revier:['WILDES','REVIER','green','gold']};
const HERO={biber:['hardhat','mansion','toolbox'],donner:['horseshoe','wildsun','feather'],rubin:['ruby','seven','bolt'],frei:['bolt','seven2','giftbonus'],glut:['fireball','slotm','guitar'],schwein:['pot2','pig1','crown'],hamster:['vault','goldstack','coin'],revier:['emerald','amber','rose']};
const TIERS=[[10,'BIG WIN'],[25,'SUPER WIN'],[50,'MEGA WIN'],[100,'EPIC WIN'],[250,'LEGENDÄR']];
function def(){return{coins:5e6,gems:30,xp:0,lvl:1,vip:0,room:0,bet:[2,0,0],spins:0,won:0,daily:{d:'',streak:0},hour:0,q:{d:'',l:[]},sq:{},sqc:{},cards:{},packs:1,stars:0,setc:{},pet:{lvl:1,xp:0,treats:3},pass:{m:'',pts:0,c:[]},wk:{id:0,sc:0},boost:0,scr:'',st:{},snd:1,mus:1,seen:0,deal:{m:1,u:0,d:''},mini:0}}
function load(){const s=def();try{Object.assign(s,JSON.parse(localStorage.getItem(KEY)||'{}'))}catch(e){}if(!s.deal)s.deal={m:1,u:0,d:''};return s}
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
let S=load(),cur=null,tab='lobby';
function fmt(n){n=Math.round(n);const a=Math.abs(n),f=(v,s)=>(v>=100?v.toFixed(0):v>=10?v.toFixed(1):v.toFixed(2)).replace(/(\.\d*?)0+$/,'$1').replace(/\.$/,'')+s;
 return a>=1e12?f(n/1e12,' Bio'):a>=1e9?f(n/1e9,' Mrd'):a>=1e6?f(n/1e6,' Mio'):a>=1e4?f(n/1e3,'K'):String(n)}
const today=o=>new Date(Date.now()-(o||0)*864e5).toLocaleDateString('sv'),fmtFull=n=>Math.round(n).toLocaleString('de-DE');
function vipT(){let t=0;VIP.forEach((v,i)=>{if(S.vip>=v[1])t=i});return t}
const vipM=()=>1+[0,.2,.5,1,2][vipT()],petM=()=>1+S.pet.lvl*.02,boostM=()=>Date.now()<S.boost?1.5:1,dealM=()=>Date.now()<S.deal.u?S.deal.m:1,base=()=>1e6*(1+S.lvl*.5),need=l=>Math.round(60*Math.pow(l,1.4));
const hrOpen=()=>S.lvl>=10||vipT()>=1;
const gt=(t,c,fit)=>`<span class="gt ${c||''}" data-t="${t}"${fit?` data-fit="${fit}"`:''}>${t}</span>`;
function setGt(el,t){if(!el)return;el.textContent=t;el.dataset.t=t;if(el.dataset.fit)fitGt(el)}
function fitGt(el){const m=+el.dataset.fit||60;el.style.fontSize=Math.min(m,Math.min(innerWidth,520)*.84/(Math.max(4,el.textContent.length)*.66))+'px'}
function fitAll(root){root.querySelectorAll('.gt[data-fit]').forEach(fitGt)}
/* ---------- HUD (coin counter is held back while a win is presented, then rolls up) ---------- */
const HUD={shown:null,lock:0,raf:0};
function coinsTxt(v){return v<1e15?fmtFull(v):fmt(v)}
function tweenCoins(to,ms){cancelAnimationFrame(HUD.raf);const from=HUD.shown==null?to:HUD.shown,t0=performance.now(),el=$('#coins');if(to>from)$('#coinpill').classList.add('bump');
 const st=n=>{const u=Math.min(1,(n-t0)/(ms||500)),e=1-Math.pow(1-u,3);HUD.shown=from+(to-from)*e;el.textContent=coinsTxt(HUD.shown);if(u<1)HUD.raf=requestAnimationFrame(st);else $('#coinpill').classList.remove('bump')};st(t0)}
function hud(){if(!HUD.lock)tweenCoins(S.coins,HUD.shown==null||S.coins<HUD.shown?150:700);$('#gems').textContent=S.gems;$('#lvl').textContent=S.lvl;$('#xpt').textContent='LEVEL '+S.lvl;$('#xpb').style.width=Math.min(100,S.xp/need(S.lvl)*100)+'%';$('#sndb').innerHTML=A(S.snd||S.mus?'sound':'mute')}
function addXp(x){S.xp+=x;while(S.xp>=need(S.lvl)){S.xp-=need(S.lvl);S.lvl++;const c=Math.round(base()*2*petM());S.coins+=c;S.gems+=2;const pk=S.lvl%3===0;if(pk)S.packs++;levelUp(c,pk)}}
function levelUp(c,pk){const u=SLOTS.find(s=>s.lvl===S.lvl);toast(`⭐ LEVEL ${S.lvl}! +${fmt(c)} 🪙 +2 💎${pk?' +🃏':''}`);SFX.bonus();const[x,y]=elCenter('#lvl');fxStars(x,y,14);fxRing(x,y,{s:10,s2:90});if(u)setTimeout(()=>toast(`🔓 Neuer Slot: ${u.name}`),900);if(S.lvl===10)setTimeout(()=>toast('👑 High-Roller-Raum geöffnet!'),1600)}
function toast(t){const d=document.createElement('div');d.className='toast';d.innerHTML=t;$('#toasts').appendChild(d);setTimeout(()=>d.remove(),3100);while($('#toasts').children.length>3)$('#toasts').firstChild.remove()}
let lastSay=TIPS[0];function say(t){lastSay=t;const b=$('#bub');if(b)b.textContent=t}
function modal(h,lock,cls){$('#mbox').className=cls||'';$('#mbox').innerHTML=(lock?'':'<button class="x" data-act="close">✕</button>')+h;$('#modal').classList.remove('hide');$('#modal').dataset.lock=lock?1:''}
function closeM(){$('#modal').classList.add('hide');$('#mbox').innerHTML=''}
/* ---------- periodic state ---------- */
function wkId(){return Math.floor((Date.now()/864e5+3)/7)}
function wkFrac(){return((Date.now()/864e5+3)/7)%1}
function bots(id,frac){return BN.map((n,i)=>{const x=Math.sin(id*97+i*13.7)*1e4,b=x-Math.floor(x);return{n,sc:Math.round((3e7+b*1.5e9)*frac*(1+S.lvl*.15))}})}
function board(id,frac,my){const l=bots(id,frac);l.push({n:'Du',sc:my,me:1});l.sort((a,b)=>b.sc-a.sc);return l}
const rankRew=r=>base()*(r===1?100:r===2?50:r===3?25:r<=10?10:2);
function periodic(){const w=wkId();if(S.wk.id!==w){if(S.wk.id&&S.wk.sc>0){const r=board(S.wk.id,1,S.wk.sc).findIndex(x=>x.me)+1,c=Math.round(rankRew(r));S.coins+=c;setTimeout(()=>{modal(`<h2>${gt('WOCHEN-RANGLISTE')}</h2><div class="big-ic">${A(r<=3?['mgold','msilver','mbronze'][r-1]:'trophy')}</div><p>Letzte Woche: Platz <b>${r}</b> von 20.</p><div class="prize">🪙 ${fmt(c)}</div><button class="gbtn" data-act="close">EINSAMMELN</button>`);fxRain(60);hud()},800)}S.wk={id:w,sc:0}}
 const m=today().slice(0,7);if(S.pass.m!==m)S.pass={m,pts:0,c:[]};qGen()}
function qGen(){const d=today();if(S.q.d===d)return;const p=[0,1,2,3,4].sort(()=>R()-.5).slice(0,3);S.q={d,l:p.map((i,j)=>({i,n:QT[i].n[j],p:0,c:0}))}}
function qAdd(k){for(const q of S.q.l)if(QT[q.i].k===k&&q.p<q.n){q.p++;if(q.p>=q.n){toast('📜 Quest erfüllt – Belohnung abholen!');navDraw()}}}
const qRew=j=>Math.round(base()*3*(j+1)*petM());
/* ---------- navigation ---------- */
const NAV=[['lobby','🏠','Lobby'],['quests','📜','Quests'],['cards','🃏','Karten'],['pet','🐉','Juwel'],['rank','🏆','Rang'],['pass','🛤️','Pass'],['vip','👑','VIP']];
function navDraw(){const dot={quests:S.q.l.some(q=>q.p>=q.n&&!q.c),cards:S.packs>0,pet:S.pet.treats>0,pass:passClaimable()};$('#nav').innerHTML=NAV.map(n=>`<button data-act="go" data-t="${n[0]}" class="${tab===n[0]?'on':''}">${n[1]}<small>${n[2]}</small>${dot[n[0]]?'<i class="dot"></i>':''}</button>`).join('')}
function go(t){if(cur&&cur.busy){cur.auto=false;toast('Dreh läuft noch – einen Moment…');return}if(cur){reUnmount();cur=null}tab=t;$('#app').classList.remove('inslot');$('#app').className='sc-lobby';periodic();setTheme('lobby');
 ({lobby:vLobby,quests:vQuests,cards:vCards,pet:vPet,rank:vRank,pass:vPass,vip:vVip})[t]();navDraw();hud();save();view.scrollTop=0}
/* ---------- lobby ---------- */
function drawTile(cv,s){const w=cv.width,h=cv.height,x=cv.getContext('2d');sceneURL(s.id);const sc=SCENECV[s.id];if(sc)x.drawImage(sc,0,0,sc.width,sc.width*h/w,0,0,w,h);
 const g=x.createLinearGradient(0,h*.4,0,h);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(10,0,30,.9)');x.fillStyle=g;x.fillRect(0,0,w,h);glow(x,w/2,h*.38,w*.6,'#fff3c0',.4);const hk=HERO[s.id];
 x.drawImage(assetCanvas(hk[1]),w*.0,h*.3,w*.46,w*.46);x.drawImage(assetCanvas(hk[2]),w*.54,h*.3,w*.46,w*.46);x.drawImage(assetCanvas(hk[0]),w*.12,h*.05,w*.76,w*.76);const lg=assetCanvas('logo-'+s.id),lw=w*.98,lh=lw*lg.height/lg.width;x.drawImage(lg,(w-lw)/2,h*.97-lh,lw,lh)}
const tileH=(s,bet)=>{const c=S.sqc[s.id]||0,lk=S.lvl<s.lvl;return`<div class="tile ${lk?'lock':''}" data-act="slot" data-id="${s.id}"><canvas data-tile="${s.id}"></canvas><u>${s.coin?(s.hs?'GRAND':'MAJOR')+' '+fmt(JP[s.hs?'grand':'major']*bet*SCALE[s.id]):s.pigs?'3 BONUS-TÖPFE':s.bonus?'AUSWAHL-BONUS':'FREISPIELE'}</u>${lk?`<div class="lk">🔒<b>LEVEL ${s.lvl}</b></div>`:''}<span class="st">${'⭐'.repeat(c)}${'☆'.repeat(SQ.length-c)}</span></div>`};
function vLobby(){const dr=S.daily.d!==today(),sf=S.scr!==today(),mr=Date.now()>=S.mini,bet=ROOMS[S.room].bets[S.bet[S.room]];view.innerHTML=`<div class="lob">
 <div class="promos"><button class="promo p1 ${dr?'rdy':''}" data-act="wheel"><i>${A('wheelicon')}</i><div>${gt('TAGESRAD')}<small>${dr?'Dein Gratis-Dreh wartet!':'Extra-Dreh: 10 Edelsteine'}</small><u>DREHEN</u></div></button>
 <button class="promo p4 ${mr?'rdy':''}" data-act="minibox"><i>${A('mini')}</i><div>${gt('MINI-PREIS')}<small id="mbt">${mr?'Bereit zum Öffnen!':''}</small><u>ÖFFNEN</u></div></button>
 <button class="promo p2 ${sf?'rdy':''}" data-act="scratch"><i>${A('ticket')}</i><div>${gt('RUBBELLOS')}<small>${sf?'Heute gratis!':'Los: '+fmt(base()*5)+' Münzen'}</small><u>RUBBELN</u></div></button>
 <button class="promo p3" data-act="deal"><i>${A('balloon')}</i><div>${gt('BALLON-DEAL')}<small>${dealM()>1?'×'+String(dealM()).replace('.',',')+' aktiv!':'Platz einen Ballon!'}</small><u>ZUM DEAL</u></div></button></div>
 <div class="host" data-act="tip"><i>${A('crest')}</i><div class="bub" id="bub">${lastSay}</div></div>
 <div class="rooms">${ROOMS.map((r,i)=>`<button data-act="room" data-i="${i}" class="${S.room===i?'on':''}">${r.e} ${r.n}${r.lock&&!hrOpen()?' 🔒':''}</button>`).join('')}</div>
 <div class="grp g1"><h3>${gt('BRANDHEISS!','hot')}</h3><div class="shelf">${SLOTS.slice(0,4).map(s=>tileH(s,bet)).join('')}</div></div>
 <div class="grp g2"><h3>${gt('FAVORITEN','fav')}</h3><div class="shelf">${SLOTS.slice(4).map(s=>tileH(s,bet)).join('')}</div></div>
 <button class="collect" data-act="hourly" id="hbtn">${A('clock')}<b>STUNDENBONUS</b><span id="hb"></span></button></div>`;
 $$('canvas[data-tile]').forEach(cv=>{cv.width=Math.round(150*DPR);cv.height=Math.round(214*DPR);drawTile(cv,SLOTS.find(s=>s.id===cv.dataset.tile))});tick()}
function tick(){const d=S.hour+36e5-Date.now(),t=d<=0?'BEREIT!':Math.floor(d/6e4)+':'+String(Math.floor(d/1e3)%60).padStart(2,'0'),el=$('#hb');if(el){el.textContent=t;$('#hbtn').classList.toggle('rdy',d<=0)}
 const h2=$('#hb2');if(h2&&h2.textContent!==t){h2.textContent=t;$('#dealb').classList.toggle('rdy',d<=0)}const mb=$('#mbt');if(mb){const m=S.mini-Date.now();mb.textContent=m<=0?'Bereit zum Öffnen!':'Öffnet in '+Math.floor(m/36e5)+'h '+Math.floor(m/6e4)%60+'m'}if(cur&&!cur.busy)side()}
setInterval(tick,1000);
/* ---------- pages ---------- */
function vQuests(){view.innerHTML=`<div class="pg"><h2>${gt('TAGES-QUESTS')}</h2>${S.q.l.map((q,j)=>`<div class="row"><i class="ri">${A(['target','scroll','star'][j])}</i><div><b>${QT[q.i].t(q.n)}</b><div class="bar"><i style="width:${q.p/q.n*100}%"></i><em>${q.p}/${q.n}</em></div><small>🪙 ${fmt(qRew(j))} · +150 Pass-Punkte${j===2?' · 🃏':''}</small></div>${q.c?A('check','ok'):`<button class="gbtn sm" data-act="qclaim" data-j="${j}" ${q.p<q.n?'disabled':''}>HOLEN</button>`}</div>`).join('')}
 <h2>${gt('SLOT-QUESTS')}</h2><p>Sammle Sterne pro Slot – jeder Stern bringt Münzen und ein Kartenpack.</p>${SLOTS.map(s=>{const n=S.sq[s.id]||0,c=S.sqc[s.id]||0,t=SQ[Math.min(c,SQ.length-1)];return`<div class="row"><i class="ri">${A(HERO[s.id][0])}</i><div><b>${s.name}</b> <span class="sts">${'⭐'.repeat(c)}${'☆'.repeat(SQ.length-c)}</span><div class="bar"><i style="width:${Math.min(100,n/t*100)}%"></i><em>${c>=SQ.length?'MEISTER':n+'/'+t}</em></div></div></div>`}).join('')}</div>`}
const SETS=SLOTS.map(s=>{const k=KEYS[s.id],ids=s.syms.slice(0,4).map(x=>k[x[0]]);return{n:s.name,c:[ids[3],ids[2],ids[1],ids[0],k.W,HERO[s.id][0]]}});
const rar=i=>i<3?1:i<5?2:3;
function vCards(){view.innerHTML=`<div class="pg"><h2>${gt('KARTENSETS')}</h2><div class="row hi"><i class="ri">${A('cards')}</i><div><b>${S.packs} Kartenpack${S.packs===1?'':'s'}</b><br><small>⭐ ${S.stars} Sterne aus Duplikaten · 30 Sterne = 1 Pack</small></div><button class="gbtn sm blue" data-act="starpack" ${S.stars<30?'disabled':''}>⭐→🃏</button><button class="gbtn sm" data-act="pack" ${S.packs<1?'disabled':''}>ÖFFNEN</button></div>
 ${SETS.map((st,si)=>{const have=st.c.filter((_,i)=>S.cards[si*6+i]).length;return`<div class="row col"><div class="rh"><b>${st.n}</b><small>${have}/6</small>${S.setc[si]?A('check','ok'):have===6?`<button class="gbtn sm" data-act="setclaim" data-i="${si}">+${fmt(base()*40)}</button>`:''}</div><div class="cards">${st.c.map((e,i)=>{const n=S.cards[si*6+i]||0;return`<div class="card r${rar(i)} ${n?'':'no'}">${A(e)}<small>${'★'.repeat(rar(i))}</small>${n>1?`<u>×${n}</u>`:''}</div>`}).join('')}</div></div>`}).join('')}</div>`}
function openPack(){S.packs--;const got=[];for(let k=0;k<3;k++){const r=wp([[1,70],[2,25],[3,5]]),si=ri(SETS.length),opts=[0,1,2,3,4,5].filter(i=>rar(i)===r),i=opts[ri(opts.length)],id=si*6+i,nw=!S.cards[id];S.cards[id]=(S.cards[id]||0)+1;if(!nw)S.stars+=r;got.push({e:SETS[si].c[i],r,nw,n:SETS[si].n})}
 SFX.bonus();modal(`<h2>${gt('KARTENPACK')}</h2><div class="cards big">${got.map((g,k)=>`<div class="card r${g.r} flip" style="animation-delay:${.3+k*.35}s">${A(g.e)}<small>${'★'.repeat(g.r)}</small><em>${g.nw?'NEU!':'+'+g.r+' ⭐'}</em></div>`).join('')}</div><p>${got.map(g=>g.n).join(' · ')}</p><button class="gbtn" data-act="close">WEITER</button>`,0,'packm');
 got.forEach((g,k)=>setTimeout(()=>{SFX.pop();if(g.r>1)SFX.scatter(g.r)},300+k*350));save();if(tab==='cards'&&!cur)vCards();navDraw()}
function vPet(){const p=S.pet,st=p.lvl<3?0:p.lvl<6?1:p.lvl<10?2:p.lvl<20?3:4;view.innerHTML=`<div class="pg"><h2>${gt('GLÜCKSJUWEL')}</h2><div class="petb"><div class="rays sm"></div>${PETS[st]}</div><div class="row"><div><b>${PETN[st]} · Stufe ${p.lvl}</b><br><small>Bonus +${p.lvl*2}% auf Tagesrad, Stundenbonus, Quests und Level-Belohnungen</small><div class="bar"><i style="width:${p.xp/(p.lvl*3)*100}%"></i><em>${p.xp}/${p.lvl*3}</em></div><small>Neue Form bei Stufe 3, 6, 10, 20</small></div></div>
 <div class="row"><i class="ri">${A('polish')}</i><div><b>${p.treats} Poliersteine</b><br><small>Alle 20 Drehs gibt es einen (High Roller: alle 10).</small></div><button class="gbtn sm" data-act="feed" ${p.treats<1?'disabled':''}>SCHLEIFEN</button></div></div>`}
function vRank(){const l=board(S.wk.id,Math.max(.02,wkFrac()),S.wk.sc);view.innerHTML=`<div class="pg"><h2>${gt('WOCHEN-TURNIER')}</h2><p>Deine Gewinne dieser Woche gegen 19 simulierte Mitspieler. Abrechnung jeden Montag.</p>${l.map((x,i)=>`<div class="row ${x.me?'me':''}"><b class="rk">${i<3?A(['mgold','msilver','mbronze'][i]):i+1}</b><div><b>${x.n}</b><br><small>Preis: 🪙 ${fmt(rankRew(i+1))}</small></div><b class="sc">${fmt(x.sc)}</b></div>`).join('')}</div>`}
const PT=200,passRew=i=>i%5===4?{g:10,p:1}:i%2?{t:2}:{c:1};
const passClaimable=()=>{const n=Math.min(30,Math.floor(S.pass.pts/PT));for(let i=0;i<n;i++)if(!S.pass.c.includes(i))return true;return false};
function vPass(){const n=Math.floor(S.pass.pts/PT);view.innerHTML=`<div class="pg"><h2>${gt('GOLDPFAD')}</h2><p>Monatspass · ${S.pass.pts} Punkte · Stufe ${Math.min(30,n)}/30</p><div class="bar big"><i style="width:${Math.min(100,S.pass.pts/(PT*30)*100)}%"></i></div><div class="path">${Array.from({length:30},(_,i)=>{const r=passRew(i),t=r.g?`💎 ${r.g} + 🃏`:r.t?`🍖 ${r.t}`:`🪙 ${fmt(base()*(4+i))}`,cl=S.pass.c.includes(i);return`<div class="node ${cl?'done':i<n?'open':''}"><b>${i+1}</b><div>${t}</div>${cl?A('check','ok'):`<button class="gbtn sm" data-act="pclaim" data-i="${i}" ${i<n?'':'disabled'}>${i<n?'HOLEN':'🔒'}</button>`}</div>`}).join('')}</div></div>`}
function vVip(){const t=vipT(),nx=VIP[t+1];view.innerHTML=`<div class="pg"><h2>${gt('VIP-CLUB')}</h2><div class="vipcard"><i>${A(VIP[t][2]==='👑'?'vip':['mbronze','msilver','mgold','gem','vip'][t])}</i><div>${gt(VIP[t][0].toUpperCase())}<small>${S.vip} VIP-Punkte</small>${nx?`<div class="bar"><i style="width:${S.vip/nx[1]*100}%"></i><em>noch ${nx[1]-S.vip} bis ${nx[0]}</em></div>`:''}</div></div>
 <p>VIP-Punkte gibt es für (simulierte) Käufe und alle 100 Drehs. Der Bonus gilt für Shop, Tagesrad und Stundenbonus.</p>${VIP.map((v,i)=>`<div class="row ${i===t?'me':''}"><i class="ri">${A(['mbronze','msilver','mgold','gem','vip'][i])}</i><div><b>${v[0]}</b> · ab ${v[1]} Punkten<br><small>+${[0,20,50,100,200][i]}% Bonus-Münzen${i>=1?' · High Roller sofort offen':''}</small></div></div>`).join('')}
 <h2>${gt('STATISTIK')}</h2><div class="row"><i class="ri">${A('chart')}</i><div>Drehs gesamt: <b>${fmtFull(S.spins)}</b><br>Gesamtgewinn: <b>${fmt(S.won)}</b></div></div></div>`}
/* ---------- slot screen ---------- */
const curBet=()=>cur&&cur.busy?cur.bet:ROOMS[S.room].bets[S.bet[S.room]];
const unit=()=>curBet()*SCALE[cur.cfg.id],pay=m=>Math.round(m*unit()*cur.bm);
function assetFor(cfg,id){const k=KEYS[cfg.id]||{};if(k[id])return k[id];return'rk-'+(RANKSTYLE[cfg.id]||'multi')+'-'+id}
function stageMin(){const w=cur&&cur.cfg.bonus&&cur.cfg.bonus.type==='wheel';return($('#jps')?$('#jps').offsetHeight:0)+($('#extra')?$('#extra').offsetHeight+16:0)+(w?96:58)+8}
function availReels(){const sl=$('.slot');return sl.clientHeight-($('.evt').offsetHeight+$('.sbar').offsetHeight+$('#msg').offsetHeight+stageMin()+16)}
function layoutReels(rows){RE.unit=unit();reLayout(rows,availReels())}
function openSlot(id,quiet){const cfg=SLOTS.find(s=>s.id===id);if(S.lvl<cfg.lvl){SFX.no();toast(`🔒 ${cfg.name} öffnet ab Level ${cfg.lvl}`);return}if(!quiet&&GFX.ready&&FX.spr)starSwirl(1000).then(()=>{if($('#ovl').classList.contains('swirl'))ovHide()});
 const st=S.st[id]||(S.st[id]=newSt());if(!st.pig)st.pig=[0,0,0];cur={cfg,st,busy:false,auto:false,turbo:false,win:0,bm:1,fs:null};tab='slot';navDraw();sceneURL(id);
 $('#app').className='inslot sc-'+id;const wheelTop=cfg.bonus&&cfg.bonus.type==='wheel';
 view.innerHTML=`<div class="slot"><div class="evt" data-act="go" data-t="rank"><div class="pool">🏆<b>WOCHEN-POOL</b><span id="evt"></span></div><div class="pls" id="evr"></div></div>
 <div class="stage" data-min="${wheelTop?150:120}"><div class="jps" id="jps"></div><div class="rail" id="rail"></div><div class="extra" id="extra"></div>
 <div class="topper">${wheelTop?'<canvas id="tw"></canvas>':'<canvas id="logo"></canvas>'}</div></div>
 <div class="rw"><div class="rails"><canvas id="rc"></canvas></div><div class="hsbar hide" id="hsbar"></div><div class="bn" id="bn"></div></div><div class="msg" id="msg">VIEL GLÜCK!</div>
 <div class="sbar"><div class="sl"><div class="r1"><button data-act="max" class="ch">MAX</button><div class="winl"><b id="win">0</b><small>GEWINN</small></div><button data-act="turbo" id="turbob" class="ch">TURBO</button></div>
 <div class="betr"><button data-act="betm">−</button><div><b id="bet"></b><small>EINSATZ</small></div><button data-act="betp">+</button></div></div><button data-act="spin" class="spin"><img class="wtxt" src="${GFX.url['w-spin']}" alt=""><small>Halten für Auto</small></button></div></div>`;
 setTheme(id);reMount($('#rc'),cfg,st);cur.unit=unit();side();layoutReels(cfg.rows);const g=spin(cfg,newSt(),{}).grid;reSetGrid(g);RE.zoneCols=cfg.zone?ZR[st.z|0]:null;RE.onCycle=w=>msg(`${w.label||'GEWINN'} · <b>${fmt(pay(w.amt))}</b>`);
 if(wheelTop)topWheel();else drawLogo();side()}
function drawLogo(){const cv=$('#logo');if(!cv)return;const w=cv.parentElement.clientWidth,h=Math.min(124,Math.max(10,availTop()));if(h<44){cv.style.display='none';return}cv.style.display='';cv.width=Math.round(w*DPR);cv.height=Math.round(h*DPR);cv.style.width=w+'px';cv.style.height=h+'px';const x=cv.getContext('2d');x.scale(DPR,DPR);
 const hk=HERO[cur.cfg.id];glow(x,w/2,h/2,w*.5,'#fff3c0',.3);x.drawImage(assetCanvas(hk[0]),w*.02,h*.04,h*.92,h*.92);x.drawImage(assetCanvas(hk[1]),w-w*.02-h*.92,h*.04,h*.92,h*.92);const lg=assetCanvas('logo-'+cur.cfg.id);let lh=h*.98,lw=lh*lg.width/lg.height;if(lw>w*.66){lw=w*.66;lh=lw*lg.height/lg.width}x.drawImage(lg,(w-lw)/2,(h-lh)/2,lw,lh)}
function availTop(){const st=$('.stage');return st?st.clientHeight-($('#jps').offsetHeight+$('#extra').offsetHeight)-6:100}
/* wheel renderer (topper + overlays) */
const WCOL=['#e6152d','#f08a00','#12a878','#8a1ad0','#1e8fff','#d4a400'];
function drawWheel(x,cx,cy,R,segs,ang,o){o=o||{};const n=segs.length,sg=6.2832/n,t=performance.now()/1000;x.save();
 const rg=x.createLinearGradient(cx-R,cy-R,cx+R,cy+R);rg.addColorStop(0,'#fff6b0');rg.addColorStop(.3,'#f5b301');rg.addColorStop(.55,'#8a4a00');rg.addColorStop(.8,'#ffd23c');rg.addColorStop(1,'#a85d00');x.fillStyle=rg;x.beginPath();x.arc(cx,cy,R,0,7);x.fill();
 const Ri=R*.86;for(let i=0;i<n;i++){const a0=-1.5708-sg/2+i*sg+ang,a1=a0+sg,c=segs[i].c||WCOL[i%WCOL.length],g=x.createRadialGradient(cx,cy,Ri*.15,cx,cy,Ri);g.addColorStop(0,'#fff');g.addColorStop(.25,c);g.addColorStop(1,shade(c,-.45));x.fillStyle=g;x.beginPath();x.moveTo(cx,cy);x.arc(cx,cy,Ri,a0,a1);x.closePath();x.fill();
  if(o.hl===i){x.globalAlpha=.35+.35*Math.sin(t*12);x.fillStyle='#fff6c0';x.fill();x.globalAlpha=1}}
 x.strokeStyle='#ffd23c';x.lineWidth=Math.max(2,R*.018);for(let i=0;i<n;i++){const a=-1.5708-sg/2+i*sg+ang;x.beginPath();x.moveTo(cx,cy);x.lineTo(cx+Ri*Math.cos(a),cy+Ri*Math.sin(a));x.stroke();ball(x,cx+R*.93*Math.cos(a),cy+R*.93*Math.sin(a),R*.028,'#fff','#d0d6e0','#5a6478')}
 for(let i=0;i<n;i++){const a=-1.5708+i*sg+ang;x.save();x.translate(cx,cy);x.rotate(a);const lb=segs[i].l.split('\n'),fs=Math.min(R*.12,Ri*sg*.5/lb.length);lb.forEach((l,j)=>glossText(x,l,Ri*.6,(j-(lb.length-1)/2)*fs*1.02+fs*.36,fs,segs[i].st||'white',{max:Ri*.6,ex:.05}));if(segs[i].a&&!o.noIcon){const im=assetCanvas(segs[i].a),z=Math.min(R*.17,Ri*sg*.55);x.drawImage(im,Ri*.9-z,-z/2,z,z)}x.restore()}
 const bl=24;for(let i=0;i<bl;i++){const a=i/bl*6.2832,on=o.spin?((i+Math.floor(t*14))%3===0):((i+Math.floor(t*3))%2===0);glow(x,cx+R*.97*Math.cos(a),cy+R*.97*Math.sin(a),R*.05,on?'#fffbe0':'#ffb030',on?1:.4)}
 ball(x,cx,cy,R*.15,'#fffbe0','#ffc21a','#8a4a00');x.restore()}
function shade(hex,k){const n=parseInt(hex.slice(1),16);let r=n>>16,g=n>>8&255,b=n&255;const f=v=>Math.round(k<0?v*(1+k):v+(255-v)*k);return`rgb(${f(r)},${f(g)},${f(b)})`}
const wseg=()=>WHEEL.map((w,i)=>({l:w.t==='c'?w.v+'×\nEINSATZ':w.t==='j'?w.j.toUpperCase():w.t==='fs'?w.n+'\nFREISPIELE':'BAU-\nBONUS',st:w.t==='j'?JPST[w.j]:w.t==='hs'?'gold':'white',a:w.t==='hs'?'mansion':w.t==='fs'?'star':w.t==='j'?'gem':null}));
function topWheel(){const cv=$('#tw'),w=cv.parentElement.clientWidth,h=Math.max(70,availTop());cv.width=Math.round(w*DPR);cv.height=Math.round(h*DPR);cv.style.width=w+'px';cv.style.height=h+'px';const segs=wseg();
 const R=Math.min(w*.47,h*1.02),fr=()=>{if(!cv.isConnected||!cur)return;const x=cv.getContext('2d');x.setTransform(DPR,0,0,DPR,0,0);x.clearRect(0,0,w,h);drawWheel(x,w/2,h+R*.04,R,segs,performance.now()/9000,{noIcon:1});
  x.fillStyle=vg(x,0,14,['#ff5a4a','#8a0010']);x.beginPath();x.moveTo(w/2-10,0);x.lineTo(w/2+10,0);x.lineTo(w/2,18);x.fill();requestAnimationFrame(fr)};fr()}
function msg(t){const m=$('#msg');if(m){m._h=null;m.innerHTML=t}if(cur)cur.msgT=Date.now()+3500}
function setWin(v){if(!cur)return;cur.win=v;const e=$('#win');if(e)e.textContent=fmt(v)}
function setH(sel,h){const el=$(sel);if(el&&el._h!==h){el._h=h;el.innerHTML=h}}
function spinBtn(){const b=$('.spin'),C=cur;if(!b||!C)return;b.classList.toggle('busy',!!C.busy&&!C.auto);b.classList.toggle('auto',!!C.auto);const im=b.querySelector('img'),k=C.auto?'w-auto':C.busy?'w-stop':'w-spin';if(im&&im.dataset.k!==k){im.dataset.k=k;im.src=GFX.url[k]}b.lastChild.textContent=C.auto?'Tippen zum Stoppen':C.busy?'Tippen = Schnellstopp':'Halten für Auto'}
function side(){const C=cur;if(!C||!$('#extra'))return;const cfg=C.cfg;let h='';
 if(cfg.pigs)h+=`<div class="pots">${['SAPHIR: +6 SPIELE','RUBIN: ×-WILDS','GOLD: TOP-SYMBOLE'].map((d,i)=>`<span class="pt pt${i}" id="pot${i}"><i style="--f:${Math.min(1,(C.st.pig[i]||0)%60/60)}">${A('pot'+i)}</i><small>${d}</small></span>`).join('')}</div>`;
 if(cfg.zone)h+=`<span class="chip">WILD-ZONE: WALZE ${ZR[C.st.z|0].map(x=>x+1).join(' · ')}</span>`;
 if(boostM()>1)h+=`<span class="chip bst">🚀 BOOSTER ×1,5 · ${Math.ceil((S.boost-Date.now())/6e4)} MIN</span>`;
 if(C.fs)h=`<div class="fsbar"><div>${gt('FREISPIEL','sm')}<b>${C.fs.i} / ${C.fs.i+C.fs.n}</b></div><div>${gt('BONUS-GEWINN','sm')}<b>${fmt(C.fs.t)}</b></div>${C.fs.tag?`<small>${C.fs.tag}</small>`:''}</div>`;
 setH('#extra',h);
 if(cfg.coin&&!C.fs){const un=unit();setH('#jps',Object.keys(JP).filter(k=>cfg.hs||k!=='grand').reverse().map(k=>k==='grand'?`<span class="jgrand"><small>GRAND</small><b>${fmt(JP[k]*un)}</b><small>GRAND</small></span>`:`<span class="j${k}"><b>${fmt(JP[k]*un)}</b><small>${k.toUpperCase()}</small></span>`).join(''))}else if(C.fs)setH('#jps','');
 setH('#rail',`<button data-act="go" data-t="quests">📜<b>${S.q.l.filter(q=>q.p>=q.n).length}/3</b></button><button data-act="go" data-t="pass">🛤️<b>${Math.floor(S.pass.pts%PT/PT*100)}%</b></button><button data-act="go" data-t="cards">🃏<b>${S.packs}</b></button>`);
 const bd=board(S.wk.id,Math.max(.02,wkFrac()),S.wk.sc),me=bd.findIndex(x=>x.me),st0=Math.max(0,Math.min(bd.length-4,me-2)),lf=(1-wkFrac())*7;
 setH('#evr',bd.slice(st0,st0+4).map((x,i)=>`<i class="${x.me?'me':''}"><b>#${st0+i+1} ${x.n}</b><small>${fmt(x.sc)}</small></i>`).join(''));setH('#evt',`${Math.floor(lf)}T ${Math.floor(lf%1*24)}STD`);
 if(!C.busy&&cfg.coin&&Date.now()>(C.msgT||0)){const ks=Object.keys(JP).filter(k=>cfg.hs||k!=='grand'),k=ks[Math.floor(Date.now()/2500)%ks.length],m=$('#msg'),h2=`<i class="t${k}">${k.toUpperCase()}</i> ${fmtFull(JP[k]*unit())}`;if(m&&m._h!==h2){m._h=h2;m.innerHTML=h2}}
 $('#bet').textContent=fmtFull(curBet());$('#turbob').classList.toggle('on',!!C.turbo);spinBtn()}
/* ---------- overlay building blocks ---------- */
function shake(px,ms){const a=$('#app');a.style.setProperty('--sk',px+'px');a.classList.remove('shk');void a.offsetWidth;a.classList.add('shk');clearTimeout(shake.t);shake.t=setTimeout(()=>a.classList.remove('shk'),ms||450)}
const WMAP={'GEWINN':'w-gewinn','BIG WIN':'w-big','SUPER WIN':'w-super','MEGA WIN':'w-mega','EPIC WIN':'w-epic','LEGENDÄR':'w-leg','FREISPIELE':'w-free','GEWONNEN!':'w-won','BONUS!':'w-bonus','LETZTER SPIN!':'w-last','NEUE REIHE!':'w-row','FEATURE KOMPLETT':'w-done','JACKPOT!':'w-jackpot','GLÜCKSRAD':'w-wheel','AUSWAHL-BONUS':'w-pick','UPGRADE!':'w-tier','TAGESBONUS':'w-daily','GLÜCKWUNSCH!':'w-congr','EINSAMMELN':'w-collect','START':'w-start','GRAND':'w-grand','MAJOR':'w-major','MINOR':'w-minor','MINI':'w-mini'};
function TT(t,cls,fit){return WMAP[t]&&GFX.url[WMAP[t]]?WT(WMAP[t],cls):gt(t,cls,fit)}
let OVN=0;
function ovShow(cls,h){const old=$('#ovl'),o=old.cloneNode(false);old.replaceWith(o);OVN++;o.className='ov '+cls;o.innerHTML=h;fitAll(o);return o}
function ovHide(){const o=$('#ovl'),n=OVN;o.classList.add('out');return sleep(280).then(()=>{if(n!==OVN)return;o.className='hide';o.innerHTML=''})}
function waitTap(el,auto){return new Promise(res=>{let done=false;const f=()=>{if(done)return;done=true;res()};el.addEventListener('click',f,{once:true});if(auto)setTimeout(f,auto)})}
function banner(t,d,cls){return new Promise(res=>{const b=$('#bn');if(!b)return res();b.innerHTML=`<div class="${cls||''}">${t}</div>`;setTimeout(()=>{if($('#bn'))$('#bn').innerHTML='';res()},(d||1500)*(cur&&cur.turbo?.6:1))})}
/* 3D star / gem vortex like the reference transition */
function starSwirl(ms,keep){const el=ovShow('swirl','<canvas id="swc"></canvas>'),cv=el.querySelector('#swc'),W=innerWidth,H=innerHeight;cv.width=Math.round(W*DPR);cv.height=Math.round(H*DPR);cv.style.width=W+'px';cv.style.height=H+'px';const x=cv.getContext('2d');x.scale(DPR,DPR);
 const st=[],t0=performance.now();for(let i=0;i<70;i++)st.push({a:R()*6.283,z:R()*1.2,k:R()<.62?'star':'bstar',r:R()*6,v:.5+R()*.7});SFX.whoosh();
 return new Promise(res=>{const f=n=>{const u=Math.max(0,Math.min(1,(n-t0)/ms));x.clearRect(0,0,W,H);const bg=Math.min(1,u*4)*(keep?1:u>.75?(1-u)/.25:1);x.fillStyle=`rgba(18,4,58,${.9*bg})`;x.fillRect(0,0,W,H);glow(x,W/2,H/2,W*.6,'#ffd860',.5*bg);
  for(const s of st){s.z+=s.v*.018*(1+u*2.5);const z=s.z%1.2,d=Math.pow(z,2.4)*Math.max(W,H)*.85,px=W/2+Math.cos(s.a+u*2.4)*d,py=H/2+Math.sin(s.a+u*2.4)*d,sz=8+z*z*230;x.save();x.translate(px,py);x.rotate(s.r+u*5);x.globalAlpha=Math.min(1,z*3)*bg;x.drawImage(FX.spr[s.k],-sz/2,-sz/2,sz,sz);x.restore()}
  if(u<1)requestAnimationFrame(f);else res()};requestAnimationFrame(f)})}
async function cine(asset){const C=cur,tb=C&&C.turbo;await starSwirl(tb?600:1100,1);ovShow('cine',`<div class="spot"></div><div class="rays"></div><div class="hero">${A(asset)}</div>`);SFX.whoosh();await sleep(tb?650:1350);fxFlash(innerWidth/2,innerHeight*.45,innerWidth*.9,{life:.5});SFX.stopBig();shake(10,400);await sleep(260)}
async function meteorIntro(){const C=cur,tb=C&&C.turbo,el=ovShow('meteor','<canvas id="mtc"></canvas>'),cv=el.querySelector('#mtc'),W=innerWidth,H=innerHeight;cv.width=Math.round(W*DPR);cv.height=Math.round(H*DPR);cv.style.width=W+'px';cv.style.height=H+'px';const x=cv.getContext('2d');x.scale(DPR,DPR);
 sceneURL('glut');const bg=SCENECV.glut,D=tb?1600:3200,t0=performance.now();SFX.fire();SFX.rumble(D/1000);
 await new Promise(res=>{const f=n=>{const u=Math.max(0,Math.min(1,(n-t0)/D));x.clearRect(0,0,W,H);x.drawImage(bg,0,0,W,H);x.fillStyle='rgba(0,0,0,.35)';x.fillRect(0,0,W,H);
  const s=Math.pow(u,2.2)*Math.max(W,H)*2.6+60,cx=W*.5+(1-u)*W*.25,cy=H*.42-(1-u)*H*.2;glow(x,cx,cy,s*.9,'#ff7a10',.6);x.save();x.translate(cx,cy);x.rotate(u*1.6);x.drawImage(FX.spr.fire,-s/2,-s/2,s,s);x.restore();
  if(u>.82){x.fillStyle=`rgba(255,240,200,${(u-.82)/.18})`;x.fillRect(0,0,W,H)}if(R()<.06){x.strokeStyle='#cfefff';x.lineWidth=2.5;x.shadowColor='#7ad8ff';x.shadowBlur=14;x.beginPath();let px=R()*W,py=0;x.moveTo(px,py);while(py<H*.5){px+=(R()-.5)*50;py+=20+R()*30;x.lineTo(px,py)}x.stroke();x.shadowBlur=0}
  if(u<1)requestAnimationFrame(f);else res()};requestAnimationFrame(f)});SFX.stopBig();shake(14,600)}
async function signIntro(o){const C=cur;const el=ovShow('intro',`<div class="rays"></div><div class="sign"><div class="sgi"><b>${o.l1}</b><b>${o.l2}</b></div></div>${o.sub?`<p class="isub">${o.sub}</p>`:''}<button class="gbtn pulse" id="igo">${o.btn||'TIPPEN ZUM STARTEN'}</button>`);SFX.trigger();
 await sleep(700);await waitTap(el,C&&C.auto?2800:0);SFX.click();await ovHide()}
async function triggerSeq(cells){const C=cur,tb=C.turbo;if(!cells.length)return;RE.spot=new Set(cells.map(c=>c[0]+','+c[1]));RE.spotT=RE.t;duck(2200);
 for(let k=0;k<3;k++){reFlash(cells);SFX.scatter(Math.min(5,2+k));cells.forEach(c=>{const[x,y]=reCellCenter(c[0],c[1]);fxRing(x,y,{s:10,s2:70+k*20});fxStars(x,y,4+k*2)});await sleep(tb?260:560)}
 SFX.bonusHit();shake(9,550);const rc=reRect();fxFlash(rc.left+rc.width/2,rc.top+rc.height/2,rc.width,{life:.5});cells.forEach(c=>{const[x,y]=reCellCenter(c[0],c[1]);fxExplode(x,y)});
 await banner(WT('w-bonus','bnimg'),tb?900:1700,'img');RE.spot=null}
/* drumroll suspense before a big reveal */
async function suspense(el,ms){SFX.roll(ms/1000);fadeMusic(.08,300);const t0=performance.now();el&&el.classList.add('sus');await sleep(ms);el&&el.classList.remove('sus');fadeMusic(.38,600)}
/* celebration: suspense, tiered count-up with escalating effects, then collect */
function celebrate(total,o){o=o||{};return new Promise(async res=>{const C=cur,bet=o.bet||(C&&C.busy&&C.bet?C.bet:ROOMS[S.room].bets[S.bet[S.room]]),ratio=total/bet,tiers=TIERS.filter(t=>ratio>=t[0]),auto=(C&&C.auto)||o.auto;
 const el=ovShow('cel',`<div class="rays"></div><div class="celbox"><div class="ctitle">${TT(o.title||'GEWINN','',62)}</div><div class="cnum">${gt(tiers.length||o.roll?'? ? ?':'0','num',58)}</div><div class="csub">${o.sub||''}</div><button class="gbtn hide" id="ccol">${o.collect?WT('w-collect','bt'):'WEITER'}</button></div>`);
 const ttl=el.querySelector('.ctitle'),num=el.querySelector('.cnum .gt');
 if(tiers.length||o.roll){await suspense(el.querySelector('.cnum'),(C&&C.turbo)?700:tiers.length>2?2100:1500)}
 if(tiers.length)setTheme('bigwin');SFX.big();duck(1400);fxRain(tiers.length?50:18);if(tiers.length){shake(8,500);fxCoinBlast(26)}
 const bounds=tiers.map(t=>t[0]*bet).concat([total]);let seg=0,from=0,t0=performance.now(),lastTick=0,done=false,shownTier=-1,rainT=0;const dur=i=>tiers.length?(i===0?2000:2200):1600,start=performance.now();
 const fin=()=>{done=true;setGt(num,fmtFull(total));el.querySelector('.cnum').classList.add('land');const b=el.querySelector('#ccol');b.classList.remove('hide');b.classList.add('pulse');SFX.winMed();fxGlints(b.getBoundingClientRect(),10,{spread:.6});const nr=num.getBoundingClientRect();fxStars(nr.left+nr.width/2,nr.top+nr.height/2,22);
  const go=()=>{if(go.d)return;go.d=1;SFX.collect();const[bx,by]=elCenter(b),[tx,ty]=elCenter('#coinpill');if(o.collect){fxFly(bx,by,tx,ty,36,{onHit:(i,n)=>{if(i===1){HUD.lock=0;tweenCoins(S.coins,1500)}if(i%4===0)SFX.coin()}})}el.classList.add('fade');setTimeout(()=>{ovHide();if(tiers.length)setTheme(C?C.cfg.id:'lobby');res()},o.collect?1000:400)};
  b.onclick=go;if(auto)setTimeout(go,2600)};
 el.addEventListener('click',e=>{if(done||e.target.closest('#ccol'))return;if(performance.now()-start>1200){from=bounds[seg];if(seg>=bounds.length-1){fin();return}setTier(seg);seg++;t0=performance.now()}});
 function setTier(i){if(i>=tiers.length||i<=shownTier)return;shownTier=i;ttl.innerHTML=TT(tiers[i][1]);ttl.classList.remove('pop');void ttl.offsetWidth;ttl.classList.add('pop');SFX.tier();shake(6+i*3,500);fxRain(40+i*40,{kinds:{coin:.72,bar:.18+i*.03,gem:.1}});fxCoinBlast(14+i*8);fxFlash(innerWidth/2,innerHeight*.4,innerWidth*.8);fxStars(innerWidth/2,innerHeight*.35,24);el.querySelector('.rays').style.animationDuration=Math.max(6,30-i*7)+'s'}
 if(tiers.length)setTier(0),seg=0;
 const step=now=>{if(done)return;const u=Math.max(0,Math.min(1,(now-t0)/dur(seg))),e=seg===bounds.length-1?1-Math.pow(1-u,2.4):u,v=from+(bounds[seg]-from)*e;setGt(num,fmtFull(v));if(now-lastTick>70){lastTick=now;SFX.count(u)}
  if(tiers.length&&now-rainT>260){rainT=now;fxRain(5+seg*3)}
  if(u>=1){from=bounds[seg];if(seg<bounds.length-1){seg++;setTier(seg);t0=now+380}else{fin();return}}requestAnimationFrame(step)};requestAnimationFrame(step)})}
/* ---------- spin flow with anticipation ---------- */
function antiCount(g,c,id){let n=0;for(let i=0;i<c;i++)for(const s of g[i])if(s.s===id)n++;return n}
function anticipate(cfg,g,c){if(c===0)return false;if(cfg.scat&&antiCount(g,c,'S')>=2)return true;if(cfg.bonus&&cfg.bonus.reels.includes(c)&&antiCount(g,c,'B')>=2)return true;
 if(cfg.coin&&cfg.coin.need&&c>=2&&antiCount(g,c,'C')>=cfg.coin.need-(cfg.coin.need>=6?2:1))return true;if(cfg.coll&&c===4&&antiCount(g,c,'C')>=3)return true;if(cfg.qh&&antiCount(g,c,'Z')>=4)return true;return false}
function waitUntil(t,brk){return new Promise(res=>{const f=()=>{if(performance.now()>=t||brk())res();else setTimeout(f,16)};f()})}
async function reelSpin(r,slow){const C=cur,cfg=C.cfg,tb=C.turbo&&!slow;C.quick=false;C.spinning=true;reStart(tb);SFX.spin();const t0=performance.now(),lands=[];let extra=0,sc=0;spinBtn();
 const b0=tb?320:(slow?1150:900),st=tb?110:(slow?360:300);
 for(let c=0;c<5;c++){await waitUntil(t0+b0+c*st+extra,()=>C.quick);
  if(!C.quick&&(anticipate(cfg,r.grid,c)||(C.forceAnt&&c>=3))){await Promise.all(lands);RE.antic[c]=1;tension(true);const add=tb?1300:2900;SFX.antic(add/1000+.2);duck(add+400);const ts=performance.now();
   await waitUntil(ts+add*.45,()=>C.quick);if(!C.quick)RE.cols[c].slow=6;await waitUntil(ts+add*.82,()=>C.quick);if(!C.quick)RE.cols[c].slow=3.2;await waitUntil(ts+add,()=>C.quick);extra+=add+(tb?80:200)}
  const ci=c,ant=RE.antic[c];lands.push(reStop(ci,r.grid[ci],ant).then(()=>{RE.antic[ci]=0;if(ant){SFX.stopBig();shake(5,300)}else SFX.stop();const col=r.grid[ci],sp=[];col.forEach((s,ri)=>{if(s.s==='S'||s.s==='B'||(cfg.coin&&cfg.coin.need&&s.s==='C')||s.s==='H'||s.s==='Z')sp.push([ci,ri])});
   if(sp.length){sc+=sp.length;reFlash(sp);sp.forEach(p=>{const[x,y]=reCellCenter(p[0],p[1]);fxGlints({left:x-20,top:y-20,width:40,height:40},2,{spread:.15})});if(sp.some(p=>{const s=col[p[1]];return s.s==='S'||s.s==='B'})||sc>=3)SFX.scatter(Math.min(5,sc))}}))}
 await Promise.all(lands);tension(false);RE.antic=[0,0,0,0,0];RE.grid=r.grid;C.spinning=false;C.forceAnt=0;spinBtn()}
function rollWin(add,ms){return new Promise(res=>{const C=cur,from=C.win,to=from+add,t0=performance.now();let lt=0;C.skip=false;const st=n=>{const u=C.skip?1:Math.max(0,Math.min(1,(n-t0)/ms));setWin(from+add*u);if(n-lt>65&&u<1){lt=n;SFX.count(u*.6)}if(u<1)requestAnimationFrame(st);else res()};requestAnimationFrame(st)})}
async function collectAnim(r){const C=cur,g=r.grid,coins=[],cols=[];g.forEach((col,c)=>col.forEach((s,ri)=>{if(s.s==='C')coins.push([c,ri,s]);if(s.s==='H')cols.push([c,ri])}));if(!cols.length||!coins.length)return;
 msg('DER TRESOR SAMMELT EIN …');RE.spot=new Set(cols.concat(coins).map(c=>c[0]+','+c[1]));RE.spotT=RE.t;reFlash(cols);SFX.roll(.9);await sleep(C.turbo?300:900);let i=0;
 for(const k of cols)for(const cc of coins){const[x0,y0]=reCellCenter(cc[0],cc[1]),[x1,y1]=reCellCenter(k[0],k[1]);fxFly(x0,y0,x1,y1,1,{s:34,dur:.5,onHit:()=>{SFX.ding(i++);fxRing(x1,y1,{s:8,s2:50});shake(3,150)}});await sleep(C.turbo?80:240)}await sleep(700);RE.spot=null}
async function showWins(r){const C=cur;if(!r.wins.length){if(r.fx.sc)reShowWins([],r.fx.sc);return 0}
 if(C.cfg.coll&&r.wins.some(w=>w.label==='Tresor geleert'))await collectAnim(r);
 reShowWins(r.wins,r.fx.sc);const a=pay(r.win),ratio=a/C.bet,lab=r.wins.length===1?r.wins[0].label:null;msg(`${lab?lab.toUpperCase()+' · ':''}GEWINN <b>${fmt(a)}</b>`);
 (ratio>=4?SFX.winMed:ratio>=1?SFX.win:SFX.coin)();const rc=reRect();if(ratio>=2)fxFountain(rc.left+rc.width/2,rc.top+rc.height*.6,Math.min(80,10+Math.round(ratio*3)),{w:rc.width*.7,bars:ratio>=5?.1:0});if(ratio>=1)fxGlints(rc,Math.min(22,4+Math.round(ratio*2)),{spread:.9});if(ratio>=5)shake(4,300);
 await rollWin(a,ratio<1?450:ratio<3?900:ratio<10?1500:1900);if(C.fs){C.fs.t+=a;side()}return a}
/* ---------- hold & spin ---------- */
function hsKeys(H){const o=[];for(let c=0;c<5;c++)for(let r=H.M-H.open;r<H.M;r++)o.push([c,r]);return o}
function hsBar(H,sum,hidden){const lamps=[0,1,2].map(i=>`<i class="${i<H.left?'on':''}${H.left===1&&!H.done?' red':''}"></i>`).join('');let cnt=0;for(const col of H.cells)for(const x of col)if(x)cnt++;
 const un=cur.cfg.hs.unlock,nx=un&&H.open<H.M?un[H.open-cur.cfg.rows]-cnt:0;setH('#hsbar',`<div class="rs"><small>RESPINS</small><span>${lamps}</span></div><div class="sm"><small>SUMME</small><b>${hidden?'? ? ?':fmt(sum)}</b></div>${nx>0?`<div class="un"><small>NEUE REIHE</small><b>NOCH ${nx}</b></div>`:''}`)}
async function runHs(H,o){o=o||{};const C=cur,cfg=C.cfg,tb=C.turbo,nm=cfg.hs.upgrade?['BAU','BONUS']:cfg.hs.maxRows?['GLUT','KETTE']:['RUBIN','LINK'],builder=!!cfg.hs.upgrade,fire=!!cfg.hs.maxRows,hero=symKey({s:'C',v:1},0);
 if(o.intro!==false){if(fire)await meteorIntro();else await cine(hero);await signIntro({l1:nm[0],l2:nm[1],sub:'3 Respins – jeder neue Treffer setzt sie zurück.'+(builder?' Treffer bauen und werten Häuser auf!':fire?' Ab 8, 12, 16, 20 Kugeln öffnen sich neue Reihen!':''),btn:'START'})}
 setTheme('feature');reClearWins();reSetHS(H);layoutReels(H.open);$('#hsbar').classList.remove('hide');H.left=3;
 const vis=()=>hsKeys(H).filter(([c,r])=>H.cells[c][r]),val=(c,r)=>{const s=H.cells[c][r];return s?pay(s.v||0):0};let sum=0;
 const land=async(k,offR)=>{const[c,r]=k.split(',').map(Number),[x,y]=reCellCenter(c,r-offR);if(fire){RE.hide.add(k);SFX.meteor();await fxMeteor(x+(R()-.5)*160,-60,x,y,{dur:tb?.32:.55,s:Math.max(40,RE.ch*.9)});RE.hide.delete(k);shake(4,200)}else{RE.hide.delete(k);fxBurst(x,y,10,{v:240});fxRing(x,y,{s:8,s2:60})}RE.pop.set(k,RE.t);SFX.coinLand()};
 const off0=H.M-H.open;for(const[c,r]of vis()){const k=c+','+r;if(fire)RE.hide.add(k)}for(const[c,r]of vis()){await land(c+','+r,off0);sum+=val(c,r);hsBar(H,sum,builder);await sleep(tb?40:fire?60:140)}
 while(!H.done){await sleep(tb?300:650);const before=new Set(vis().map(k=>k.join(','))),empty=hsKeys(H).filter(([c,r])=>!H.cells[c][r]).map(k=>k.join(',')),o2=H.open,ev=hsStep(cfg,H),evk=ev.map(e=>e.join(',')),nw=evk.filter(k=>!before.has(k)),up=evk.filter(k=>before.has(k));
  const offR=H.M-o2,last=H.left===1&&!H.done&&!ev.length;nw.forEach(k=>RE.hide.add(k));RE.spinSet=new Set(empty);SFX.spin();if(H.left<=1&&!ev.length){}await sleep(tb?420:950);
  for(let c=0;c<5;c++){const colKeys=empty.filter(k=>+k.split(',')[0]===c);for(const k of colKeys){RE.spinSet.delete(k);if(nw.includes(k)){await land(k,offR);const[cc,rr]=k.split(',').map(Number),s=H.cells[cc][rr];
     if(s.d){SFX.tier();const[x,y]=reCellCenter(cc,rr-offR);fxRing(x,y,{s:10,s2:200,col:'#ff7a2a'});shake(8,400);await banner(gt('REIHE ×2!','',40),1000,'img');}sum=vis().reduce((a,[c2,r2])=>a+val(c2,r2),0);hsBar(H,sum,builder);await sleep(tb?40:120)}}
   if(colKeys.length){SFX.tick();await sleep(tb?30:140)}}
  RE.spinSet=null;for(const k of up){RE.pop.set(k,RE.t);const[c,r]=k.split(',').map(Number),[x,y]=reCellCenter(c,r-offR);SFX.upgrade();fxStars(x,y,10);fxText(x,y-20,'UPGRADE!',{size:18,style:'green'});await sleep(tb?60:220)}
  if(H.open>o2){layoutReels(H.open);SFX.fire();shake(10,600);const rc=reRect();fxFlash(rc.left+rc.width/2,rc.top+20,rc.width*.7,{col:'#ffb040'});fxEmbers(rc,40);await banner(WT('w-row','bnimg'),1400,'img')}
  if(ev.length&&!H.done){SFX.reset()}const lst=H.left===1&&!H.done;RE.tension=lst;tension(lst);hsBar(H,sum,builder);if(lst){SFX.last();await banner(WT('w-last','bnimg'),tb?700:1300,'img')}}
 RE.tension=false;tension(false);hsBar(H,sum,builder);await sleep(400);SFX.bonus();await banner(WT('w-done','bnimg'),tb?800:1700,'img');
 if(H.grand){SFX.grand();shake(16,900);fxRain(160,{kinds:{coin:.65,bar:.25,gem:.1}});fxCoinBlast(40);await banner(WT('w-grand','bnimg')+WT('w-jackpot','bnimg'),3000,'img')}
 const order=vis();if(builder){msg('DIE HÄUSER WERDEN BEWERTET …');SFX.roll(1.2);await sleep(tb?300:1100);for(const[c,r]of order){RE.rev.set(c+','+r,RE.t);SFX.swirl();const[x,y]=reCellCenter(c,r-(H.M-H.open));fxGlints({left:x-20,top:y-20,width:40,height:40},3,{spread:.2});await sleep(tb?80:230)}await sleep(600)}
 msg('EINSAMMELN …');let acc=0,i=0;for(const[c,r]of order){const k=c+','+r,s=H.cells[c][r];RE.hl=k;acc+=val(c,r);const[x,y]=reCellCenter(c,r-(H.M-H.open)),[mx,my]=elCenter('#hsbar .sm b');fxFly(x,y,mx,my,1,{kind:'coin',s:28,dur:.45});SFX.ding(i++);hsBar(H,acc,false);
  if(s.j){SFX.tier();shake(10,500);fxCoinBlast(16);await banner(WT('w-'+s.j,'bnimg')+WT('w-jackpot','bnimg'),1700,'img')}await sleep(tb?60:200)}
 RE.hl=null;const total=pay(hsTotal(H));hsBar(H,total,false);await sleep(700);addFeatWin(total);
 await celebrate(total,{title:nm.join('-')+'-GEWINN',roll:true});C.celebrated=true;$('#hsbar').classList.add('hide');reSetReels();layoutReels(cfg.rows);reSetGrid(C.lastGrid||RE.grid);setTheme(cfg.id);return total}
function addFeatWin(a){const C=cur;setWin(C.win+a);if(C.fs){C.fs.t+=a;side()}}
/* ---------- wheel / picks / pots ---------- */
function wheelOverlay(segs,idx,o){o=o||{};return new Promise(res=>{const C=cur,el=ovShow('wheel',`<div class="rays"></div><h2 class="wt">${TT(o.title||'GLÜCKSRAD','',46)}</h2><div class="wwrap"><canvas id="wcv"></canvas><div class="flap" id="flap"></div></div><p class="isub" id="wres">${o.sub||''}</p><button class="gbtn pulse" id="wgo">${WT('w-spin','bt')}</button>`),cv=el.querySelector('#wcv'),S0=Math.min(innerWidth*.9,420);
 cv.width=Math.round(S0*DPR);cv.height=Math.round(S0*DPR);cv.style.width=cv.style.height=S0+'px';const x=cv.getContext('2d'),n=segs.length,sg=6.2832/n;let ang=0,spin=false,hl=-1,raf=0,lastSeg=0,flap=0;
 const draw=()=>{x.setTransform(DPR,0,0,DPR,0,0);x.clearRect(0,0,S0,S0);drawWheel(x,S0/2,S0/2,S0*.48,segs,ang,{spin,hl});$('#flap').style.transform=`translateX(-50%) rotate(${flap}deg)`;flap*=.8;raf=requestAnimationFrame(draw)};draw();
 const go=()=>{if(spin)return;spin=true;el.querySelector('#wgo').classList.add('hide');SFX.whoosh();duck(9000);const f=.62+R()*.33,target=-(idx*sg-sg/2+f*sg),turns=(C&&C.turbo?4:7)*6.2832,A=turns+((target-ang)%6.2832+6.2832)%6.2832,a0=ang,D=C&&C.turbo?4200:8200,t0=performance.now();SFX.roll(D/1000*.9);
  const st=now=>{const u=Math.min(1,(now-t0)/D),e=1-Math.pow(1-u,5);ang=a0+A*e;const sgi=Math.floor((ang+sg/2)/sg);if(sgi!==lastSeg){lastSeg=sgi;SFX.tick();flap=-28}
   if(u<1)requestAnimationFrame(st);else{spin=false;hl=idx;SFX.winMed();shake(8,500);const r=cv.getBoundingClientRect();fxStars(r.left+r.width/2,r.top+r.height*.12,22);fxFlash(r.left+r.width/2,r.top+r.height*.15,180);fxExplode(r.left+r.width/2,r.top+r.height*.1,1);el.querySelector('#wres').innerHTML=o.result?o.result:'';fitAll(el);setTimeout(()=>{cancelAnimationFrame(raf);ovHide().then(res)},2600)}};requestAnimationFrame(st)};
 el.querySelector('#wgo').onclick=go;if(C&&C.auto)setTimeout(go,1500)})}
function pickOverlay(){return new Promise(res=>{const C=cur,b=pickBoard(),k=[0,0,0,0,0];let done=false;const el=ovShow('pick',`<div class="rays"></div><h2 class="wt">${TT('AUSWAHL-BONUS','',44)}</h2><p class="isub">Finde 3 gleiche – sie bestimmen deine Freispiele!</p><div class="picks">${b.map((x,i)=>`<button data-i="${i}">${A('gift')}</button>`).join('')}</div>`);
 const reveal=(t,p,dim)=>{t.classList.add('open');if(dim)t.classList.add('dim');t.innerHTML=`<b>${PICKS[p].n}</b><small>SPIELE</small><em>×${PICKS[p].xm}</em>`;t.className+=' c'+p};
 const pick=t=>{if(!t||done||t.disabled)return;t.disabled=true;t.classList.add('shake');SFX.shake();const cnt=k.reduce((a,b)=>a+Math.max(0,b-1),0);setTimeout(()=>{const p=b[+t.dataset.i];reveal(t,p);SFX.pop();const r=t.getBoundingClientRect();fxStars(r.left+r.width/2,r.top+r.height/2,6);k[p]++;
  if(k[p]===2){$$('.picks .c'+p).forEach(e=>e.classList.add('two'));SFX.scatter(2)}
  if(k[p]>=3){done=true;$$('.picks .c'+p).forEach(e=>e.classList.add('win'));SFX.trigger();setTimeout(()=>{$$('.picks button:not(.open)').forEach(e=>reveal(e,b[+e.dataset.i],1))},900);setTimeout(()=>ovHide().then(()=>res(PICKS[p])),2600)}},C&&C.turbo?150:650)};
 el.querySelector('.picks').onclick=e=>pick(e.target.closest('button'));if(C&&C.auto){const a=()=>{if(done)return;const f=$$('.picks button:not(.open):not([disabled])');pick(f[ri(f.length)]);setTimeout(a,900)};setTimeout(a,900)}})}
async function potBurst(pig){const nm=['SAPHIR','RUBIN','GOLD'];for(let i=0;i<3;i++)if(pig[i]){const el=$('#pot'+i);if(!el)continue;el.classList.add('shake');SFX.shake();await sleep(1100);el.classList.remove('shake');const[x,y]=elCenter(el);SFX.burst();fxFlash(x,y,160);fxFountain(x,y,30,{v:520});fxStars(x,y,12);await banner(nm[i]+'-TOPF PLATZT!',1300,'jp')}}
/* ---------- features ---------- */
async function features(r,mode){const C=cur,cfg=C.cfg;let t=0;
 if(r.fx.hs){if(!mode.free)qAdd('feat');await triggerSeq(r.grid.flatMap((col,c)=>col.map((s,ri)=>s.s==='C'?[c,ri]:null)).filter(Boolean));C.lastGrid=r.grid;t+=await runHs(hsNew(cfg,r.grid))}
 if(r.fx.bonus){if(!mode.free)qAdd('feat');await triggerSeq(r.fx.sc||[]);
  if(cfg.bonus.type==='wheel'){await cine('wheeltok');await signIntro({l1:'RAD',l2:'FEATURE',sub:'Münzen, Jackpots, Freispiele oder der Bau-Bonus warten!',btn:'TIPPEN ZUM DREHEN'});const i=wheelSpin(),w=WHEEL[i];
   const lab=w.t==='c'?w.v+'× EINSATZ':w.t==='j'?w.j.toUpperCase()+' JACKPOT':w.t==='fs'?w.n+' FREISPIELE':'BAU-BONUS';await wheelOverlay(wseg(),i,{title:'RAD-FEATURE',result:gt(lab,'res',34)});
   if(w.t==='c'||w.t==='j'){const a=pay(w.t==='c'?w.v:JP[w.j]);addFeatWin(a);t+=a;await celebrate(a,{title:lab});C.celebrated=true}else if(w.t==='hs'){C.lastGrid=r.grid;t+=await runHs(hsNew(cfg,null,6),{intro:false})}else r.fx.fs=(r.fx.fs||0)+w.n}
  else if(mode.free){r.fx.fs=(r.fx.fs||0)+5}else{await cine('giftbonus');const p=await pickOverlay();r.fx.fs=p.n;r.fx.mode={xm:p.xm}}}
 if(r.fx.fs&&!mode.free){if(!r.fx.bonus){qAdd('feat');if(r.fx.sc)await triggerSeq(r.fx.sc)}if(r.fx.pig)await potBurst(r.fx.pig);t+=await runFree(r.fx.fs,r.fx.mode,r.fx.pig)}return t}
async function fsIntro(n,tag){const C=cur,el=ovShow('fsi',`<div class="rays"></div><div class="fsbox"><div class="ctitle">${TT('GEWONNEN!')}</div><div class="fsn">${gt('0','num')}</div><div class="ctitle sm">${TT('FREISPIELE')}</div>${tag?`<p class="isub">${tag}</p>`:''}<button class="gbtn pulse hide" id="fgo">${WT('w-start','bt')}</button></div>`);SFX.trigger();fxRain(40);fxCoinBlast(14);
 const nn=el.querySelector('.fsn .gt');await sleep(500);for(let i=1;i<=n;i++){setGt(nn,String(i));nn.parentElement.classList.remove('tick');void nn.offsetWidth;nn.parentElement.classList.add('tick');SFX.ding(i);await sleep(Math.max(60,1100/n))}SFX.tier();shake(8,500);fxStars(innerWidth/2,innerHeight*.42,26);const b=el.querySelector('#fgo');b.classList.remove('hide');await waitTap(b,C.auto?2600:0);SFX.click();await ovHide()}
async function runFree(n,m,pig){const C=cur,cfg=C.cfg,mode=Object.assign({free:true},cfg.fmode,m);let t=0,i=0;if(pig)pig.forEach((p,k)=>{if(p)C.st.pig[k]=0});
 const tag=[mode.xm?'Alle Gewinne ×'+mode.xm:'',mode.mult?'Wilds mit ×2 / ×3':'',mode.high?'Nur Top-Symbole':'',cfg.zone?'Die Wild-Zone schrumpft nicht':'',cfg.coll?'Jede COLLECT-Tafel sammelt doppelt':''].filter(Boolean).join(' · ');
 await cine(KEYS[cfg.id].S||KEYS[cfg.id].B||(cfg.pigs?'pot2':'star'));await fsIntro(n,tag);setTheme('feature');C.fs={i:0,n,t:0,tag};side();$('#app').classList.add('fsmode');
 while(n>0&&i<300){n--;i++;C.fs.i=i;C.fs.n=n;side();if(n===0&&i>1){SFX.last();await banner(WT('w-last','bnimg'),C.turbo?600:1100,'img')}const r=spin(cfg,C.st,mode);RE.zoneCols=cfg.zone?ZR[r.zone]:null;await reelSpin(r,1);t+=await showWins(r);const f=await features(r,mode);t+=f;
  if(r.fx.fs){n+=r.fx.fs;C.fs.n=n;side();SFX.trigger();shake(8,500);fxCoinBlast(12);await banner(gt(`+${r.fx.fs} FREISPIELE!`,'',40),1800,'img')}await sleep(C.turbo?150:450);reClearWins()}
 C.fs=null;side();$('#app').classList.remove('fsmode');setTheme(cfg.id);await banner(WT('w-done','bnimg'),1500,'img');await celebrate(t,{title:'FREISPIELE',roll:true});C.celebrated=true;return t}
/* ---------- the spin ---------- */
async function doSpin(){const C=cur;if(!C||C.busy)return;const rm=ROOMS[S.room],bet=curBet();
 if(S.coins<bet){C.auto=false;spinBtn();if(S.coins<ROOMS[0].bets[0]){const g=Math.round(base()*3);S.coins+=g;hud();modal(`<h2>${gt('GOLDIE HILFT!')}</h2><div class="big-ic">${A('chest')}</div><p>Dein Konto ist leer – hier ist Nachschub aufs Haus.</p><div class="prize">🪙 ${fmt(g)}</div><button class="gbtn" data-act="close">DANKE!</button>`);fxRain(30)}else{SFX.no();toast('Nicht genug Münzen – Einsatz senken oder Shop öffnen')}return}
 C.busy=true;C.bet=bet;C.bm=boostM();C.celebrated=false;RE.unit=unit();setWin(0);S.coins-=bet;HUD.lock=0;hud();HUD.lock=1;msg('VIEL GLÜCK!');reClearWins();
 S.spins++;qAdd('spins');if(S.bet[S.room]===rm.bets.length-1)qAdd('max');S.pass.pts+=rm.k>=3?2:1;if(S.spins%(rm.k>=3?10:20)===0){S.pet.treats++;toast('🍖 +1 Polierstein')}if(S.spins%100===0)S.vip++;
 const id=C.cfg.id;S.sq[id]=(S.sq[id]||0)+1;const sc=S.sqc[id]||0;if(sc<SQ.length&&S.sq[id]>=SQ[sc]){S.sqc[id]=sc+1;const c=Math.round(base()*5*(sc+1));S.coins+=c;S.packs++;toast(`🎯 Slot-Quest ⭐${sc+1}: +${fmt(c)} 🪙 + 🃏`);SFX.bonus()}
 let total=0;try{RE.zoneCols=C.cfg.zone?ZR[C.st.z|0]:null;const r=spin(C.cfg,C.st,{});C.lastGrid=r.grid;await reelSpin(r);total+=await showWins(r);
  if(C.force){const f=C.force;C.force=null;if(f==='hs'&&C.cfg.hs){qAdd('feat');total+=await runHs(hsNew(C.cfg,null,C.cfg.coin.need))}else if(f==='fs'){qAdd('feat');total+=await runFree(8,C.cfg.pigs?{mult:1,high:1}:C.cfg.bonus&&C.cfg.bonus.type==='pick'?{xm:3}:{})}else if(f==='bo'&&C.cfg.bonus){r.fx.bonus=true;r.fx.sc=r.fx.sc||[]}}
  total+=await features(r,{});if(C.cfg.zone){RE.zoneCols=ZR[C.st.z|0];side()}}catch(e){console.error(e)}
 S.coins+=total;S.won+=total;S.wk.sc+=total;if(total>0)qAdd('wins');if(total>=bet*10)qAdd('big');addXp(10*rm.k);save();
 if(cur===C&&total>0){if(total>=bet*10&&!C.celebrated)await celebrate(total,{collect:true,bet});else{const[wx,wy]=elCenter('#win'),[tx,ty]=elCenter('#coinpill');await fxFly(wx,wy,tx,ty,Math.min(16,3+Math.round(total/bet*2)),{s:22,dur:.6,stagger:.03,onHit:i=>{if(i===1){HUD.lock=0;tweenCoins(S.coins,700)}if(i%3===1)SFX.coin()}})}}
 HUD.lock=0;hud();if(cur===C&&!total)msg('NÄCHSTER DREH, NÄCHSTES GLÜCK!');
 C.busy=false;if(cur===C){side();navDraw();if(C.auto)setTimeout(()=>{if(cur===C&&C.auto)doSpin()},C.turbo?150:420)}}
/* ---------- lobby bonuses ---------- */
const DCOL=[['#ffd23c','#c88a00'],['#ff2a3a','#8a0010'],['#3ab8ff','#0a4ab0'],['#ff3ab0','#8a0a5a'],['#b45aff','#4a0a9a'],['#3ae05a','#0a7a2a'],['#ff8a1a','#a03a00'],['#5ae0ff','#0a7aa0']];
async function dailyWheel(){if(cur&&cur.busy)return;const free=S.daily.d!==today();if(!free){if(S.gems<10){SFX.no();toast('Heute schon gedreht – ein Extra-Dreh kostet 10 💎');return}S.gems-=10}else{S.daily.streak=S.daily.d===today(1)?S.daily.streak+1:1;S.daily.d=today()}
 const st=Math.min(S.daily.streak,7),vals=[1,2,3,5,1.5,8,2.5,12,4,20,6,50],N=vals.length,idx=wp(vals.map((v,i)=>[i,v>=20?.4:v>=8?1:2])),b=base();hud();save();
 const el=ovShow('daily',`<div class="rays"></div><div class="dtitle">${WT('w-daily')}</div><div class="dreel"><canvas id="drc"></canvas><i class="ar t"></i><i class="ar b"></i></div><p class="isub">Tippe auf DREHEN – die Bonus-Walze bestimmt deinen Grundgewinn.</p><button class="gbtn pulse" id="dgo">${WT('w-spin','bt')}</button>`);
 const cv=el.querySelector('#drc'),W=Math.min(innerWidth*.96,500),H=Math.min(260,innerHeight*.34);cv.width=Math.round(W*DPR);cv.height=Math.round(H*DPR);cv.style.width=W+'px';cv.style.height=H+'px';const x=cv.getContext('2d');x.scale(DPR,DPR);const bw=W/5.3;
 const strip=document.createElement('canvas');strip.width=Math.round(bw*N*DPR);strip.height=Math.round(H*DPR);const sx=strip.getContext('2d');sx.scale(DPR,DPR);
 for(let i=0;i<N;i++){const X=i*bw,c=DCOL[i%DCOL.length],g=sx.createLinearGradient(X,0,X+bw,0);g.addColorStop(0,c[1]);g.addColorStop(.35,c[0]);g.addColorStop(.5,'#fff');g.addColorStop(.62,c[0]);g.addColorStop(1,c[1]);sx.fillStyle=g;sx.fillRect(X,0,bw,H);
  for(let k=0;k<40;k++){sx.globalAlpha=Math.random()*.6;sx.fillStyle='#fff';sx.fillRect(X+Math.random()*bw,Math.random()*H,1.6,1.6)}sx.globalAlpha=1;sx.fillStyle='rgba(0,0,0,.35)';sx.fillRect(X,0,2,H);
  sx.save();sx.translate(X+bw/2,H/2);sx.rotate(-Math.PI/2);glossText(sx,fmt(vals[i]*b),0,bw*.17,bw*.42,'white',{max:H*.86,ex:.06});sx.restore()}
 let off=0,hl=-1;const draw=()=>{if(!cv.isConnected)return;x.clearRect(0,0,W,H);const tot=bw*N;let o=((off%tot)+tot)%tot;for(let k=-1;k<2;k++)x.drawImage(strip,W/2-bw/2-o+k*tot,0,tot,H);
  const sg=x.createLinearGradient(0,0,W,0);sg.addColorStop(0,'rgba(10,2,40,.85)');sg.addColorStop(.3,'rgba(10,2,40,0)');sg.addColorStop(.7,'rgba(10,2,40,0)');sg.addColorStop(1,'rgba(10,2,40,.85)');x.fillStyle=sg;x.fillRect(0,0,W,H);
  x.strokeStyle=hl>=0?`rgba(255,240,150,${.6+.4*Math.sin(performance.now()/90)})`:'#ffe36a';x.lineWidth=hl>=0?6:4;x.shadowColor='#ffd23c';x.shadowBlur=hl>=0?28:12;x.strokeRect(W/2-bw/2+2,3,bw-4,H-6);x.shadowBlur=0;requestAnimationFrame(draw)};draw();
 await waitTap(el.querySelector('#dgo'),0);el.querySelector('#dgo').classList.add('hide');SFX.whoosh();duck(9000);const D=7600,loops=5,target=(loops*N+idx)*bw,t0=performance.now();let lastI=-1;SFX.roll(6.8);
 await new Promise(res=>{const f=n=>{const u=Math.min(1,(n-t0)/D),e=1-Math.pow(1-u,5);off=target*e;const ci=Math.floor((off+bw/2)/bw);if(ci!==lastI){lastI=ci;SFX.tick()}if(u<1)requestAnimationFrame(f);else res()};requestAnimationFrame(f)});
 hl=idx;SFX.winMed();shake(10,600);const r=cv.getBoundingClientRect();fxExplode(r.left+r.width/2,r.top+r.height/2,1);fxFountain(r.left+r.width/2,r.top+r.height/2,60,{v:800,arc:2.4,bars:.12});fxStars(r.left+r.width/2,r.top+r.height/2,24);await sleep(2200);
 const reel=Math.round(vals[idx]*b),sm=1+st*.15,vm=vipM(),pm=petM(),total=Math.round(reel*sm*vm*pm);
 const row=(ic,l,v)=>`<div class="drow">${A(ic)}<span>${l}</span><b>${v}</b></div>`;
 const e2=ovShow('daily sum',`<div class="rays"></div><div class="dtitle">${WT('w-congr')}</div><div class="dbox">${row('coin','Bonus-Walze',fmt(reel))}${row('clock','Serie: '+st+' Tag'+(st===1?'':'e'),'×'+sm.toFixed(2).replace('.',','))}${row('vip','VIP '+VIP[vipT()][0],'×'+vm.toFixed(1).replace('.',','))}${row('jewel2','Glücksjuwel','×'+pm.toFixed(2).replace('.',','))}<div class="dtot"><small>GESAMT</small>${gt('? ? ?','num',50)}</div></div><button class="gbtn hide" id="dcol">${WT('w-collect','bt')}</button>`);
 const rows=[...e2.querySelectorAll('.drow')];rows.forEach(r=>r.style.opacity=0);for(const r of rows){await sleep(420);r.style.opacity=1;r.classList.add('in');SFX.coinLand()}
 const num=e2.querySelector('.dtot .gt');await suspense(e2.querySelector('.dtot'),1500);const t1=performance.now();await new Promise(res=>{const f=n=>{const u=Math.min(1,(n-t1)/1800),e=1-Math.pow(1-u,3);setGt(num,fmtFull(total*e));if(u<1){if(Math.random()<.3)SFX.count(u);requestAnimationFrame(f)}else res()};requestAnimationFrame(f)});
 SFX.big();shake(10,600);fxCoinBlast(24);fxRain(60);const bt=e2.querySelector('#dcol');bt.classList.remove('hide');bt.classList.add('pulse');await waitTap(bt,0);S.coins+=total;HUD.lock=1;SFX.collect();
 const[bx,by]=elCenter(bt),[tx,ty]=elCenter('#coinpill');fxFly(bx,by,tx,ty,40,{onHit:i=>{if(i===1){HUD.lock=0;tweenCoins(S.coins,1500)}if(i%4===0)SFX.coin()}});await sleep(900);await ovHide();HUD.lock=0;
 say(`Serien-Bonus ×${sm.toFixed(2).replace('.',',')} – morgen wird es noch mehr!`);hud();save();if(!cur)vLobby()}
function hourly(){if(Date.now()<S.hour+36e5){SFX.no();toast('Der Stundenbonus lädt noch.');return}const c=Math.round(base()*1.5*vipM()*petM());S.coins+=c;S.hour=Date.now();SFX.collect();const b=$('#hbtn')||$('#dealb'),[x,y]=elCenter(b),[tx,ty]=elCenter('#coinpill');HUD.lock=1;
 fxFountain(x,y,20,{v:420});fxFly(x,y,tx,ty,18,{onHit:i=>{if(i===1){HUD.lock=0;tweenCoins(S.coins,900)}if(i%3===0)SFX.coin()}});toast(`⏰ +${fmt(c)} 🪙`);save();tick();if(!cur)setTimeout(vLobby,1200)}
function miniBox(){if(Date.now()<S.mini){toast('Der Mini-Preis lädt noch.');return}const P=[['c',3],['c',6],['g',5],['p',1],['t',3],['c',12]],pr=P[ri(P.length)];S.mini=Date.now()+4*36e5;
 modal(`<h2>${gt('MINI-PREIS')}</h2><div class="box3"><div class="mbx" id="mbx">${A('mini')}</div></div><p id="mbr">Tippe auf das Geschenk!</p><button class="gbtn hide" id="mbc" data-act="closelobby">EINSAMMELN</button>`,1,'minim');save();
 $('#mbx').onclick=()=>{const b=$('#mbx');if(b.dataset.o)return;b.dataset.o=1;b.classList.add('shake');SFX.shake();setTimeout(()=>{b.classList.remove('shake');b.classList.add('open');SFX.burst();const[x,y]=elCenter(b);fxFlash(x,y,200);fxStars(x,y,16);let t='';
  if(pr[0]==='c'){const c=Math.round(base()*pr[1]);S.coins+=c;t=`🪙 ${fmt(c)}`;fxFountain(x,y,30)}else if(pr[0]==='g'){S.gems+=pr[1];t=`💎 ${pr[1]}`}else if(pr[0]==='p'){S.packs+=pr[1];t=`🃏 Kartenpack`}else{S.pet.treats+=pr[1];t=`🍖 ${pr[1]} Poliersteine`}
  $('#mbr').innerHTML=`<span class="prize">${t}</span>`;$('#mbc').classList.remove('hide');hud();save()},1000)}}
function dealPop(){if(S.deal.d===today()&&dealM()>1){store();return}const ms=[1.5,2,2.5,3],cols=['red','blue','green'];modal(`<h2>${gt('BALLON-DEAL')}</h2><p>Platz einen Ballon! Er hebt <b>alle Shop-Pakete</b> eine Stunde lang an.</p><div class="balloons">${cols.map((c,i)=>`<button class="bal b${i}" data-i="${i}">${A('balloon')}</button>`).join('')}</div><p class="small">Alle Käufe sind simuliert – es fließt nie echtes Geld.</p>`,0,'dealm');
 $$('.bal').forEach(b=>b.onclick=()=>{if(S.deal.d===today()&&dealM()>1)return;const m=ms[ri(ms.length)];S.deal={m,u:Date.now()+36e5,d:today()};save();b.classList.add('popped');SFX.pop();const[x,y]=elCenter(b);fxConfetti(40);fxStars(x,y,14);
  b.innerHTML=`<span class="mult">${gt('×'+String(m).replace('.',','))}</span>`;SFX.winMed();setTimeout(()=>{if($('#mbox').className==='dealm'&&!$('#modal').classList.contains('hide'))store()},1500)})}
function scratch(){const free=S.scr!==today(),cost=Math.round(base()*5);if(!free){if(S.coins<cost){SFX.no();toast('Nicht genug Münzen');return}S.coins-=cost}else S.scr=today();hud();save();
 const P=[[0,45],[1,25],[3,15],[10,9],[50,4],[250,1.5],['💎',.5]],prize=wp(P),lab=x=>x==='💎'?'💎 25':fmt(x*base()),pool=[1,3,10,50,250,'💎'],g=[];
 if(prize!==0)g.push(prize,prize,prize);const cnt={};if(prize!==0)cnt[prize]=3;while(g.length<9){const x=pool[ri(pool.length)];if((cnt[x]||0)<2&&x!==prize){cnt[x]=(cnt[x]||0)+1;g.push(x)}}g.sort(()=>R()-.5);
 modal(`<h2>${gt('RUBBELLOS')}</h2><p>3 gleiche Beträge gewinnen!</p><div class="scr"><div class="sg">${g.map(x=>`<div class="${x===prize?'pz':''}">${A(x==='💎'?'gem':'coin')}<b>${lab(x)}</b></div>`).join('')}</div><canvas id="sc" width="300" height="300"></canvas></div><p id="scm">Mit dem Finger freirubbeln …</p>`,1,'scrm');
 const cv=$('#sc'),x=cv.getContext('2d'),sg=x.createLinearGradient(0,0,300,300);sg.addColorStop(0,'#e8eef6');sg.addColorStop(.35,'#9aa6ba');sg.addColorStop(.6,'#f4f7fb');sg.addColorStop(1,'#7a8498');x.fillStyle=sg;x.fillRect(0,0,300,300);
 for(let i=0;i<30;i++){x.fillStyle=`rgba(255,255,255,${R()*.4})`;x.fillRect(R()*300,R()*300,2,2)}glossText(x,'RUBBELN!',150,165,46,'gold');x.globalCompositeOperation='destination-out';let n=0,done=false;
 const mv=e=>{const r=cv.getBoundingClientRect();x.beginPath();x.arc((e.clientX-r.left)*300/r.width,(e.clientY-r.top)*300/r.height,26,0,7);x.fill();if(++n%5===0)tone(1800+R()*600,.03,'sawtooth',.012);
  if(n>55&&!done){done=true;cv.style.opacity=0;cv.style.pointerEvents='none';$$('.sg .pz').forEach(d=>d.classList.add('w'));let t='Leider kein Treffer – nächstes Mal!';
   if(prize==='💎'){S.gems+=25;t='25 EDELSTEINE!';SFX.big()}else if(prize){const c=Math.round(prize*base());S.coins+=c;t=fmt(c)+' MÜNZEN!';fxRain(40);SFX.big()}else SFX.no();
   $('#scm').innerHTML=prize?gt(t,'res',30):t;fitAll($('#scm'));$('#mbox').insertAdjacentHTML('beforeend','<button class="gbtn" data-act="closelobby">WEITER</button>');hud();save()}};
 cv.onpointerdown=mv;cv.onpointermove=e=>{if(e.buttons||e.pointerType==='touch')mv(e)}}
const SHOP=[['Münzbeutel','0,99 €',20,1,'bag'],['Schatztruhe','4,99 €',150,5,'chest'],['Goldbarren','9,99 €',400,10,'goldstack'],['Juwelenhort','19,99 €',1000,20,'gem'],['Königsschatz','49,99 €',4000,50,'vip'],['Imperium','99,99 €',10000,100,'mansion']];
function store(){const dm=dealM();modal(`<h2>${gt('MÜNZ-SHOP')}</h2><p class="small"><b>Alles simuliert – es wird niemals echtes Geld berechnet.</b><br>VIP-Bonus +${Math.round((vipM()-1)*100)}%${dm>1?` · <b class="dl">Ballon-Deal ×${String(dm).replace('.',',')}</b>`:''}</p>
 <div class="shop">${SHOP.map((s,i)=>`<button data-act="buy" data-i="${i}" class="${i===3?'best':''}">${i===3?'<em>BESTER WERT</em>':''}<i>${A(s[4])}</i><span>${s[0]}</span><b>${fmt(s[2]*base()*vipM()*dm)}</b><small>+${s[3]*5} 💎</small><u>${s[1]}</u></button>`).join('')}</div>
 <h2>${gt('EDELSTEIN-SHOP','cy')}</h2><div class="shop">${[['boost','rocket','Win-Booster','+50% · 30 Min',20],['pack','cards','Kartenpack','3 Karten',15],['treat','polish','Poliersteine','5 Stück',10],['free','gift','Geschenk',fmt(base()*2)+' 🪙',0]].map(g=>`<button data-act="gbuy" data-k="${g[0]}"><i>${A(g[1])}</i><span>${g[2]}</span><b>${g[3]}</b><u>${g[4]} 💎</u></button>`).join('')}</div>`,0,'shopm')}
function info(){const cfg=cur.cfg,u=unit();modal(`<h2>${gt(cfg.name.toUpperCase())}</h2><p>${cfg.info}</p><div class="pay">${cfg.syms.map(s=>`<div><i>${A(assetFor(cfg,s[0]))}</i>${[5,4,3].map(n=>`<span><b>${n}×</b> ${fmt(s[n-1]*(cfg.bm||1)*u)}</span>`).join('')}</div>`).join('')}</div><p class="small">Werte beim aktuellen Einsatz${cfg.ev==='ways'?' je Gewinnweg ('+Math.pow(cfg.rows,5)+' Wege)':' je Linie (20 Linien)'}. Feste Auszahlungsquote ca. 96 % – per Simulation über Millionen Drehs eingestellt. Jeder Dreh ist unabhängig und hat immer dieselben Chancen; Einsatz, Raum, Level oder Kontostand ändern daran nichts. Die Spannungs-Animationen (z. B. länger drehende Walzen) reagieren nur auf bereits gelandete Symbole und verraten nichts. Nur der sichtbare Win-Booster erhöht Gewinne um 50 %.</p>`)}
function settings(){modal(`<h2>${gt('EINSTELLUNGEN')}</h2><div class="row"><i class="ri">${A('sound')}</i><div><b>Soundeffekte</b></div><button class="gbtn sm ${S.snd?'':'off'}" data-act="tsnd">${S.snd?'AN':'AUS'}</button></div><div class="row"><i class="ri">${A('sound')}</i><div><b>Musik</b></div><button class="gbtn sm ${S.mus?'':'off'}" data-act="tmus">${S.mus?'AN':'AUS'}</button></div>
 <div class="row"><i class="ri">${A('info')}</i><div><b>Ton-Test</b><br><small>Spielt einen Klang und zeigt, ob das Gerät Audio zulässt.</small></div><button class="gbtn sm blue" data-act="sndtest">TEST</button></div><p class="small" id="sndi"></p>
 <button class="gbtn purple" data-act="debug">DEBUG-MENÜ</button>`)}
function debug(){const B=(k,t)=>`<button data-act="dbg" data-k="${k}">${t}</button>`,C=cur;
 modal(`<h2>${gt('DEBUG-MENÜ')}</h2>${C?`<h3>Features · ${C.cfg.name}</h3><div class="dbg">${C.cfg.hs?B('fhs','Hold & Spin auslösen'):''}${B('ffs','Freispiele auslösen')}${C.cfg.bonus?B('fbo','Bonus auslösen'):''}${B('big','Big-Win-Animation')}${B('ant','Antizipation testen')}${B('rtp','Quote testen')}</div>`:'<p class="small">Öffne einen Slot, um Features auszulösen und die Quote zu testen.</p>'}<p id="dbgo" class="small"></p>
 <h3>Guthaben</h3><div class="dbg">${B('c','+1 Mrd Münzen')+B('c2','+1 Bio Münzen')+B('c0','Konto leeren')+B('g','+100 Edelsteine')}</div>
 <h3>Fortschritt</h3><div class="dbg">${B('l','+1 Level')+B('l10','+10 Level')+B('un','Alle Slots freischalten')+B('v','+500 VIP-Punkte')+B('ps','+1000 Pass-Punkte')+B('pj','Juwel +1 Stufe')}</div>
 <h3>Timer & Aufgaben</h3><div class="dbg">${B('dw','Tagesrad zurücksetzen')+B('hb','Stundenbonus bereit')+B('sc','Rubbellos zurücksetzen')+B('mb','Mini-Preis bereit')+B('dl','Ballon-Deal zurücksetzen')+B('qn','Neue Quests würfeln')+B('qd','Quests erfüllen')+B('wk','Wochenabrechnung jetzt')}</div>
 <h3>Booster & Sammlung</h3><div class="dbg">${B('bo','Booster 30 Min an')+B('bx','Booster aus')+B('p','+5 Kartenpacks')+B('ca','Alle Karten geben')+B('tr','+20 Poliersteine')}</div>
 <h3>Anzeige</h3><div class="dbg">${B('fx','Münzregen testen')+B('sp','Startbildschirm zeigen')}</div>
 <h3>Spielstand</h3><textarea id="dbgt" placeholder="Spielstand hier einfügen, dann »Laden«"></textarea><div class="dbg">${B('ex','Exportieren')+B('im','Laden')+B('r','Alles löschen')}</div>`)}
/* ---------- actions ---------- */
const ACT={close:closeM,closelobby(){closeM();if(!cur)vLobby()},go:t=>go(t.dataset.t),tip(){say(TIPS[1+ri(TIPS.length-1)])},
 slot:t=>openSlot(t.dataset.id),room(t){const i=+t.dataset.i;if(ROOMS[i].lock&&!hrOpen()){SFX.no();toast('👑 High Roller öffnet ab Level 10 oder VIP Silber');return}S.room=i;say(i===2?'Willkommen bei den High Rollern – hier fließt das Gold!':i===0?'Low Roller: entspannt drehen mit kleinen Einsätzen.':'Classic-Raum: die goldene Mitte.');vLobby();save()},
 wheel:dailyWheel,hourly,scratch,store,info,settings,minibox:miniBox,deal:dealPop,
 spin(){const C=cur;if(!C)return;if(C.hold){C.hold=false;return}if(C.auto){C.auto=false;spinBtn();return}if(C.busy){if(C.spinning)C.quick=true;else C.skip=true;return}doSpin()},helpi(){if(cur)info();else ACT.tip()},
 betm(){if(cur.busy)return;S.bet[S.room]=Math.max(0,S.bet[S.room]-1);RE.unit=unit();side()},betp(){if(cur.busy)return;S.bet[S.room]=Math.min(ROOMS[S.room].bets.length-1,S.bet[S.room]+1);RE.unit=unit();side()},
 max(){if(cur.busy)return;const b=ROOMS[S.room].bets;let i=b.length-1;while(i>0&&b[i]>S.coins)i--;S.bet[S.room]=i;RE.unit=unit();side();toast('🔥 Max Bet: '+fmt(b[i]))},
 turbo(){cur.turbo=!cur.turbo;side()},
 qclaim(t){const j=+t.dataset.j,q=S.q.l[j];if(q.c||q.p<q.n)return;q.c=1;const c=qRew(j);S.coins+=c;S.pass.pts+=150;if(j===2)S.packs++;const[x,y]=elCenter(t),[tx,ty]=elCenter('#coinpill');HUD.lock=1;fxFly(x,y,tx,ty,14,{onHit:i=>{if(i===1){HUD.lock=0;tweenCoins(S.coins,800)}}});SFX.collect();save();setTimeout(()=>go('quests'),900)},
 pack(){if(S.packs>0)openPack()},starpack(){if(S.stars>=30){S.stars-=30;S.packs++;openPack()}},
 setclaim(t){const i=+t.dataset.i;if(S.setc[i])return;S.setc[i]=1;const c=Math.round(base()*40);S.coins+=c;S.gems+=20;HUD.lock=1;celebrate(c,{title:'SET KOMPLETT!',collect:true,bet:base()}).then(()=>{HUD.lock=0;hud();go('cards')});if(Object.keys(S.setc).length===SETS.length){S.coins+=c*10;toast('🏆 ALLE Sets komplett! Mega-Bonus!')}save()},
 feed(){const p=S.pet;if(p.treats<1)return;p.treats--;p.xp++;SFX.coin();const pb=$('.petb');if(pb){const[x,y]=elCenter(pb);fxStars(x,y,8);fxGlints(pb.getBoundingClientRect(),5)}if(p.xp>=p.lvl*3){p.xp=0;p.lvl++;toast(`🐉 Glücksjuwel Stufe ${p.lvl} · Bonus +${p.lvl*2}%`);fxRain(30);SFX.bonus()}save();setTimeout(()=>go('pet'),300)},
 pclaim(t){const i=+t.dataset.i;if(S.pass.c.includes(i)||i>=Math.floor(S.pass.pts/PT))return;S.pass.c.push(i);const r=passRew(i);if(r.g){S.gems+=r.g;S.packs++}else if(r.t)S.pet.treats+=r.t;else S.coins+=Math.round(base()*(4+i));SFX.collect();const[x,y]=elCenter(t);fxStars(x,y,10);save();setTimeout(()=>go('pass'),500)},
 buy(t){const s=SHOP[+t.dataset.i];modal(`<h2>${gt(s[0].toUpperCase())}</h2><div class="big-ic">${A(s[4])}</div><p>Simulierter Kauf für <b>${s[1]}</b>.<br>Es wird <b>kein echtes Geld</b> berechnet – das ist nur Spielgefühl.</p><button class="gbtn" data-act="buyok" data-i="${t.dataset.i}">KAUF SIMULIEREN</button><button class="gbtn grey" data-act="store">ZURÜCK</button>`)},
 buyok(t){const s=SHOP[+t.dataset.i],c=Math.round(s[2]*base()*vipM()*dealM());S.coins+=c;S.gems+=s[3]*5;S.vip+=s[3]*10;closeM();HUD.lock=1;save();celebrate(c,{title:'KA-CHING!',collect:true,bet:base()*s[2]/12,sub:`+${s[3]*5} Edelsteine · +${s[3]*10} VIP-Punkte`}).then(()=>{HUD.lock=0;hud();if(cur)side();else if(tab==='lobby')vLobby()})},
 gbuy(t){const k=t.dataset.k,cost={boost:20,pack:15,treat:10,free:0}[k];if(S.gems<cost){SFX.no();toast('Nicht genug 💎');return}S.gems-=cost;if(k==='boost'){S.boost=Math.max(Date.now(),S.boost)+18e5;toast('🚀 Win-Booster aktiv: +50 % auf alle Gewinne')}else if(k==='pack'){S.packs++;toast('+1 Kartenpack')}else if(k==='treat'){S.pet.treats+=5;toast('+5 Poliersteine')}else{S.coins+=Math.round(base()*2);const[x,y]=elCenter(t);fxFountain(x,y,16)}SFX.win();hud();save();navDraw();if(cur)side();if(k!=='free')closeM();else store()},
 sound(){const on=!(S.snd||S.mus);S.snd=S.mus=on?1:0;save();hud();unlockAudio();music();if(on){SFX.win();setTimeout(()=>{if(!AC||AC.state!=='running')toast('Ton wird vom Gerät blockiert – Lautstärke und Stummschalter prüfen')},600)}},
 tsnd(){S.snd=S.snd?0:1;save();settings()},tmus(){S.mus=S.mus?0:1;if(S.mus)music();else{clearInterval(MU.timer);MU.timer=null}save();settings()},
 sndtest(){unlockAudio();const was=S.snd;S.snd=1;SFX.winMed();S.snd=was;setTimeout(()=>{const i=$('#sndi');if(i)i.textContent=AC?`Audio-Status: ${AC.state==='running'?'läuft ✓':'blockiert ('+AC.state+')'} · Abtastrate ${AC.sampleRate} Hz`:'Dieses Gerät stellt kein Web-Audio bereit.'},500)},
 debug,dbg(t){const k=t.dataset.k,C=cur,out=x=>{const o=$('#dbgo');if(o)o.innerHTML=x},lv=n=>{for(let i=0;i<n;i++){S.xp=need(S.lvl);addXp(0)}};
  if(k==='c')S.coins+=1e9;else if(k==='c2')S.coins+=1e12;else if(k==='c0')S.coins=0;else if(k==='g')S.gems+=100;else if(k==='l')lv(1);else if(k==='l10')lv(10);else if(k==='un'){if(S.lvl<12)S.lvl=12}else if(k==='v')S.vip+=500;
  else if(k==='dw')S.daily.d='';else if(k==='hb')S.hour=0;else if(k==='sc')S.scr='';else if(k==='mb')S.mini=0;else if(k==='dl')S.deal={m:1,u:0,d:''};else if(k==='qn'){S.q.d='';qGen()}else if(k==='qd')S.q.l.forEach(q=>{q.p=q.n});else if(k==='ps')S.pass.pts+=1000;
  else if(k==='bo')S.boost=Date.now()+18e5;else if(k==='bx')S.boost=0;else if(k==='p')S.packs+=5;else if(k==='ca'){for(let i=0;i<SETS.length*6;i++)S.cards[i]=S.cards[i]||1}else if(k==='tr')S.pet.treats+=20;else if(k==='pj')S.pet.lvl++;
  else if(k==='wk'){S.wk.id-=1;if(S.wk.sc<=0)S.wk.sc=1;save();closeM();periodic();return}
  else if(k==='fhs'||k==='ffs'||k==='fbo'){C.force=k==='fhs'?'hs':k==='ffs'?'fs':'bo';closeM();toast('Debug: Feature startet beim nächsten Dreh');return}
  else if(k==='ant'){closeM();C.forceAnt=1;toast('Debug: nächster Dreh zeigt Walzen-Spannung');return}
  else if(k==='big'){closeM();HUD.lock=1;celebrate(curBet()*(60+ri(240)),{collect:true}).then(()=>{HUD.lock=0;hud()});return}
  else if(k==='fx'){closeM();fxRain(120,{kinds:{coin:.7,bar:.2,gem:.1}});fxConfetti(60);return}
  else if(k==='sp'){closeM();splash(true);return}
  else if(k==='rtp'){out('Simulation läuft …');setTimeout(()=>{const st=newSt(),stat={hit:0,base:0,hs:0,bonus:0,fs:0},N=200000;let tot=0;for(let i=0;i<N;i++)tot+=simRound(C.cfg,st,stat);const f=x=>x?'1 zu '+Math.round(N/x):'–';out(`<b>${C.cfg.name}</b><br>Auszahlungsquote: <b>${(tot/N*SCALE[C.cfg.id]*100).toFixed(1)} %</b> · Trefferquote ${(stat.hit/N*100).toFixed(1)} %<br>Hold & Spin ${f(stat.hs)} · Bonus ${f(stat.bonus)} · Freispiele ${f(stat.fs)}<br>200.000 simulierte Drehs, kurze Stichprobe – schwankt um einige Prozentpunkte.`)},60);return}
  else if(k==='ex'){const j=JSON.stringify(S);$('#dbgt').value=j;try{navigator.clipboard.writeText(j).then(()=>toast('Spielstand kopiert'),()=>{})}catch(e){}out('Spielstand steht im Textfeld – markieren und kopieren.');return}
  else if(k==='im'){try{const o=JSON.parse($('#dbgt').value);if(typeof o.coins!=='number')throw 0;S=Object.assign(def(),o);save();if(cur){reUnmount();cur=null}closeM();HUD.shown=null;go('lobby');toast('Spielstand geladen')}catch(e){out('Das ist kein gültiger Spielstand.')}return}
  else if(k==='r'){try{localStorage.removeItem(KEY)}catch(e){}S=def();if(cur){reUnmount();cur=null}closeM();HUD.shown=null;go('lobby');return}
  hud();save();navDraw();tick();toast('Debug: erledigt');if(!cur&&tab==='lobby')vLobby();else if(cur)side()}};
document.addEventListener('click',e=>{const t=e.target.closest('[data-act]');if(!t){if(e.target.id==='modal'&&!e.target.dataset.lock)closeM();return}if(t.disabled)return;const a=ACT[t.dataset.act];if(a){if(t.dataset.act!=='spin')SFX.click();a(t)}});
addEventListener('resize',()=>{if(cur&&!cur.busy&&RE.mode==='reels'){layoutReels(cur.cfg.rows);reSetGrid(RE.grid)}});
let holdT=null;document.addEventListener('pointerdown',e=>{if(!e.target.closest('.spin')||!cur)return;const C=cur;clearTimeout(holdT);holdT=setTimeout(()=>{if(cur!==C||C.auto)return;C.auto=true;C.hold=true;setTimeout(()=>{C.hold=false},1200);toast('Auto-Spin an – tippen zum Stoppen');spinBtn();if(!C.busy)doSpin()},550)});
['pointerup','pointercancel','pointerleave'].forEach(ev=>document.addEventListener(ev,()=>clearTimeout(holdT),true));
/* ---------- splash + boot ---------- */
function drawSplashLogo(cv){const w=cv.clientWidth,h=cv.clientHeight;cv.width=Math.round(w*DPR);cv.height=Math.round(h*DPR);const x=cv.getContext('2d');x.scale(DPR,DPR);glow(x,w/2,h*.5,w*.55,'#ffe08a',.45);
 if(GFX.ready){x.drawImage(assetCanvas('goldstack'),w*.0,h*.02,h*.5,h*.5);x.drawImage(assetCanvas('coin'),w-h*.46,h*.04,h*.42,h*.42);x.drawImage(assetCanvas('crest'),w/2-h*.2,-h*.02,h*.4,h*.4);const lg=assetCanvas('logo-casino'),lw=w*.98,lh=lw*lg.height/lg.width;x.drawImage(lg,(w-lw)/2,h-lh,lw,lh)}}
async function splash(again){const sp=$('#splash');sp.classList.remove('hide','out');const bar=$('#spbar i'),st=$('#spst'),go_=$('#spgo');go_.classList.add('hide');$('#spl').classList.remove('hide');
 if(!again){sp.style.backgroundImage=`url(${sceneURL('lobby')})`;const fl=document.fonts?Promise.race([document.fonts.load('40px Disp'),sleep(2500)]).catch(()=>{}):Promise.resolve();
  st.textContent='Lade Schriften …';await fl;st.textContent='Poliere das Gold …';await loadAssets(p=>{bar.style.width=Math.round(p*70)+'%'});st.textContent='Male die Kulissen …';
  for(const k of Object.keys(LOGO)){sceneURL(k);bar.style.width=(70+Object.keys(SCENEURL).length/9*25)+'%';await sleep(10)}fxInit();startArtObserver();Object.keys(LOGO).forEach(k=>document.head.insertAdjacentHTML('beforeend',`<style>.sc-${k} .slot{background-image:url(${SCENEURL[k]})}</style>`));
  bar.style.width='100%';st.textContent='Alles bereit!';drawSplashLogo($('#splogo'))}
 await sleep(300);$('#spl').classList.add('hide');go_.classList.remove('hide');await waitTap(go_);unlockAudio();music('lobby');SFX.collect();fxFlash(innerWidth/2,innerHeight/2,innerWidth);sp.classList.add('out');await sleep(450);sp.classList.add('hide');if(!again)boot()}
function boot(){periodic();HUD.shown=null;hud();go('lobby');$('#app').style.backgroundImage=`url(${SCENEURL.lobby})`;
 if(!S.seen){S.seen=1;save();modal(`<h2>${gt('WILLKOMMEN!')}</h2><div class="big-ic">${A('crest')}</div><p>Ich bin <b>Goldie</b> und begleite dich. Hier ist alles nur Spiel: keine Werbung, kein echtes Geld, und jeder Dreh hat immer dieselbe faire Chance.</p><div class="prize">🪙 5 Mio · 💎 30 · 🃏 1</div><button class="gbtn" data-act="close">LOS GEHT'S!</button>`)}
 else if(S.daily.d!==today())setTimeout(dailyWheel,600)}
splash();
