(()=>{
const btn=document.querySelector('.minisel[data-mini="brain"]'),playMenu=document.getElementById('playMenu'),miniArea=document.getElementById('miniArea'),miniTitle=document.getElementById('miniTitle'),game=document.getElementById('game'),start=document.getElementById('start'),gameMsg=document.getElementById('gameMsg'),miniBack=document.getElementById('miniBack');
if(!btn||!game)return;
let mode='',level='easy',q=0,answer=null,locked=false;
const rnd=n=>Math.floor(Math.random()*n),pick=a=>a[rnd(a.length)],shuffle=a=>{a=[...a];for(let i=a.length-1;i;i--){const j=rnd(i+1);[a[i],a[j]]=[a[j],a[i]]}return a};
function shell(title,body){game.innerHTML='<div class="brainbox"><div class="brainhead">'+title+'</div>'+body+'<div id="brainMsg" class="brainmsg"></div></div>'}
function home(){mode='';miniTitle.textContent='かんがえる げーむ';shell('どれで あそぶ？','<div class="brainmenu"><button data-b="pattern">🔮<b>つぎは なに？</b><small>ならびの ひみつを みつけよう</small></button><button data-b="detective">🕵️<b>すうじ たんてい</b><small>ひんとから すうじを みつけよう</small></button><button data-b="blocks">🧊<b>なんこで できる？</b><small>つみきを かぞえよう</small></button></div>');game.querySelectorAll('[data-b]').forEach(b=>b.onclick=()=>choose(b.dataset.b))}
function choose(m){mode=m;shell(m==='pattern'?'つぎは なに？':m==='detective'?'すうじ たんてい':'なんこで できる？','<div class="brainlevels"><button data-l="easy">🌱<b>かんたん</b></button><button data-l="normal">🌼<b>ふつう</b></button><button data-l="hard">🔥<b>むずかしい</b></button></div><button class="brainback" id="brainHome">← げーむを えらぶ</button>');game.querySelectorAll('[data-l]').forEach(b=>b.onclick=()=>{level=b.dataset.l;q=0;next()});document.getElementById('brainHome').onclick=home}
function next(){locked=false;q++;game.classList.remove('brain-pattern','brain-detective','brain-blocks');game.classList.add('brain-'+mode);if(mode==='pattern')pattern();else if(mode==='detective')detective();else blocks()}
function choices(vals){return '<div class="brainchoices">'+vals.map(v=>'<button data-a="'+v+'">'+v+'</button>').join('')+'</div>'}
function bind(correct,explain){answer=String(correct);game.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>{if(locked)return;if(b.dataset.a===answer){locked=true;b.classList.add('correct');const m=document.getElementById('brainMsg');m.innerHTML='🎉 せいかい！<br><small>'+explain+'</small><br><button id="brainNext">つぎの もんだい</button>';document.getElementById('brainNext').onclick=next}else{b.classList.add('wrong');document.getElementById('brainMsg').textContent='おしい！ もういちど みてみよう'}})}
function pattern(){
 const colors=['🔴','🔵','🟡','🟢','🟣','🟠'],shapes=['●','▲','■','★','◆'],icons=[...colors,'⭐','❤️','▲','■'];
 let seq=[],ans,opts,why;
 if(level==='easy'){
  const a=pick(icons),b=pick(icons.filter(x=>x!==a));seq=[a,b,a,b,a,'？'];ans=b;opts=shuffle([a,b,...shuffle(icons.filter(x=>x!==a&&x!==b)).slice(0,2)]);why='2つの ならびが くりかえしているよ';
 }else if(level==='normal'){
  const pool=shuffle(icons),a=pool[0],b=pool[1],d=pool[2],kind=rnd(6);
  const patterns=[
   [a,b,a,b,a,'？'],
   [a,a,b,a,a,b,'？'],
   [a,b,b,a,b,b,'？'],
   [a,b,d,a,b,d,'？'],
   [a,a,b,d,a,a,b,'？'],
   [a,b,a,d,a,b,a,'？']
  ];
  seq=patterns[kind];
  const bases=[[a,b],[a,a,b],[a,b,b],[a,b,d],[a,a,b,d],[a,b,a,d]];
  const base=bases[kind],idx=seq.length-1;ans=base[idx%base.length];
  opts=shuffle([ans,...shuffle(icons.filter(x=>x!==ans)).slice(0,3)]);
  why=(base.length===2?'2こ':base.length===3?'3こ':'4こ')+'の ならびが くりかえしているよ';
 }else{
  const kind=rnd(4);
  if(kind===0){
   const s=1+rnd(3),step=pick([2,3,4]);seq=[s,s+step,s+step*2,s+step*3,'？'];ans=s+step*4;opts=shuffle([ans,ans+step,ans-step,ans+1]);why=step+'ずつ おおきく なっているよ';
  }else{
   const cs=shuffle(colors).slice(0,kind===1?3:4),ss=shuffle(shapes).slice(0,kind===3?3:2),items=[];
   for(let i=0;i<6;i++){const col=cs[i%cs.length],sh=ss[Math.floor(i/cs.length)%ss.length];items.push('<span class="combo"><i>'+col+'</i><b>'+sh+'</b></span>')}
   const ci=6%cs.length,si=Math.floor(6/cs.length)%ss.length;ans=cs[ci]+'|'+ss[si];seq=[...items,'？'];
   const candidates=[];for(const co of cs)for(const sh of ss)candidates.push(co+'|'+sh);
   opts=shuffle([ans,...shuffle(candidates.filter(x=>x!==ans)).slice(0,3)]).map(x=>{const [co,sh]=x.split('|');return '<span class="combo"><i>'+co+'</i><b>'+sh+'</b></span>'});
   why='いろと かたちの 2つの きまりを みつけよう';
  }
 }
 shell('もんだい '+q,'<div class="brainquestion">つぎに くるのは？</div><div class="patternrow pattern'+seq.length+'">'+seq.map(x=>'<span>'+x+'</span>').join('')+'</div>'+choices(opts));bind(ans,why)
}
function detective(){
 let n,min,max,hints=[];
 if(level==='easy'){n=1+rnd(10);hints=['🔎 '+Math.max(0,n-2)+'より おおきい','🔎 '+Math.min(11,n+2)+'より ちいさい']}
 else if(level==='normal'){n=2+rnd(18);hints=['🔎 '+(n-1)+'より おおきい','🔎 '+(n+2)+'より ちいさい',n%2===0?'🔎 2こずつ わけられる':'🔎 2こずつ わけると 1こ あまる']}
 else{n=4+rnd(26);const tens=Math.floor(n/10)*10;hints=['🔎 '+Math.max(0,tens-1)+'より おおきい','🔎 '+(tens+10)+'より ちいさい',n%2===0?'🔎 ぐうすう':'🔎 きすう','🔎 1のくらいは '+(n%10)]}
 const wrong=new Set();while(wrong.size<3){let x=Math.max(1,n-5+rnd(11));if(x!==n)wrong.add(x)}
 shell('すうじを みつけよう','<div class="detectivecard">ぼくの すうじは なーんだ？<div class="hints">'+hints.map(h=>'<div>'+h+'</div>').join('')+'</div></div>'+choices(shuffle([n,...wrong])));bind(n,'ひんとを ひとつずつ つかうと みつけられるね')
}
function blocks(){
 let heights,ans,scene;
 if(level==='hard'){
  const w=2+rnd(2),d=2+rnd(2),grid=Array.from({length:d},()=>Array.from({length:w},()=>1+rnd(3)));
  ans=grid.flat().reduce((a,b)=>a+b,0);
  const cubes=[];
  for(let y=d-1;y>=0;y--)for(let x=0;x<w;x++)for(let z=0;z<grid[y][x];z++)cubes.push('<span class="cube3d" style="--x:'+x+';--y:'+y+';--z:'+z+'"></span>');
  scene='<div class="blockscene block3d" aria-label="りったいの つみき"><div class="cubeplane">'+cubes.join('')+'</div></div>';
 }else{
  heights=level==='easy'?shuffle([1,1,1,2].slice(0,3+rnd(2))):Array.from({length:4+rnd(2)},()=>1+rnd(3));
  ans=heights.reduce((a,b)=>a+b,0);
  scene='<div class="blockscene" aria-label="つみき">'+heights.map(h=>'<div class="blockcol">'+Array.from({length:h},()=>'<span>🧊</span>').join('')+'</div>').join('')+'</div>';
 }
 const wrong=new Set();while(wrong.size<3){const x=Math.max(1,ans-3+rnd(7));if(x!==ans)wrong.add(x)}
 shell(level==='hard'?'りったい つみき':'つみきは なんこ？','<div class="brainquestion">ぜんぶで なんこ あるかな？</div>'+scene+choices(shuffle([ans,...wrong])));bind(ans,level==='hard'?'おくに ある つみきも わすれずに かぞえよう':'したから うえまで ひとつずつ かぞえてみよう')
}
btn.onclick=()=>{playMenu.style.display='none';miniArea.style.display='block';miniArea.className='brain-mode';start.style.display='none';gameMsg.style.display='none';home()};
miniBack.addEventListener('click',()=>{if(miniArea.classList.contains('brain-mode'))miniArea.classList.remove('brain-mode')});
})();