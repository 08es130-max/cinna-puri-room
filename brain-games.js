(()=>{
const btn=document.querySelector('.minisel[data-mini="brain"]'),playMenu=document.getElementById('playMenu'),miniArea=document.getElementById('miniArea'),miniTitle=document.getElementById('miniTitle'),game=document.getElementById('game'),start=document.getElementById('start'),gameMsg=document.getElementById('gameMsg'),miniBack=document.getElementById('miniBack');
if(!btn||!game)return;
let mode='',level='easy',q=0,answer=null,locked=false;
const rnd=n=>Math.floor(Math.random()*n),pick=a=>a[rnd(a.length)],shuffle=a=>{a=[...a];for(let i=a.length-1;i;i--){const j=rnd(i+1);[a[i],a[j]]=[a[j],a[i]]}return a};
function shell(title,body){game.innerHTML='<div class="brainbox"><div class="brainhead">'+title+'</div>'+body+'<div id="brainMsg" class="brainmsg"></div></div>'}
function home(){mode='';miniTitle.textContent='かんがえる げーむ';shell('どれで あそぶ？','<div class="brainmenu"><button data-b="pattern">🔮<b>つぎは なに？</b><small>ならびの ひみつを みつけよう</small></button><button data-b="detective">🕵️<b>すうじ たんてい</b><small>ひんとから すうじを みつけよう</small></button><button data-b="blocks">🧊<b>なんこで できる？</b><small>つみきを かぞえよう</small></button></div>');game.querySelectorAll('[data-b]').forEach(b=>b.onclick=()=>choose(b.dataset.b))}
function choose(m){mode=m;shell(m==='pattern'?'つぎは なに？':m==='detective'?'すうじ たんてい':'なんこで できる？','<div class="brainlevels"><button data-l="easy">🌱<b>かんたん</b></button><button data-l="normal">🌼<b>ふつう</b></button><button data-l="hard">🔥<b>むずかしい</b></button></div><button class="brainback" id="brainHome">← げーむを えらぶ</button>');game.querySelectorAll('[data-l]').forEach(b=>b.onclick=()=>{level=b.dataset.l;q=0;next()});document.getElementById('brainHome').onclick=home}
function next(){locked=false;q++;game.classList.remove('brain-pattern','brain-detective','brain-blocks');game.classList.add('brain-'+mode);if(mode==='pattern')pattern();else if(mode==='detective')detective();else blocks()}
function choices(vals){return '<div class="brainchoices">'+vals.map(v=>{const o=(v&&typeof v==='object')?v:{value:String(v),label:v};return '<button data-a="'+String(o.value).replace(/&/g,'&amp;').replace(/\"/g,'&quot;')+'">'+o.label+'</button>'}).join('')+'</div>'}
function bind(correct,explain){answer=String(correct);game.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>{if(locked)return;if(b.dataset.a===answer){locked=true;b.classList.add('correct');const m=document.getElementById('brainMsg');m.innerHTML='🎉 せいかい！<br><small>'+explain+'</small><br><button id="brainNext">つぎの もんだい</button>';document.getElementById('brainNext').onclick=next}else{b.classList.add('wrong');document.getElementById('brainMsg').textContent='おしい！ もういちど みてみよう'}})}
function pattern(){
 const simple=['🔴','🔵','🟡','🟢','🟣','🟠','⭐','❤️','▲','■'];
 let seq=[],ans,opts,why;
 if(level==='easy'||level==='normal'){
  const pool=shuffle(simple),a=pool[0],b=pool[1],d=pool[2];
  const pats=level==='easy'?[[a,b,a,b,a,'？']]:[[a,b,a,b,a,'？'],[a,a,b,a,a,b,'？'],[a,b,b,a,b,b,'？'],[a,b,d,a,b,d,'？'],[a,a,b,d,a,a,b,'？'],[a,b,a,d,a,b,a,'？']];
  seq=pick(pats);const base=seq.slice(0,-1),period=level==='easy'?2:(base[0]===base[3]&&base[1]===base[4]?3:(base.length===6&&base[0]===base[4]?4:base.length));
  ans=base[(base.length)%period]||base[0];
  // derive the next item by finding the shortest repeating period
  for(let p=1;p<=base.length;p++){let ok=true;for(let i=0;i<base.length;i++)if(base[i]!==base[i%p])ok=false;if(ok){ans=base[base.length%p];break}}
  opts=shuffle([ans,...shuffle(simple.filter(x=>x!==ans)).slice(0,3)]);why='ならびの きまりを みつけよう';
 }else{
  const palette=shuffle([{id:'r',c:'#ef4444'},{id:'b',c:'#2684e8'},{id:'y',c:'#f4c928'},{id:'g',c:'#39b765'},{id:'p',c:'#a43de0'},{id:'o',c:'#ed8a13'}]).slice(0,2+rnd(2));
  const forms=shuffle([{id:'c',s:'circle'},{id:'t',s:'triangle'},{id:'q',s:'square'},{id:'d',s:'diamond'}]).slice(0,2+rnd(2));
  const token=o=>'<span class="ruleToken '+o.f.s+'" style="--rc:'+o.col.c+'"></span>';
  const period=[];for(let i=0;i<Math.max(palette.length,forms.length)*2;i++)period.push({col:palette[i%palette.length],f:forms[i%forms.length]});
  const n=6,raw=Array.from({length:n+1},(_,i)=>period[i%period.length]);seq=raw.slice(0,n).map(token).concat('？');
  const correct=raw[n];ans=correct.col.id+'|'+correct.f.id;
  const cand=[];for(const col of palette)for(const fm of forms)cand.push({value:col.id+'|'+fm.id,label:token({col,f:fm})});
  opts=shuffle([{value:ans,label:token(correct)},...shuffle(cand.filter(x=>x.value!==ans)).slice(0,3)]);
  why='いろと かたちの きまりを いっしょに みつけよう';
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
 let heights,ans,scene,grid=null,angle=0;
 const renderIso=()=>{
  const svg=document.querySelector('.isoBlocks');if(!svg||!grid)return;
  const d=grid.length,w=grid[0].length,rot=(x,y)=>angle===0?[x,y]:angle===1?[d-1-y,x]:angle===2?[w-1-x,d-1-y]:[y,w-1-x];
  const cells=[];for(let y=0;y<d;y++)for(let x=0;x<w;x++){const [rx,ry]=rot(x,y);cells.push({x:rx,y:ry,h:grid[y][x]})}
  const maxX=Math.max(...cells.map(o=>o.x)),maxY=Math.max(...cells.map(o=>o.y)),dx=27,dy=14,dz=27;
  let minX=1e9,maxPX=-1e9,minY=1e9,maxPY=-1e9;
  cells.forEach(o=>{const cx=(o.x-o.y)*dx,base=(o.x+o.y)*dy;minX=Math.min(minX,cx-dx);maxPX=Math.max(maxPX,cx+dx);minY=Math.min(minY,base-o.h*dz);maxPY=Math.max(maxPY,base+dy*2+dz)});
  const vw=maxPX-minX+20,vh=maxPY-minY+20,ox=-minX+10,oy=-minY+10,parts=[];
  cells.sort((a,b)=>(a.x+a.y)-(b.x+b.y));
  for(const o of cells)for(let z=0;z<o.h;z++){const cx=ox+(o.x-o.y)*dx,cy=oy+(o.x+o.y)*dy-z*dz;
   const top=cx+','+cy+' '+(cx+dx)+','+(cy+dy)+' '+cx+','+(cy+dy*2)+' '+(cx-dx)+','+(cy+dy);
   const left=(cx-dx)+','+(cy+dy)+' '+cx+','+(cy+dy*2)+' '+cx+','+(cy+dy*2+dz)+' '+(cx-dx)+','+(cy+dy+dz);
   const right=(cx+dx)+','+(cy+dy)+' '+cx+','+(cy+dy*2)+' '+cx+','+(cy+dy*2+dz)+' '+(cx+dx)+','+(cy+dy+dz);
   parts.push('<g class="isoCube"><polygon class="ctop" points="'+top+'"/><polygon class="cleft" points="'+left+'"/><polygon class="cright" points="'+right+'"/></g>');
  }
  svg.setAttribute('viewBox','0 0 '+vw+' '+vh);svg.innerHTML=parts.join('');
 };
 if(level==='hard'){
  const presets=[[[2,1],[1,2]],[[1,2,1],[2,1,2]],[[3,1],[2,2],[1,1]],[[1,2,1],[2,3,1],[1,1,2]],[[2,2,1],[1,3,2]]];
  grid=pick(presets);ans=grid.flat().reduce((a,b)=>a+b,0);
  scene='<div class="blockscene block3d"><svg class="isoBlocks" role="img" aria-label="りったいに つまれた つみき"></svg></div><div class="rotateHelp">べつの ほうこうから みてみよう</div><div class="rotateBtns"><button type="button" data-turn="-1">↶ ひだり</button><button type="button" data-turn="1">みぎ ↷</button></div>';
 }else{
  heights=level==='easy'?shuffle([1,1,1,2].slice(0,3+rnd(2))):Array.from({length:4+rnd(2)},()=>1+rnd(3));ans=heights.reduce((a,b)=>a+b,0);
  scene='<div class="blockscene">'+heights.map(h=>'<div class="blockcol">'+Array.from({length:h},()=>'<span>🧊</span>').join('')+'</div>').join('')+'</div>';
 }
 const wrong=new Set();while(wrong.size<3){const x=Math.max(1,ans-3+rnd(7));if(x!==ans)wrong.add(x)}
 shell(level==='hard'?'りったい つみき':'つみきは なんこ？','<div class="brainquestion">ぜんぶで なんこ あるかな？</div>'+scene+choices(shuffle([ans,...wrong])));
 if(grid){renderIso();document.querySelectorAll('.rotateBtns button').forEach(b=>b.onclick=()=>{angle=(angle+Number(b.dataset.turn)+4)%4;renderIso()})}
 bind(ans,level==='hard'?'みる ほうこうを かえると おくの つみきも わかるよ':'したから うえまで ひとつずつ かぞえてみよう')
}
btn.onclick=()=>{playMenu.style.display='none';miniArea.style.display='block';miniArea.className='brain-mode';start.style.display='none';gameMsg.style.display='none';home()};
miniBack.addEventListener('click',()=>{if(miniArea.classList.contains('brain-mode'))miniArea.classList.remove('brain-mode')});
})();