'use strict';
/* ---------- Menüs nach Max' Entwürfen (Goldfuchs – Menüentwürfe) ----------
   Kopfzeile mit Goldie + Logo, Guthabenleiste, fünf Bereiche (Spielen · Sammlung · Aufgaben · Bonus · Mehr),
   Einstellungen und Spielmenü (Pause) als Dialog. Grafiken: IMG['mn-*'], Texte sind echte UI-Elemente. */
function hdrInit(){$('#hgoldie').innerHTML=A('mn-goldie');$('#hlogo').innerHTML=A('mn-logo');$('#ccoin').innerHTML=A('mn-coin');$('#cgem').innerHTML=A('mn-gem');document.body.classList.toggle('lessfx',!!S.lessfx)}
function rerender(){if(cur)return;go(tab)}
function vib(p){try{if(S.vib&&navigator.vibrate)navigator.vibrate(p)}catch(e){}}
const divider=t=>`<div class="mdiv"><i></i><b>${t}</b><i></i></div>`;
const playerName=()=>(S.name||'Spieler').toUpperCase();
/* Unterseiten: Zurück-Knopf (Mehr) bzw. Umschalter (Sammlung) */
function subNav(t){const pg=view.firstElementChild;if(!pg)return;
 if(NAVOF[t]==='more')pg.insertAdjacentHTML('afterbegin',`<button class="mback" data-act="go" data-t="more">‹ Mehr</button>`);
 if(t==='cards'||t==='pet')pg.insertAdjacentHTML('afterbegin',`<div class="seg two"><button data-act="go" data-t="cards" class="${t==='cards'?'on':''}">Kartensets</button><button data-act="go" data-t="pet" class="${t==='pet'?'on':''}">Glücksjuwel</button></div>`)}
/* ---------- Spielen ---------- */
const HEROART={biber:'mn-hero-biber',donner:'mn-hero-donner',rubin:'mn-hero-rubin'};
function drawHero(cv,s){const w=cv.width,h=cv.height,x=cv.getContext('2d');sceneURL(s.id);const sc=SCENECV[s.id];
 if(sc){const sh=sc.width*h/w;x.drawImage(sc,0,Math.max(0,(sc.height-sh)*.42),sc.width,Math.min(sh,sc.height),0,0,w,h)}
 const g=x.createLinearGradient(0,0,w,0);g.addColorStop(0,'rgba(40,6,50,.15)');g.addColorStop(1,'rgba(40,6,50,.45)');x.fillStyle=g;x.fillRect(0,0,w,h);
 const art=GFX.img[HEROART[s.id]];
 if(art){const ah=h,aw=ah*art.width/art.height,t=document.createElement('canvas');t.width=Math.ceil(aw);t.height=h;const tx=t.getContext('2d');tx.drawImage(art,0,0,aw,ah);tx.globalCompositeOperation='destination-out';const fg=tx.createLinearGradient(aw*.72,0,aw,0);fg.addColorStop(0,'rgba(0,0,0,0)');fg.addColorStop(1,'#000');tx.fillStyle=fg;tx.fillRect(0,0,aw,h);x.drawImage(t,0,0)}
 else{glow(x,w*.24,h*.5,h*.6,'#fff3c0',.35);const hk=HERO[s.id];x.drawImage(assetCanvas(hk[0]),w*.02,h*.06,h*.88,h*.88)}
 const lg=assetCanvas('logo-'+s.id);let lw=w*.5,lh=lw*lg.height/lg.width;if(lh>h*.44){lh=h*.44;lw=lh*lg.width/lg.height}x.drawImage(lg,w*.735-lw/2,h*.05,lw,lh)}
function gcard(s,bet){const c=S.sqc[s.id]||0,lk=S.lvl<s.lvl,fav=(S.fav||[]).includes(s.id);
 return`<div class="gcard ${lk?'lock':''}" data-act="slot" data-id="${s.id}" data-n="${s.name.toLowerCase()}"><div class="gart"><canvas data-tile="${s.id}"></canvas><u>${s.coin?(s.hs?'GRAND':'MAJOR')+' '+fmt(JP[s.hs?'grand':'major']*bet*SCALE[s.id]):s.pigs?'3 BONUS-TÖPFE':s.bonus?'AUSWAHL-BONUS':'FREISPIELE'}</u>
 <button class="fav ${fav?'on':''}" data-act="fav" data-id="${s.id}" aria-label="Favorit">★</button><span class="st">${'★'.repeat(c)}<em>${'★'.repeat(SQ.length-c)}</em></span></div>
 ${lk?`<span class="glock">🔒 Ab Level ${s.lvl}</span>`:`<span class="gplay">SPIELEN</span>`}</div>`}
