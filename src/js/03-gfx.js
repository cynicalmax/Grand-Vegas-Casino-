'use strict';
/* ===== Goldfuchs gfx runtime: prerendered 3D assets, 3D-style live lettering, painted scenes ===== */
const DPR=Math.min(3,window.devicePixelRatio||1),FONT="Disp,'Arial Black',Impact,sans-serif";
const GFX={url:{},img:{},ready:false};
function b64blob(d){const i=d.indexOf(','),mime=d.slice(5,d.indexOf(';')),bin=atob(d.slice(i+1)),n=bin.length,u=new Uint8Array(n);for(let k=0;k<n;k++)u[k]=bin.charCodeAt(k);return new Blob([u],{type:mime})}
function loadAssets(onp){const ks=Object.keys(IMG);let n=0;return Promise.all(ks.map(k=>new Promise(res=>{let u;try{u=URL.createObjectURL(b64blob(IMG[k]))}catch(e){u=IMG[k]}GFX.url[k]=u;const im=new Image();im.onload=()=>{GFX.img[k]=im;onp&&onp(++n/ks.length);res()};im.onerror=()=>{console.warn('asset',k);res()};im.src=u}))).then(()=>{GFX.ready=true;
 const r=document.documentElement.style;for(const k of ks)if(k.startsWith('ui-'))r.setProperty('--'+k,`url(${GFX.url[k]})`)})}
function assetCanvas(k){return GFX.img[k]||GFX.img.star}
const A=(n,c)=>GFX.url[n]?`<img class="art ${c||''}" src="${GFX.url[n]}" alt="" draggable="false">`:'';
const WT=(k,c)=>GFX.url[k]?`<img class="wtxt ${c||''}" src="${GFX.url[k]}" alt="" draggable="false">`:'';
function fillArt(){}
/* ---------- 3D-style live lettering (numbers & dynamic words) ---------- */
const TS={gold:{f:['#fffbe0','#ffe066','#ffb81e','#e07800','#9a4a00'],r:['#fff3b0','#b86a00','#5a2600'],x:'#2a0e00'},white:{f:['#ffffff','#f4fbff','#d6ecff','#9ccaff','#6aa8f0'],r:['#fff6c0','#f0a820','#7a3e00'],x:'#3a1600'},
 green:{f:['#f2ffd0','#b8ff5a','#5ad81e','#1a9a14','#0a5a08'],r:['#fff6c0','#f0a820','#7a3e00'],x:'#063a08'},red:{f:['#ffe6e0','#ff8a7a','#ff2a2a','#c0000e','#6a0008'],r:['#fff6c0','#f0a820','#7a3e00'],x:'#3a0004'},
 pink:{f:['#fff0fa','#ffa6e0','#ff4ac2','#c2108a','#6a0448'],r:['#fff6c0','#f0a820','#7a3e00'],x:'#3a0028'},cyan:{f:['#f0ffff','#a8f4ff','#34d2ff','#0a86e0','#064a9a'],r:['#fff6c0','#f0a820','#7a3e00'],x:'#031a4a'},
 purple:{f:['#f6e6ff','#d6a0ff','#a650ff','#6a14d6','#3a0886'],r:['#fff6c0','#f0a820','#7a3e00'],x:'#1a043a'},orange:{f:['#fff4d0','#ffd070','#ff9a1e','#e85a00','#8a2a00'],r:['#fff6c0','#f0a820','#7a3e00'],x:'#3a1200'},
 silver:{f:['#ffffff','#eef2f8','#c4ccda','#8a94a8','#5a6478'],r:['#fff6c0','#c88a20','#5a3000'],x:'#1a1e2a'},ink:{f:['#4a4a56','#1e1e26','#000'],r:['#ffffff','#d0d6e0','#8a94a8'],x:'#000'}};
