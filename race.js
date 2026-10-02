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
 const type=i%5,rot=Math.floor(i/5)%4;
 const sets=[
  // square: diagonal versus two sides, with two larger perimeter routes
  [
   [[18,14],[50,50],[50,88]],
   [[38,14],[38,50],[50,50],[50,88]],
   [[62,14],[82,14],[82,52],[50,52],[50,88]],
   [[86,14],[94,30],[72,48],[90,66],[50,88]]
  ],
  // rectangle
  [
   [[16,12],[50,48],[50,88]],
   [[38,12],[38,48],[50,48],[50,88]],
   [[62,12],[82,12],[82,52],[50,52],[50,88]],
   [[86,12],[94,32],[70,52],[90,70],[50,88]]
  ],
  // triangle: hypotenuse-like shortcut vs two legs
  [
   [[15,14],[50,58],[50,88]],
   [[38,14],[38,58],[50,58],[50,88]],
   [[62,14],[84,36],[62,58],[50,88]],
   [[86,14],[94,36],[74,58],[88,74],[50,88]]
  ],
  // diamond
  [
   [[15,12],[50,50],[50,88]],
   [[38,12],[22,50],[50,88]],
   [[62,12],[82,50],[50,88]],
   [[86,12],[94,34],[72,50],[94,68],[50,88]]
  ],
  // trapezoid / polygon
  [
   [[15,12],[50,54],[50,88]],
   [[38,12],[26,34],[26,58],[50,88]],
   [[62,12],[80,30],[80,58],[50,88]],
   [[86,12],[94,28],[76,44],[92,62],[70,76],[50,88]]
  ]
 ];
 let raw=sets[type].map(p=>p.map(q=>[...q]));
 // rotate which colour gets each geometric route while keeping the drawing recognisably different.
 const lanes=Array(4);for(let j=0;j<4;j++)lanes[(j+rot)%4]={pts:raw[j],rank:j};
 const starts=lanes.map(l=>l.pts[0][0]);
 return {starts,lanes,winner:rot,geometry:true,shape:type};
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
 if(st.geometry){
  const guides=[
   'M18 14 L82 14 L82 58 L18 58 Z M18 14 L82 58 M82 14 L18 58',
   'M16 12 L84 12 L84 58 L16 58 Z M16 12 L84 58',
   'M18 14 L50 58 L82 14 Z M18 14 L50 58',
   'M50 10 L84 50 L50 82 L16 50 Z M50 10 L50 82',
   'M24 12 L76 12 L88 58 L50 82 L12 58 Z M24 12 L50 82'
  ];
  svg.append(E('path',{d:guides[st.shape],class:'geometryguide'}));
 }
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