function vLobby(){const bet=ROOMS[S.room].bets[S.bet[S.room]],last=SLOTS.find(s=>s.id===S.last&&S.lvl>=s.lvl)||SLOTS[0],br=bonusReady(),fav=S.fav||[];
 const list=SLOTS.slice().sort((a,b)=>(fav.includes(b.id)-fav.includes(a.id))||((S.lvl<a.lvl)-(S.lvl<b.lvl)));
 view.innerHTML=`<div class="mn lob2">
 <div class="hero gf" data-act="slot" data-id="${last.id}"><canvas id="herocv"></canvas><div class="hov"><span class="hpill">${S.last?'Zuletzt gespielt':'Tipp für dich'}</span><span class="gbtn hgo">${S.last?'WEITERSPIELEN':'JETZT SPIELEN'}</span></div></div>
 <button class="bbar gf ${br?'rdy':''}" data-act="go" data-t="bonus"><i>${A('mn-gift')}</i><div><b>${br?'BONUS BEREIT':'DEINE BONI'}</b><small id="lbt"></small></div><span class="gold">${br?'Abholen':'Ansehen'}</span></button>
 ${divider('DEINE SPIELE')}
 <label class="msearch gf"><span>⌕</span><input id="gsearch" type="search" placeholder="Spiel suchen" autocomplete="off"></label>
 <div class="seg">${ROOMS.map((r,i)=>`<button data-act="room" data-i="${i}" class="${S.room===i?'on':''}">${r.n}${r.lock&&!hrOpen()?' 🔒':''}</button>`).join('')}</div>
 <div class="ggrid">${list.map(s=>gcard(s,bet)).join('')}</div><p class="nores hide" id="nores">Kein Spiel gefunden.</p>
 <p class="mfoot">Privates Spiel · kein echtes Geld · faire, feste Gewinnchancen</p></div>`;
 const hc=$('#herocv'),hw=hc.clientWidth||360,hh=hc.clientHeight||200;hc.width=Math.round(hw*DPR);hc.height=Math.round(hh*DPR);drawHero(hc,last);
 $$('canvas[data-tile]').forEach(cv=>{cv.width=Math.round(150*DPR);cv.height=Math.round(190*DPR);drawTile(cv,SLOTS.find(s=>s.id===cv.dataset.tile))});
 $('#gsearch').addEventListener('input',e=>{const q=e.target.value.trim().toLowerCase();let n=0;$$('.gcard').forEach(c=>{const v=!q||c.dataset.n.includes(q);c.classList.toggle('hide',!v);n+=v});$('#nores').classList.toggle('hide',n>0)});tick()}
/* ---------- Bonus ---------- */
function vBonus(){const dr=S.daily.d!==today(),sf=S.scr!==today(),dm=dealM();
 view.innerHTML=`<div class="mn pg2">${divider('DEINE BONI')}
 <div class="bhour gf" id="hbtn"><img src="${GFX.url['mn-bonus-hour']}" alt=""><div class="bside"><div class="wood">STUNDENBONUS</div><span class="stat" id="hb"></span><button class="gbtn" data-act="hourly" id="hbgo">ABHOLEN</button></div></div>
 <div class="b2">
  <div class="bsq gf ${dr?'rdy':''}" data-act="wheel"><img src="${GFX.url['mn-bonus-wheel']}" alt=""><small>${dr?'Gratis-Dreh wartet!':'Extra-Dreh: 10 💎'}</small><span class="pbtn">ÖFFNEN</span></div>
  <div class="bsq gf ${sf?'rdy':''}" data-act="scratch"><img src="${GFX.url['mn-bonus-scratch']}" alt=""><small>${sf?'Heute gratis!':'Los: '+fmt(base()*5)+' Münzen'}</small><span class="pbtn">ÖFFNEN</span></div></div>
 <button class="mrow gf" data-act="minibox"><i>${A('mn-chest')}</i><div><b>MINI-PREIS</b><small id="mbt"></small></div><em>›</em></button>
 <button class="mrow gf" data-act="deal"><i>${A('mn-balloons')}</i><div><b>BALLON-DEAL</b><small>${dm>1?'×'+String(dm).replace('.',',')+' auf alle Shop-Pakete aktiv!':'Platz einen Ballon für bessere Shop-Pakete'}</small></div><em>›</em></button>
 <button class="mrow gf" data-act="store"><i>${A('mn-coin')}</i><div><b>MÜNZ-SHOP</b><small>Alles simuliert – nie echtes Geld</small></div><em>›</em></button></div>`;tick()}