let _tc=null;
function glossText(ctx,txt,x,y,size,style,o){o=o||{};const S=TS[style]||TS.gold;txt=String(txt);ctx.save();ctx.font=`${size}px ${FONT}`;try{ctx.letterSpacing=(size*.03).toFixed(1)+'px'}catch(e){}ctx.lineJoin='round';ctx.textBaseline='alphabetic';
 const w=ctx.measureText(txt).width,sc=o.max&&w>o.max?o.max/w:1,al=o.align||'center',ox=al==='center'?-w/2:al==='right'?-w:0,rw=size*(o.sw||.2),dep=size*(o.ex==null?.09:o.ex);ctx.translate(x,y);ctx.scale(sc,1);ctx.textAlign='left';
 ctx.shadowColor='rgba(0,0,0,.55)';ctx.shadowBlur=size*.12;ctx.shadowOffsetY=size*.06;ctx.strokeStyle=S.x;ctx.lineWidth=rw;ctx.strokeText(txt,ox+dep*.25,dep);ctx.shadowColor='transparent';
 const n=Math.max(2,Math.ceil(dep));for(let i=n;i>=1;i--){ctx.strokeStyle=i===n?S.x:S.x;ctx.lineWidth=rw;ctx.strokeText(txt,ox+dep*.25*i/n,dep*i/n)}
 const rg=ctx.createLinearGradient(0,-size*.8,0,size*.15);rg.addColorStop(0,S.r[0]);rg.addColorStop(.45,S.r[1]);rg.addColorStop(.6,S.r[0]);rg.addColorStop(1,S.r[2]);ctx.strokeStyle=rg;ctx.lineWidth=rw;ctx.strokeText(txt,ox,0);
 ctx.strokeStyle='rgba(0,0,0,.45)';ctx.lineWidth=size*.035;ctx.strokeText(txt,ox,0);
 const g=ctx.createLinearGradient(0,-size*.74,0,size*.04);S.f.forEach((c,i)=>g.addColorStop(i/(S.f.length-1),c));ctx.fillStyle=g;ctx.fillText(txt,ox,0);
 if(style!=='ink'&&o.gloss!==false){const pad=Math.ceil(size*.3),W=Math.ceil(w+pad*2),H=Math.ceil(size*1.3);if(!_tc)_tc=document.createElement('canvas');if(_tc.width<W)_tc.width=W;if(_tc.height<H)_tc.height=H;const t=_tc.getContext('2d');t.clearRect(0,0,_tc.width,_tc.height);
  t.font=ctx.font;try{t.letterSpacing=ctx.letterSpacing}catch(e){}t.textBaseline='alphabetic';t.fillStyle='#fff';t.fillText(txt,pad,size);t.globalCompositeOperation='source-in';const gg=t.createLinearGradient(0,size*.22,0,size*.58);gg.addColorStop(0,'rgba(255,255,255,.8)');gg.addColorStop(.85,'rgba(255,255,255,.08)');gg.addColorStop(1,'rgba(255,255,255,0)');t.fillStyle=gg;t.fillRect(0,0,W,H);t.globalCompositeOperation='source-over';
  ctx.drawImage(_tc,0,0,W,H,ox-pad,-size,W,H)}
 ctx.restore()}
/* emoji in UI copy -> art */
const EM={'🪙':'coin','💎':'gem','⭐':'star','☆':'star','👑':'vip','🃏':'cards','📜':'scroll','🏆':'trophy','🛤️':'pass','🏠':'home','🥇':'mgold','🥈':'msilver','🥉':'mbronze','⚙️':'gear','🛠️':'gear','🚀':'rocket','🍖':'polish',
 '🎁':'gift','🧰':'chest','👛':'bag','🏰':'mansion','✅':'check','📈':'chart','🎯':'target','🔒':'lock','🔓':'key','⏰':'clock','🎡':'wheelicon','🎟️':'ticket','🛒':'cart','🎉':'star','💥':'boom',
 '🥚':'jewel1','🐣':'jewel2','🐥':'jewel3','🐲':'jewel4','🐉':'jewel5','🌱':'chip','🎰':'chip','🦊':'crest','🔥':'fireball','🎈':'balloon','📦':'mini','🏦':'bank','🔑':'key','🐷':'pot2',
 'ℹ️':'info','ℹ':'info','🦫':'hardhat','🦬':'horseshoe','⚡':'bolt','☄️':'fireball','🐹':'vault','🐯':'emerald','💰':'bag'};
