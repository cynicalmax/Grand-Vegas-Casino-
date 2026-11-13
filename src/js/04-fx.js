'use strict';
/* ===== Goldfuchs fx: 3D coin showers, gold bars, gems, star glints, rings, flying coins, floating numbers ===== */
const FX={c:null,x:null,p:[],raf:0,w:0,h:0,spr:{},last:0,txt:new Map()};
function fxInit(){FX.c=document.getElementById('fx');FX.x=FX.c.getContext('2d');fxResize();addEventListener('resize',fxResize);
 const mk=(k,s)=>{const c=document.createElement('canvas');c.width=c.height=s;c.getContext('2d').drawImage(assetCanvas(k),0,0,s,s);return c};
 FX.spr={coin:mk('coin',96),bar:mk('goldbar',110),gem:mk('gem',84),star:mk('star',80),stack:mk('goldstack',120),fire:mk('fireball',140),bstar:mk('jewel2',84)}}
function fxResize(){FX.w=innerWidth;FX.h=innerHeight;FX.c.width=Math.round(FX.w*DPR);FX.c.height=Math.round(FX.h*DPR);FX.c.style.width=FX.w+'px';FX.c.style.height=FX.h+'px'}
function fxRun(){if(!FX.raf){FX.last=performance.now();FX.raf=requestAnimationFrame(fxLoop)}}
const R_=Math.random;
function fxAdd(p){p.age=0;p.life=p.life||4;FX.p.push(p);fxRun();return p}
/* coin shower from the top; kinds weights: coin, bar, gem */
function fxRain(n,o){o=o||{};const kinds=o.kinds||{coin:.84,bar:.1,gem:.06},sp=o.spread||1.2;for(let i=0;i<n;i++){const r=R_();let k='coin',acc=0;for(const q in kinds){acc+=kinds[q];if(r<acc){k=q;break}}
 fxAdd({k,x:R_()*FX.w,y:-40-R_()*80,vx:(R_()-.5)*60,vy:120+R_()*240,g:520,s:(k==='coin'?26:k==='bar'?38:26)*(.8+R_()*.6)*(o.scale||1),ph:R_()*6,vph:6+R_()*8,rot:R_()*6,vr:(R_()-.5)*4,delay:R_()*sp,life:5})}}
function fxFountain(x,y,n,o){o=o||{};for(let i=0;i<n;i++){const a=-Math.PI/2+(R_()-.5)*(o.arc||1.4),v=(o.v||620)*(.55+R_()*.6),k=R_()<(o.bars||0)?'bar':R_()<(o.gems||0)?'gem':'coin';
 fxAdd({k,x:x+(R_()-.5)*(o.w||20),y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,g:900,s:(k==='bar'?36:26)*(.75+R_()*.6),ph:R_()*6,vph:8+R_()*10,rot:R_()*6,vr:(R_()-.5)*6,delay:R_()*(o.spread||.25),life:4})}}
function fxBurst(x,y,n,o){o=o||{};for(let i=0;i<n;i++){const a=R_()*6.2832,v=(o.v||420)*(.4+R_()*.8),k=R_()<.25?'glint':'coin';
 fxAdd({k,x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-120,g:k==='glint'?0:700,drag:k==='glint'?2.5:0,s:k==='glint'?14+R_()*14:20+R_()*14,ph:R_()*6,vph:8+R_()*8,life:k==='glint'?.9:3,col:o.col})}}
