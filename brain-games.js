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
  const canvas=document.querySelector('.isoBlocks');if(!canvas||!grid)return;
  const ctx=canvas.getContext('2d'),W=canvas.width,H=canvas.height;
  ctx.clearRect(0,0,W,H);
  const d=grid.length,w=grid[0].length,rad=angle*Math.PI/180,ca=Math.cos(rad),sa=Math.sin(rad),tilt=.58;
  const proj=(x,y,z)=>{
    const px=x-w/2,py=y-d/2,rx=px*ca-py*sa,ry=px*sa+py*ca;
    return {x:rx,y:ry,z,sx:rx,sy:ry*tilt-z,depth:ry};
  };
  const faces=[];
  const occupied=(x,y,z)=>x>=0&&x<w&&y>=0&&y<d&&z>=0&&z<grid[y][x];
  const pushFace=(verts,kind,nx,ny,nz)=>{
    const p=verts.map(v=>proj(...v));
    const rcx=nx*ca-ny*sa,rcy=nx*sa+ny*ca;
    const facing=rcy*tilt+nz;
    faces.push({p,kind,facing,depth:p.reduce((s,v)=>s+v.depth,0)/p.length});
  };
  for(let y=0;y<d;y++)for(let x=0;x<w;x++)for(let z=0;z<grid[y][x];z++){
    if(!occupied(x,y,z+1))pushFace([[x,y,z+1],[x+1,y,z+1],[x+1,y+1,z+1],[x,y+1,z+1]],'top',0,0,1);
    if(!occupied(x-1,y,z))pushFace([[x,y,z],[x,y+1,z],[x,y+1,z+1],[x,y,z+1]],'sideA',-1,0,0);
    if(!occupied(x+1,y,z))pushFace([[x+1,y,z],[x+1,y,z+1],[x+1,y+1,z+1],[x+1,y+1,z]],'sideB',1,0,0);
    if(!occupied(x,y-1,z))pushFace([[x,y,z],[x,y,z+1],[x+1,y,z+1],[x+1,y,z]],'sideA',0,-1,0);
    if(!occupied(x,y+1,z))pushFace([[x,y+1,z],[x+1,y+1,z],[x+1,y+1,z+1],[x,y+1,z+1]],'sideB',0,1,0);
    if(z===0)pushFace([[x,y,z],[x+1,y,z],[x+1,y+1,z],[x,y+1,z]],'bottom',0,0,-1);
  }
  const all=faces.flatMap(f=>f.p),minX=Math.min(...all.map(p=>p.sx)),maxX=Math.max(...all.map(p=>p.sx)),minY=Math.min(...all.map(p=>p.sy)),maxY=Math.max(...all.map(p=>p.sy));
  const scale=Math.min((W-70)/(maxX-minX||1),(H-60)/(maxY-minY||1)),ox=W/2-(minX+maxX)*scale/2,oy=H/2-(minY+maxY)*scale/2;
  faces.sort((a,b)=>a.depth-b.depth);
  const fill={top:'#a8e3fa',sideA:'#73c5e8',sideB:'#55add5',bottom:'#55add5'};
  ctx.lineJoin='round';ctx.lineWidth=5;ctx.strokeStyle='#368fbd';
  for(const f of faces){ctx.beginPath();f.p.forEach((p,i)=>{const X=ox+p.sx*scale,Y=oy+p.sy*scale;i?ctx.lineTo(X,Y):ctx.moveTo(X,Y)});ctx.closePath();ctx.fillStyle=fill[f.kind];ctx.fill();ctx.stroke()}
 };
 if(level==='hard'){
  const presets=[[[2,1],[1,2]],[[1,2,1],[2,1,2]],[[3,1],[2,2],[1,1]],[[1,2,1],[2,3,1],[1,1,2]],[[2,2,1],[1,3,2]]];
  grid=pick(presets);ans=grid.flat().reduce((a,b)=>a+b,0);
  scene='<div class="blockscene block3d"><canvas class="isoBlocks" width="640" height="480" role="img" aria-label="りったいに つまれた つみき"></canvas></div><div class="rotateHelp">👆 ゆびで よこに うごかすと まわせるよ</div>';
 }else{
  heights=level==='easy'?shuffle([1,1,1,2].slice(0,3+rnd(2))):Array.from({length:4+rnd(2)},()=>1+rnd(3));ans=heights.reduce((a,b)=>a+b,0);
  scene='<div class="blockscene">'+heights.map(h=>'<div class="blockcol">'+Array.from({length:h},()=>'<span>🧊</span>').join('')+'</div>').join('')+'</div>';
 }
 const wrong=new Set();while(wrong.size<3){const x=Math.max(1,ans-3+rnd(7));if(x!==ans)wrong.add(x)}
 shell(level==='hard'?'りったい つみき':'つみきは なんこ？','<div class="brainquestion">ぜんぶで なんこ あるかな？</div>'+scene+choices(shuffle([ans,...wrong])));
 if(grid){
  renderIso();
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