/* ---------- Mehr ---------- */
function vMore(){const nd=need(S.lvl);
 view.innerHTML=`<div class="mn pg2">${divider('DEIN MENÜ')}
 <div class="prof gf" data-act="go" data-t="profile"><i>${A('mn-profile-star')}</i><div><b>${playerName()}</b><span class="lvp">LEVEL ${S.lvl}</span><div class="xpb"><i style="width:${Math.min(100,S.xp/nd*100)}%"></i></div></div></div>
 <div class="mgrp gf">${[['profile','mn-m-medal','Profil & Fortschritt'],['rank','mn-m-trophy','Rangliste'],['pass','mn-m-pass','Saisonpass'],['vip','mn-m-crown','VIP-Lounge']].map(r=>`<button class="mrow" data-act="go" data-t="${r[0]}"><i>${A(r[1])}</i><div><b>${r[2]}</b></div>${r[0]==='pass'&&passClaimable()?'<span class="mdot"></span>':''}<em>›</em></button>`).join('')}</div>
 <div class="mgrp gf"><button class="mrow" data-act="settings"><i>${A('mn-m-gear')}</i><div><b>Einstellungen</b></div><em>›</em></button><button class="mrow" data-act="help"><i>${A('mn-m-book')}</i><div><b>Hilfe & Spielregeln</b></div><em>›</em></button></div>
 ${divider('Privates Spiel')}<p class="mfoot">Kein echtes Geld · keine Werbung · faire, feste Gewinnchancen</p></div>`}
function vProfile(){const nd=need(S.lvl),cards=Object.keys(S.cards).length,stars=Object.values(S.sqc).reduce((a,b)=>a+b,0),open=SLOTS.filter(s=>S.lvl>=s.lvl).length;
 const st=(l,v)=>`<div class="srow"><span>${l}</span><b>${v}</b></div>`;
 view.innerHTML=`<div class="mn pg2">${divider('PROFIL')}
 <div class="prof gf big"><i>${A('mn-profile-star')}</i><div><b>${playerName()}</b><span class="lvp">LEVEL ${S.lvl}</span><div class="xpb"><i style="width:${Math.min(100,S.xp/nd*100)}%"></i></div><small>${S.xp} / ${nd} XP bis Level ${S.lvl+1}</small></div></div>
 <button class="gbtn sm purple mname" data-act="rename">Namen ändern</button>
 <div class="mgrp gf stats">${st('Drehs gesamt',fmtFull(S.spins))+st('Gesamtgewinn',fmt(S.won))+st('VIP-Stufe',VIP[vipT()][0])+st('Glücksjuwel',PETN[S.pet.lvl<3?0:S.pet.lvl<6?1:S.pet.lvl<10?2:S.pet.lvl<20?3:4]+' · Stufe '+S.pet.lvl)+st('Sammelkarten',cards+' / '+SETS.length*6)+st('Slot-Sterne',stars+' / '+SLOTS.length*SQ.length)+st('Freigeschaltete Slots',open+' / '+SLOTS.length)}</div></div>`}
/* ---------- Dialoge ---------- */
const tg=(k,on)=>`<button class="tg ${on?'on':''}" data-act="tog" data-k="${k}"><b>${on?'AN':'AUS'}</b><i></i></button>`;
function settings(){modal(`<div class="setban" style="background-image:url(${GFX.url['mn-set-banner']})"></div><h2 class="mh">EINSTELLUNGEN</h2>
 <section class="sbox"><h4>TON</h4>
  <div class="srow2"><i>${A('mn-s-sound')}</i><span>Soundeffekte</span>${tg('snd',S.snd)}</div>
  <div class="srow2"><i>${A('mn-s-music')}</i><span>Musik</span>${tg('mus',S.mus)}</div>
  <div class="srow2 col"><i>${A('mn-s-head')}</i><div><span>Musiklautstärke</span><input type="range" id="vol" min="0" max="100" value="${Math.round((S.vol==null?1:S.vol)*100)}" style="--v:${Math.round((S.vol==null?1:S.vol)*100)}%"></div></div>
  <button class="goldp" data-act="sndtest">TON TESTEN</button><p class="small" id="sndi"></p></section>
 <section class="sbox"><h4>DARSTELLUNG</h4>
  <div class="srow2"><i>${A('mn-s-vib')}</i><span>Vibration<small>nur auf Geräten, die es unterstützen</small></span>${tg('vib',S.vib)}</div>
  <div class="srow2"><i>${A('mn-s-fx')}</i><span>Weniger Effekte<small>weniger Partikel und Wackeln</small></span>${tg('lessfx',S.lessfx)}</div></section>
 <section class="sbox"><h4>SPRACHE</h4><div class="srow2"><i>${A('mn-s-globe')}</i><span>Deutsch</span><em class="chk">✓</em></div></section>
 <button class="gbtn" data-act="close">FERTIG</button><button class="dbgl" data-act="debug">Entwickler-Menü</button>`,0,'setm');
 const v=$('#vol');v.oninput=()=>{S.vol=v.value/100;v.style.setProperty('--v',v.value+'%');if(typeof GR!=='undefined'&&GR&&AC)fadeMusic(.38*S.vol,80)};v.onchange=save}
