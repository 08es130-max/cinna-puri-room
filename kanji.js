(()=>{
const btn=document.querySelector('.minisel[data-mini="kanji"]');
const playMenu=document.getElementById('playMenu'),miniArea=document.getElementById('miniArea'),miniTitle=document.getElementById('miniTitle'),game=document.getElementById('game'),start=document.getElementById('start'),gameMsg=document.getElementById('gameMsg'),miniBack=document.getElementById('miniBack');
if(!btn||!playMenu||!miniArea||!game)return;

const levels={
 easy:[
  {k:'山',r:'やま',s:'きょうは 山 に のぼります。',w:['やま','かわ','そら','もり'],m:'たかく もりあがった ところだよ。'},
  {k:'川',r:'かわ',s:'川 で さかなを みつけたよ。',w:['かわ','やま','うみ','みち'],m:'みずが ながれている ところだよ。'},
  {k:'日',r:'ひ',s:'お 日 さまが でているよ。',w:['ひ','つき','ほし','そら'],m:'そらを あかるく てらすよ。'},
  {k:'月',r:'つき',s:'よるに 月 が みえたよ。',w:['つき','ひ','ほし','くも'],m:'よるの そらで ひかって みえるよ。'},
  {k:'人',r:'ひと',s:'あそこに 人 が いるよ。',w:['ひと','いぬ','とり','くるま'],m:'わたしたちの ことだよ。'},
  {k:'口',r:'くち',s:'口 を あけて たべよう。',w:['くち','め','みみ','はな'],m:'たべたり おはなししたり する ところだよ。'},
  {k:'目',r:'め',s:'目 で よく みてね。',w:['め','て','あし','くち'],m:'ものを みる ところだよ。'},
  {k:'手',r:'て',s:'手 を きれいに あらおう。',w:['て','め','あし','みみ'],m:'ものを もったり さわったり するよ。'},
  {k:'足',r:'あし',s:'足 で げんきに あるこう。',w:['あし','て','くち','め'],m:'あるいたり はしったり するときに つかうよ。'},
  {k:'大',r:'おお',s:'大 きな ぞうが いるよ。',w:['おお','ちい','なが','たか'],m:'おおきい という いみだよ。'},
  {k:'小',r:'ちい',s:'小 さな ねこが いるよ。',w:['ちい','おお','あか','しろ'],m:'ちいさい という いみだよ。'},
  {k:'上',r:'うえ',s:'つくえの 上 に ほんが あるよ。',w:['うえ','した','なか','そと'],m:'たかい ほうを あらわすよ。'},
  {k:'下',r:'した',s:'いすの 下 に ぼーるが あるよ。',w:['した','うえ','みぎ','ひだり'],m:'ひくい ほうを あらわすよ。'},
  {k:'中',r:'なか',s:'はこの 中 に おもちゃが あるよ。',w:['なか','そと','うえ','した'],m:'ものの うちがわを あらわすよ。'}
 ],
 normal:[
  {k:'空',r:'そら',s:'青い 空 を みあげたよ。',w:['そら','うみ','かわ','やま'],m:'わたしたちの うえに ひろがっているよ。'},
  {k:'雨',r:'あめ',s:'きょうは 雨 が ふっているよ。',w:['あめ','ゆき','かぜ','くも'],m:'そらから ふってくる みずだよ。'},
  {k:'花',r:'はな',s:'きれいな 花 が さいたよ。',w:['はな','くさ','き','み'],m:'しょくぶつに さく きれいな ぶぶんだよ。'},
  {k:'森',r:'もり',s:'森 には きが たくさん あるよ。',w:['もり','かわ','うみ','そら'],m:'きが たくさん はえている ところだよ。'},
  {k:'学校',r:'がっこう',s:'あしたは 学校 に いくよ。',w:['がっこう','こうえん','びょういん','えき'],m:'べんきょうしたり ともだちと すごしたり する ところだよ。'},
  {k:'先生',r:'せんせい',s:'先生 に おはようと いったよ。',w:['せんせい','ともだち','かぞく','おとな'],m:'いろいろな ことを おしえてくれる ひとだよ。'}
 ]};
let pool=[],qi=0,current=null,phase='quiz',drawings=[],charIndex=0,ink=null,ctx=null,drawing=false,last=null,demoToken=0;

const shuffle=a=>[...a].sort(()=>Math.random()-.5);
function sentenceHTML(q){return q.s.replace(q.k,'<strong class="kanjitarget">'+q.k+'</strong>')}
function chooseLevel(){
 game.innerHTML='<div class="kanjichoose"><div class="kanjihead">どの むずかしさに する？</div><button data-l="easy">🌱<b>かんたん</b><small>はじめての かんじ</small></button><button data-l="normal">🌼<b>ふつう</b><small>すこし ながい かんじも あるよ</small></button></div>';
 game.querySelectorAll('[data-l]').forEach(b=>b.onclick=()=>{pool=shuffle(levels[b.dataset.l]);qi=0;showQuiz()});
}
function showQuiz(){
 phase='quiz';current=pool[qi%pool.length];game.innerHTML='';
 const box=document.createElement('div');box.className='kanjiquiz';
 const n=document.createElement('div');n.className='kanjistep';n.textContent='よみかたを えらんでね';
 const sentence=document.createElement('div');sentence.className='kanjisentence';sentence.innerHTML=sentenceHTML(current);
 const choices=document.createElement('div');choices.className='kanjichoices';
 shuffle(current.w).forEach(x=>{const b=document.createElement('button');b.textContent=x;b.onclick=()=>answer(b,x);choices.appendChild(b)});
 const msg=document.createElement('div');msg.className='kanjimsg';
 box.append(n,sentence,choices,msg);game.appendChild(box);
}
function answer(b,x){
 const msg=game.querySelector('.kanjimsg');
 if(x!==current.r){b.classList.add('wrong');msg.textContent='もういちど！';setTimeout(()=>b.classList.remove('wrong'),500);return}
 game.querySelectorAll('.kanjichoices button').forEach(x=>x.disabled=true);b.classList.add('right');
 msg.innerHTML='せいかい！<br><b>'+current.k+'（'+current.r+'）</b><br><small>'+current.m+'</small>';
 const go=document.createElement('button');go.className='kanjipractice';go.textContent='✏️ なぞって かいてみる';go.onclick=startPractice;msg.appendChild(go);
}
function guideSvg(ch){
 return '<svg viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg"><text x="400" y="610" text-anchor="middle" font-family="Hiragino Sans,Yu Gothic,sans-serif" font-size="600" font-weight="600" fill="#eef1f2" stroke="#cdd7dc" stroke-width="4">'+ch+'</text></svg>';
}
function startPractice(){phase='practice';charIndex=0;drawings=Array([...current.k].length).fill(null);showPractice()}
function showPractice(){
 const chars=[...current.k],ch=chars[charIndex];game.innerHTML='';
 const box=document.createElement('div');box.className='kanjitrace';
 const top=document.createElement('div');top.className='kanjitracetop';top.innerHTML='<b>'+current.k+'（'+current.r+'）</b><span>'+chars.map((c,i)=>i===charIndex?'【'+c+'】':c).join('')+'</span>';
 const board=document.createElement('div');board.className='kanjiboard';board.innerHTML='<div class="kanjiguide">'+guideSvg(ch)+'</div>';
 ink=document.createElement('canvas');ink.width=800;ink.height=800;ink.className='kanjiink';board.appendChild(ink);ctx=ink.getContext('2d');
 const controls=document.createElement('div');controls.className='kanjictrl';
 const demo=document.createElement('button');demo.textContent='おてほん';demo.onclick=()=>showStrokeDemo(ch,demo);
 const clear=document.createElement('button');clear.textContent='けす';clear.onclick=()=>ctx.clearRect(0,0,800,800);
 const next=document.createElement('button');next.textContent=charIndex===chars.length-1?'できた':'つぎへ';next.onclick=()=>{saveDrawing();if(charIndex===chars.length-1)showDone();else{charIndex++;showPractice()}};
 controls.append(demo,clear,next);box.append(top,board,controls);game.appendChild(box);bindInk();
}
function bindInk(){
 const pos=e=>{const r=ink.getBoundingClientRect();return{x:(e.clientX-r.left)*800/r.width,y:(e.clientY-r.top)*800/r.height}};
 ink.onpointerdown=e=>{drawing=true;last=pos(e);ink.setPointerCapture?.(e.pointerId);ctx.beginPath();ctx.arc(last.x,last.y,9,0,Math.PI*2);ctx.fillStyle='#111';ctx.fill()};
 ink.onpointermove=e=>{if(!drawing)return;const p=pos(e);ctx.beginPath();ctx.moveTo(last.x,last.y);ctx.lineTo(p.x,p.y);ctx.strokeStyle='#111';ctx.lineWidth=20;ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke();last=p};
 ink.onpointerup=ink.onpointercancel=()=>{drawing=false;last=null};
}
function saveDrawing(){drawings[charIndex]=ink.toDataURL('image/png')}
async function showStrokeDemo(ch,b){
 const token=++demoToken;b.disabled=true;b.textContent='よみこみちゅう…';
 const host=game.querySelector('.kanjiguide');
 try{
  const cp=ch.codePointAt(0).toString(16).padStart(5,'0');
  const res=await fetch('https://cdn.jsdelivr.net/npm/kanjivg@2023.8.2/kanji/'+cp+'.svg');
  if(!res.ok)throw 0;const txt=await res.text();if(token!==demoToken)return;
  host.innerHTML=txt;const svg=host.querySelector('svg');if(svg){svg.removeAttribute('width');svg.removeAttribute('height');}
  const paths=[...host.querySelectorAll('path[id*="kvg:"]')];
  const usable=paths.filter(p=>{try{return p.getTotalLength()>5}catch(e){return false}});
  usable.forEach(p=>{const l=p.getTotalLength();p.style.fill='none';p.style.stroke='#cdd7dc';p.style.strokeWidth='5';p.style.strokeLinecap='round';p.style.strokeDasharray=l;p.style.strokeDashoffset=l});
  host.getBoundingClientRect();
  for(const p of usable){if(token!==demoToken)break;const l=p.getTotalLength();p.style.stroke='#55bff5';await p.animate([{strokeDashoffset:l},{strokeDashoffset:0}],{duration:650,easing:'linear',fill:'forwards'}).finished.catch(()=>{});await new Promise(r=>setTimeout(r,120))}
 }catch(e){host.innerHTML=guideSvg(ch)}
 b.disabled=false;b.textContent='おてほん';
}
function showDone(){
 saveDrawing();game.innerHTML='';
 const box=document.createElement('div');box.className='kanjidone';
 box.innerHTML='<div class="kanjidonetitle">かけたよ！</div><div class="kanjidoneword">'+current.k+'（'+current.r+'）</div>';
 const row=document.createElement('div');row.className='kanjidonerow';
 [...current.k].forEach((ch,i)=>{const c=document.createElement('div');c.className='kanjidonechar';const im=document.createElement('img');if(drawings[i])im.src=drawings[i];const sp=document.createElement('span');sp.textContent=ch;c.append(im,sp);row.appendChild(c)});
 const next=document.createElement('button');next.className='kanjinext';next.textContent='つぎの もんだい';next.onclick=()=>{qi++;showQuiz()};
 box.append(row,next);game.appendChild(box);
}
function open(){
 playMenu.style.display='none';miniArea.style.display='block';
 miniArea.classList.remove('hide-mode','riddle-mode','maze-mode','math-mode','trace-mode');miniArea.classList.add('kanji-mode');
 miniTitle.textContent='かんじを よもう';start.style.display='none';gameMsg.style.display='none';chooseLevel();
}
btn.onclick=open;
miniBack.addEventListener('click',()=>{demoToken++;miniArea.classList.remove('kanji-mode')});
})();