const EMRE=new RegExp('('+Object.keys(EM).sort((a,b)=>b.length-a.length).map(k=>k.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|')+'|\\p{Extended_Pictographic}\\uFE0F?)','gu');
function fixText(n){const p=n.parentNode;if(!p||p.namespaceURI==='http://www.w3.org/2000/svg'||/^(SCRIPT|STYLE|TEXTAREA)$/.test(p.nodeName))return;const t=n.nodeValue;EMRE.lastIndex=0;if(!EMRE.test(t))return;const f=document.createElement('span');
 f.innerHTML=t.replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c])).replace(EMRE,m=>EM[m]?A(EM[m],m==='☆'?'dim':''):'');n.replaceWith(...f.childNodes)}
function deEmoji(root){if(root.nodeType===3)return fixText(root);if(root.nodeType!==1)return;const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT),l=[];while(w.nextNode())l.push(w.currentNode);l.forEach(fixText)}
function startArtObserver(){deEmoji(document.body);new MutationObserver(ms=>{for(const m of ms){if(m.type==='characterData')fixText(m.target);else m.addedNodes.forEach(deEmoji)}}).observe(document.body,{childList:true,subtree:true,characterData:true})}

/* ---------- painted scenes (pure canvas → data URL) ---------- */
function rng(seed){let s=seed%2147483647||7;return()=>{s=s*16807%2147483647;return s/2147483647}}
function vg(x,y0,y1,stops){const g=x.createLinearGradient(0,y0,0,y1);stops.forEach((c,i)=>g.addColorStop(Array.isArray(c)?c[0]:i/(stops.length-1),Array.isArray(c)?c[1]:c));return g}
function glow(x,cx,cy,r,col,a){const g=x.createRadialGradient(cx,cy,0,cx,cy,r);g.addColorStop(0,col);g.addColorStop(1,'rgba(0,0,0,0)');x.globalAlpha=a==null?1:a;x.fillStyle=g;x.beginPath();x.arc(cx,cy,r,0,7);x.fill();x.globalAlpha=1}
function ball(x,cx,cy,r,c0,c1,c2){const g=x.createRadialGradient(cx-r*.35,cy-r*.4,r*.1,cx,cy,r);g.addColorStop(0,c0);g.addColorStop(.55,c1);g.addColorStop(1,c2);x.fillStyle=g;x.beginPath();x.arc(cx,cy,r,0,7);x.fill()}
function cloud(x,cx,cy,s,a){x.globalAlpha=a||1;[[0,0,1],[-.9,.25,.7],[.9,.25,.75],[-.45,-.35,.75],[.45,-.3,.8],[1.6,.4,.5],[-1.6,.45,.45]].forEach(c=>ball(x,cx+c[0]*s*30,cy+c[1]*s*30,c[2]*s*30,'#ffffff','#f4f9ff','#c8def5'));x.globalAlpha=1}
function hills(x,R,y,amp,n,top,bot,hl){x.beginPath();x.moveTo(0,700+60);x.lineTo(0,y);const w=400/n;let px=0,py=y;for(let i=0;i<n;i++){const nx=(i+1)*w,ny=y+(R()-.5)*amp*.4;x.quadraticCurveTo(px+w/2,y-amp*(.5+R()*.6),nx,ny);px=nx;py=ny}x.lineTo(400,760);x.closePath();x.fillStyle=vg(x,y-amp,y+160,[top,bot]);x.fill();if(hl){x.strokeStyle=hl;x.lineWidth=2;x.globalAlpha=.6;x.stroke();x.globalAlpha=1}}
function tree(x,tx,ty,s,dark){x.fillStyle=vg(x,ty-s*.2,ty+s*.6,['#8a5a2a','#4a2a10']);x.fillRect(tx-s*.08,ty-s*.2,s*.16,s*.75);const c=dark?['#5ab83a','#227a1c','#0e3a0a']:['#9ff060','#3aa82a','#145a10'];
 [[0,-.55,.42],[-.3,-.3,.34],[.3,-.3,.34],[0,-.15,.38]].forEach(q=>ball(x,tx+q[0]*s,ty+q[1]*s,q[2]*s,c[0],c[1],c[2]))}
