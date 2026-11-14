'use strict';
/* ===== Goldfuchs reels: canvas reel set with physics, anticipation frames, win cycling, hold&spin board ===== */
const FELT={biber:['#2a8a36','#0e4418'],donner:['#7a3214','#2a0c02'],rubin:['#8a0c30','#2a0010'],frei:['#2e1e96','#0a0630'],glut:['#4a120c','#140402'],schwein:['#8a1e66','#2a0420'],hamster:['#334058','#0e1018'],revier:['#106a44','#03180e']};
const KEYS={biber:{'🦫':'toolbox','🏡':'saw','🪓':'tape','🪵':'hammer',W:'wildsign',B:'wheeltok',C:'hardhat'},donner:{'🦬':'bf-bison','🦅':'bf-eagle','🐺':'bf-wolf','🦌':'bf-elk',W:'bf-wild',S:'bf-free'},
 rubin:{'7️⃣':'seven','🔔':'bell','💠':'sapphire','🍒':'cherry','🍋':'lemon','🍉':'bar','🍇':'grapes',W:'wild7',Z:'bolt',C:'ruby'},frei:{'7️⃣':'seven2','⭐':'star','🔔':'bell','🍀':'clover','🍒':'cherry','🍊':'orange','🍇':'grapes',W:'wild7b',Z:'bolt',B:'giftbonus'},
 glut:{'🎸':'guitar','🏍️':'dice','🤠':'cowboy','🌵':'cactus',W:'wildflame',S:'slotm',C:'fireball'},schwein:{'👑':'crown','💎':'diamond','💰':'bag','🎩':'tophat',W:'wildrain',P0:'pig0',P1:'pig1',P2:'pig2'},
 hamster:{'🏦':'bank','💼':'briefcase','🔑':'key','🧲':'goldstack',W:'wildspark',S:'freeticket',C:'coin',H:'collector'},revier:{'🐯':'amber','🦜':'emerald','🐍':'amethyst','🌺':'rose',W:'wilddia',S:'freestar'}};
/* animierte Symbole: 6x4-Spritesheet, 24 Frames à 83 ms (Max' Asset-Paket) */
const ANIM={'bf-bison':'an-bison','bf-eagle':'an-eagle','bf-wolf':'an-wolf','bf-elk':'an-elk','bf-wild':'an-wild','bf-free':'an-free'};
const RANKSTYLE={biber:'green',donner:'prairie',glut:'red',schwein:'multi',hamster:'gold',revier:'multi'};
const TIER=['hut','cabin','brick','mansion'],JPST={mini:'green',minor:'cyan',major:'pink',grand:'gold'};
const RE={cv:null,x:null,cfg:null,st:null,W:0,H:0,rows:3,cw:0,ch:0,px:6,py:6,dv:4,cols:[],mode:'reels',HS:null,win:null,flash:new Map(),antic:[0,0,0,0,0],raf:0,last:0,t:0,unit:1,
 hide:new Set(),spinSet:null,pop:new Map(),rev:new Map(),hl:null,tension:false,bg:null,zoneCols:null,turbo:false,glintT:0,glints:[],onCycle:null,grid:null};
function symKey(s,hs){const id=RE.cfg.id,k=KEYS[id]||{};if(s.s==='C'){if(s.d)return'boom';if(s.lvl!=null&&hs)return TIER[s.lvl];return k.C||'coin'}
 if(k[s.s])return k[s.s];if(/^(A|K|Q|J|10|9)$/.test(s.s))return'rk-'+(RANKSTYLE[id]||'multi')+'-'+s.s;return'star'}
function reMount(cv,cfg,st){RE.cv=cv;RE.x=cv.getContext('2d');RE.cfg=cfg;RE.st=st;RE.mode='reels';RE.HS=null;RE.win=null;RE.flash.clear();RE.pop.clear();RE.rev.clear();RE.hide.clear();RE.hl=null;RE.spinSet=null;RE.tension=false;RE.antic=[0,0,0,0,0];
 RE.cols=[0,1,2,3,4].map(()=>({off:0,v:0,st:'idle',map:new Map(),t:0}));if(!RE.raf){RE.last=performance.now();RE.raf=requestAnimationFrame(reLoop)}}
