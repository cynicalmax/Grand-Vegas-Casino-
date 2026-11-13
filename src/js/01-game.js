'use strict';
const JP={mini:10,minor:25,major:100,grand:1000};
const R=Math.random,ri=n=>Math.floor(R()*n);
function wp(l){let t=0;for(const x of l)t+=x[1];let r=R()*t;for(const x of l){r-=x[1];if(r<0)return x[0]}return l[0][0]}
const CV=[[1,40],[2,25],[3,14],[5,10],[8,5],[12,3],['mini',2],['minor',.8],['major',.15]];
function coinVal(){const x=wp(CV);return typeof x==='string'?{s:'C',v:JP[x],j:x}:{s:'C',v:x}}
const LOW=(w,a,b,c)=>['A','K','Q','J','10'].map(e=>[e,w,a,b,c,1]);
const LINES=[[1,1,1,1,1],[0,0,0,0,0],[2,2,2,2,2],[0,1,2,1,0],[2,1,0,1,2],[0,0,1,2,2],[2,2,1,0,0],[1,0,0,0,1],[1,2,2,2,1],[0,1,1,1,0],[2,1,1,1,2],[1,0,1,2,1],[1,2,1,0,1],[0,1,0,1,0],[2,1,2,1,2],[1,1,0,1,1],[1,1,2,1,1],[0,0,1,0,0],[2,2,1,2,2],[0,2,0,2,0]];
const ZR=[[2],[2,3],[1,2,3],[1,2,3,4]];
const WHEEL=[{t:'c',v:5},{t:'fs',n:8},{t:'c',v:10},{t:'hs'},{t:'c',v:8},{t:'j',j:'mini'},{t:'c',v:15},{t:'fs',n:12},{t:'c',v:5},{t:'j',j:'minor'},{t:'c',v:25},{t:'hs'}];
const PICKS=[{n:20,xm:1},{n:15,xm:2},{n:10,xm:3},{n:7,xm:5},{n:5,xm:8}];
const SLOTS=[
{id:'biber',bm:13,name:'Goldener Baumeister',sub:'Bau-Bonus · Glücksrad · Freispiele',icon:'🦫',bg:['#2e9e55','#0c3320'],lvl:1,rows:3,ev:'ways',
 syms:[['🦫',5,.5,1.2,3],['🏡',6,.4,1,2.5],['🪓',7,.3,.8,2],['🪵',8,.25,.6,1.5],...LOW(12,.1,.25,.6)],
 wild:{w:3,reels:[1,2,3],e:'🌟'},coin:{w:14,need:6,e:'⛑️'},bonus:{w:5,reels:[1,2,3],e:'🎡',type:'wheel'},hs:{p:.05,upgrade:true,up:.05},fmode:{hot:1},
 info:'6+ Bausteine starten den Bau-Bonus: Jeder Stein bleibt als Bronze-Münze stehen. Weitere Treffer setzen neue Steine oder werten bestehende auf (Bronze → Silber → Gold → Jackpot-Stein). 3 Respins, jeder Treffer setzt zurück. Volles Feld = GRAND. 3 Bonus-Tafeln auf Walze 2–4 starten das Glücksrad (Münzen, Freispiele, Jackpots oder Bau-Bonus).'},
{id:'donner',bm:2,name:'Donnerhuf',sub:'1024 Wege · Multiplikator-Wilds',icon:'🦬',bg:['#e07b28','#4a1a05'],lvl:1,rows:4,ev:'ways',
 syms:[['🦬',9,.3,.8,2],['🦅',5,.25,.6,1.5],['🐺',6,.2,.5,1.2],['🦌',7,.15,.4,1],...LOW(11,.05,.12,.3)],
 wild:{w:3,reels:[1,2,3],e:'🌄'},scat:{w:2.2,e:'🪙',fs:[8,15,20],re:5},fmode:{mult:1},
 info:'1024 Gewinnwege. 3/4/5 FREE-Tafeln = 8/15/20 Freispiele. In Freispielen trägt jedes Wild ×2 oder ×3 – mehrere Wilds multiplizieren sich (bis ×27). 2 Tafeln in Freispielen = +5 Spiele.'},
{id:'rubin',name:'Blitz-Treffer Rubin',sub:'Blitz-Scatter · Rubin-Link',icon:'💎',bg:['#d81b60','#3d0520'],lvl:2,rows:3,ev:'lines',
 syms:[['7️⃣',4,2,8,40],['🔔',5,1.5,5,20],['💠',6,1,4,12],['🍒',8,.5,2,8],['🍋',9,.4,1.5,5],['🍉',9,.4,1.5,5],['🍇',10,.25,1,4]],
 wild:{w:3,reels:[1,2,3,4],e:'🃏'},qh:{w:6,e:'⚡',pay:[1,3,10,30,100,300,1000]},coin:{w:10,need:6,e:'🔴'},hs:{p:.05},
 info:'20 Linien. Blitze zahlen überall: 3 bis 9 Stück, bis zum 1000-Fachen. 6+ Rubine starten Rubin-Link (Hold & Spin): Rubine bleiben stehen, 3 Respins, jeder neue Rubin setzt zurück. Volles Feld = GRAND.'},
{id:'frei',name:'Blitz-Treffer Grenzenlos',sub:'Blitz-Scatter · Auswahl-Bonus',icon:'⚡',bg:['#7b3ff2','#1b0a4a'],lvl:4,rows:3,ev:'lines',
 syms:[['7️⃣',4,2,8,40],['⭐',5,1.5,5,20],['🔔',6,1,4,12],['🍀',8,.5,2,8],['🍒',9,.4,1.5,5],['🍊',9,.4,1.5,5],['🍇',10,.25,1,4]],
 wild:{w:3,reels:[1,2,3,4],e:'🃏'},qh:{w:6,e:'⚡',pay:[1,3,10,30,100,300,1000]},bonus:{w:3,reels:[1,2,3],e:'🎁',type:'pick'},
 info:'20 Linien. Blitze zahlen überall (3–9). 3 Bonus-Tafeln auf Walze 2–4 starten den Auswahl-Bonus: Decke Felder auf, bis 3 gleiche erscheinen – 20 Spiele ×1, 15 ×2, 10 ×3, 7 ×5 oder 5 ×8. Alle Gewinne in den Freispielen werden multipliziert.'},
{id:'glut',bm:3,name:'Glutkette Doppelknall',sub:'Glutkugel-Link · bis 8 Reihen',icon:'☄️',bg:['#ff5722','#3a0a00'],lvl:6,rows:4,ev:'ways',
 syms:[['🎸',5,.3,.8,2],['🏍️',6,.25,.6,1.5],['🤠',7,.2,.5,1.2],['🌵',8,.15,.4,1],...LOW(11,.05,.12,.3)],
 wild:{w:3,reels:[1,2,3],e:'🔥'},scat:{w:2.2,e:'🎰',fs:[8,10,15]},coin:{w:3.2,need:4,e:'☄️'},hs:{p:.035,maxRows:8,unlock:[8,12,16,20],dbl:.08},fmode:{hot:1},
 info:'4+ Glutkugeln starten die Glutkette: Kugeln bleiben stehen, 3 Respins. Ab 8/12/16/20 Kugeln öffnet sich je eine weitere Reihe (bis 8). Eine ×2-Tafel verdoppelt alle Werte seiner Reihe. 3 FREE-Tafeln = Freispiele mit mehr Glutkugeln.'},
{id:'schwein',bm:1.5,name:'Drei Goldtöpfe',sub:'3 Töpfe · kombinierbare Freispiele',icon:'🐷',bg:['#ff80ab','#5a0f35'],lvl:8,rows:3,ev:'ways',
 syms:[['👑',5,.5,1.2,3],['💎',6,.4,1,2.5],['💰',7,.3,.8,2],['🎩',8,.25,.6,1.5],...LOW(12,.1,.25,.6)],
 wild:{w:3,reels:[1,2,3],e:'🌈'},pigs:{w:6,p:1/80},
 info:'Jede farbige Münze füllt ihren Topf und hat dabei immer dieselbe feste Chance (1 zu 80), ihn auszulösen. Saphir: 12 statt 6 Freispiele. Rubin: Wilds mit ×2/×3. Gold: nur Top-Symbole. Mehrere Töpfe kombinieren sich. Die Füllanzeige ist nur Deko.'},
{id:'hamster',bm:4,name:'Goldtresor Royal',sub:'Münzen sammeln · Tresor-Freispiele',icon:'🐹',bg:['#f5b301','#4a3200'],lvl:10,rows:3,ev:'ways',
 syms:[['🏦',5,.5,1.2,3],['💼',6,.4,1,2.5],['🔑',7,.3,.8,2],['🧲',8,.25,.6,1.5],...LOW(12,.1,.25,.6)],
 wild:{w:3,reels:[1,2,3],e:'✨'},scat:{w:3,e:'🎟️',fs:[8,12,20]},coin:{w:9,reels:[0,1,2,3],e:'🪙'},coll:{w:5,e:'🐹'},
 info:'Münzen mit Werten (auch MINI/MINOR/MAJOR) landen auf Walze 1–4. Eine COLLECT-Tafel auf Walze 5 sammelt alle sichtbaren Münzen ein – mehrere Tafeln sammeln mehrfach. 3 FREE-Tafeln = Freispiele, in denen jede Tafel doppelt sammelt.'},
{id:'revier',name:'Wildes Revier',sub:'Wachsende Wild-Zone',icon:'🐯',bg:['#00a884','#022b22'],lvl:12,rows:4,ev:'ways',
 syms:[['🐯',5,.3,.8,2],['🦜',6,.25,.6,1.5],['🐍',7,.2,.5,1.2],['🌺',8,.15,.4,1],...LOW(11,.05,.12,.3)],
 zone:{w:7,e:'🌀'},scat:{w:2.2,e:'🗿',fs:[8,12,20]},
 info:'Wilds erscheinen nur in der Wild-Zone. Sie startet auf Walze 3. Landet ein Wild, wächst die Zone für den nächsten Dreh um eine Walze (bis Walze 2–5); ohne Wild schrumpft sie zurück. In Freispielen (3 FREE-Tafeln) schrumpft die Zone nie.'}
];
function wl(cfg,c,mode,st){const z=cfg.zone?st.z|0:0,k=c+(mode.free?'f':'')+(mode.high?'h':'')+z,ca=cfg._c||(cfg._c={});if(ca[k])return ca[k];
 const L=[];for(const s of cfg.syms)if(!(mode.high&&s[5]))L.push([s[0],s[1]]);
 const ad=(o,id,w)=>{if(o&&(!o.reels||o.reels.includes(c)))L.push([id,w||o.w])};
 ad(cfg.wild,'W');ad(cfg.scat,'S');ad(cfg.bonus,'B');ad(cfg.qh,'Z');
 if(cfg.coin)ad(cfg.coin,'C',cfg.coin.w*(mode.free&&mode.hot?1.5:1));
 if(cfg.coll&&c===4)L.push(['H',cfg.coll.w]);
 if(cfg.pigs)for(let i=0;i<3;i++)L.push(['P'+i,cfg.pigs.w/3]);
 if(cfg.zone&&ZR[z].includes(c))L.push(['W',cfg.zone.w]);
 return ca[k]=L}