function stars(x,R,n,h,a){for(let i=0;i<n;i++){x.globalAlpha=(a||1)*(.3+R()*.7);x.fillStyle='#fff';const r=R()*1.4+.3;x.beginPath();x.arc(R()*400,R()*h,r,0,7);x.fill()}x.globalAlpha=1}
function rays(x,cx,cy,n,c,a,r0){x.save();x.globalAlpha=a;x.fillStyle=c;for(let i=0;i<n;i++){const t=i/n*6.2832+(r0||0),d=3.1416/n*.9;x.beginPath();x.moveTo(cx,cy);x.lineTo(cx+900*Math.cos(t-d/2),cy+900*Math.sin(t-d/2));x.lineTo(cx+900*Math.cos(t+d/2),cy+900*Math.sin(t+d/2));x.fill()}x.restore()}
function mesas(x,R,y,h,c1,c2,lit){let px=-20;while(px<420){const w=40+R()*70,hh=h*(.45+R()*.55),gap=10+R()*40;x.beginPath();x.moveTo(px,y);x.lineTo(px+8,y-hh);x.lineTo(px+w-8,y-hh);x.lineTo(px+w,y);x.closePath();x.fillStyle=vg(x,y-hh,y,[c1,c2]);x.fill();
 if(lit){x.fillStyle=lit;x.globalAlpha=.55;x.beginPath();x.moveTo(px+w*.55,y-hh);x.lineTo(px+w-8,y-hh);x.lineTo(px+w,y);x.lineTo(px+w*.7,y);x.closePath();x.fill();x.globalAlpha=1}px+=w+gap}}
