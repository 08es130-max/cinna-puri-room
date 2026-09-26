(()=>{
const btn=document.querySelector('.minisel[data-mini="namewrite"]');
const playMenu=document.getElementById('playMenu'),miniArea=document.getElementById('miniArea'),miniTitle=document.getElementById('miniTitle'),game=document.getElementById('game'),start=document.getElementById('start'),gameMsg=document.getElementById('gameMsg'),miniBack=document.getElementById('miniBack');
if(!btn||!game)return;
const people=[
 {label:'かこ',hira:['や','ま','だ','か','こ'],kanji:['山','田','栞','瑚'],hiraText:'やまだ かこ',kanjiText:'山田 栞瑚'},
 {label:'なぎ',hira:['や','ま','だ','な','ぎ'],kanji:['山','田','凪'],hiraText:'やまだ なぎ',kanjiText:'山田 凪'}
];
let person=null,kind='hira',chars=[],ci=0,drawings=[],ink=null,ctx=null,drawing=false,last=null,demoToken=0;
function guide(ch){return '<svg viewBox="0 0 800 800"><text x="400" y="610" text-anchor="middle" font-family="Hiragino Sans,Yu Gothic,sans-serif" font-size="600" font-weight="600" fill="#eef1f2" stroke="#cdd7dc" stroke-width="4">'+ch+'</text></svg>'}
function choosePerson(){
 game.innerHTML='<div class="namechoose"><div class="namehead">だれの なまえを かく？</div>'+people.map((p,i)=>'<button data-p="'+i+'">🌷<b>'+p.label+'</b><small>'+p.hiraText+'</small></button>').join('')+'</div>';
 game.querySelectorAll('[data-p]').forEach(b=>b.onclick=()=>{person=people[+b.dataset.p];chooseKind()});
}
function chooseKind(){
 game.innerHTML='<div class="namechoose"><div class="namehead">'+person.label+'の なまえ</div><button data-k="hira"><b>ひらがな</b><small>'+person.hiraText+'</small></button><button data-k="kanji"><b>かんじ</b><small>'+person.kanjiText+'</small></button><button class="nameback">もどる</button></div>';
 game.querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>{kind=b.dataset.k;chars=[...person[kind]];ci=0;drawings=Array(chars.length).fill(null);showTrace()});
 game.querySelector('.nameback').onclick=choosePerson;
}
function showTrace(){
 demoToken++;const ch=chars[ci];game.innerHTML='';
 const box=document.createElement('div');box.className='nametrace';
 const top=document.createElement('div');top.className='nametop';top.innerHTML='<b>'+(kind==='hira'?person.hiraText:person.kanjiText)+'</b><span>'+chars.map((c,i)=>i===ci?'【'+c+'】':c).join('')+'</span>';
 const board=document.createElement('div');board.className='nameboard';board.innerHTML='<div class="nameguide">'+guide(ch)+'</div>';
 ink=document.createElement('canvas');ink.width=800;ink.height=800;ink.className='nameink';board.appendChild(ink);ctx=ink.getContext('2d');
 const ctrl=document.createElement('div');ctrl.className='namectrl';
 const demo=document.createElement('button');demo.textContent='おてほん';demo.onclick=()=>showDemo(ch,demo);
 const clear=document.createElement('button');clear.textContent='けす';clear.onclick=()=>ctx.clearRect(0,0,800,800);
 const next=document.createElement('button');next.textContent=ci===chars.length-1?'できた':'つぎへ';next.onclick=()=>{save();if(ci===chars.length-1)done();else{ci++;showTrace()}};
 ctrl.append(demo,clear,next);box.append(top,board,ctrl);game.appendChild(box);bindInk();
}
function bindInk(){
 const pos=e=>{const r=ink.getBoundingClientRect();return{x:(e.clientX-r.left)*800/r.width,y:(e.clientY-r.top)*800/r.height}};
 ink.onpointerdown=e=>{drawing=true;last=pos(e);ink.setPointerCapture?.(e.pointerId);ctx.beginPath();ctx.arc(last.x,last.y,9,0,Math.PI*2);ctx.fillStyle='#111';ctx.fill()};
 ink.onpointermove=e=>{if(!drawing)return;const p=pos(e);ctx.beginPath();ctx.moveTo(last.x,last.y);ctx.lineTo(p.x,p.y);ctx.strokeStyle='#111';ctx.lineWidth=20;ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke();last=p};
 ink.onpointerup=ink.onpointercancel=()=>{drawing=false;last=null};
}
function save(){drawings[ci]=ink.toDataURL('image/png')}
async function fetchText(url){try{const r=await fetch(url,{cache:'force-cache'});return r.ok?await r.text():''}catch(e){return''}}
async function showDemo(ch,b){
 const token=++demoToken;b.disabled=true;b.textContent='よみこみちゅう…';const host=game.querySelector('.nameguide');
 try{
  let txt='';
  if(kind==='kanji'){
   const cp=ch.codePointAt(0).toString(16).padStart(5,'0');
   txt=await fetchText('https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/'+cp+'.svg')||await fetchText('https://cdn.jsdelivr.net/gh/KanjiVG/kanjivg@master/kanji/'+cp+'.svg');
  }else{
   const dir=/^[ァ-ヺ]$/.test(ch)?'katakana':'hiragana';
   txt=await fetchText('https://raw.githubusercontent.com/zhengkyl/strokesvg/main/dist/'+dir+'/'+encodeURIComponent(ch)+'.svg');
  }
  if(!txt||token!==demoToken)throw 0;host.innerHTML=txt;const svg=host.querySelector('svg');if(!svg)throw 0;svg.removeAttribute('width');svg.removeAttribute('height');
  if(kind==='kanji')svg.setAttribute('viewBox','0 0 109 109');
  let paths=[...svg.querySelectorAll('path')].filter(p=>{try{return p.getTotalLength()>5}catch(e){return false}});
  if(!paths.length)throw 0;
  paths.forEach(p=>{const l=p.getTotalLength();p.style.fill='none';p.style.stroke='#d7e0e4';p.style.strokeWidth=kind==='kanji'?'4.5':'64';p.style.strokeLinecap='round';p.style.strokeLinejoin='round';p.style.strokeDasharray=String(l);p.style.strokeDashoffset=String(l)});
  svg.getBoundingClientRect();await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
  for(const p of paths){if(token!==demoToken)return;const l=p.getTotalLength();p.style.stroke='#55bff5';await p.animate([{strokeDashoffset:String(l)},{strokeDashoffset:'0'}],{duration:600,easing:'linear',fill:'forwards'}).finished.catch(()=>{});p.style.strokeDashoffset='0';await new Promise(r=>setTimeout(r,90))}
 }catch(e){host.innerHTML=guide(ch)}
 b.disabled=false;b.textContent='おてほん';
}
function done(){
 save();game.innerHTML='';const box=document.createElement('div');box.className='namedone';box.innerHTML='<div class="namedonetitle">かけたよ！</div><div class="namedoneword">'+(kind==='hira'?person.hiraText:person.kanjiText)+'</div>';
 const row=document.createElement('div');row.className='namedonerow';chars.forEach((ch,i)=>{const c=document.createElement('div');c.className='namedonechar';const im=document.createElement('img');if(drawings[i])im.src=drawings[i];const sp=document.createElement('span');sp.textContent=ch;c.append(im,sp);row.appendChild(c)});const again=document.createElement('button');again.className='nameagain';again.textContent='もういちど かく';again.onclick=chooseKind;box.append(row,again);game.appendChild(box);
}
function open(){playMenu.style.display='none';miniArea.style.display='block';miniArea.classList.remove('hide-mode','riddle-mode','maze-mode','math-mode','trace-mode','kanji-mode');miniArea.classList.add('name-mode');miniTitle.textContent='なまえを かこう';start.style.display='none';gameMsg.style.display='none';choosePerson()}
btn.onclick=open;
miniBack.addEventListener('click',()=>{demoToken++;miniArea.classList.remove('name-mode')});
})();