function pauseMenu(){if(!cur)return;modal(`<h2 class="mh lau">SPIELMENÜ</h2>
 <button class="gbtn pgo" data-act="close"><span class="tri"></span>WEITERSPIELEN</button>
 <button class="prow" data-act="info"><i>${A('mn-p-book')}</i><b>SPIELREGELN</b></button>
 <button class="prow" data-act="settings"><i>${A('mn-p-gear')}</i><b>EINSTELLUNGEN</b></button>
 <button class="prow" data-act="golobby"><i>${A('mn-p-home')}</i><b>ZUR LOBBY</b></button>
 <div class="ptg"><span>♫ Musik ${tg('mus',S.mus)}</span><span>🔊 Sound ${tg('snd',S.snd)}</span></div>`,0,'pausem')}
function help(){modal(`<h2 class="mh">HILFE & SPIELREGELN</h2><div class="help">
 <h4>Faire Chancen</h4><p>Jeder Dreh ist unabhängig und hat immer dieselbe Gewinnchance. Einsatz, Raum, Level oder Kontostand ändern daran nichts. Die Auszahlungsquote liegt fest bei etwa 96 %. Nur der sichtbare Win-Booster hebt Gewinne offen um 50 % an.</p>
 <h4>Spielregeln der Slots</h4><p>Im Slot oben links auf das Menü tippen und »Spielregeln« wählen. Dort stehen Gewinntabelle und Features des Spiels.</p>
 <h4>Räume</h4><p>Low Roller, Classic und High Roller unterscheiden sich nur in den Einsätzen und Belohnungen. High Roller öffnet ab Level 10 oder VIP Silber.</p>
 <h4>Boni</h4><p>Stundenbonus jede Stunde, Tagesrad einmal am Tag (die Serie erhöht den Gewinn), Rubbellos einmal täglich gratis, Mini-Preis alle 4 Stunden. Der Ballon-Deal hebt eine Stunde lang alle Shop-Pakete an.</p>
 <h4>Sammlung & Aufgaben</h4><p>Kartenpacks gibt es für Level, Quests und Slot-Sterne. Komplette Sets bringen Münzen und Edelsteine. Das Glücksjuwel erhöht alle Bonus-Münzen.</p>
 <h4>Privates Spiel</h4><p>Alles ist Spielgeld. Es gibt keine Werbung, und Käufe im Shop sind nur simuliert: Es wird nie echtes Geld berechnet.</p></div>
 <button class="gbtn" data-act="close">VERSTANDEN</button>`,0,'helpm')}
function renameDlg(){modal(`<h2 class="mh">DEIN NAME</h2><input id="nmi" class="minput" maxlength="14" value="${(S.name||'').replace(/"/g,'')}" placeholder="Spieler"><button class="gbtn" data-act="nameok">SPEICHERN</button>`);setTimeout(()=>{const i=$('#nmi');if(i)i.focus()},50)}
Object.assign(ACT,{settings,help,pause:pauseMenu,rename:renameDlg,
 tip(){say(TIPS[1+ri(TIPS.length-1)]);toast('⭐ '+lastSay)},
 golobby(){closeM();go('lobby')},
 nameok(){const v=($('#nmi').value||'').replace(/[<>&"]/g,'').trim().slice(0,14);S.name=v;save();closeM();rerender()},
 fav(t){const id=t.dataset.id,f=S.fav||(S.fav=[]),i=f.indexOf(id);if(i<0)f.push(id);else f.splice(i,1);t.classList.toggle('on',i<0);if(i<0){const[x,y]=elCenter(t);fxStars(x,y,6)}save()},
 tog(t){const k=t.dataset.k;S[k]=S[k]?0:1;const on=!!S[k];$$(`.tg[data-k="${k}"]`).forEach(b=>{b.classList.toggle('on',on);b.firstChild.textContent=on?'AN':'AUS'});
  if(k==='mus'){unlockAudio();if(on)music();else musicOff()}
  if(k==='snd'&&on){unlockAudio();SFX.coin()}
  if(k==='vib'&&on)vib(60);
  if(k==='lessfx')document.body.classList.toggle('lessfx',on);
  save()}});