function mk(cfg,id,mode){if(id==='C')return cfg.hs&&cfg.hs.upgrade?{s:'C',lvl:0,v:1+ri(3)}:coinVal();if(id==='W'&&mode.mult)return{s:'W',m:R()<.5?2:3};return{s:id}}
function evWays(cfg,g){const wins=[];for(const s of cfg.syms){const e=s[0];let ways=1,n=0,m=1;const cl=[];
 for(let c=0;c<5;c++){let k=0;for(let r=0;r<cfg.rows;r++){const x=g[c][r];if(x.s===e||x.s==='W'){k++;cl.push([c,r]);if(x.m)m*=x.m}}if(!k)break;ways*=k;n++}
 if(n>=3)wins.push({cells:cl,amt:s[n-1]*ways*m*(cfg.bm||1)})}return wins}
function evLines(cfg,g){const wins=[],P={};for(const s of cfg.syms)P[s[0]]=s;
 for(const l of LINES){let t=null,n=0;for(let c=0;c<5;c++){const x=g[c][l[c]].s;if(x==='W'){n++;continue}if(!P[x])break;if(t===null)t=x;else if(x!==t)break;n++}
  if(n>=3){if(t===null)t=cfg.syms[0][0];wins.push({cells:l.slice(0,n).map((r,c)=>[c,r]),amt:P[t][n-1]*(cfg.bm||1)})}}return wins}
