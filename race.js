(()=>{
const btn=document.querySelector('.minisel[data-mini="race"]'),playMenu=document.getElementById('playMenu'),miniArea=document.getElementById('miniArea'),miniTitle=document.getElementById('miniTitle'),game=document.getElementById('game'),start=document.getElementById('start'),gameMsg=document.getElementById('gameMsg'),miniBack=document.getElementById('miniBack');
if(!btn||!game)return;
const C=[['#ed5555','あか'],['#4c9fe5','あお'],['#efc932','きいろ'],['#55b86a','みどり']],NS='http://www.w3.org/2000/svg';
let level='easy',stage=0,choice=-1,running=false,raf=0,order=[];
function E(n,a={}){const e=document.createElementNS(NS,n);for(const k in a)e.setAttribute(k,a[k]);return e}
function stageData(mode,i){
 if(mode==='hard') return geometryStage(i);
 const starts=[14,38,62,86],winner=(i*3+(mode==='normal'?1:0))%4,lanes=[],variants=i%5;
 for(let j=0;j<4;j++){
  const rank=(j-winner+4)%4,sx=starts[j],pts=[[sx,8]];
  if(mode==='easy'){
   const amp=[0,4.5,7.5,10.5][rank]+variants*.35,n=[0,1,2,3][rank];
   if(n===0)pts.push([sx,88]);else{for(let k=1;k<=n;k++){const y=8+80*k/(n+1),dir=(k+variants)%2?1:-1;pts.push([sx+dir*amp,y])}pts.push([sx,88])}
  }else{
   const n=[2,3,4,5][rank],amp=[3.5,5,6.5,8][rank]+(variants%3)*.45;
   for(let k=1;k<=n;k++){const y=8+80*k/(n+1),dir=(k+j+variants)%2?1:-1;pts.push([sx+dir*amp*(k%2?1:.72),y])}pts.push([sx,88]);
  }
  lanes.push({pts,rank});
 }
 return {starts,lanes,winner,geometry:false};
}
function geometryStage(i){
 // Four separate mini geometry problems. Each coloured ball has one clearly traceable route.
 // Route lengths are deliberately distinct; shapes rotate across 20 stages.
 const starts=[14,38,62,86],variant=i%5,rot=Math.floor(i/5)%4;
 const templates=[
  // straight diagonal, two sides, triangle perimeter, rectangle detour
  [
   [[14,10],[14,88]],
   [[38,10],[28,48],[38,88]],
   [[62,10],[72,36],[54,62],[62,88]],
   [[86,10],[76,28],[94,47],[76,67],[86,88]]
  ],
  [
   [[14,10],[20,49],[14,88]],
   [[38,10],[28,30],[48,50],[38,88]],
   [[62,10],[74,27],[54,47],[74,68],[62,88]],
   [[86,10],[76,24],[94,39],[76,55],[94,71],[86,88]]
  ],
  [
   [[14,10],[14,88]],
   [[38,10],[48,36],[28,62],[38,88]],
   [[62,10],[52,29],[72,48],[52,68],[62,88]],
   [[86,10],[76,25],[94,40],[76,55],[94,70],[86,88]]
  ],
  [
   [[14,10],[20,49],[14,88]],
   [[38,10],[28,49],[38,88]],
   [[62,10],[74,32],[52,55],[62,88]],
   [[86,10],[76,25],[94,45],[76,65],[86,88]]
  ],
  [
   [[14,10],[14,88]],
   [[38,10],[48,30],[28,50],[38,88]],
   [[62,10],[52,28],[72,47],[52,67],[62,88]],
   [[86,10],[76,23],[94,37],[76,52],[94,68],[86,88]]
  ]
 ];
 const base=templates[variant],lanes=Array(4);
 for(let j=0;j<4;j++)lanes[(j+rot)%4]={pts:base[j].map(p=>[...p]),rank:j};
 return {starts:lanes.map(l=>l.pts[0][0]),lanes,winner:rot,geometry:true,shape:variant};
}
function shuffleStages(){order=Array.from({length:20},(_,i)=>i);for(let i=19;i>0;i--){const j=Math.floor(Math.random()*(i+1));[order[i],order[j]]=[order[j],order[i]]}}
function levels(){game.innerHTML='<div class="racelevels"><div class="racehead">どの すてーじに する？</div><button data-l="easy">🌱<b>かんたん</b><small>ながい みちと みじかい みち</small></button><button data-l="normal">🌼<b>ふつう</b><small>まがりかたも くらべよう</small></button><button data-l="hard">🔥<b>むずかしい</b><small>よく みないと まようかも！</small></button></div>';game.querySelectorAll('[data-l]').forEach(b=>b.onclick=()=>{level=b.dataset.l;stage=0;shuffleStages();show()})}
function pathD(p){return p.map((q,k)=>(k?'L':'M')+q[0]+' '+q[1]).join(' ')}
function show(){
 cancelAnimationFrame(raf);running=false;choice=-1;if(!order.length)shuffleStages();const st=stageData(level,order[stage]);game.innerHTML='';
 const box=document.createElement('div');box.className='racebox gravityrace';box.innerHTML='<div class="racehead">'+({easy:'かんたん',normal:'ふつう',hard:'むずかしい'}[level])+'　'+(stage+1)+' / 20</div><div class="racehint">どの ぼーるが さいしょに したまで いくかな？</div>';
 const svg=E('svg',{class:'raceworld gravityworld',viewBox:'0 0 100 100',preserveAspectRatio:'none'});
 svg.append(E('rect',{x:3,y:4,width:94,height:91,rx:4,class:'machineback'}));
 // One common board: crossing ramps are scenery/rails; each ball follows gravity-safe downhill surfaces.
 st.lanes.forEach((l,j)=>{const p=E('path',{d:pathD(l.pts),class:'simplechute'+(st.geometry?' geometryroute':'')+' route'+j,'data-lane':j});svg.append(p)});
 svg.append(E('rect',{x:5,y:91,width:90,height:3,class:'finishfloor'}));
 const gt=E('text',{x:50,y:89.5,'text-anchor':'middle',class:'gravitygoal'});gt.textContent='ごーる';svg.append(gt);
 const balls=st.starts.map((x,j)=>{const b=E('circle',{cx:x,cy:8,r:2.7,fill:C[j][0],class:'physicsball'});svg.append(b);return b});
 box.append(svg);
 const picks=document.createElement('div');picks.className='racepicks';C.forEach((b,j)=>{const p=document.createElement('button');p.innerHTML='<span style="color:'+b[0]+'">●</span><br>'+b[1];p.onclick=()=>{if(running)return;choice=j;[...picks.children].forEach((x,k)=>x.classList.toggle('picked',k===j));go.disabled=false};picks.append(p)});
 const go=document.createElement('button');go.className='racego';go.disabled=true;go.textContent='よそうした！　おとす';go.onclick=()=>run(st,balls,box);
 const msg=document.createElement('div');msg.className='racemsg';box.append(picks,go,msg);game.append(box);
}
function lengths(pts){const seg=[],cum=[0];let total=0;for(let i=0;i<pts.length-1;i++){const dx=pts[i+1][0]-pts[i][0],dy=pts[i+1][1]-pts[i][1],l=Math.hypot(dx,dy);seg.push({dx,dy,l});total+=l;cum.push(total)}return{seg,cum,total}}
function point(pts,m,d){for(let i=0;i<m.seg.length;i++)if(d<=m.cum[i+1]){const s=m.seg[i],t=(d-m.cum[i])/s.l;return{x:pts[i][0]+s.dx*t,y:pts[i][1]+s.dy*t}}return{x:pts.at(-1)[0],y:pts.at(-1)[1]}}
function run(st,els,box){
 if(running||choice<0)return;running=true;box.querySelector('.racego').disabled=true;box.querySelectorAll('.racepicks button').forEach(x=>x.disabled=true);
 const ms=st.lanes.map(l=>lengths(l.pts));
 // deterministic: shorter/steeper visible route is faster; no bounce, randomness, or stopping.
 const state=ms.map((m,j)=>({d:0,v:.064,done:false})),finish=[];let last=performance.now();
 function tick(now){const dt=Math.min(30,now-last);last=now;
  state.forEach((s,j)=>{if(s.done)return;const m=ms[j],l=st.lanes[j];s.v=Math.min(.086,s.v+.000008*dt);s.d+=s.v*dt;if(s.d>=m.total){s.d=m.total;s.done=true;finish.push(j)}const q=point(l.pts,m,s.d);els[j].setAttribute('cx',q.x);els[j].setAttribute('cy',q.y)});
  if(state.every(s=>s.done)){running=false;result(finish[0],box);return}raf=requestAnimationFrame(tick)
 }raf=requestAnimationFrame(tick)
}
function result(w,box){const m=box.querySelector('.racemsg');m.innerHTML=(choice===w?'🎉 せいかい！':'おしい！')+'　<b><span style="color:'+C[w][0]+'">●</span> '+C[w][1]+'が いちばん！</b><br><small>みちの ながさと まがりかたを くらべてみよう</small>';const n=document.createElement('button');n.className='racenext';n.textContent=stage===19?'こーすを えらぶ':'つぎの すてーじ';n.onclick=()=>{if(stage===19)levels();else{stage++;show()}};m.append(n)}
btn.onclick=()=>{playMenu.style.display='none';miniArea.style.display='block';miniArea.classList.remove('hide-mode','riddle-mode','maze-mode','math-mode','trace-mode','kanji-mode','clock-mode');miniArea.classList.add('race-mode');miniTitle.textContent='ころころ よそうれーす';start.style.display='none';gameMsg.style.display='none';levels()};
miniBack.addEventListener('click',()=>{cancelAnimationFrame(raf);running=false;miniArea.classList.remove('race-mode')});
})();