function fxGlints(rect,n,o){o=o||{};for(let i=0;i<n;i++)fxAdd({k:'glint',x:rect.left+R_()*rect.width,y:rect.top+R_()*rect.height,vx:0,vy:0,g:0,s:(o.s||16)*(.6+R_()*.8),delay:R_()*(o.spread||1),life:.7+R_()*.4,col:o.col})}
function fxStars(x,y,n,o){o=o||{};for(let i=0;i<n;i++){const a=R_()*6.2832,v=(o.v||260)*(.4+R_()*.8);fxAdd({k:'ostar',x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,g:-30,drag:1.4,s:10+R_()*16,rot:R_()*6,vr:(R_()-.5)*4,life:1.4+R_()*.6,col:o.col||'#fff6b0'})}}
function fxRing(x,y,o){o=o||{};fxAdd({k:'ring',x,y,s:o.s||40,s2:o.s2||260,life:o.life||.6,col:o.col||'#fff2a0',g:0,vx:0,vy:0})}
function fxFlash(x,y,r,o){o=o||{};fxAdd({k:'flash',x,y,s:r||200,life:o.life||.45,col:o.col||'#fffbe0',g:0,vx:0,vy:0})}
function fxConfetti(n){const cs=['#ff4a6a','#ffd23c','#4ad8ff','#8aff6a','#d46aff','#ff9a3a'];for(let i=0;i<n;i++)fxAdd({k:'conf',x:R_()*FX.w,y:-20-R_()*60,vx:(R_()-.5)*80,vy:80+R_()*120,g:60,drag:.3,s:6+R_()*6,ph:R_()*6,vph:4+R_()*6,rot:R_()*6,vr:(R_()-.5)*8,col:cs[i%cs.length],delay:R_()*1.5,life:6})}
/* coins flying along an arc from a point to a target element; onHit(i) per arrival */
function fxFly(fx,fy,tx,ty,n,o){o=o||{};return new Promise(res=>{let hit=0;if(!n)return res();for(let i=0;i<n;i++){const cx=(fx+tx)/2+(R_()-.5)*(o.spread||220),cy=Math.min(fy,ty)-60-R_()*160;
 fxAdd({k:o.kind||'coin',fly:1,x0:fx+(R_()-.5)*(o.jit||40),y0:fy+(R_()-.5)*(o.jit||40),cx,cy,tx,ty,x:fx,y:fy,s:o.s||26,ph:R_()*6,vph:10,delay:i*(o.stagger==null?.035:o.stagger),dur:(o.dur||.75)*(.85+R_()*.3),life:9,
  onEnd:()=>{hit++;o.onHit&&o.onHit(hit,n);if(hit===n)res()}})}})}
/* floating label (cached glossy text) */
function txtSprite(t,size,style){const key=t+'|'+size+'|'+style;let c=FX.txt.get(key);if(c)return c;c=document.createElement('canvas');const x=c.getContext('2d');x.font=`${size}px ${FONT}`;const w=x.measureText(t).width;c.width=Math.ceil(w+size*.8);c.height=Math.ceil(size*1.5);glossText(c.getContext('2d'),t,c.width/2,size*1.08,size,style);if(FX.txt.size>400)FX.txt.clear();FX.txt.set(key,c);return c}
function fxText(x,y,t,o){o=o||{};fxAdd({k:'txt',x,y,vx:0,vy:o.vy==null?-70:o.vy,g:0,img:txtSprite(t,Math.round((o.size||30)*DPR),o.style||'gold'),life:o.life||1.2,s:1})}
function drawCoin(x,px,py,s,ph){const c=Math.cos(ph),a=Math.max(.07,Math.abs(c)),th=s*.1*Math.sin(ph);x.save();x.translate(px,py);
 if(a<.98){x.fillStyle='#9a5a00';x.beginPath();x.ellipse(th,0,s/2*a+Math.abs(th)*.6,s/2,0,0,7);x.fill();x.fillStyle='#f0b020';x.beginPath();x.ellipse(th*.5,0,s/2*a+Math.abs(th)*.3,s/2*.98,0,0,7);x.fill()}
 x.scale(a,1);x.drawImage(FX.spr.coin,-s/2,-s/2,s,s);x.restore()}
function glint(x,px,py,s,col,al){s=Math.max(.01,s);al=Math.max(0,al);x.save();x.globalAlpha=al;x.globalCompositeOperation='lighter';const g=x.createRadialGradient(px,py,0,px,py,s);g.addColorStop(0,col||'#fffbe0');g.addColorStop(1,'rgba(255,220,120,0)');x.fillStyle=g;x.beginPath();x.arc(px,py,s,0,7);x.fill();
 x.fillStyle='#fff';x.beginPath();const l=s*1.6,w=s*.16;x.moveTo(px,py-l);x.quadraticCurveTo(px+w,py-w,px+l,py);x.quadraticCurveTo(px+w,py+w,px,py+l);x.quadraticCurveTo(px-w,py+w,px-l,py);x.quadraticCurveTo(px-w,py-w,px,py-l);x.fill();x.restore()}