function coinE(x,cx,cy,r,t){x.save();x.translate(cx,cy);x.scale(1,t||.45);x.fillStyle='#8a4a00';x.beginPath();x.arc(0,r*.35,r,0,7);x.fill();ball(x,0,0,r,'#fffbd0','#ffd23c','#c27800');x.strokeStyle='#a35800';x.lineWidth=r*.12;x.beginPath();x.arc(0,0,r*.72,0,7);x.stroke();x.restore()}
function curtain(x,x0,w,flip,col){for(let i=0;i<7;i++){const fx=x0+(flip?w-(i+1)*w/7:i*w/7);x.fillStyle=vg(x,0,760,[col[0],col[1],col[2]]);x.fillRect(fx,0,w/7+1,760);const g=x.createLinearGradient(fx,0,fx+w/7,0);g.addColorStop(0,'rgba(0,0,0,.35)');g.addColorStop(.45,'rgba(255,255,255,.18)');g.addColorStop(1,'rgba(0,0,0,.4)');x.fillStyle=g;x.fillRect(fx,0,w/7+1,760)}}
function beam(x,tx,ty,bx,w,col,a){const g=x.createLinearGradient(0,ty,0,760);g.addColorStop(0,col);g.addColorStop(1,'rgba(0,0,0,0)');x.save();x.globalAlpha=a;x.globalCompositeOperation='lighter';x.fillStyle=g;x.beginPath();x.moveTo(tx-6,ty);x.lineTo(tx+6,ty);x.lineTo(bx+w,760);x.lineTo(bx-w,760);x.fill();x.restore()}
function bokeh(x,R,n,cols,rmax,h){x.save();x.globalCompositeOperation='lighter';for(let i=0;i<n;i++){const r=4+R()*rmax;glow(x,R()*400,R()*(h||760),r,cols[i%cols.length],.18+R()*.3)}x.restore()}
function bolt(x,R,x0,y0,len){x.save();x.strokeStyle='#e8f6ff';x.shadowColor='#7ad8ff';x.shadowBlur=18;x.lineWidth=3;x.beginPath();x.moveTo(x0,y0);let px=x0,py=y0;while(py<y0+len){px+=(R()-.5)*40;py+=15+R()*25;x.lineTo(px,py)}x.stroke();x.lineWidth=1.2;x.strokeStyle='#fff';x.stroke();x.restore()}
function skyline(x,R,y,c,win){let px=0;while(px<400){const w=24+R()*36,h=50+R()*140;x.fillStyle=c;x.fillRect(px,y-h,w,h+300);if(win){x.fillStyle=win;for(let wy=y-h+8;wy<y;wy+=12)for(let wx=px+5;wx<px+w-6;wx+=9)if(R()<.45){x.globalAlpha=.4+R()*.6;x.fillRect(wx,wy,4,6)}x.globalAlpha=1}px+=w+2}}
function leaf(x,cx,cy,l,w,a,c){x.save();x.translate(cx,cy);x.rotate(a);const g=x.createLinearGradient(0,-w,0,w);g.addColorStop(0,c[0]);g.addColorStop(1,c[1]);x.fillStyle=g;x.beginPath();x.moveTo(0,0);x.quadraticCurveTo(l*.5,-w,l,0);x.quadraticCurveTo(l*.5,w,0,0);x.fill();x.strokeStyle='rgba(0,0,0,.25)';x.lineWidth=1.2;x.beginPath();x.moveTo(0,0);x.lineTo(l*.95,0);x.stroke();x.restore()}
function vaultDoor(x,cx,cy,r){ball(x,cx,cy,r,'#f2f6fc','#9aa6ba','#2e3648');ball(x,cx,cy,r*.82,'#5a6478','#2a3040','#0e121c');for(let i=0;i<12;i++){const a=i/12*6.2832;ball(x,cx+Math.cos(a)*r*.91,cy+Math.sin(a)*r*.91,r*.045,'#fff','#c8d0dc','#5a6478')}
 x.strokeStyle='#e8b830';x.lineWidth=r*.09;x.lineCap='round';for(let i=0;i<4;i++){const a=i/4*3.1416;x.beginPath();x.moveTo(cx-Math.cos(a)*r*.6,cy-Math.sin(a)*r*.6);x.lineTo(cx+Math.cos(a)*r*.6,cy+Math.sin(a)*r*.6);x.stroke()}ball(x,cx,cy,r*.2,'#fff6c0','#ffc21a','#8a5000')}