function spin(cfg,st,mode){mode=mode||{};const g=[],zone=cfg.zone?st.z|0:0;
 for(let c=0;c<5;c++){const L=wl(cfg,c,mode,st),col=[];for(let r=0;r<cfg.rows;r++)col.push(mk(cfg,wp(L),mode));g.push(col)}
 const wins=cfg.ev==='lines'?evLines(cfg,g):evWays(cfg,g),fx={};
 const cells=id=>{const o=[];for(let c=0;c<5;c++)for(let r=0;r<cfg.rows;r++)if(g[c][r].s===id)o.push([c,r]);return o};
 if(cfg.qh){const q=cells('Z');if(q.length>=3)wins.push({cells:q,amt:cfg.qh.pay[Math.min(q.length,9)-3],label:q.length+'× Blitz'})}
 if(mode.xm)for(const w of wins)w.amt*=mode.xm;
 if(cfg.scat){const sc=cells('S'),n=sc.length;if(n>=3)fx.fs=cfg.scat.fs[Math.min(n,5)-3];else if(mode.free&&n===2&&cfg.scat.re)fx.fs=cfg.scat.re;if(fx.fs)fx.sc=sc}
 if(cfg.coin&&cfg.coin.need&&cells('C').length>=cfg.coin.need)fx.hs=true;
 if(cfg.bonus){const b=cells('B');if(b.length>=3){fx.bonus=true;fx.sc=b}}
 if(cfg.coll){const k=cells('H'),cs=cells('C');if(k.length&&cs.length){let v=0;for(const[c,r]of cs)v+=g[c][r].v;wins.push({cells:cs.concat(k),amt:v*k.length*(mode.free?2:1),label:'Tresor geleert'})}}
 if(cfg.pigs){const t=[0,0,0];let any=0;for(let i=0;i<3;i++)for(const x of cells('P'+i)){st.pig[i]=(st.pig[i]||0)+1;if(mode.free)wins.push({cells:[x],amt:1,label:'Münzbonus'});else if(R()<cfg.pigs.p){t[i]=1;any=1}}
  if(any){fx.fs=6+(t[0]?6:0);fx.mode={mult:t[1],high:t[2]};fx.pig=t}}
 if(cfg.zone){if(cells('W').length)st.z=Math.min(zone+1,3);else if(!mode.free)st.z=0}
 let win=0;for(const w of wins)win+=w.amt;return{grid:g,wins,win,fx,zone}}