function fxLoop(now){const dt=Math.max(0,Math.min(.05,(now-FX.last)/1000));FX.last=now;const x=FX.x;x.setTransform(DPR,0,0,DPR,0,0);x.clearRect(0,0,FX.w,FX.h);const keep=[];
 for(const p of FX.p){if(p.delay>0){p.delay-=dt;keep.push(p);continue}p.age+=dt;if(p.age>p.life||p.y>FX.h+80){if(p.onEnd&&!p.ended){p.ended=1;p.onEnd()}continue}
  if(p.fly){const u=Math.min(1,p.age/p.dur),e=u<.5?2*u*u:1-Math.pow(-2*u+2,2)/2,iu=1-e;p.x=iu*iu*p.x0+2*iu*e*p.cx+e*e*p.tx;p.y=iu*iu*p.y0+2*iu*e*p.cy+e*e*p.ty;p.ph+=p.vph*dt;
   const sc=1-.4*e;if(p.k==='coin')drawCoin(x,p.x,p.y,p.s*sc,p.ph);else if(p.img)x.drawImage(p.img,p.x-p.img.width/2/DPR,p.y-p.img.height/2/DPR,p.img.width/DPR,p.img.height/DPR);if(u>=1){if(p.onEnd&&!p.ended){p.ended=1;p.onEnd()}continue}keep.push(p);continue}
  if(p.k==='meteor'){const u=Math.min(1,p.age/p.dur),e=u*u,px=p.x0+(p.x1-p.x0)*e,py=p.y0+(p.y1-p.y0)*e;for(let k=0;k<3;k++)FX.p.push({k:'ember',x:px+(R_()-.5)*p.s*.3,y:py+(R_()-.5)*p.s*.3,vx:(R_()-.5)*40,vy:(R_()-.5)*40,g:0,drag:1.5,s:p.s*(.18+R_()*.22),life:.35+R_()*.3,age:0,col:R_()<.5?'#ffb030':'#ff5a10'});
   x.save();x.globalCompositeOperation='lighter';const g=x.createRadialGradient(px,py,0,px,py,p.s*1.1);g.addColorStop(0,'rgba(255,200,80,.8)');g.addColorStop(1,'rgba(255,80,0,0)');x.fillStyle=g;x.beginPath();x.arc(px,py,p.s*1.1,0,7);x.fill();x.restore();
   x.save();x.translate(px,py);x.rotate(p.age*6);x.drawImage(FX.spr.fire,-p.s/2,-p.s/2,p.s,p.s);x.restore();if(u>=1){if(p.onEnd&&!p.ended){p.ended=1;p.onEnd()}continue}keep.push(p);continue}
  if(p.drag){p.vx*=Math.max(0,1-p.drag*dt);p.vy*=Math.max(0,1-p.drag*dt)}p.vy+=(p.g||0)*dt;p.x+=(p.vx||0)*dt;p.y+=(p.vy||0)*dt;if(p.vph)p.ph+=p.vph*dt;if(p.vr)p.rot+=p.vr*dt;
  const lf=p.age/p.life,fade=lf>.8?(1-lf)/.2:1;
  if(p.k==='coin'){x.globalAlpha=fade;drawCoin(x,p.x,p.y,p.s,p.ph);x.globalAlpha=1}
  else if(p.k==='bar'||p.k==='gem'||p.k==='star'||p.k==='stack'){const im=FX.spr[p.k];x.save();x.globalAlpha=fade;x.translate(p.x,p.y);x.rotate(p.rot);x.scale(.8+.2*Math.cos(p.ph),1);x.drawImage(im,-p.s/2,-p.s/2,p.s,p.s);x.restore()}
  else if(p.k==='ember'){const k=1-lf;x.save();x.globalCompositeOperation='lighter';const r=Math.max(.5,p.s*k),g=x.createRadialGradient(p.x,p.y,0,p.x,p.y,r);g.addColorStop(0,'rgba(255,250,210,'+k+')');g.addColorStop(.35,p.col);g.addColorStop(1,'rgba(255,60,0,0)');x.globalAlpha=k;x.fillStyle=g;x.beginPath();x.arc(p.x,p.y,r,0,7);x.fill();x.restore()}
  else if(p.k==='glint'){const k=Math.sin(Math.min(1,lf)*Math.PI);glint(x,p.x,p.y,p.s*k,p.col,k)}
  else if(p.k==='ostar'){x.save();x.globalAlpha=1-lf;x.translate(p.x,p.y);x.rotate(p.rot);x.strokeStyle=p.col;x.lineWidth=2;x.shadowColor=p.col;x.shadowBlur=8;x.beginPath();for(let i=0;i<10;i++){const r=i%2?p.s*.42:p.s,a=-1.5708+i*.6283;x.lineTo(Math.cos(a)*r,Math.sin(a)*r)}x.closePath();x.stroke();x.restore()}
  else if(p.k==='ring'){const r=p.s+(p.s2-p.s)*Math.sqrt(lf);x.save();x.globalAlpha=(1-lf)*.9;x.globalCompositeOperation='lighter';x.strokeStyle=p.col;x.lineWidth=10*(1-lf)+2;x.shadowColor=p.col;x.shadowBlur=20;x.beginPath();x.arc(p.x,p.y,r,0,7);x.stroke();x.restore()}
  else if(p.k==='flash'){x.save();x.globalCompositeOperation='lighter';x.globalAlpha=1-lf;const g=x.createRadialGradient(p.x,p.y,0,p.x,p.y,p.s*(.6+lf*.6));g.addColorStop(0,p.col);g.addColorStop(.35,'rgba(255,240,180,.6)');g.addColorStop(1,'rgba(255,200,80,0)');x.fillStyle=g;x.fillRect(p.x-p.s*1.3,p.y-p.s*1.3,p.s*2.6,p.s*2.6);x.restore()}
  else if(p.k==='conf'){x.save();x.globalAlpha=fade;x.translate(p.x+Math.sin(p.ph)*8,p.y);x.rotate(p.rot);x.scale(1,Math.cos(p.ph));x.fillStyle=p.col;x.fillRect(-p.s/2,-p.s/4,p.s,p.s/2);x.restore()}
  else if(p.k==='txt'){x.globalAlpha=fade;const im=p.img,sc=Math.min(1,.4+p.age*5)/DPR;x.drawImage(im,p.x-im.width*sc/2,p.y-im.height*sc/2,im.width*sc,im.height*sc);x.globalAlpha=1}
  keep.push(p)}
 FX.p=keep;FX.raf=FX.p.length?requestAnimationFrame(fxLoop):0;if(!FX.raf)x.clearRect(0,0,FX.w,FX.h)}
