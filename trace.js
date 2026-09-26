(()=>{
const btn=document.querySelector('.minisel[data-mini="trace"]');
const playMenu=document.getElementById('playMenu'),miniArea=document.getElementById('miniArea'),miniTitle=document.getElementById('miniTitle'),game=document.getElementById('game'),start=document.getElementById('start'),gameMsg=document.getElementById('gameMsg'),miniBack=document.getElementById('miniBack');
if(!btn||!playMenu||!miniArea||!game)return;

/* かなのかきじゅんは strokesvg (MIT / Klee One: SIL OFL 1.1) のSVGを利用 */
const kana={
 hira:[...'あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん'],
 kata:[...'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン']
};
const rows={
 hira:[...'あいうえお|かきくけこ|さしすせそ|たちつてと|なにぬねの|はひふへほ|まみむめも|や　ゆ　よ|らりるれろ|わ　　　を|ん'.split('|')],
 kata:[...'アイウエオ|カキクケコ|サシスセソ|タチツテト|ナニヌネノ|ハヒフヘホ|マミムメモ|ヤ　ユ　ヨ|ラリルレロ|ワ　　　ヲ|ン'.split('|')]
};
const number=[...'123456789','10'];
const numberPaths={
 '1':['M330 270 Q385 245 430 190 L430 830'],
 '2':['M270 315 C290 180 535 155 650 245 C800 365 610 515 300 805 L735 805'],
 '3':['M285 245 C430 150 690 175 700 320 C705 430 585 480 465 490 C610 490 735 555 720 690 C700 865 415 880 275 760'],
 '4':['M610 170 L265 610 L760 610','M610 170 L610 850'],
 '5':['M685 205 L340 205 L315 470 C430 420 675 430 710 605 C750 805 505 900 285 790'],
 '6':['M655 215 C430 180 270 395 270 620 C270 850 600 900 710 700 C810 515 555 390 320 535'],
 '7':['M255 220 L745 220','M700 245 C575 415 475 600 420 845'],
 '8':['M430 485 C250 405 280 180 505 190 C725 200 745 430 565 500 C760 570 735 850 495 860 C235 870 215 590 430 485'],
 '9':['M675 505 C575 620 305 595 295 390 C285 175 620 125 710 330 C800 535 660 775 390 860'],
 '10':['M190 270 Q235 245 275 190 L275 830','M655 190 C430 190 430 830 655 830 C880 830 880 190 655 190']
};
let mode='number',index=0,learnMode='sequence',drawing=false,last=null,demoToken=0,svgHost=null,ink=null,inkCtx=null,label=null,sub=null,controls=null,wrap=null;

const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const sourceUrl=(m,ch)=>'https://raw.githubusercontent.com/zhengkyl/strokesvg/main/dist/'+(m==='hira'?'hiragana':'katakana')+'/'+encodeURIComponent(ch)+'.svg';

async function getKanaSvg(m,ch){
 const url=sourceUrl(m,ch),cacheName='nakayoshi-kana-strokes-v1';
 try{
  if('caches'in window){
   const c=await caches.open(cacheName),hit=await c.match(url);
   if(hit)return await hit.text();
   const res=await fetch(url,{cache:'force-cache'});if(!res.ok)throw 0;await c.put(url,res.clone());return await res.text();
  }
  const res=await fetch(url);if(!res.ok)throw 0;return await res.text();
 }catch(e){return ''}
}
function prefetchKana(){
 if(!('caches'in window))return;
 caches.open('nakayoshi-kana-strokes-v1').then(async c=>{
  for(const m of ['hira','kata'])for(const ch of kana[m]){
   const u=sourceUrl(m,ch);if(await c.match(u))continue;
   fetch(u,{cache:'force-cache'}).then(r=>{if(r.ok)c.put(u,r.clone())}).catch(()=>{});
  }
 }).catch(()=>{});
}
function clearInk(){if(inkCtx)inkCtx.clearRect(0,0,800,800);last=null}
function stopDemo(){demoToken++}
function currentChar(){return mode==='number'?number[index]:kana[mode][index]}

function baseNumberSvg(ch){
 const paths=numberPaths[ch]||[];
 return '<svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">'+
 '<text x="512" y="720" text-anchor="middle" font-family="-apple-system,BlinkMacSystemFont,Hiragino Sans,Yu Gothic,sans-serif" font-size="'+(ch==='10'?620:760)+'" font-weight="700" fill="none" stroke="#c9d6dc" stroke-width="10">'+ch+'</text>'+
 '<g data-demo-strokes fill="none" stroke="#9dcfe8" stroke-width="54" stroke-linecap="round" stroke-linejoin="round" opacity=".42">'+
 paths.map((d,i)=>'<path data-stroke="'+i+'" d="'+d+'"/>').join('')+'</g></svg>';
}
function prepareKanaSvg(xml){
 if(!xml)return '';
 return xml.replace('<svg ','<svg class="tracesvg" ')
  .replace(/style="fill:var\(--shadow,#ccc\)"/,'style="fill:#dbe4e8;opacity:.42"')
  .replace(/style="stroke:var\(--stroke,#000\);fill:none;stroke-width:128;stroke-linecap:round"/,'style="stroke:#9dcfe8;fill:none;stroke-width:64;stroke-linecap:round;opacity:.48"');
}
async function renderCharacter(){
 const token=++demoToken,ch=currentChar();
 clearInk();
 label.textContent=ch+' を なぞってね';
 sub.textContent=mode==='number'?'おてほんを みて かいてみよう':(learnMode==='sequence'?'じゅんばんに れんしゅうしよう':'えらんだ もじを れんしゅうしよう');
 svgHost.innerHTML=mode==='number'?baseNumberSvg(ch):'<div class="traceload">よみこみちゅう…</div>';
 if(mode!=='number'){
  const xml=await getKanaSvg(mode,ch);if(token!==demoToken)return;
  svgHost.innerHTML=xml?prepareKanaSvg(xml):'<div class="traceload">おてほんを よみこめなかったよ</div>';
 }
 updateButtons();
}
function updateButtons(){
 if(!controls)return;
 const pick=controls.querySelector('.tracepick');
 pick.style.display=mode==='number'||learnMode==='sequence'?'none':'';
}
async function demo(){
 const token=++demoToken,ch=currentChar(),b=controls.querySelector('.tracedemo');
 b.disabled=true;b.textContent='おてほん さいせいちゅう';
 if(mode==='number'){
  svgHost.innerHTML=baseNumberSvg(ch);
  const strokes=[...svgHost.querySelectorAll('[data-demo-strokes]>path')];
  strokes.forEach(p=>{const len=p.getTotalLength();p.style.opacity='1';p.style.stroke='#55bff5';p.style.strokeWidth='72';p.style.strokeDasharray=len;p.style.strokeDashoffset=len});
  for(const p of strokes){
   if(token!==demoToken)break;
   const len=p.getTotalLength(),ms=Math.max(650,Math.min(1500,len*1.45));
   await p.animate([{strokeDashoffset:len},{strokeDashoffset:0}],{duration:ms,easing:'linear',fill:'forwards'}).finished.catch(()=>{});
   await sleep(180);
  }
 }else{
  const xml=await getKanaSvg(mode,ch);if(token!==demoToken){b.disabled=false;b.textContent='おてほん';return}
  svgHost.innerHTML=prepareKanaSvg(xml);
  const group=svgHost.querySelector('[data-strokesvg="strokes"]');
  const strokes=group?[...group.children]:[];
  for(const stroke of strokes){
   if(token!==demoToken)break;
   const ps=stroke.matches('path')?[stroke]:[...stroke.querySelectorAll('path')];
   const jobs=ps.map(p=>{
    const len=p.getTotalLength();p.style.opacity='1';p.style.stroke='#55bff5';p.style.strokeWidth='82';p.style.strokeDasharray=len;p.style.strokeDashoffset=len;
    return p.animate([{strokeDashoffset:len},{strokeDashoffset:0}],{duration:Math.max(600,Math.min(1500,len*1.5)),easing:'linear',fill:'forwards'}).finished.catch(()=>{});
   });
   await Promise.all(jobs);await sleep(170);
  }
 }
 if(token===demoToken){await sleep(500);await renderCharacter()}
 b.disabled=false;b.textContent='おてほん';
}
function showPicker(){
 stopDemo();game.innerHTML='';
 const box=document.createElement('div');box.className='tracepicker';
 const title=document.createElement('div');title.className='tracepicktitle';title.textContent=(mode==='hira'?'ひらがな':'かたかな')+'を えらんでね';
 const grid=document.createElement('div');grid.className='tracekanagrid';
 const chars=kana[mode];
 chars.forEach(ch=>{const b=document.createElement('button');b.className='tracekanabtn';b.textContent=ch;b.onclick=()=>{index=chars.indexOf(ch);learnMode='pick';buildBoard()} ;grid.appendChild(b)});
 const seq=document.createElement('button');seq.className='traceseq';seq.textContent='あから じゅんばんに やる';seq.onclick=()=>{learnMode='sequence';index=0;buildBoard()};
 box.append(title,grid,seq);game.appendChild(box);
}
function chooseKanaMode(){
 stopDemo();game.innerHTML='';
 const box=document.createElement('div');box.className='tracechoose';
 const t=document.createElement('div');t.className='tracepicktitle';t.textContent='どうやって れんしゅうする？';
 const seq=document.createElement('button');seq.className='tracechoosebtn';seq.innerHTML='➡️<br>あから じゅんばん';
 seq.onclick=()=>{learnMode='sequence';index=0;buildBoard()};
 const pick=document.createElement('button');pick.className='tracechoosebtn';pick.innerHTML='🔤<br>ごじゅうおんから えらぶ';
 pick.onclick=()=>{learnMode='pick';showPicker()};
 box.append(t,seq,pick);game.appendChild(box);
}
function buildBoard(){
 stopDemo();game.innerHTML='';
 wrap=document.createElement('div');wrap.className='tracebox';
 const tabs=document.createElement('div');tabs.className='tracetabs';
 tabs.innerHTML='<button class="tracetab" data-mode="number">すうじ</button><button class="tracetab" data-mode="hira">ひらがな</button><button class="tracetab" data-mode="kata">かたかな</button>';
 tabs.querySelector('[data-mode="'+mode+'"]').classList.add('active');
 label=document.createElement('div');label.className='tracelabel';
 sub=document.createElement('div');sub.className='traceorder';
 const board=document.createElement('div');board.className='traceboard';
 svgHost=document.createElement('div');svgHost.className='traceguidehost';
 ink=document.createElement('canvas');ink.className='tracecanvas traceink';ink.width=800;ink.height=800;inkCtx=ink.getContext('2d');
 board.append(svgHost,ink);
 controls=document.createElement('div');controls.className='tracectrl tracefour';
 controls.innerHTML='<button class="tracedemo">おてほん</button><button class="traceclear">けす</button><button class="traceprev">まえへ</button><button class="tracenext">つぎへ</button><button class="tracepick">もじを えらぶ</button>';
 wrap.append(tabs,label,sub,board,controls);game.appendChild(wrap);

 tabs.querySelectorAll('.tracetab').forEach(x=>x.onclick=()=>{mode=x.dataset.mode;index=0;stopDemo();if(mode==='number'){learnMode='sequence';buildBoard()}else chooseKanaMode()});
 controls.querySelector('.tracedemo').onclick=demo;
 controls.querySelector('.traceclear').onclick=clearInk;
 controls.querySelector('.tracepick').onclick=showPicker;
 controls.querySelector('.traceprev').onclick=()=>{
  stopDemo();
  if(mode==='number'){index=(index-1+number.length)%number.length;renderCharacter()}
  else if(learnMode==='sequence'){index=(index-1+kana[mode].length)%kana[mode].length;renderCharacter()}
  else showPicker();
 };
 controls.querySelector('.tracenext').onclick=()=>{
  stopDemo();
  if(mode==='number'){index=(index+1)%number.length;renderCharacter()}
  else if(learnMode==='sequence'){index=(index+1)%kana[mode].length;renderCharacter()}
  else showPicker();
 };

 function pos(e){const r=ink.getBoundingClientRect();return{x:(e.clientX-r.left)*800/r.width,y:(e.clientY-r.top)*800/r.height}}
 ink.addEventListener('pointerdown',e=>{drawing=true;last=pos(e);ink.setPointerCapture?.(e.pointerId);inkCtx.beginPath();inkCtx.arc(last.x,last.y,9,0,Math.PI*2);inkCtx.fillStyle='#111';inkCtx.fill()});
 ink.addEventListener('pointermove',e=>{if(!drawing)return;const p=pos(e);inkCtx.beginPath();inkCtx.moveTo(last.x,last.y);inkCtx.lineTo(p.x,p.y);inkCtx.strokeStyle='#111';inkCtx.lineWidth=20;inkCtx.lineCap='round';inkCtx.lineJoin='round';inkCtx.stroke();last=p});
 const stop=()=>{drawing=false;last=null};ink.addEventListener('pointerup',stop);ink.addEventListener('pointercancel',stop);ink.addEventListener('pointerleave',e=>{if(e.buttons===0)stop()});
 renderCharacter();
}
function open(){
 mode='number';index=0;learnMode='sequence';playMenu.style.display='none';miniArea.style.display='block';
 miniArea.classList.remove('hide-mode','riddle-mode','maze-mode','math-mode');miniArea.classList.add('trace-mode');
 miniTitle.textContent='なぞって かこう';start.style.display='none';gameMsg.textContent='';buildBoard();prefetchKana();
}
btn.onclick=open;
miniBack.addEventListener('click',()=>{stopDemo();miniArea.classList.remove('trace-mode')});
})();