function reUnmount(){RE.cv=null;if(RE.raf)cancelAnimationFrame(RE.raf);RE.raf=0}
function reLayout(rows,availH){const W=RE.cv.parentElement.clientWidth;RE.rows=rows;RE.px=5;RE.py=5;RE.dv=4;RE.cw=(W-2*RE.px-4*RE.dv)/5;RE.ch=Math.max(28,Math.min(RE.cw*1.02,(availH-2*RE.py)/rows));
 RE.W=W;RE.H=Math.round(RE.ch*rows+2*RE.py);RE.cv.width=Math.round(W*DPR);RE.cv.height=Math.round(RE.H*DPR);RE.cv.style.width=W+'px';RE.cv.style.height=RE.H+'px';RE.bg=null}
function reSetGrid(g){RE.grid=g;const n=RE.rows;RE.cols.forEach((c,ci)=>{c.map.clear();c.off=n-1;c.st='idle';c.v=0;for(let r=0;r<n;r++)c.map.set(n-1-r,g[ci][r])})}
function symAt(ci,k){const c=RE.cols[ci];let s=c.map.get(k);if(!s){const L=wl(RE.cfg,ci,{},RE.st);let id=wp(L);if('CPHSBZ'.includes(id[0])&&Math.random()<.5)id=wp(L.filter(e=>!'CPHSBZ'.includes(e[0][0])));s=mk(RE.cfg,id,{});c.map.set(k,s)}return s}
const colX=c=>RE.px+c*(RE.cw+RE.dv);
function reCellCenter(c,r){const b=RE.cv.getBoundingClientRect();return[b.left+colX(c)+RE.cw/2,b.top+RE.py+r*RE.ch+RE.ch/2]}
function reRect(){return RE.cv.getBoundingClientRect()}
/* spinning */
function reStart(turbo){RE.turbo=!!turbo;RE.win=null;RE.flash.clear();RE.cols.forEach(c=>{c.st='spin';c.t=0;c.v=0;c.k0=c.off})}
function reStop(ci,final,soft){return new Promise(res=>{const c=RE.cols[ci],n=RE.rows,T=Math.floor(c.off)+n+2;for(let r=0;r<n;r++)c.map.set(T-r,final[r]);
 const v0=Math.max(c.v,3);c.from=c.off;c.T=T;c.dist=T-c.off;c.dur=Math.min(soft?1.7:.95,Math.max(.22,(soft?3.2:2.6)*c.dist/v0));c.t=0;c.st='stop';c.final=final;c.res=res;c.slow=0})}
function reStepCol(c,dt){c.t+=dt;if(c.st==='spin'){if(c.t<.18){c.off=c.k0-.32*Math.sin(c.t/.18*Math.PI)}else{const vm=RE.turbo?34:24;if(c.slow){c.v+=(c.slow-c.v)*Math.min(1,dt*2.2)}else c.v=Math.min(vm,c.v+110*dt);c.off+=c.v*dt}}
 else if(c.st==='stop'){const u=Math.min(1,c.t/c.dur);if(u<1){const e=1-Math.pow(1-u,3);c.off=c.from+c.dist*e;c.v=3*c.dist/c.dur*Math.pow(1-u,2)}else{const b=c.t-c.dur;if(b<.34){c.off=c.T+.24*Math.exp(-b*9)*Math.sin(b/.34*Math.PI*2.2);c.v=0}else{const n=RE.rows;c.map.clear();for(let r=0;r<n;r++)c.map.set(n-1-r,c.final[r]);c.off=n-1;c.st='idle';c.v=0;const f=c.res;c.res=null;f&&f()}}}}
