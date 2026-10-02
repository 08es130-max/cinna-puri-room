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
 const icons=['🔴','🔵','🟡','🟢','⭐','❤️','▲','■'];
 let seq=[],ans,opts,why;
 if(level==='easy'){const a=pick(icons),b=pick(icons.filter(x=>x!==a));seq=[a,b,a,b,a,'？'];ans=b;opts=shuffle([a,b,...shuffle(icons.filter(x=>x!==a&&x!==b)).slice(0,2)]);why=a+'、'+b+'の じゅんばんだね'}
 else if(level==='normal'){const a=pick(icons),b=pick(icons.filter(x=>x!==a)),c=pick(icons.filter(x=>x!==a&&x!==b));seq=[a,a,b,a,a,b,'？'];ans=a;opts=shuffle([a,b,c,pick(icons.filter(x=>![a,b,c].includes(x)))]);why=a+'、'+a+'、'+b+'が くりかえしているよ'}
 else{const starts=[1,2,3],s=pick(starts),step=pick([2,3,4]);seq=[s,s+step,s+step*2,s+step*3,'？'];ans=s+step*4;opts=shuffle([ans,ans+step,ans-step,ans+1]);why=step+'ずつ おおきく なっているよ'}
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
 let heights,ans;
 if(level==='easy')heights=shuffle([1,1,1,2].slice(0,3+rnd(2)));
 else if(level==='normal')heights=Array.from({length:4+rnd(2)},()=>1+rnd(3));
 else heights=Array.from({length:5+rnd(2)},()=>1+rnd(4));
 ans=heights.reduce((a,b)=>a+b,0);
 const max=Math.max(...heights),cols=heights.map((h,i)=>'<div class="blockcol">'+Array.from({length:h},()=>'<span>🧊</span>').join('')+'</div>').join('');
 const wrong=new Set();while(wrong.size<3){const x=Math.max(1,ans-3+rnd(7));if(x!==ans)wrong.add(x)}
 shell('つみきは なんこ？','<div class="brainquestion">ぜんぶで なんこ あるかな？</div><div class="blockscene" aria-label="つみき">'+cols+'</div>'+choices(shuffle([ans,...wrong])));bind(ans,'したから うえまで ひとつずつ かぞえてみよう')
}
btn.onclick=()=>{playMenu.style.display='none';miniArea.style.display='block';miniArea.className='brain-mode';start.style.display='none';gameMsg.style.display='none';home()};
miniBack.addEventListener('click',()=>{if(miniArea.classList.contains('brain-mode'))miniArea.classList.remove('brain-mode')});
})();