function barStack(x,cx,cy,s,n){for(let row=0;row<n;row++)for(let i=0;i<n-row;i++){const bx=cx+(i-(n-row-1)/2)*s*1.05,by=cy-row*s*.42;x.fillStyle=vg(x,by-s*.18,by+s*.25,['#fff6c0','#ffd23c','#b86a00']);x.beginPath();x.moveTo(bx-s*.5,by+s*.22);x.lineTo(bx-s*.36,by-s*.18);x.lineTo(bx+s*.36,by-s*.18);x.lineTo(bx+s*.5,by+s*.22);x.closePath();x.fill();x.strokeStyle='#7a4000';x.lineWidth=1;x.stroke()}}
const SCN={
 lobby(x,R){x.fillStyle=vg(x,0,760,['#2a0870','#5a14b0',[.6,'#3a0a86'],'#12032e']);x.fillRect(0,0,400,760);rays(x,200,140,18,'#c88aff',.07);
  ['#ff4ad8','#4ad8ff','#ffd84a','#8aff6a'].forEach((c,i)=>beam(x,40+i*107,0,(i<2?60:340)+(R()-.5)*80,70,c,.22));bokeh(x,R,40,['#ff6ae0','#6ad8ff','#ffe06a','#b88aff'],22);
  curtain(x,-10,70,0,['#c2108a','#7a0458','#3a0028']);curtain(x,340,70,1,['#c2108a','#7a0458','#3a0028']);x.fillStyle=vg(x,0,46,['#d41e8e','#7a0458']);x.fillRect(0,0,400,40);
  for(let i=0;i<16;i++)glow(x,12+i*25.3,40,8,'#fff6c0',.8)},
 biber(x,R){x.fillStyle=vg(x,0,380,['#2f9cf0','#7cd0ff','#d8f4ff']);x.fillRect(0,0,400,400);glow(x,320,70,160,'#fffbe0',.55);ball(x,320,70,34,'#ffffff','#fff8c8','#ffe68a');
  cloud(x,90,90,1.1);cloud(x,250,150,.75,.9);cloud(x,370,210,.6,.85);hills(x,R,330,60,3,'#9ae070','#5ab840','#e8ffb0');hills(x,R,360,40,4,'#6cc844','#2e8a24','#c8ff90');
  x.fillStyle=vg(x,360,760,['#5ac83a','#2a8a1e','#14520e']);x.fillRect(0,368,400,400);
  x.fillStyle=vg(x,365,760,['#f6e2b0','#d8b070']);x.beginPath();x.moveTo(194,366);x.lineTo(206,366);x.lineTo(330,760);x.lineTo(70,760);x.fill();
  for(let i=9;i>=0;i--){const t=Math.pow(i/9,1.6),y=372+t*390,s=10+t*120,dx=20+t*230;tree(x,200-dx,y,s,i%2);tree(x,200+dx,y,s,(i+1)%2)}
  for(let i=0;i<18;i++){const bx=R()*400,by=560+R()*200;ball(x,bx,by,14+R()*20,'#a8f070','#3aa82a','#0e4a0a')}},
 donner(x,R){x.fillStyle=vg(x,0,470,['#1a0a4a','#5a1a6a',[.55,'#d2466a'],[.8,'#ff8a3a'],'#ffd27a']);x.fillRect(0,0,400,480);stars(x,R,60,180,.8);
  glow(x,200,420,260,'#ffb050',.6);ball(x,200,420,70,'#fffbe0','#ffe08a','#ffa040');mesas(x,R,470,170,'#c2552a','#6a2210','#ff9a4a');mesas(x,R,520,110,'#8a3418','#3a1206','#e06a2a');
  x.fillStyle=vg(x,500,760,['#7a2e14','#3a1006']);x.fillRect(0,510,400,260);for(let i=0;i<6;i++){x.strokeStyle='rgba(30,10,0,.6)';x.lineWidth=2;x.beginPath();const bx=40+R()*320,by=60+R()*120;x.moveTo(bx-8,by);x.quadraticCurveTo(bx-4,by-5,bx,by);x.quadraticCurveTo(bx+4,by-5,bx+8,by);x.stroke()}},
 rubin(x,R){x.fillStyle=vg(x,0,760,['#5a0420','#b0103e',[.55,'#6a0424'],'#1e0008']);x.fillRect(0,0,400,760);rays(x,200,260,20,'#ff7aa8',.09,.1);
  beam(x,120,0,90,90,'#ffd0e0',.25);beam(x,280,0,320,90,'#ffd0e0',.25);beam(x,200,0,200,70,'#fff0c0',.2);bokeh(x,R,46,['#ff6a9a','#ffd27a','#ffffff'],18);
  curtain(x,-10,64,0,['#e0204a','#8a0424','#3a0010']);curtain(x,346,64,1,['#e0204a','#8a0424','#3a0010'])},
 frei(x,R){x.fillStyle=vg(x,0,760,['#0a0630','#2a1488',[.55,'#5a1ad0'],'#12043a']);x.fillRect(0,0,400,760);stars(x,R,120,420);glow(x,200,260,260,'#a86aff',.35);
  for(let i=0;i<5;i++)cloud(x,40+i*85,300+(R()-.5)*40,.9,.18);bolt(x,R,70,0,240);bolt(x,R,330,20,200);skyline(x,R,560,'#140636','#ffd86a');bokeh(x,R,24,['#7ad8ff','#ff8ae0'],14,400)},
 glut(x,R){x.fillStyle=vg(x,0,760,['#02041a','#0a1450',[.45,'#1a2a8a'],[.7,'#0e1a5a'],'#04061e']);x.fillRect(0,0,400,760);stars(x,R,220,760,.9);glow(x,200,330,260,'#3a6aff',.35);
  for(let i=0;i<70;i++){const cx=R()*400,cy=i<35?40+R()*120:560+R()*160,s=.5+R()*1.1;x.globalAlpha=.55;ball(x,cx,cy,s*34,'#9aa8ff','#4a4ab0','#1a1250');x.globalAlpha=1}
  for(let i=0;i<40;i++){const cx=R()*400,cy=i<20?60+R()*90:590+R()*120;glow(x,cx,cy,30+R()*30,'#b8c8ff',.18)}
  bolt(x,R,40,60,260);bolt(x,R,360,90,220);bolt(x,R,140,600,150);x.save();x.globalCompositeOperation='lighter';glow(x,40,140,90,'#7ad8ff',.35);glow(x,360,170,80,'#7ad8ff',.3);x.restore();
  glow(x,200,400,160,'#ff7a1a',.12)},
 schwein(x,R){x.fillStyle=vg(x,0,760,['#5a0a4a','#c2208a',[.5,'#ff7ac8'],'#7a1458']);x.fillRect(0,0,400,760);rays(x,200,300,22,'#ffe6a0',.13);glow(x,200,300,220,'#fff0b0',.5);
  x.lineWidth=16;['#ff4a4a','#ffd23c','#4ad84a','#4ab8ff'].forEach((c,i)=>{x.strokeStyle=c;x.globalAlpha=.32;x.beginPath();x.arc(200,420,230-i*16,3.3,6.12);x.stroke()});x.globalAlpha=1;bokeh(x,R,30,['#fff0b0','#ffb0e0'],12);
  for(let i=0;i<70;i++)coinE(x,R()*400,620+R()*140+Math.abs(i%9-4)*4,14+R()*12)},
 hamster(x,R){x.fillStyle=vg(x,0,760,['#1a1e2a','#3a4258',[.6,'#232838'],'#0a0c12']);x.fillRect(0,0,400,760);
  for(let r=0;r<7;r++)for(let c=0;c<5;c++){x.fillStyle=vg(x,r*110,r*110+100,['#4a5268','#2a3040']);x.fillRect(c*82+4,r*110+4,76,102);x.strokeStyle='rgba(255,255,255,.08)';x.strokeRect(c*82+4.5,r*110+4.5,75,101)}
  glow(x,200,220,240,'#ffd27a',.35);vaultDoor(x,200,210,120);barStack(x,60,560,46,3);barStack(x,340,560,46,3);glow(x,60,530,90,'#ffd23c',.3);glow(x,340,530,90,'#ffd23c',.3)},
 revier(x,R){x.fillStyle=vg(x,0,760,['#0a3a2a','#14805a',[.5,'#0e5a3a'],'#03180e']);x.fillRect(0,0,400,760);x.save();x.globalCompositeOperation='lighter';for(let i=0;i<6;i++){const sx=60+i*60;x.fillStyle=vg(x,0,600,['rgba(230,255,180,.22)','rgba(0,0,0,0)']);x.beginPath();x.moveTo(sx,0);x.lineTo(sx+30,0);x.lineTo(sx+140,600);x.lineTo(sx+60,600);x.fill()}x.restore();
  for(let i=0;i<34;i++){const side=i%2,cx=side?400-R()*120:R()*120,cy=R()*720;leaf(x,cx,cy,90+R()*90,24+R()*16,(side?3.14:0)+(R()-.5)*1.4,R()<.5?['#4ae06a','#0e6a2a']:['#2aa84a','#06401a'])}
  for(let i=0;i<30;i++)glow(x,R()*400,R()*700,3+R()*4,'#e8ff8a',.8);glow(x,200,380,200,'#9affc8',.18)}};
const SCENEURL={};
function sceneURL(k){if(SCENEURL[k])return SCENEURL[k];const c=document.createElement('canvas'),s=2;c.width=400*s;c.height=760*s;const x=c.getContext('2d');x.scale(s,s);try{(SCN[k]||SCN.lobby)(x,rng(k.length*977+31))}catch(e){console.error(e)}
 let u='';try{u=c.toDataURL('image/jpeg',.86)}catch(e){}SCENEURL[k]=u;SCENECV[k]=c;return u}
const SCENECV={};