/* background (felt, panels, dividers) */
function reBg(){if(RE.bg&&RE.bg.w===RE.W&&RE.bg.h===RE.H&&RE.bg.id===RE.cfg.id)return RE.bg.c;const c=document.createElement('canvas');c.width=RE.cv.width;c.height=RE.cv.height;const x=c.getContext('2d');x.scale(DPR,DPR);const f=FELT[RE.cfg.id]||FELT.biber;
 x.fillStyle=vg(x,0,RE.H,[f[0],f[1]]);x.fillRect(0,0,RE.W,RE.H);
 for(let ci=0;ci<5;ci++){const cx=colX(ci),g=x.createLinearGradient(cx,0,cx+RE.cw,0);g.addColorStop(0,'rgba(0,0,0,.35)');g.addColorStop(.5,'rgba(255,255,255,.07)');g.addColorStop(1,'rgba(0,0,0,.35)');x.fillStyle=g;x.fillRect(cx,0,RE.cw,RE.H);
  const v=x.createLinearGradient(0,0,0,RE.H);v.addColorStop(0,'rgba(0,0,0,.55)');v.addColorStop(.12,'rgba(0,0,0,0)');v.addColorStop(.88,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.55)');x.fillStyle=v;x.fillRect(cx,0,RE.cw,RE.H)}
 for(let ci=1;ci<5;ci++){const dx=colX(ci)-RE.dv,g=x.createLinearGradient(dx,0,dx+RE.dv,0);g.addColorStop(0,'#7a4a00');g.addColorStop(.4,'#fff3a0');g.addColorStop(.7,'#e0a020');g.addColorStop(1,'#5a3000');x.fillStyle=g;x.fillRect(dx,0,RE.dv,RE.H)}
 RE.bg={c,w:RE.W,h:RE.H,id:RE.cfg.id};return c}
/* symbol drawing */
function valText(s){if(s.d)return null;if(s.j)return[s.j.toUpperCase(),JPST[s.j]];if(!s.v)return null;return[fmt(s.v*RE.unit),'white']}
function drawTxt(x,t,style,size,cx,cy,maxW,sc){const im=txtSprite(t,Math.round(size*DPR),style),w=im.width/DPR,h=im.height/DPR,f=Math.min(1,maxW/w)*(sc||1);x.drawImage(im,cx-w*f/2,cy-h*f/2,w*f,h*f)}
function drawSym(x,s,cx,cy,sc,hs,al,at){if(!s)return;const k=symKey(s,hs),im=assetCanvas(k),z=Math.min(RE.cw,RE.ch)*.94*(sc||1);if(al!=null)x.globalAlpha=al;
 const sh=at!=null&&ANIM[k]&&GFX.img[ANIM[k]];if(sh){const f=Math.floor(at/.083)%24,fw=sh.width/6,fh=sh.height/4;x.drawImage(sh,(f%6)*fw,Math.floor(f/6)*fh,fw,fh,cx-z/2,cy-z/2,z,z)}else x.drawImage(im,cx-z/2,cy-z/2,z,z);
 if(s.s==='C'&&s.lvl==null&&!s.d){const vt=valText(s);if(vt)drawTxt(x,vt[0],vt[1],RE.ch*(vt[0].length>6?.21:.26),cx,cy+RE.ch*.06,RE.cw*.98,sc)}
 if(al!=null)x.globalAlpha=1}
function plateDraw(x,s,cx,cy,k){const w=RE.cw*.9,h=RE.ch*.78;x.save();x.translate(cx,cy);x.scale(Math.max(.02,k),1);const jp=!!s.j,g=x.createLinearGradient(0,-h/2,0,h/2);
 if(jp){g.addColorStop(0,'#c86aff');g.addColorStop(1,'#4a0890')}else{g.addColorStop(0,'#ff5a4a');g.addColorStop(1,'#8a0010')}x.fillStyle=g;rr(x,-w/2,-h/2,w,h,8);x.fill();x.lineWidth=3;x.strokeStyle='#ffd23c';x.stroke();
 drawTxt(x,jp?s.j.toUpperCase():fmt(s.v*RE.unit),jp?JPST[s.j]:'gold',RE.ch*.27,0,0,w*.92);x.restore()}
function rr(x,X,Y,w,h,r){x.beginPath();x.moveTo(X+r,Y);x.arcTo(X+w,Y,X+w,Y+h,r);x.arcTo(X+w,Y+h,X,Y+h,r);x.arcTo(X,Y+h,X,Y,r);x.arcTo(X,Y,X+w,Y,r);x.closePath()}
/* main loop */
function reLoop(now){if(!RE.cv){RE.raf=0;return}const dt=Math.max(0,Math.min(.05,(now-RE.last)/1000));RE.last=now;RE.t+=dt;const x=RE.x;x.setTransform(DPR,0,0,DPR,0,0);x.clearRect(0,0,RE.W,RE.H);x.drawImage(reBg(),0,0,RE.W,RE.H);
 if(RE.mode==='reels')drawReels(x,dt);else drawHS(x);
 drawGlints(x,dt);RE.raf=requestAnimationFrame(reLoop)}
function drawReels(x,dt){const n=RE.rows,ch=RE.ch;
 if(RE.zoneCols)RE.zoneCols.forEach(ci=>{const X=colX(ci);x.save();x.globalAlpha=.25+.12*Math.sin(RE.t*4);x.fillStyle='#6affea';x.fillRect(X,0,RE.cw,RE.H);x.restore()});
 for(let ci=0;ci<5;ci++){const c=RE.cols[ci];reStepCol(c,dt);const X=colX(ci);x.save();x.beginPath();x.rect(X,0,RE.cw,RE.H);x.clip();
  const fast=c.st!=='idle'&&c.v>9,k0=Math.floor(c.off-n),k1=Math.ceil(c.off)+1;
  for(let k=k0;k<=k1;k++){const y=RE.py+(c.off-k)*ch+ch/2;if(y<-ch||y>RE.H+ch)continue;const s=symAt(ci,k);
   if(fast){drawSym(x,s,X+RE.cw/2,y-ch*.2,1,0,.25);drawSym(x,s,X+RE.cw/2,y-ch*.1,1,0,.45);drawSym(x,s,X+RE.cw/2,y,1,0,.7)}
   else{const r=Math.round(c.off)-k,fk=c.st==='idle'&&RE.grid?ci+','+r:null,fl=fk&&RE.flash.get(fk);let sc=1;if(fl){const u=(RE.t-fl)/.75;if(u<1)sc=1+.38*Math.sin(u*Math.PI)*(1-u*.4)}drawSym(x,s,X+RE.cw/2,y,sc,0)}}
  if(fast){x.fillStyle='rgba(0,0,0,.12)';x.fillRect(X,0,RE.cw,RE.H)}x.restore();
  if(RE.antic[ci])anticFrame(x,X)}
 if(RE.win)drawWin(x);
 if(RE.spot){const k=Math.min(1,(RE.t-RE.spotT)*2.5);for(let ci=0;ci<5;ci++)for(let r=0;r<n;r++){const key=ci+','+r,X=colX(ci),Y=RE.py+r*ch;if(!RE.spot.has(key)){x.fillStyle=`rgba(6,0,20,${.72*k})`;x.fillRect(X,Y,RE.cw,ch)}else{const c=RE.cols[ci],s=c.map.get(Math.round(c.off)-r),pl=1+.12*Math.sin(RE.t*9);x.save();x.globalCompositeOperation='lighter';glow(x,X+RE.cw/2,Y+ch/2,RE.cw*.8,'#ffd860',.55*k);x.restore();drawSym(x,s,X+RE.cw/2,Y+ch/2,pl,0,null,RE.t-RE.spotT)}}}}
function anticFrame(x,X){const t=RE.t,w=RE.cw,h=RE.H;x.save();x.globalCompositeOperation='lighter';for(let i=0;i<14;i++){const p=(t*.55+i/14)%1,ex=X+w*(.15+.7*hsh2(i,1)),ey=h*(1-p);glow(x,ex+Math.sin(t*3+i)*6,ey,5+6*(1-p),i%3?'#ffb030':'#fff0a0',.9*(1-p))}const a=.55+.35*Math.sin(t*14);x.fillStyle=`rgba(255,150,30,${.18*a})`;x.fillRect(X,0,w,h);
 x.lineWidth=4;x.strokeStyle=`hsl(${40+20*Math.sin(t*9)} 100% ${60+15*a}%)`;x.shadowColor='#ffb020';x.shadowBlur=22;rr(x,X+2,2,w-4,h-4,8);x.stroke();
 for(let i=0;i<10;i++){const p=((t*1.6+i/10)%1),per=2*(w+h),d=p*per;let px,py;if(d<w){px=X+d;py=2}else if(d<w+h){px=X+w-2;py=d-w}else if(d<2*w+h){px=X+w-(d-w-h);py=h-2}else{px=X+2;py=h-(d-2*w-h)}
  const g=x.createRadialGradient(px,py,0,px,py,9);g.addColorStop(0,'#fffbe0');g.addColorStop(1,'rgba(255,160,40,0)');x.fillStyle=g;x.beginPath();x.arc(px,py,9,0,7);x.fill()}x.restore()}
function winCells(){const w=RE.win;if(!w)return null;if(w.idx<0)return w.all;return w.sets[w.idx]}
function drawWin(x){const w=RE.win,t=RE.t-w.t0;if(w.list.length>1&&!RE.turbo){const per=1.05,start=1.5;if(t>start){const i=Math.floor((t-start)/per)%w.list.length;if(i!==w.idx){w.idx=i;RE.onCycle&&RE.onCycle(w.list[i])}}}
 const cells=winCells(),n=RE.rows,dim=Math.min(.6,t*3);
 for(let ci=0;ci<5;ci++)for(let r=0;r<n;r++)if(!cells.has(ci+','+r)){x.fillStyle=`rgba(4,0,16,${dim})`;x.fillRect(colX(ci),RE.py+r*RE.ch,RE.cw,RE.ch)}
 const pl=1+.07*Math.sin(t*7);if(w.lines&&w.idx>=0&&w.lines[w.idx]){const L=w.lines[w.idx];x.save();x.lineCap='round';x.lineJoin='round';x.strokeStyle='rgba(255,220,80,.9)';x.shadowColor='#ffd23c';x.shadowBlur=14;x.lineWidth=5;x.beginPath();L.forEach((cr,i)=>{const px=colX(cr[0])+RE.cw/2,py=RE.py+cr[1]*RE.ch+RE.ch/2;i?x.lineTo(px,py):x.moveTo(px,py)});x.stroke();x.restore()}
 for(const key of cells){const[ci,r]=key.split(',').map(Number),X=colX(ci),Y=RE.py+r*RE.ch,col=RE.cols[ci];if(!col)continue;const s=col.map.get(Math.round(col.off)-r);
  x.save();x.shadowColor='#ffd23c';x.shadowBlur=16;x.lineWidth=3;x.strokeStyle=`rgba(255,${200+40*Math.sin(t*7)},90,.95)`;rr(x,X+3,Y+3,RE.cw-6,RE.ch-6,8);x.stroke();x.restore();
  x.save();x.beginPath();x.rect(X,Y,RE.cw,RE.ch);x.clip();x.fillStyle=vg(x,Y,Y+RE.ch,['rgba(255,230,120,.0)','rgba(255,210,80,.22)','rgba(255,230,120,.0)']);x.fillRect(X,Y,RE.cw,RE.ch);drawSym(x,s,X+RE.cw/2,Y+RE.ch/2,ANIM[symKey(s,0)]?1:pl,0,null,t);
  const sw=((t*.8+ci*.13)%1.4)-.2;if(sw>=0&&sw<=1){const gx=X-RE.cw+sw*RE.cw*3,gr=x.createLinearGradient(gx,Y,gx+RE.cw*.6,Y+RE.ch);gr.addColorStop(0,'rgba(255,255,255,0)');gr.addColorStop(.5,'rgba(255,250,220,.55)');gr.addColorStop(1,'rgba(255,255,255,0)');x.globalCompositeOperation='lighter';x.fillStyle=gr;x.fillRect(X,Y,RE.cw,RE.ch)}x.restore()}}
function reShowWins(wins,sc){if(!wins.length&&!(sc&&sc.length)){RE.win=null;return}const sets=wins.map(w=>new Set(w.cells.map(c=>c[0]+','+c[1]))),all=new Set();sets.forEach(s=>s.forEach(k=>all.add(k)));(sc||[]).forEach(c=>all.add(c[0]+','+c[1]));
 RE.win={list:wins,sets,all,idx:-1,t0:RE.t,lines:RE.cfg.ev==='lines'?wins.map(w=>w.label?null:w.cells):null}}
function reClearWins(){RE.win=null}
function reFlash(cells){cells.forEach(c=>RE.flash.set(c[0]+','+c[1],RE.t))}
/* ambient glints on special symbols */
function drawGlints(x,dt){RE.glintT-=dt;if(RE.glintT<0&&RE.mode==='reels'&&RE.cols.every(c=>c.st==='idle')){RE.glintT=.35+Math.random()*.5;const ci=Math.floor(Math.random()*5),r=Math.floor(Math.random()*RE.rows),c=RE.cols[ci],s=c.map.get(Math.round(c.off)-r);
  if(s&&(s.s==='W'||s.s==='C'||s.s==='S'||s.s==='B'||s.s==='Z'||s.s==='H'||(s.s[0]==='P'&&s.s.length===2)))RE.glints.push({x:colX(ci)+RE.cw*(.25+Math.random()*.5),y:RE.py+r*RE.ch+RE.ch*(.2+Math.random()*.4),t:0})}
 RE.glints=RE.glints.filter(g=>{g.t+=dt;if(g.t>.7)return false;const k=Math.sin(g.t/.7*Math.PI);glint(x,g.x,g.y,RE.ch*.13*k,'#fffbe0',k);return true})}
/* ---- hold & spin board ---- */
function reSetHS(H){RE.mode='hs';RE.HS=H;RE.hide.clear();RE.pop.clear();RE.rev.clear();RE.hl=null;RE.spinSet=null;RE.tension=false;RE.win=null}
function reSetReels(){RE.mode='reels';RE.HS=null;RE.tension=false;RE.hl=null}
function drawHS(x){const H=RE.HS,n=RE.rows,off=H.M-n;for(let ci=0;ci<5;ci++)for(let r=0;r<n;r++){const X=colX(ci),Y=RE.py+r*RE.ch,cx=X+RE.cw/2,cy=Y+RE.ch/2,s=H.cells[ci][off+r],key=ci+','+(off+r),hidden=RE.hide.has(key);
  x.save();x.fillStyle='rgba(0,0,0,.42)';rr(x,X+3,Y+3,RE.cw-6,RE.ch-6,8);x.fill();x.strokeStyle='rgba(255,220,120,.18)';x.lineWidth=1.5;x.stroke();
  if(RE.tension&&(!s||hidden)){x.fillStyle=`rgba(255,40,60,${.12+.1*Math.sin(RE.t*9)})`;x.fill()}x.restore();
  if(RE.spinSet&&RE.spinSet.has(key)){x.save();x.beginPath();x.rect(X+3,Y+3,RE.cw-6,RE.ch-6);x.clip();const sp=(RE.t*9+ci*.37+r*.21)%1,ks=symKey(RE.cfg.hs&&RE.cfg.hs.upgrade?{s:'C',v:1,lvl:0}:{s:'C',v:1},1),im=assetCanvas(ks),z=Math.min(RE.cw,RE.ch)*.8;
   x.globalAlpha=.35;x.drawImage(im,cx-z/2,Y-z+sp*(RE.ch+z),z,z);x.globalAlpha=.18;x.drawImage(im,cx-z/2,Y-z+((sp+.5)%1)*(RE.ch+z),z,z);x.restore();continue}
  if(!s||hidden)continue;const p=RE.pop.get(key);let sc=1;if(p!=null){const u=(RE.t-p)/.45;if(u<1)sc=1.5-.5*Math.min(1,u*1.3)+.1*Math.sin(u*Math.PI)}
  const rv=RE.rev.get(key);if(rv!=null&&s.lvl!=null){const u=Math.min(1,(RE.t-rv)/.34);if(u<.5){x.save();x.translate(cx,cy);x.scale(Math.max(.02,1-u*2),1);x.translate(-cx,-cy);drawSym(x,s,cx,cy,1,1);x.restore()}else plateDraw(x,s,cx,cy,(u-.5)*2)}
  else drawSym(x,s,cx,cy,sc,1);
  if(s.x2){x.save();x.globalCompositeOperation='lighter';x.globalAlpha=.25+.15*Math.sin(RE.t*6);x.fillStyle='#ff5a2a';rr(x,X+3,Y+3,RE.cw-6,RE.ch-6,8);x.fill();x.restore()}
  if(RE.hl===key){x.save();x.shadowColor='#fff3a0';x.shadowBlur=24;x.lineWidth=4;x.strokeStyle='#fffbe0';rr(x,X+2,Y+2,RE.cw-4,RE.ch-4,9);x.stroke();x.restore()}
  if(p!=null&&RE.t-p<.35){const k=1-(RE.t-p)/.35;glint(x,cx,cy,RE.ch*.5*k,'#fffbe0',k)}}}

function hsh2(a,b){const v=Math.sin(a*127.1+b*311.7)*43758.5;return v-Math.floor(v)}
