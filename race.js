(()=>{
const btn=document.querySelector('.minisel[data-mini="race"]'),playMenu=document.getElementById('playMenu'),miniArea=document.getElementById('miniArea'),miniTitle=document.getElementById('miniTitle'),game=document.getElementById('game'),start=document.getElementById('start'),gameMsg=document.getElementById('gameMsg'),miniBack=document.getElementById('miniBack');
if(!btn||!game)return;
const C=[['#ed5555','あか'],['#4c9fe5','あお'],['#efc932','きいろ'],['#55b86a','みどり']],NS='http://www.w3.org/2000/svg';
let level='easy',stage=0,choice=-1,running=false,raf=0;
const S={easy:[18,38,62,82],normal:[14,36,64,86],hard:[12,34,66,88]};
function E(n,a={}){const e=document.createElementNS(NS,n);for(const k in a)e.setAttribute(k,a[k]);return e}
function seeded(n){let x=(n+1)*9301+49297;return()=>((x=(x*9301+49297)%233280)/233280)}
function makeStage(mode,i){
 const rnd=seeded(i+(mode==='normal'?100:mode==='hard'?200:0)),hard=mode==='hard',normal=mode==='normal';
 const segs=[],pegs=[],spins=[];
 const rows=hard?7:normal?6:5;
 for(let r=0;r<rows;r++){
  const y=17+r*(hard?10.3:normal?11.8:13.4);
  const count=hard?3:normal?2+(r%2):2;
  for(let k=0;k<count;k++){
   const cx=12+(k+.5)*(76/count)+(rnd()-.5)*10;
   const len=hard?18+rnd()*12:normal?22+rnd()*15:27+rnd()*15;
   const tilt=(rnd()>.5?1:-1)*(hard?10+rnd()*18:8+rnd()*14);
   const dx=Math.cos(tilt*Math.PI/180)*len/2,dy=Math.sin(tilt*Math.PI/180)*len/2;
   segs.push({x1:cx-dx,y1:y-dy,x2:cx+dx,y2:y+dy});
  }
 }
 const pc=hard?12:normal?8:4;
 for(let p=0;p<pc;p++)pegs.push({x:10+rnd()*80,y:22+rnd()*62,r:hard?2.2:2.6});
 const sc=hard?4:normal?2:0;
 for(let p=0;p<sc;p++)spins.push({x:18+rnd()*64,y:28+rnd()*50,len:hard?11:13,a:rnd()*Math.PI});
 return {starts:S[mode],segs,pegs,spins};
}
function levels(){game.innerHTML='<div class="racelevels"><div class="racehead">どの すてーじに する？</div><button data-l="easy">🌱<b>かんたん</b><small>おおきな さかを よく みよう</small></button><button data-l="normal">🌼<b>ふつう</b><small>くぎや かいてんぼうも あるよ</small></button><button data-l="hard">🔥<b>むずかしい</b><small>しかけが いっぱい！</small></button></div>';game.querySelectorAll('[data-l]').forEach(b=>b.onclick=()=>{level=b.dataset.l;stage=0;show()})}
function show(){
 cancelAnimationFrame(raf);running=false;choice=-1;const st=makeStage(level,stage);game.innerHTML='';
 const box=document.createElement('div');box.className='racebox gravityrace';box.innerHTML='<div class="racehead">'+({easy:'かんたん',normal:'ふつう',hard:'むずかしい'}[level])+'　'+(stage+1)+' / 20</div><div class="racehint">どの ぼーるが さいしょに したまで いくかな？</div>';
 const svg=E('svg',{class:'raceworld gravityworld',viewBox:'0 0 100 100',preserveAspectRatio:'none'});
 svg.append(E('rect',{x:3,y:4,width:94,height:91,rx:4,class:'machineback'}));
 st.segs.forEach((s,k)=>{svg.append(E('line',{x1:s.x1,y1:s.y1,x2:s.x2,y2:s.y2,class:'machinebar','data-bar':k}))});
 st.pegs.forEach(p=>svg.append(E('circle',{cx:p.x,cy:p.y,r:p.r,class:'machinepeg'})));
 st.spins.forEach((p,k)=>{const g=E('g',{class:'machinespinner','data-spin':k});g.append(E('circle',{cx:p.x,cy:p.y,r:2.2,class:'spinaxle'}));g.append(E('line',{x1:p.x-p.len/2,y1:p.y,x2:p.x+p.len/2,y2:p.y,class:'spinbar'}));svg.append(g)});
 svg.append(E('rect',{x:5,y:92,width:90,height:3,class:'finishfloor'}));
 const balls=st.starts.map((x,j)=>{const b=E('circle',{cx:x,cy:9,r:2.7,fill:C[j][0],class:'physicsball','data-i':j});svg.append(b);return b});
 box.append(svg);
 const picks=document.createElement('div');picks.className='racepicks';C.forEach((b,j)=>{const p=document.createElement('button');p.innerHTML='<span style="color:'+b[0]+'">●</span><br>'+b[1];p.onclick=()=>{if(running)return;choice=j;[...picks.children].forEach((x,k)=>x.classList.toggle('picked',k===j));go.disabled=false};picks.append(p)});
 const go=document.createElement('button');go.className='racego';go.disabled=true;go.textContent='よそうした！　おとす';go.onclick=()=>run(st,balls,box,svg);
 const msg=document.createElement('div');msg.className='racemsg';box.append(picks,go,msg);game.append(box);
}
function closest(px,py,x1,y1,x2,y2){const dx=x2-x1,dy=y2-y1,l=dx*dx+dy*dy||1,t=Math.max(0,Math.min(1,((px-x1)*dx+(py-y1)*dy)/l));return{x:x1+t*dx,y:y1+t*dy,dx,dy}}
function run(st,els,box,svg){
 if(running||choice<0)return;running=true;box.querySelector('.racego').disabled=true;box.querySelectorAll('.racepicks button').forEach(x=>x.disabled=true);
 const balls=st.starts.map((x,j)=>({x,y:9,vx:0,vy:0,done:false,t:0})),finish=[];let last=performance.now(),elapsed=0;
 function tick(now){const dt=Math.min(24,now-last)/16.67;last=now;elapsed+=dt*16.67;
  st.spins.forEach((sp,k)=>{sp.a+=.035*dt;const g=svg.querySelector('[data-spin="'+k+'"]');g.setAttribute('transform','rotate('+(sp.a*180/Math.PI)+' '+sp.x+' '+sp.y+')')});
  balls.forEach((b,j)=>{if(b.done)return;b.vy+=.055*dt;b.vx*=Math.pow(.994,dt);b.vy*=Math.pow(.998,dt);b.x+=b.vx*dt;b.y+=b.vy*dt;
   if(b.x<6){b.x=6;b.vx=Math.abs(b.vx)*.65}if(b.x>94){b.x=94;b.vx=-Math.abs(b.vx)*.65}
   st.segs.forEach(s=>{const q=closest(b.x,b.y,s.x1,s.y1,s.x2,s.y2),dx=b.x-q.x,dy=b.y-q.y,d=Math.hypot(dx,dy),rr=3.6;if(d<rr){let nx=dx/(d||1),ny=dy/(d||1);if(d<.15){const L=Math.hypot(q.dx,q.dy);nx=-q.dy/L;ny=q.dx/L;if(ny>0){nx=-nx;ny=-ny}}b.x=q.x+nx*rr;b.y=q.y+ny*rr;const dot=b.vx*nx+b.vy*ny;if(dot<0){b.vx-=1.45*dot*nx;b.vy-=1.45*dot*ny}const L=Math.hypot(q.dx,q.dy);b.vx+=q.dx/L*.018*dt;b.vy+=q.dy/L*.018*dt}});
   st.pegs.forEach(p=>{const dx=b.x-p.x,dy=b.y-p.y,d=Math.hypot(dx,dy),rr=5;if(d<rr){const nx=dx/(d||1),ny=dy/(d||1);b.x=p.x+nx*rr;b.y=p.y+ny*rr;const dot=b.vx*nx+b.vy*ny;if(dot<0){b.vx-=1.65*dot*nx;b.vy-=1.65*dot*ny}}});
   st.spins.forEach(p=>{const ca=Math.cos(p.a),sa=Math.sin(p.a),x1=p.x-ca*p.len/2,y1=p.y-sa*p.len/2,x2=p.x+ca*p.len/2,y2=p.y+sa*p.len/2,q=closest(b.x,b.y,x1,y1,x2,y2),dx=b.x-q.x,dy=b.y-q.y,d=Math.hypot(dx,dy);if(d<3.8){const nx=dx/(d||1),ny=dy/(d||1);b.x=q.x+nx*3.8;b.y=q.y+ny*3.8;const dot=b.vx*nx+b.vy*ny;if(dot<0){b.vx-=1.5*dot*nx;b.vy-=1.5*dot*ny}b.vx+=-sa*.08;b.vy+=ca*.08}});
   if(b.y>=91){b.done=true;b.t=elapsed;finish.push(j);b.y=91}els[j].setAttribute('cx',b.x);els[j].setAttribute('cy',b.y);
  });
  if(balls.every(b=>b.done)){running=false;result(finish[0],box);return}raf=requestAnimationFrame(tick)
 }raf=requestAnimationFrame(tick)
}
function result(w,box){const m=box.querySelector('.racemsg');m.innerHTML=(choice===w?'🎉 せいかい！':'おしい！')+'　<b><span style="color:'+C[w][0]+'">●</span> '+C[w][1]+'が いちばん！</b><br><small>どこに ぶつかって どう おちたか みてみよう</small>';const n=document.createElement('button');n.className='racenext';n.textContent=stage===19?'こーすを えらぶ':'つぎの すてーじ';n.onclick=()=>{if(stage===19)levels();else{stage++;show()}};m.append(n)}
btn.onclick=()=>{playMenu.style.display='none';miniArea.style.display='block';miniArea.classList.remove('hide-mode','riddle-mode','maze-mode','math-mode','trace-mode','kanji-mode','clock-mode');miniArea.classList.add('race-mode');miniTitle.textContent='ころころ よそうれーす';start.style.display='none';gameMsg.style.display='none';levels()};
miniBack.addEventListener('click',()=>{cancelAnimationFrame(raf);running=false;miniArea.classList.remove('race-mode')});
})();