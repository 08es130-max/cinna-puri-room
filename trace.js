(()=>{
const btn=document.querySelector('.minisel[data-mini="trace"]');
const playMenu=document.getElementById('playMenu'),miniArea=document.getElementById('miniArea'),miniTitle=document.getElementById('miniTitle'),game=document.getElementById('game'),start=document.getElementById('start'),gameMsg=document.getElementById('gameMsg'),miniBack=document.getElementById('miniBack');
if(!btn||!playMenu||!miniArea||!game)return;

const sets={
 number:['1','2','3','4','5','6','7','8','9','10'],
 hira:['あ','い','う','え','お']
};
/* かきじゅんの開始位置。800x800 のキャンバス基準 */
const strokeStarts={
 number:{
  '1':[[330,210]],'2':[[270,245]],'3':[[275,230]],'4':[[455,205],[255,430]],
  '5':[[520,215]],'6':[[485,210]],'7':[[250,220],[525,240]],'8':[[400,205]],'9':[[325,235]],'10':[[230,210],[505,205]]
 },
 hira:{
  'あ':[[235,300],[445,210],[300,455]],
  'い':[[275,270],[500,265]],
  'う':[[350,230],[285,350]],
  'え':[[360,220],[270,360]],
  'お':[[245,300],[450,210],[310,500]]
 }
};
let mode='number',index=0,drawing=false,last=null;

function setup(){
 game.innerHTML='';
 const wrap=document.createElement('div');wrap.className='tracebox';

 const tabs=document.createElement('div');tabs.className='tracetabs';
 tabs.innerHTML='<button class="tracetab active" data-mode="number">すうじ</button><button class="tracetab" data-mode="hira">ひらがな</button>';

 const board=document.createElement('div');board.className='traceboard';
 const guide=document.createElement('canvas');guide.className='tracecanvas traceguide';
 const ink=document.createElement('canvas');ink.className='tracecanvas traceink';
 board.append(guide,ink);

 const label=document.createElement('div');label.className='tracelabel';
 const order=document.createElement('div');order.className='traceorder';
 const controls=document.createElement('div');controls.className='tracectrl';
 controls.innerHTML='<button class="traceclear">けす</button><button class="traceprev">まえへ</button><button class="tracenext">つぎへ</button>';

 wrap.append(tabs,label,order,board,controls);game.appendChild(wrap);

 const sizeCanvas=c=>{c.width=800;c.height=800};
 sizeCanvas(guide);sizeCanvas(ink);
 const g=guide.getContext('2d'),d=ink.getContext('2d');

 function drawMarker(x,y,n){
  g.save();
  g.beginPath();g.arc(x,y,28,0,Math.PI*2);
  g.fillStyle='rgba(105,194,243,.96)';g.fill();
  g.lineWidth=5;g.strokeStyle='#fff';g.stroke();
  g.fillStyle='#fff';g.font='900 30px -apple-system,BlinkMacSystemFont,"Hiragino Sans","Yu Gothic",sans-serif';
  g.textAlign='center';g.textBaseline='middle';g.fillText(String(n),x,y+1);
  g.restore();
 }
 function drawGuide(){
  g.clearRect(0,0,800,800);
  const ch=sets[mode][index];
  label.textContent=ch+' を なぞってね';
  const starts=(strokeStarts[mode]&&strokeStarts[mode][ch])||[];
  order.textContent=starts.length>1?'①から じゅんばんに なぞってね':'①から なぞってね';
  g.save();
  g.textAlign='center';g.textBaseline='middle';
  let size=560;
  if(mode==='number'&&ch==='10')size=430;
  g.font=(mode==='number'?'700 ':'600 ')+size+'px "Hiragino Sans","Yu Gothic",sans-serif';
  g.lineWidth=10;g.strokeStyle='rgba(120,150,170,.30)';
  g.strokeText(ch,400,430);
  g.restore();
  starts.forEach((p,i)=>drawMarker(p[0],p[1],i+1));
 }
 function clearInk(){d.clearRect(0,0,800,800);last=null}
 function switchMode(m){
  mode=m;index=0;tabs.querySelectorAll('.tracetab').forEach(x=>x.classList.toggle('active',x.dataset.mode===mode));clearInk();drawGuide();
 }
 tabs.querySelectorAll('.tracetab').forEach(x=>x.onclick=()=>switchMode(x.dataset.mode));
 controls.querySelector('.traceclear').onclick=clearInk;
 controls.querySelector('.traceprev').onclick=()=>{index=(index-1+sets[mode].length)%sets[mode].length;clearInk();drawGuide()};
 controls.querySelector('.tracenext').onclick=()=>{index=(index+1)%sets[mode].length;clearInk();drawGuide()};

 function pos(e){
  const r=ink.getBoundingClientRect();
  return {x:(e.clientX-r.left)*800/r.width,y:(e.clientY-r.top)*800/r.height};
 }
 ink.addEventListener('pointerdown',e=>{
  drawing=true;last=pos(e);ink.setPointerCapture?.(e.pointerId);
  d.beginPath();d.arc(last.x,last.y,9,0,Math.PI*2);d.fillStyle='#111';d.fill();
 });
 ink.addEventListener('pointermove',e=>{
  if(!drawing)return;
  const p=pos(e);
  d.beginPath();d.moveTo(last.x,last.y);d.lineTo(p.x,p.y);
  d.strokeStyle='#111';d.lineWidth=20;d.lineCap='round';d.lineJoin='round';d.stroke();
  last=p;
 });
 const stop=()=>{drawing=false;last=null};
 ink.addEventListener('pointerup',stop);ink.addEventListener('pointercancel',stop);ink.addEventListener('pointerleave',e=>{if(e.buttons===0)stop()});
 drawGuide();
}

btn.onclick=()=>{
 playMenu.style.display='none';miniArea.style.display='block';
 miniArea.classList.remove('hide-mode','riddle-mode','maze-mode','math-mode');
 miniArea.classList.add('trace-mode');
 miniTitle.textContent='なぞって かこう';
 start.style.display='none';gameMsg.textContent='';setup();
};
miniBack.addEventListener('click',()=>miniArea.classList.remove('trace-mode'));
})();