function hsNew(cfg,g,seed){const h=cfg.hs,M=h.maxRows||cfg.rows,off=M-cfg.rows,cells=[];
 for(let c=0;c<5;c++){cells.push(new Array(M).fill(null));if(g)for(let r=0;r<cfg.rows;r++)if(g[c][r].s==='C')cells[c][off+r]=Object.assign({},g[c][r])}
 while(seed>0){const c=ri(5),r=off+ri(cfg.rows);if(!cells[c][r]){cells[c][r]=mk(cfg,'C',{});seed--}}
 return{cells,M,open:cfg.rows,left:3,done:false,grand:false}}
function hsStep(cfg,H){const h=cfg.hs,ev=[];
 for(let c=0;c<5;c++)for(let r=H.M-H.open;r<H.M;r++){const x=H.cells[c][r];
  if(!x){if(R()<h.p){let n=mk(cfg,'C',{});if(h.dbl&&R()<h.dbl&&!H.cells.some(col=>col[r]&&col[r].d)){n={s:'C',d:1,v:0};for(const col of H.cells)if(col[r]&&col[r].v){col[r].v*=2;col[r].x2=1}}H.cells[c][r]=n;ev.push([c,r])}}
  else if(h.upgrade&&x.lvl<3&&R()<h.up){x.lvl++;if(x.lvl===1)x.v=5;else if(x.lvl===2)x.v=15;else{x.j=wp([['mini',6],['minor',3],['major',1]]);x.v=JP[x.j]}ev.push([c,r])}}
 let n=0;for(const col of H.cells)for(const x of col)if(x)n++;
 if(h.unlock)while(H.open<H.M&&n>=h.unlock[H.open-cfg.rows])H.open++;
 H.left=ev.length?3:H.left-1;
 if(n>=5*H.M){H.grand=true;H.done=true}else if(H.left<=0)H.done=true;
 return ev}
