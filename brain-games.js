(()=>{
const btn=document.querySelector('.minisel[data-mini="brain"]'),playMenu=document.getElementById('playMenu'),miniArea=document.getElementById('miniArea'),miniTitle=document.getElementById('miniTitle'),game=document.getElementById('game'),start=document.getElementById('start'),gameMsg=document.getElementById('gameMsg'),miniBack=document.getElementById('miniBack');
if(!btn||!game)return;
let mode='',level='easy',q=0,answer=null,locked=false;
const rnd=n=>Math.floor(Math.random()*n),pick=a=>a[rnd(a.length)],shuffle=a=>{a=[...a];for(let i=a.length-1;i;i--){const j=rnd(i+1);[a[i],a[j]]=[a[j],a[i]]}return a};
function shell(title,body){game.innerHTML='<div class="brainbox"><div class="brainhead">'+title+'</div>'+body+'<div id="brainMsg" class="brainmsg"></div></div>'}
function home(){mode='';miniTitle.textContent='かんがえる げーむ';shell('どれで あそぶ？','<div class="brainmenu"><button data-b="pattern">🔮<b>つぎは なに？</b><small>ならびの ひみつを みつけよう</small></button><button data-b="detective">🕵️<b>すうじ たんてい</b><small>ひんとから すうじを みつけよう</small></button><button data-b="blocks">🧊<b>なんこで できる？</b><small>つみきを かぞえよう</small></button></div>');game.querySelectorAll('[data-b]').forEach(b=>b.onclick=()=>choose(b.dataset.b))}
function choose(m){mode=m;shell(m==='pattern'?'つぎは なに？':m==='detective'?'すうじ たんてい':'なんこで できる？','<div class="brainlevels"><button data-l="easy">🌱<b>かんたん</b></button><button data-l="normal">🌼<b>ふつう</b></button><button data-l="hard">🔥<b>むずかしい</b></button></div><button class="brainback" id="brainHome">← げーむを えらぶ</button>');game.querySelectorAll('[data-l]').forEach(b=>b.onclick=()=>{level=b.dataset.l;q=0;next()});document.getElementById('brainHome').onclick=home}
function next(){locked=false;q++;game.classList.remove('brain-pattern','brain-detective','brain-blocks');miniArea.classList.remove('brain-pattern','brain-detective','brain-blocks');game.classList.add('brain-'+mode);miniArea.classList.add('brain-'+mode);if(mode==='pattern')pattern();else if(mode==='detective')detective();else blocks()}
function choices(vals){return '<div class="brainchoices">'+vals.map(v=>{const o=(v&&typeof v==='object')?v:{value:String(v),label:v};return '<button data-a="'+String(o.value).replace(/&/g,'&amp;').replace(/\"/g,'&quot;')+'">'+o.label+'</button>'}).join('')+'</div>'}
function bind(correct,explain){answer=String(correct);game.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>{if(locked)return;if(b.dataset.a===answer){locked=true;b.classList.add('correct');const m=document.getElementById('brainMsg');m.innerHTML='🎉 せいかい！<br><small>'+explain+'</small><br><button id="brainNext">つぎの もんだい</button>';document.getElementById('brainNext').onclick=next}else{b.classList.add('wrong');document.getElementById('brainMsg').textContent='おしい！ もういちど みてみよう'}})}
function pattern(){
 const palette=[{id:'r',c:'#ef4444'},{id:'b',c:'#2684e8'},{id:'y',c:'#f4c928'},{id:'g',c:'#39b765'},{id:'p',c:'#a43de0'},{id:'o',c:'#ed8a13'}];
 const forms=[{id:'c',s:'circle'},{id:'t',s:'triangle'},{id:'q',s:'square'},{id:'d',s:'diamond'}];
 const token=o=>'<span class="ruleToken '+o.f.s+'" style="--rc:'+o.col.c+'"></span>';
 const key=o=>o.col.id+'|'+o.f.id;
 let raw=[],period=[],why;
 if(level==='easy'){
   const col=pick(palette),fs=shuffle(forms).slice(0,2);period=[{col,f:fs[0]},{col,f:fs[1]}];why='2つの かたちが じゅんばんに ならんでいるよ';
 }else if(level==='normal'){
   const cols=shuffle(palette).slice(0,2+rnd(2)),fs=shuffle(forms).slice(0,2+rnd(2)),kind=rnd(4);
   if(kind===0) period=[{col:cols[0],f:fs[0]},{col:cols[1],f:fs[1]}];
   if(kind===1) period=[{col:cols[0],f:fs[0]},{col:cols[0],f:fs[0]},{col:cols[1],f:fs[1]}];
   if(kind===2) period=[{col:cols[0],f:fs[0]},{col:cols[1],f:fs[0]},{col:cols[0],f:fs[1]},{col:cols[1],f:fs[1]}];
   if(kind===3) period=[{col:cols[0],f:fs[0]},{col:cols[1],f:fs[1]},{col:cols[2]||cols[0],f:fs[0]}];
   why='いろと かたちの くりかえしを みつけよう';
 }else{
   const cols=shuffle(palette).slice(0,3),fs=shuffle(forms).slice(0,3),kind=rnd(3);
   if(kind===0) period=[{col:cols[0],f:fs[0]},{col:cols[1],f:fs[1]},{col:cols[2],f:fs[2]}];
   if(kind===1) period=[{col:cols[0],f:fs[0]},{col:cols[1],f:fs[0]},{col:cols[2],f:fs[1]},{col:cols[0],f:fs[1]}];
   if(kind===2) period=[{col:cols[0],f:fs[0]},{col:cols[1],f:fs[1]},{col:cols[2],f:fs[0]},{col:cols[0],f:fs[2]}];
   why='いろと かたち、りょうほうの きまりを みつけよう';
 }
 const n=level==='hard'?7:6;raw=Array.from({length:n+1},(_,i)=>period[i%period.length]);const correct=raw[n],ans=key(correct);
 const seq=raw.slice(0,n).map(token).concat('？');
 const all=[];for(const col of palette)for(const f of forms)all.push({value:key({col,f}),label:token({col,f})});
 const opts=shuffle([{value:ans,label:token(correct)},...shuffle(all.filter(x=>x.value!==ans)).slice(0,3)]);
 shell('もんだい '+q,'<div class="brainquestion">つぎに くるのは？</div><div class="patternrow pattern'+seq.length+'">'+seq.map(x=>'<span class="patterncell">'+x+'</span>').join('')+'</div>'+choices(opts));bind(ans,why)
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
  const d=grid.length,w=grid[0].length,rad=angle*Math.PI/180,ca=Math.cos(rad),sa=Math.sin(rad);
  const size=42,cz=Math.cos(32*Math.PI/180),sz=Math.sin(32*Math.PI/180);
  const project=(x,y,z)=>{
    const px=x-(w/2),py=y-(d/2),rx=px*ca-py*sa,ry=px*sa+py*ca;
    return [rx*size, (ry*cz-z)*size*0.78];
  };
  const faces=[],xs=[],ys=[];
  const add=(pts,cls,depth)=>{pts.forEach(p=>{xs.push(p[0]);ys.push(p[1])});faces.push({pts,cls,depth})};
  for(let y=0;y<d;y++)for(let x=0;x<w;x++)for(let z=0;z<grid[y][x];z++){
    const v={
      a:project(x,y,z),b:project(x+1,y,z),c:project(x+1,y+1,z),d:project(x,y+1,z),
      A:project(x,y,z+1),B:project(x+1,y,z+1),C:project(x+1,y+1,z+1),D:project(x,y+1,z+1)
    };
    const center=(x-w/2)*sa+(y-d/2)*ca;
    add([v.A,v.B,v.C,v.D],'ctop',center+z*.001);
    const nx=-sa,ny=ca;
    if(nx<0)add([v.a,v.d,v.D,v.A],'cleft',center+.2);
    else add([v.b,v.c,v.C,v.B],'cright',center+.2);
    if(ny<0)add([v.a,v.b,v.B,v.A],'cleft',center+.1);
    else add([v.d,v.c,v.C,v.D],'cright',center+.1);
  }
  faces.sort((a,b)=>a.depth-b.depth);
  const pad=10,minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys),ox=-minX+pad,oy=-minY+pad;
  const poly=p=>p.map(q=>(q[0]+ox).toFixed(1)+','+(q[1]+oy).toFixed(1)).join(' ');
  svg.setAttribute('viewBox','0 0 '+(maxX-minX+pad*2)+' '+(maxY-minY+pad*2));
  svg.innerHTML=faces.map(f=>'<polygon class="'+f.cls+'" points="'+poly(f.pts)+'"/>').join('');
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
 if(grid){
  renderIso();
  document.querySelectorAll('.rotateBtns button').forEach(b=>b.onclick=()=>{angle+=Number(b.dataset.turn)*30;renderIso()});
  const svg=document.querySelector('.isoBlocks');
  let lastX=0,drag=false,pid=null;
  svg.style.touchAction='pan-y';
  svg.addEventListener('pointerdown',e=>{drag=true;pid=e.pointerId;lastX=e.clientX;try{svg.setPointerCapture(pid)}catch(_){}});
  svg.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==pid)return;const dx=e.clientX-lastX;lastX=e.clientX;angle+=dx*0.65;renderIso()});
  const stop=e=>{if(e.pointerId===pid){drag=false;pid=null}};
  svg.addEventListener('pointerup',stop);svg.addEventListener('pointercancel',stop);
}
 bind(ans,level==='hard'?'みる ほうこうを かえると おくの つみきも わかるよ':'したから うえまで ひとつずつ かぞえてみよう')
}
btn.onclick=()=>{playMenu.style.display='none';miniArea.style.display='block';miniArea.className='brain-mode';start.style.display='none';gameMsg.style.display='none';home()};
miniBack.addEventListener('click',()=>{if(miniArea.classList.contains('brain-mode'))miniArea.classList.remove('brain-mode')});
})();