function elCenter(el){const r=(typeof el==='string'?document.querySelector(el):el).getBoundingClientRect();return[r.left+r.width/2,r.top+r.height/2,r]}

function fxMeteor(x0,y0,x1,y1,o){o=o||{};return new Promise(res=>{fxAdd({k:'meteor',x0,y0,x1,y1,x:x0,y:y0,s:o.s||70,dur:o.dur||.55,life:5,ph:0,onEnd:()=>{fxExplode(x1,y1,o.big);res()}})})}
function fxExplode(x,y,big){const n=big?40:22;for(let i=0;i<n;i++){const a=R_()*6.2832,v=(big?520:320)*(.3+R_()*.9);fxAdd({k:'ember',x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,g:180,drag:2.2,s:6+R_()*12,life:.5+R_()*.6,col:R_()<.5?'#ffd060':'#ff6a10'})}
 fxRing(x,y,{s:8,s2:big?220:110,col:'#ffb040',life:.5});fxFlash(x,y,big?260:140,{col:'#fff0c0',life:.35})}
function fxEmbers(rect,n){for(let i=0;i<n;i++)fxAdd({k:'ember',x:rect.left+R_()*rect.width,y:rect.top+rect.height*(.6+R_()*.4),vx:(R_()-.5)*30,vy:-60-R_()*140,g:-20,drag:.4,s:4+R_()*7,life:1+R_()*1.2,col:R_()<.5?'#ffcf50':'#ff7a20',delay:R_()*.8})}
function fxCoinBlast(n){const W=FX.w,H=FX.h;fxFountain(W*.12,H+10,n,{v:1100,arc:.5,bars:.12,gems:.05,spread:.5});fxFountain(W*.88,H+10,n,{v:1100,arc:.5,bars:.12,gems:.05,spread:.5})}