function hsTotal(H){let t=H.grand?JP.grand:0;for(const col of H.cells)for(const x of col)if(x)t+=x.v;return t}
function wheelSpin(){return ri(WHEEL.length)}
function pickBoard(){const b=[];for(let i=0;i<5;i++)b.push(i,i,i);for(let i=14;i>0;i--){const j=ri(i+1);[b[i],b[j]]=[b[j],b[i]]}return b}
function newSt(){return{pig:[0,0,0],z:0}}
/* ---- headless round resolver (used for RTP calibration; UI mirrors this flow) ---- */
function simHs(cfg,H){while(!H.done)hsStep(cfg,H);return hsTotal(H)}
function simFeat(cfg,st,r,mode,stat){let t=0;
 if(r.fx.hs){stat.hs++;t+=simHs(cfg,hsNew(cfg,r.grid))}
 if(r.fx.bonus){stat.bonus++;if(cfg.bonus.type==='wheel'){const w=WHEEL[wheelSpin()];if(w.t==='c')t+=w.v;else if(w.t==='j')t+=JP[w.j];else if(w.t==='hs')t+=simHs(cfg,hsNew(cfg,null,6));else r.fx.fs=(r.fx.fs||0)+w.n}
  else if(mode.free)r.fx.fs=(r.fx.fs||0)+5;else{const b=pickBoard(),k=[0,0,0,0,0];let i=0;while(++k[b[i]]<3)i++;const p=PICKS[b[i]];r.fx.fs=p.n;r.fx.mode={xm:p.xm}}}
 if(r.fx.fs&&!mode.free){stat.fs++;t+=simFree(cfg,st,r.fx.fs,r.fx.mode,stat)}return t}
function simFree(cfg,st,n,m,stat){const mode=Object.assign({free:true},cfg.fmode,m);let t=0,g=0;while(n>0&&g++<300){n--;const r=spin(cfg,st,mode);t+=r.win;t+=simFeat(cfg,st,r,mode,stat);if(r.fx.fs)n+=r.fx.fs}return t}
function simRound(cfg,st,stat){const r=spin(cfg,st,{});if(r.win>0)stat.hit++;stat.base+=r.win;return r.win+simFeat(cfg,st,r,{},stat)}
if(typeof module!=='undefined')module.exports={SLOTS,simRound,newSt};
