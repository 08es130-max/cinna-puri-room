(()=>{
const btn=document.querySelector('.minisel[data-mini="trace"]');
const playMenu=document.getElementById('playMenu'),miniArea=document.getElementById('miniArea'),miniTitle=document.getElementById('miniTitle'),game=document.getElementById('game'),start=document.getElementById('start'),gameMsg=document.getElementById('gameMsg'),miniBack=document.getElementById('miniBack');
if(!btn||!playMenu||!miniArea||!game)return;

/* かなのかきじゅんは strokesvg (MIT / Klee One: SIL OFL 1.1) のSVGを利用 */
const kana={
 hira:[...'あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん'],
 kata:[...'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン']
};
const number=[...'123456789','10'];
const words={
 greeting:['おはよう','ありがとう','こんにちは','おやすみ','いただきます','ごちそうさま','いってきます','ただいま','ごめんなさい','だいすき'],
 animal:['ねこ','いぬ','うさぎ','ぞう','きりん','ぱんだ','さかな','いるか','ライオン','ペンギン','コアラ'],
 food:['りんご','いちご','すいか','おにぎり','カレー','パン','プリン','ケーキ','アイス','ハンバーグ'],
 char:['シナモロール','ポムポムプリン']
};
const wordLabels={greeting:'あいさつ',animal:'どうぶつ',food:'たべもの',char:'きゃら'};
const numberPaths={
 '1':['M365 290 L470 205 L470 825'],
 '2':['M300 330 C330 180 650 175 710 315 C770 455 610 560 305 805 L735 805'],
 '3':['M305 255 C455 155 700 190 700 335 C700 445 590 500 455 500','M455 500 C610 500 730 565 710 705 C685 875 415 885 290 770'],
 '4':['M620 190 L285 610 L760 610','M620 190 L620 845'],
 '5':['M700 205 L330 205 L305 475','M305 475 C405 405 660 425 710 600 C770 815 500 900 285 785'],
 '6':['M675 225 C465 165 285 360 285 610 C285 845 610 900 720 705 C815 535 565 395 320 535'],
 '7':['M275 220 L755 220','M710 245 C590 420 490 615 430 845'],
 '8':['M500 205 C335 205 285 345 365 445 C430 525 575 555 655 650 C750 765 650 865 500 865 C345 865 250 760 345 645 C425 548 570 520 640 435 C720 335 660 205 500 205'],
 '9':['M685 505 C600 625 325 610 300 400 C275 190 605 130 710 320 C820 520 690 770 395 860'],
 '10':['M180 290 L270 215 L270 825','M650 205 C475 205 430 355 430 515 C430 680 475 830 650 830 C825 830 870 680 870 515 C870 355 825 205 650 205']
};

let mode='number',index=0,learnMode='sequence',drawing=false,last=null,demoToken=0,svgHost=null,ink=null,inkCtx=null,label=null,sub=null,controls=null,wrap=null;
let word='',wordIndex=0,wordDrawings=[],wordCategory='greeting';

const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const charType=ch=>/^[ぁ-ゖゝゞ]$/.test(ch)?'hira':(/^[ァ-ヺヽヾ]$/.test(ch)?'kata':'special');
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
function currentChar(){
 if(mode==='number')return number[index];
 if(mode==='word')return [...word][wordIndex]||'';
 return kana[mode][index];
}
function specialSvg(ch){
 if(ch==='ー')return '<svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg"><path d="M220 515 L805 515" fill="none" stroke="#cfdce2" stroke-width="82" stroke-linecap="round"/><g data-demo-strokes><path d="M220 515 L805 515" fill="none" stroke="#55bff5" stroke-width="74" stroke-linecap="round"/></g></svg>';
 return '<svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg"><text x="512" y="720" text-anchor="middle" font-family="-apple-system,BlinkMacSystemFont,Hiragino Sans,Yu Gothic,sans-serif" font-size="720" font-weight="600" fill="none" stroke="#cfdce2" stroke-width="10">'+ch+'</text></svg>';
}
function baseNumberSvg(ch){
 const paths=numberPaths[ch]||[];
 return '<svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">'+
 '<g data-number-guide fill="none" stroke="#cfdce2" stroke-width="78" stroke-linecap="round" stroke-linejoin="round" opacity=".62">'+
 paths.map(d=>'<path d="'+d+'"/>').join('')+'</g>'+
 '<g data-demo-strokes fill="none" stroke="#55bff5" stroke-width="72" stroke-linecap="round" stroke-linejoin="round">'+
 paths.map((d,i)=>'<path data-stroke="'+i+'" d="'+d+'"/>').join('')+'</g></svg>';
}
function prepareKanaSvg(xml){
 if(!xml)return '';
 return xml.replace('<svg ','<svg class="tracesvg" ')
  .replace(/style="fill:var\(--shadow,#ccc\)"/,'style="fill:#dbe4e8;opacity:.42"')
  .replace(/style="stroke:var\(--stroke,#000\);fill:none;stroke-width:128;stroke-linecap:round"/,'style="stroke:#9dcfe8;fill:none;stroke-width:64;stroke-linecap:round;opacity:.48"');
}
async function getGuideSvg(ch){
 if(mode==='number')return baseNumberSvg(ch);
 const t=charType(ch);
 if(t==='special')return specialSvg(ch);
 const xml=await getKanaSvg(t,ch);
 return xml?prepareKanaSvg(xml):specialSvg(ch);
}
function wordProgress(){
 if(mode!=='word')return '';
 return [...word].map((ch,i)=>i===wordIndex?'【'+ch+'】':ch).join('');
}
async function renderCharacter(){
 const token=++demoToken,ch=currentChar();
 clearInk();
 label.textContent=ch+' を なぞってね';
 if(mode==='word')sub.textContent=wordProgress();
 else sub.textContent=mode==='number'?'おてほんを みて かいてみよう':(learnMode==='sequence'?'じゅんばんに れんしゅうしよう':'えらんだ もじを れんしゅうしよう');
 svgHost.innerHTML='<div class="traceload">よみこみちゅう…</div>';
 const svg=await getGuideSvg(ch);if(token!==demoToken)return;svgHost.innerHTML=svg;
 updateButtons();
}
function updateButtons(){
 if(!controls)return;
 const pick=controls.querySelector('.tracepick');
 if(pick)pick.style.display=(mode==='word'||(mode!=='number'&&learnMode==='pick'))?'':'none';
 const prev=controls.querySelector('.traceprev'),next=controls.querySelector('.tracenext');
 if(mode==='word'){
  prev.textContent=wordIndex===0?'ことば':'まえへ';
  next.textContent=wordIndex===[...word].length-1?'できた':'つぎへ';
 }else{prev.textContent='まえへ';next.textContent='つぎへ'}
}
function prepareAnimatedStrokes(root){
 const group=root.querySelector('[data-strokesvg="strokes"]');
 if(group){
  return [...group.children].map(stroke=>{
   const ps=stroke.matches('path')?[stroke]:[...stroke.querySelectorAll('path')];
   return ps.map(p=>{const len=p.getTotalLength();p.style.opacity='1';p.style.stroke='#55bff5';p.style.strokeWidth='82';p.style.strokeDasharray=len;p.style.strokeDashoffset=len;return{p,len}});
  });
 }
 const simple=[...root.querySelectorAll('[data-demo-strokes]>path')];
 return simple.map(p=>{const len=p.getTotalLength();p.style.opacity='1';p.style.stroke='#55bff5';p.style.strokeWidth='74';p.style.strokeDasharray=len;p.style.strokeDashoffset=len;return[{p,len}]});
}
async function demo(){
 const token=++demoToken,ch=currentChar(),b=controls.querySelector('.tracedemo');
 b.disabled=true;b.textContent='おてほん さいせいちゅう';
 svgHost.innerHTML=await getGuideSvg(ch);if(token!==demoToken){b.disabled=false;b.textContent='おてほん';return}
 const prepared=prepareAnimatedStrokes(svgHost);
 await new Promise(requestAnimationFrame);
 for(const items of prepared){
  if(token!==demoToken)break;
  const jobs=items.map(({p,len})=>p.animate([{strokeDashoffset:len},{strokeDashoffset:0}],{duration:Math.max(600,Math.min(1500,len*1.5)),easing:'linear',fill:'forwards'}).finished.catch(()=>{}));
  await Promise.all(jobs);await sleep(170);
 }
 if(token===demoToken){await sleep(500);await renderCharacter()}
 b.disabled=false;b.textContent='おてほん';
}
function showPicker(){
 stopDemo();game.innerHTML='';
 const box=document.createElement('div');box.className='tracepicker';
 const title=document.createElement('div');title.className='tracepicktitle';title.textContent=(mode==='hira'?'ひらがな':'かたかな')+'を えらんでね';
 const grid=document.createElement('div');grid.className='tracekanagrid';
 kana[mode].forEach(ch=>{const b=document.createElement('button');b.className='tracekanabtn';b.textContent=ch;b.onclick=()=>{index=kana[mode].indexOf(ch);learnMode='pick';buildBoard()};grid.appendChild(b)});
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
function chooseWordCategory(){
 stopDemo();game.innerHTML='';
 const box=document.createElement('div');box.className='wordchoose';
 const t=document.createElement('div');t.className='tracepicktitle';t.textContent='どんな ことばを かく？';
 const grid=document.createElement('div');grid.className='wordcatgrid';
 [['greeting','👋','あいさつ'],['animal','🐶','どうぶつ'],['food','🍎','たべもの'],['char','⭐','きゃら']].forEach(([k,ic,tx])=>{
  const b=document.createElement('button');b.className='wordcat';b.innerHTML='<span>'+ic+'</span><b>'+tx+'</b>';b.onclick=()=>showWordList(k);grid.appendChild(b);
 });
 box.append(t,grid);game.appendChild(box);
}
function showWordList(cat){
 stopDemo();wordCategory=cat;game.innerHTML='';
 const box=document.createElement('div');box.className='wordlistbox';
 const t=document.createElement('div');t.className='tracepicktitle';t.textContent=wordLabels[cat]+'から えらんでね';
 const grid=document.createElement('div');grid.className='wordlist';
 words[cat].forEach(w=>{const b=document.createElement('button');b.className='wordbtn';b.textContent=w;b.onclick=()=>startWord(w);grid.appendChild(b)});
 const back=document.createElement('button');back.className='traceseq';back.textContent='もどる';back.onclick=chooseWordCategory;
 box.append(t,grid,back);game.appendChild(box);
}
function startWord(w){
 word=w;wordIndex=0;wordDrawings=Array([...word].length).fill(null);buildBoard();
}
function saveWordDrawing(){
 if(mode!=='word'||!ink)return;
 wordDrawings[wordIndex]=ink.toDataURL('image/png');
}
function showWordResult(){
 stopDemo();saveWordDrawing();game.innerHTML='';
 const box=document.createElement('div');box.className='wordresult';
 const t=document.createElement('div');t.className='wordresulttitle';t.textContent='かけたよ！';
 const w=document.createElement('div');w.className='wordresultword';w.textContent=word;
 const row=document.createElement('div');row.className='wordresultrow';
 [...word].forEach((ch,i)=>{
  const c=document.createElement('div');c.className='wordresultchar';
  const img=document.createElement('img');if(wordDrawings[i])img.src=wordDrawings[i];img.alt=ch;
  const cap=document.createElement('span');cap.textContent=ch;c.append(img,cap);row.appendChild(c);
 });
 const again=document.createElement('button');again.className='traceseq';again.textContent='もういちど かく';again.onclick=()=>startWord(word);
 const choose=document.createElement('button');choose.className='traceseq wordback';choose.textContent='ほかの ことばを えらぶ';choose.onclick=()=>showWordList(wordCategory);
 box.append(t,w,row,again,choose);game.appendChild(box);
}
function buildBoard(){
 stopDemo();game.innerHTML='';
 wrap=document.createElement('div');wrap.className='tracebox';
 const tabs=document.createElement('div');tabs.className='tracetabs tracefive';
 tabs.innerHTML='<button class="tracetab" data-mode="number">すうじ</button><button class="tracetab" data-mode="hira">ひらがな</button><button class="tracetab" data-mode="kata">かたかな</button><button class="tracetab" data-mode="word">ことば</button>';
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

 tabs.querySelectorAll('.tracetab').forEach(x=>x.onclick=()=>{
  const m=x.dataset.mode;stopDemo();
  if(m==='word'){mode='word';chooseWordCategory();return}
  mode=m;index=0;
  if(mode==='number'){learnMode='sequence';buildBoard()}else chooseKanaMode();
 });
 controls.querySelector('.tracedemo').onclick=demo;
 controls.querySelector('.traceclear').onclick=clearInk;
 controls.querySelector('.tracepick').onclick=()=>mode==='word'?showWordList(wordCategory):showPicker();
 controls.querySelector('.traceprev').onclick=()=>{
  stopDemo();
  if(mode==='word'){
   if(wordIndex===0){showWordList(wordCategory);return}
   saveWordDrawing();wordIndex--;renderCharacter();return;
  }
  if(mode==='number'){index=(index-1+number.length)%number.length;renderCharacter()}
  else if(learnMode==='sequence'){index=(index-1+kana[mode].length)%kana[mode].length;renderCharacter()}
  else showPicker();
 };
 controls.querySelector('.tracenext').onclick=()=>{
  stopDemo();
  if(mode==='word'){
   saveWordDrawing();
   if(wordIndex>=[...word].length-1){showWordResult();return}
   wordIndex++;renderCharacter();return;
  }
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