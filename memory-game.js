(()=>{
const btn=document.querySelector('.minisel[data-mini="memory"]'),playMenu=document.getElementById('playMenu'),miniArea=document.getElementById('miniArea'),miniTitle=document.getElementById('miniTitle'),game=document.getElementById('game'),start=document.getElementById('start'),gameMsg=document.getElementById('gameMsg'),miniBack=document.getElementById('miniBack');
if(!btn)return;
const all=[
 {id:'cinna',html:'<img src="./assets/cinnamoroll.webp" alt="しなもろーる">'},
 {id:'puri',html:'<img src="./assets/pompompurin.webp" alt="ぽむぽむぷりん">'},
 {id:'apple',html:'🍎'},{id:'banana',html:'🍌'},{id:'grape',html:'🍇'},{id:'strawberry',html:'🍓'},
 {id:'orange',html:'🍊'},{id:'melon',html:'🍈'},{id:'peach',html:'🍑'},{id:'cherry',html:'🍒'},
 {id:'pineapple',html:'🍍'},{id:'watermelon',html:'🍉'},{id:'pear',html:'🍐'},{id:'lemon',html:'🍋'},{id:'kiwi',html:'🥝'}
];
let opened=[],matched=0,lock=false,pairs=3,turns=0;
const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
function choose(){
 miniArea.className='memory-mode';miniTitle.textContent='🃏 しんけいすいじゃく';start.style.display='none';gameMsg.style.display='none';
 game.innerHTML='<div class="memory-intro"><b>おなじ えを 2まい みつけよう！</b><div class="memory-levels"><button data-pairs="6">🌱 かんたん<br><small>12まい</small></button><button data-pairs="10">🌼 ふつう<br><small>20まい</small></button><button data-pairs="15">🔥 むずかしい<br><small>30まい</small></button></div></div>';
 game.querySelectorAll('[data-pairs]').forEach(b=>b.onclick=()=>begin(Number(b.dataset.pairs)));
}
function begin(n){
 pairs=n;opened=[];matched=0;lock=false;turns=0;
 let pool=[all[0],all[1],...shuffle(all.slice(2)).slice(0,n-2)];
 const cards=shuffle(pool.flatMap(x=>[{...x,key:x.id+'a'},{...x,key:x.id+'b'}]));
 miniTitle.textContent='🃏 しんけいすいじゃく';
 const best=Number(localStorage.getItem('memoryBest_'+n)||0);
 game.innerHTML='<div class="memory-top"><span><b><span id="memoryTurns">0</span>かい</b><small>べすと <span id="memoryBest">'+(best||'--')+'</span>かい</small></span><b><span id="memoryLeft">'+n+'</span>くみ</b></div><div class="memory-grid memory-'+cards.length+'">'+cards.map((x,i)=>'<button class="memory-card" data-i="'+i+'" data-id="'+x.id+'"><span class="memory-back">？</span><span class="memory-face '+(x.id==='cinna'||x.id==='puri'?'memory-character':'memory-fruit')+'">'+x.html+'</span></button>').join('')+'</div>';
 const cs=[...game.querySelectorAll('.memory-card')];
 cs.forEach(card=>card.onclick=()=>{
   if(lock||card.classList.contains('open')||card.classList.contains('matched'))return;
   card.classList.add('open');opened.push(card);
   if(opened.length===2){
    lock=true;const [a,b]=opened;
    if(a.dataset.id===b.dataset.id){
      setTimeout(()=>{a.classList.add('matched');b.classList.add('matched');opened=[];matched++;lock=false;document.getElementById('memoryLeft').textContent=n-matched;if(matched===n)finish()},420);
    }else{turns++;document.getElementById('memoryTurns').textContent=turns;setTimeout(()=>{a.classList.remove('open');b.classList.remove('open');opened=[];lock=false},850);}
   }
 });
}
function finish(){
 const key='memoryBest_'+pairs,old=Number(localStorage.getItem(key)||0);
 if(!old||turns<old)localStorage.setItem(key,String(turns));
 const best=Number(localStorage.getItem(key)||turns);
 game.insertAdjacentHTML('beforeend','<div class="memory-clear"><div class="memory-clear-box">🎉 ぜんぶ みつけた！<div class="memory-result">'+turns+'かい　べすと '+best+'かい</div><button id="memoryAgain">もういちど</button><button id="memoryLevel">なんいどを えらぶ</button></div></div>');
 document.getElementById('memoryAgain').onclick=()=>begin(pairs);
 document.getElementById('memoryLevel').onclick=choose;
}
btn.onclick=()=>{playMenu.style.display='none';miniArea.style.display='block';choose()};
miniBack.addEventListener('click',()=>{if(miniArea.classList.contains('memory-mode'))miniArea.classList.remove('memory-mode')});
})();