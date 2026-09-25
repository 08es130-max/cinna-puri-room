(()=>{
const btn=document.querySelector('.minisel[data-mini="math"]');
const playMenu=document.getElementById('playMenu'),miniArea=document.getElementById('miniArea'),miniTitle=document.getElementById('miniTitle'),game=document.getElementById('game'),start=document.getElementById('start'),gameMsg=document.getElementById('gameMsg'),miniBack=document.getElementById('miniBack');
if(!btn||!playMenu||!miniArea||!game)return;

let mode='easy',solved=false,current=null;
const pick=a=>a[Math.floor(Math.random()*a.length)];
const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const cheers=['がんばれー！','ゆっくり かんがえよう♪','きっと できるよ！','いっしょに やってみよう♪'];
const wins=['すごーい！','だいせいかい！','やったー！','よく できたね♪'];
const retry=['おしいよ！ もういちど！','だいじょうぶ♪ もういちど かんがえよう','もうすこし！ がんばれー！','おしい！ もういっかい♪'];
const icons=['🍎','⭐','🍓','🍪','🐟','🌼','🧸','🍮','🚗','🎈'];

function setup(){
 game.innerHTML='';
 const box=document.createElement('div');box.className='mathsetup';
 box.innerHTML='<div class="mathlabel">どれで あそぶ？</div><div class="mathdiffs">'+
 '<button class="mathdiff easy" data-mode="easy">🌱 かんたん<br><small>かずを かぞえる</small></button>'+
 '<button class="mathdiff normal" data-mode="normal">➕ ふつう<br><small>たしざん</small></button>'+
 '<button class="mathdiff hard" data-mode="hard">🧠 むずかしい<br><small>たしざん と ひきざん</small></button>'+
 '</div>';
 box.querySelectorAll('.mathdiff').forEach(b=>b.onclick=()=>{mode=b.dataset.mode;miniTitle.textContent='さんすう　'+b.textContent.trim().split('\n')[0].replace(/[🌱➕🧠]/g,'').trim();drawQuestion()});
 game.appendChild(box);
}

function makeQuestion(){
 if(mode==='easy'){
  const n=1+Math.floor(Math.random()*10),icon=pick(icons);
  return {answer:n,visual:Array(n).fill(icon).join(' '),formula:'いくつ あるかな？',explain:icon+'が '+n+'こ あるね'};
 }
 if(mode==='normal'){
  const a=1+Math.floor(Math.random()*9),b=1+Math.floor(Math.random()*Math.max(1,10-a));
  return {answer:a+b,visual:'',formula:a+' ＋ '+b+' ＝ ？',explain:a+'と '+b+'を あわせると '+(a+b)+'だよ'};
 }
 let subtract=Math.random()<.5;
 if(subtract){
  const a=5+Math.floor(Math.random()*16),b=1+Math.floor(Math.random()*Math.min(10,a-1));
  return {answer:a-b,visual:'',formula:a+' − '+b+' ＝ ？',explain:a+'から '+b+'を とると '+(a-b)+'だよ'};
 }else{
  const a=2+Math.floor(Math.random()*14),b=1+Math.floor(Math.random()*Math.max(1,20-a));
  return {answer:a+b,visual:'',formula:a+' ＋ '+b+' ＝ ？',explain:a+'と '+b+'を あわせると '+(a+b)+'だよ'};
 }
}

function choices(answer){
 const set=new Set([answer]);
 const offsets=shuffle([-3,-2,-1,1,2,3,4,-4]);
 for(const off of offsets){
  const v=answer+off;
  if(v>=0)set.add(v);
  if(set.size>=4)break;
 }
 while(set.size<4)set.add(set.size+answer+1);
 return shuffle([...set].slice(0,4));
}

function drawQuestion(){
 solved=false;current=makeQuestion();game.innerHTML='';
 const box=document.createElement('div');box.className='mathbox';
 const friends=document.createElement('div');friends.className='mathfriends';
 friends.innerHTML='<div class="mathfriend cinna"><img src="./assets/cinnamoroll.webp" alt="しなもろーる"><span class="mcinna">'+pick(cheers)+'</span></div><div class="mathfriend puri"><img src="./assets/pompompurin.webp" alt="ぽむぽむぷりん"><span class="mpuri">いっしょに かんがえよう〜！</span></div>';
 const q=document.createElement('div');q.className='mathquestion';
 if(current.visual){const v=document.createElement('div');v.className='mathvisual';v.textContent=current.visual;q.appendChild(v)}
 const f=document.createElement('div');f.className='mathformula';f.textContent=current.formula;q.appendChild(f);
 const answers=document.createElement('div');answers.className='mathanswers';
 const msg=document.createElement('div');msg.className='mathmsg';msg.textContent='こたえを えらんでね';
 const next=document.createElement('button');next.className='mathnext';next.textContent='つぎの もんだい';next.style.display='none';next.onclick=drawQuestion;
 choices(current.answer).forEach(ans=>{
  const b=document.createElement('button');b.className='mathanswer';b.textContent=ans;
  b.onclick=()=>{
   if(solved)return;
   if(ans===current.answer){
    solved=true;b.classList.add('correct');answers.querySelectorAll('button').forEach(x=>x.disabled=true);
    msg.textContent='せいかい！　'+current.explain;
    friends.querySelector('.mcinna').textContent=pick(wins);
    friends.querySelector('.mpuri').textContent='すごーい！ よく できたね〜♪';
    next.style.display='';
   }else{
    b.classList.add('wrong');setTimeout(()=>b.classList.remove('wrong'),500);
    msg.textContent=pick(retry);
    friends.querySelector('.mcinna').textContent='がんばれー！';
    friends.querySelector('.mpuri').textContent='もういちど えらんでみよう〜！';
   }
  };
  answers.appendChild(b);
 });
 box.append(friends,q,answers,msg,next);game.appendChild(box);
}

btn.onclick=()=>{
 playMenu.style.display='none';miniArea.style.display='block';miniArea.classList.remove('hide-mode','riddle-mode','maze-mode');miniArea.classList.add('math-mode');
 miniTitle.textContent='さんすう';start.style.display='none';gameMsg.textContent='';setup();
};
miniBack.addEventListener('click',()=>miniArea.classList.remove('math-mode'));
})();