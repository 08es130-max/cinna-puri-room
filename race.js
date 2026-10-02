(()=>{
const btn=document.querySelector('.minisel[data-mini="race"]');
const playMenu=document.getElementById('playMenu'),miniArea=document.getElementById('miniArea'),miniTitle=document.getElementById('miniTitle'),game=document.getElementById('game'),start=document.getElementById('start'),gameMsg=document.getElementById('gameMsg'),miniBack=document.getElementById('miniBack');
if(!btn||!playMenu||!miniArea||!game)return;
const balls=[['red','あか','🔴'],['blue','あお','🔵'],['yellow','きいろ','🟡'],['green','みどり','🟢']];
const labels={easy:'かんたん',normal:'ふつう',hard:'むずかしい'};
let level='easy',stage=0,running=false,choice=-1,raf=0;
function makeStages(lv){
 const out=[];
 for(let i=0;i<20;i++){
  const rot=i%4,base=lv==='easy'?[72,84,96,108]:lv==='normal'?[76,90,104,118]:[80,96,112,128];
  const dist=base.map((_,j)=>base[(j+rot)%4]+((i*7+j*3)%9));
  const obstacles=dist.map((d,j)=>{
   if(lv==='easy')return i<8?[]:((j+i)%4===0?[{x:52,type:'bump',cost:11}]:[]);
   if(lv==='normal'){const n=(j+i)%4;return n===0?[{x:38,type:'bump',cost:10},{x:70,type:'bridge',cost:14}]:n===1?[{x:58,type:'curve',cost:10}]:n===2?[{x:48,type:'gate',cost:17}]:[]}
   const n=(j+i)%4;return n===0?[{x:27,type:'bump',cost:11},{x:55,type:'gate',cost:20},{x:77,type:'curve',cost:12}]:n===1?[{x:35,type:'bridge',cost:16},{x:68,type:'bump',cost:11}]:n===2?[{x:31,type:'curve',cost:12},{x:61,type:'gate',cost:20}]:[{x:48,type:'bridge',cost:16}];
  });
  const totals=dist.map((d,j)=>d+obstacles[j].reduce((n,o)=>n+o.cost,0));
  out.push({dist,obstacles,totals,winner:totals.indexOf(Math.min(...totals))});
 }
 return out;
}
const stages={easy:makeStages('easy'),normal:makeStages('normal'),hard:makeStages('hard')};
function chooseLevel(){
 cancelAnimationFrame(raf);running=false;
 game.innerHTML='<div class="racelevels"><div class="racehead">どの こーすに する？</div><button data-l="easy">🌱<b>かんたん</b><small>みちの ながさを よく みよう</small></button><button data-l="normal">🌼<b>ふつう</b><small>しょうがいぶつも あるよ</small></button><button data-l="hard">🔥<b>むずかしい</b><small>みちと しょうがいぶつを くらべよう</small></button></div>';
 game.querySelectorAll('[data-l]').forEach(b=>b.onclick=()=>{level=b.dataset.l;stage=0;showStage()});
}
function icon(t){return t==='bump'?'▲':t==='bridge'?'╱╲':t==='gate'?'▥':'〰'}
function pathFor(d,j){
 const wig=Math.max(0,d-72),a=8+Math.min(20,wig*.35),phase=(j%2?1:-1);
 return 'M 7 50 C 25 '+(50-a*phase)+' 38 '+(50+a*phase)+' 53 50 S 78 '+(50-a*phase)+' 94 50';
}
function showStage(){
 cancelAnimationFrame(raf);running=false;choice=-1;const s=stages[level][stage];game.innerHTML='';
 const box=document.createElement('div');box.className='racebox';
 box.innerHTML='<div class="racehead">'+labels[level]+'　'+(stage+1)+' / 20</div><div class="racehint">どの ぼーるが いちばん はやく ごーるする？</div>';
 const course=document.createElement('div');course.className='racecourse';
 balls.forEach((b,j)=>{
  const lane=document.createElement('div');lane.className='racelane';
  lane.innerHTML='<div class="raceballstart">'+b[2]+'</div><svg class="racepath" viewBox="0 0 100 100" preserveAspectRatio="none"><path d="'+pathFor(s.dist[j],j)+'"/></svg><div class="raceobstacles"></div><div class="racegoal">🏁</div><div class="raceball '+b[0]+'" data-ball="'+j+'"></div>';
  const obs=lane.querySelector('.raceobstacles');
  s.obstacles[j].forEach(o=>{const x=document.createElement('span');x.className='raceobs '+o.type;x.style.left=o.x+'%';x.textContent=icon(o.type);obs.appendChild(x)});
  course.appendChild(lane);
 });
 const picks=document.createElement('div');picks.className='racepicks';
 balls.forEach((b,j)=>{const p=document.createElement('button');p.innerHTML=b[2]+'<br>'+b[1];p.onclick=()=>{if(running)return;choice=j;picks.querySelectorAll('button').forEach((x,k)=>x.classList.toggle('picked',k===j));go.disabled=false};picks.appendChild(p)});
 const go=document.createElement('button');go.className='racego';go.disabled=true;go.textContent='よそうした！　すたーと';go.onclick=()=>runRace(s,box);
 const msg=document.createElement('div');msg.className='racemsg';box.append(course,picks,go,msg);game.appendChild(box);
}
function runRace(s,box){
 if(running||choice<0)return;running=true;box.querySelector('.racego').disabled=true;box.querySelectorAll('.racepicks button').forEach(x=>x.disabled=true);
 const bs=[...box.querySelectorAll('.raceball')],startAt=performance.now(),max=Math.max(...s.totals),duration=3600;
 function frame(now){
  let done=true;
  bs.forEach((b,j)=>{
   const p=Math.min(1,(now-startAt)/(duration*s.totals[j]/max));if(p<1)done=false;
   b.style.left=(5+p*88)+'%';
   const wob=Math.sin(p*Math.PI*6+j)*Math.min(9,Math.max(0,s.dist[j]-72)*.18);
   b.style.transform='translate(-50%,calc(-50% + '+wob+'px)) rotate('+(p*900)+'deg)';
  });
  if(!done){raf=requestAnimationFrame(frame);return}
  running=false;finishRace(s,box);
 }
 raf=requestAnimationFrame(frame);
}
function finishRace(s,box){
 const win=balls[s.winner],msg=box.querySelector('.racemsg');
 msg.innerHTML=(choice===s.winner?'🎉 せいかい！':'おしい！')+'<br><b>'+win[2]+' '+win[1]+'が いちばん！</b><br><small>みちの ながさと しょうがいぶつを くらべてみよう</small>';
 const next=document.createElement('button');next.className='racenext';next.textContent=stage===19?'こーすを えらぶ':'つぎの こーす';next.onclick=()=>{if(stage===19)chooseLevel();else{stage++;showStage()}};msg.appendChild(next);
}
function open(){
 playMenu.style.display='none';miniArea.style.display='block';
 miniArea.classList.remove('hide-mode','riddle-mode','maze-mode','math-mode','trace-mode','kanji-mode','clock-mode');miniArea.classList.add('race-mode');
 miniTitle.textContent='ころころ よそうれーす';start.style.display='none';gameMsg.style.display='none';chooseLevel();
}
btn.onclick=open;
miniBack.addEventListener('click',()=>{cancelAnimationFrame(raf);running=false;miniArea.classList.remove('race-mode')});
})();