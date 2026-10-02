(()=>{
const btn=document.querySelector('.minisel[data-mini="race"]');
const playMenu=document.getElementById('playMenu'),miniArea=document.getElementById('miniArea'),miniTitle=document.getElementById('miniTitle'),game=document.getElementById('game'),start=document.getElementById('start'),gameMsg=document.getElementById('gameMsg'),miniBack=document.getElementById('miniBack');
if(!btn||!playMenu||!miniArea||!game)return;
const B=[['#ed5555','あか'],['#4c9fe5','あお'],['#efc932','きいろ'],['#55b86a','みどり']],NS='http://www.w3.org/2000/svg';
let level='easy',stage=0,choice=-1,running=false,raf=0;
const labels={easy:'かんたん',normal:'ふつう',hard:'むずかしい'};
function svgEl(n,a={}){const e=document.createElementNS(NS,n);for(const k in a)e.setAttribute(k,a[k]);return e}
function easyStage(i){
 const win=i%4,extra=[0,0,0,0].map((_,j)=>18+((j-win+4)%4)*17+((i*5+j*7)%9));
 extra[win]=4+(i%5)*2;
 return {kind:'easy',paths:extra.map((x,j)=>[[8,16+j*22],[30,16+j*22+(j%2?x*.13:-x*.13)],[58,16+j*22-(j%2?x*.1:-x*.1)],[92,16+j*22]]),obs:[[],[],[],[]]};
}
function sharedStage(i,hard){
 const starts=[[14,7],[38,7],[62,7],[86,7]],ends=[[43,94],[48,94],[53,94],[58,94]],paths=[],obs=[];
 for(let j=0;j<4;j++){
  const sx=starts[j][0],ex=ends[j][0],dir=j<2?1:-1,phase=(i+j)%4;
  if(!hard){
   const x1=Math.max(8,Math.min(92,sx+dir*(10+phase*3)));
   const x2=Math.max(8,Math.min(92,sx-dir*(7+((i+j)%3)*3)));
   const x3=Math.max(12,Math.min(88,ex+dir*(9+((i*2+j)%3)*3)));
   paths.push([[sx,7],[x1,25],[x2,43],[x3,62],[ex+dir*5,80],[ex,94]]);
   const arr=[];
   if(phase===0)arr.push({seg:1,t:.5,type:'hill',delay:9});
   if(phase===1)arr.push({seg:2,t:.5,type:'gate',delay:14});
   if(phase===2)arr.push({seg:1,t:.5,type:'bridge',delay:10});
   if(phase===3)arr.push({seg:3,t:.5,type:'spinner',delay:16});
   obs.push(arr);
  }else{
   const zig1=Math.max(7,Math.min(93,sx+dir*(16+phase*3)));
   const zig2=Math.max(7,Math.min(93,sx-dir*(13+((i+j)%3)*4)));
   const zig3=Math.max(7,Math.min(93,ex+dir*(20-((i+j)%3)*3)));
   const zig4=Math.max(7,Math.min(93,ex-dir*(14+((i*3+j)%3)*3)));
   paths.push([[sx,6],[zig1,18],[zig2,31],[zig1-dir*7,44],[zig3,57],[zig4,69],[ex+dir*13,81],[ex-dir*5,89],[ex,95]]);
   const arr=[];
   if(phase===0)arr.push({seg:1,t:.5,type:'hill',delay:10},{seg:4,t:.5,type:'gate',delay:17},{seg:6,t:.5,type:'spinner',delay:18});
   if(phase===1)arr.push({seg:2,t:.5,type:'bridge',delay:10},{seg:5,t:.5,type:'spinner',delay:18});
   if(phase===2)arr.push({seg:1,t:.5,type:'spinner',delay:18},{seg:3,t:.5,type:'hill',delay:9},{seg:6,t:.5,type:'gate',delay:17});
   if(phase===3)arr.push({seg:2,t:.5,type:'gate',delay:17},{seg:4,t:.5,type:'bridge',delay:10},{seg:6,t:.5,type:'hill',delay:9});
   obs.push(arr);
  }
 }
 return {kind:'shared',paths,obs};
}
const stages={easy:Array.from({length:20},(_,i)=>easyStage(i)),normal:Array.from({length:20},(_,i)=>sharedStage(i,false)),hard:Array.from({length:20},(_,i)=>sharedStage(i,true))};
function chooseLevel(){
 cancelAnimationFrame(raf);running=false;
 game.innerHTML='<div class="racelevels"><div class="racehead">どの こーすに する？</div><button data-l="easy">🌱<b>かんたん</b><small>4つの みちの ながさを くらべよう</small></button><button data-l="normal">🌼<b>ふつう</b><small>べつの みちから おなじ ごーるへ</small></button><button data-l="hard">🔥<b>むずかしい</b><small>さかや しかけも よく みよう</small></button></div>';
 game.querySelectorAll('[data-l]').forEach(b=>b.onclick=()=>{level=b.dataset.l;stage=0;showStage()});
}
function pathD(p){return p.map((q,k)=>(k?'L':'M')+' '+q[0]+' '+q[1]).join(' ')}
function obstacleGroup(type,x,y){
 const g=svgEl('g',{class:'racefixture '+type,transform:'translate('+x+' '+y+')'});
 if(type==='hill'){g.append(svgEl('path',{d:'M -5 3 Q 0 -6 5 3',class:'fixture-shape'}));const t=svgEl('text',{x:0,y:-6,'text-anchor':'middle'});t.textContent='さか';g.append(t)}
 if(type==='gate'){g.append(svgEl('path',{d:'M -4 4 L -4 -5 L 4 -5 L 4 4',class:'fixture-shape'}));const t=svgEl('text',{x:0,y:-7,'text-anchor':'middle'});t.textContent='げーと';g.append(t)}
 if(type==='bridge'){g.append(svgEl('path',{d:'M -6 3 Q 0 -5 6 3 M -6 3 L 6 3',class:'fixture-shape'}));const t=svgEl('text',{x:0,y:-6,'text-anchor':'middle'});t.textContent='はし';g.append(t)}
 if(type==='spinner'){g.append(svgEl('circle',{r:4,class:'fixture-shape'}));g.append(svgEl('path',{d:'M -6 0 L 6 0 M 0 -6 L 0 6',class:'fixture-shape spin'}));const t=svgEl('text',{x:0,y:-8,'text-anchor':'middle'});t.textContent='くるくる';g.append(t)}
 return g;
}
function metrics(p,obs){
 let total=0;const seg=[];
 for(let i=0;i<p.length-1;i++){const dx=p[i+1][0]-p[i][0],dy=p[i+1][1]-p[i][1],l=Math.hypot(dx,dy);seg.push({l,dx,dy});total+=l}
 let cost=total;
 for(const s of seg){const slope=s.dy/s.l;cost+=Math.max(-.25,Math.min(.35,-slope*.28))*s.l}
 cost+=obs.reduce((n,o)=>n+o.delay,0);
 return {total,seg,cost};
}
function pointOn(p,m,d){
 let left=d;
 for(let i=0;i<m.seg.length;i++){const s=m.seg[i];if(left<=s.l){const t=left/s.l;return{x:p[i][0]+s.dx*t,y:p[i][1]+s.dy*t,angle:Math.atan2(s.dy,s.dx)*180/Math.PI,seg:i,t}}left-=s.l}
 const a=p[p.length-2],z=p[p.length-1];return{x:z[0],y:z[1],angle:Math.atan2(z[1]-a[1],z[0]-a[0])*180/Math.PI,seg:m.seg.length-1,t:1}
}
function obstaclePoint(p,o){const a=p[o.seg],b=p[o.seg+1];return{x:a[0]+(b[0]-a[0])*o.t,y:a[1]+(b[1]-a[1])*o.t}}
function showStage(){
 cancelAnimationFrame(raf);running=false;choice=-1;const s=stages[level][stage];game.innerHTML='';
 const box=document.createElement('div');box.className='racebox';box.innerHTML='<div class="racehead">'+labels[level]+'　'+(stage+1)+' / 20</div><div class="racehint">どの ぼーるが いちばん はやいかな？</div>';
 const svg=svgEl('svg',{class:'raceworld',viewBox:'0 0 100 100',preserveAspectRatio:'none'});
 const floor=svgEl('g',{class:'racefloor'});
 floor.append(svgEl('ellipse',{cx:52,cy:94,rx:42,ry:3.2,class:'floorShadow'}));
 svg.append(floor);
 const defs=svgEl('defs');const pat=svgEl('pattern',{id:'finishCheck',width:4,height:4,patternUnits:'userSpaceOnUse'});pat.append(svgEl('rect',{width:2,height:2,fill:'#333'}),svgEl('rect',{x:2,y:2,width:2,height:2,fill:'#333'}));defs.append(pat);svg.append(defs);
 if(s.kind==='shared'){
  svg.append(svgEl('rect',{x:39,y:92,width:23,height:5,fill:'url(#finishCheck)',class:'sharedfinish'}));
  const gt=svgEl('text',{x:50,y:90,'text-anchor':'middle',class:'goaltext'});gt.textContent='ごーる';svg.append(gt);
 }
 const mets=s.paths.map((p,j)=>{
  const shadow=svgEl('path',{d:pathD(p),class:'trackshadow'});svg.append(shadow);
  const side=svgEl('path',{d:pathD(p),class:'trackside'});svg.append(side);
  const rail=svgEl('path',{d:pathD(p),class:'trackrail'});svg.append(rail);
  const path=svgEl('path',{d:pathD(p),class:'realtrack','data-i':j});svg.append(path);
  const shine=svgEl('path',{d:pathD(p),class:'trackshine'});svg.append(shine);
  if(s.kind==='easy'){const z=p[p.length-1];svg.append(svgEl('rect',{x:z[0]-1,y:z[1]-5,width:4,height:10,fill:'url(#finishCheck)'}))}
  s.obs[j].forEach(o=>{const q=obstaclePoint(p,o);svg.append(obstacleGroup(o.type,q.x,q.y))});
  const st=p[0];const ball=svgEl('circle',{cx:st[0],cy:st[1],r:2.8,fill:B[j][0],class:'physicsball','data-i':j});svg.append(ball);
  return metrics(p,s.obs[j]);
 });
 box.appendChild(svg);
 const picks=document.createElement('div');picks.className='racepicks';B.forEach((b,j)=>{const p=document.createElement('button');p.innerHTML='<span style="color:'+b[0]+'">●</span><br>'+b[1];p.onclick=()=>{if(running)return;choice=j;[...picks.children].forEach((x,k)=>x.classList.toggle('picked',k===j));go.disabled=false};picks.append(p)});
 const go=document.createElement('button');go.className='racego';go.disabled=true;go.textContent='よそうした！　すたーと';go.onclick=()=>runRace(s,mets,box,svg);
 const msg=document.createElement('div');msg.className='racemsg';box.append(picks,go,msg);game.append(box);
}
function runRace(s,mets,box,svg){
 if(running||choice<0)return;running=true;box.querySelector('.racego').disabled=true;box.querySelectorAll('.racepicks button').forEach(x=>x.disabled=true);
 const states=mets.map(()=>({d:0,v:0.018,wait:0,hit:new Set(),done:false,time:0})),balls=[...svg.querySelectorAll('.physicsball')];let last=performance.now(),elapsed=0,finish=[];
 function tick(now){
  let dt=Math.min(32,now-last);last=now;elapsed+=dt;
  states.forEach((st,j)=>{
   if(st.done)return;if(st.wait>0){st.wait-=dt;return}
   const q=pointOn(s.paths[j],mets[j],st.d),rad=q.angle*Math.PI/180;
   const gravity=Math.sin(rad)*0.000018;st.v=Math.max(.012,Math.min(.052,st.v+gravity*dt));st.v*=Math.pow(.9996,dt);st.d+=st.v*dt;
   s.obs[j].forEach((o,k)=>{const key=j+'-'+k;if(st.hit.has(key))return;const op=obstaclePoint(s.paths[j],o),oq=pointOn(s.paths[j],mets[j],st.d);if(Math.hypot(op.x-oq.x,op.y-oq.y)<4){st.hit.add(key);st.wait=o.delay*22;if(o.type==='hill')st.v*=.55;if(o.type==='bridge')st.v*=.72;if(o.type==='gate')st.v*=.35;if(o.type==='spinner')st.v*=.3}});
   if(st.d>=mets[j].total){st.d=mets[j].total;st.done=true;st.time=elapsed;finish.push(j)}
   const pos=pointOn(s.paths[j],mets[j],st.d);
   let px=pos.x,py=pos.y;
   balls[j].setAttribute('cx',Math.max(3,Math.min(97,px)));balls[j].setAttribute('cy',Math.max(3,Math.min(97,py)));
  });
  if(states.every(x=>x.done)){running=false;finishRace(finish[0],box);return}raf=requestAnimationFrame(tick);
 }
 raf=requestAnimationFrame(tick);
}
function finishRace(winner,box){
 const msg=box.querySelector('.racemsg'),w=B[winner];msg.innerHTML=(choice===winner?'🎉 せいかい！':'おしい！')+'　<b><span style="color:'+w[0]+'">●</span> '+w[1]+'が いちばん！</b><br><small>みちの ながさ・さか・しかけを もういちど みてみよう</small>';
 const n=document.createElement('button');n.className='racenext';n.textContent=stage===19?'こーすを えらぶ':'つぎの こーす';n.onclick=()=>{if(stage===19)chooseLevel();else{stage++;showStage()}};msg.append(n);
}
btn.onclick=()=>{playMenu.style.display='none';miniArea.style.display='block';miniArea.classList.remove('hide-mode','riddle-mode','maze-mode','math-mode','trace-mode','kanji-mode','clock-mode');miniArea.classList.add('race-mode');miniTitle.textContent='ころころ よそうれーす';start.style.display='none';gameMsg.style.display='none';chooseLevel()};
miniBack.addEventListener('click',()=>{cancelAnimationFrame(raf);running=false;miniArea.classList.remove('race-mode')});
})();