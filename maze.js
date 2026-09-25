(()=>{
const btn=document.querySelector('.minisel[data-mini="maze"]');
const playMenu=document.getElementById('playMenu'),miniArea=document.getElementById('miniArea'),miniTitle=document.getElementById('miniTitle'),game=document.getElementById('game'),start=document.getElementById('start'),gameMsg=document.getElementById('gameMsg'),miniBack=document.getElementById('miniBack');
if(!btn||!playMenu||!miniArea||!game)return;

let selectedChar='cinna',selectedDiff='easy',active=false;
const chars={
 cinna:{name:'しなもろーる',img:'./assets/cinnamoroll.webp',goal:'⭐',start:'がんばろうね♪',wall:'そっちは いけないよ〜',win:'やったー！ ごーるだよ♪'},
 puri:{name:'ぽむぽむぷりん',img:'./assets/pompompurin.webp',goal:'🍮',start:'ごーるまで いこう〜！',wall:'そっちは いけないよ〜',win:'わあ〜！ ついた〜♪'}
};
const diffs={
 easy:{label:'かんたん',rows:4,cols:5},
 normal:{label:'ふつう',rows:5,cols:7},
 hard:{label:'むずかしい',rows:7,cols:9}
};
const dirs=[
 {k:'t',opp:'b',dr:-1,dc:0},
 {k:'r',opp:'l',dr:0,dc:1},
 {k:'b',opp:'t',dr:1,dc:0},
 {k:'l',opp:'r',dr:0,dc:-1}
];
const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};

function buildMaze(rows,cols){
 const cells=Array.from({length:rows},()=>Array.from({length:cols},()=>({t:1,r:1,b:1,l:1,seen:false})));
 const stack=[[0,0]];cells[0][0].seen=true;
 while(stack.length){
  const [r,c]=stack[stack.length-1];
  const choices=shuffle(dirs).filter(d=>{
   const nr=r+d.dr,nc=c+d.dc;
   return nr>=0&&nr<rows&&nc>=0&&nc<cols&&!cells[nr][nc].seen;
  });
  if(!choices.length){stack.pop();continue}
  const d=choices[0],nr=r+d.dr,nc=c+d.dc;
  cells[r][c][d.k]=0;cells[nr][nc][d.opp]=0;cells[nr][nc].seen=true;stack.push([nr,nc]);
 }
 cells.flat().forEach(x=>delete x.seen);
 return cells;
}

function farthest(cells){
 const rows=cells.length,cols=cells[0].length,q=[[0,0,0]],seen=new Set(['0,0']);
 let best=[0,0,0];
 while(q.length){
  const [r,c,d]=q.shift();if(d>best[2])best=[r,c,d];
  for(const x of dirs){
   if(cells[r][c][x.k])continue;
   const nr=r+x.dr,nc=c+x.dc,key=nr+','+nc;
   if(nr<0||nr>=rows||nc<0||nc>=cols||seen.has(key))continue;
   seen.add(key);q.push([nr,nc,d+1]);
  }
 }
 return {r:best[0],c:best[1]};
}

function setup(){
 active=false;game.innerHTML='';
 const box=document.createElement('div');box.className='mazesetup';
 box.innerHTML='<div class="mazelabel">だれで あそぶ？</div><div class="mazechars">'+
  '<button class="mazecharbtn selected" data-char="cinna"><img src="./assets/cinnamoroll.webp" alt="しなもろーる">しなもろーる</button>'+
  '<button class="mazecharbtn" data-char="puri"><img src="./assets/pompompurin.webp" alt="ぽむぽむぷりん">ぽむぽむぷりん</button>'+
  '</div><div class="mazelabel">むずかしさ</div><div class="mazediffs">'+
  '<button class="mazediff selected" data-diff="easy">かんたん</button>'+
  '<button class="mazediff" data-diff="normal">ふつう</button>'+
  '<button class="mazediff" data-diff="hard">むずかしい</button>'+
  '</div><button class="mazego">めいろを はじめる！</button>';
 box.querySelectorAll('.mazecharbtn').forEach(b=>b.onclick=()=>{
  selectedChar=b.dataset.char;box.querySelectorAll('.mazecharbtn').forEach(x=>x.classList.toggle('selected',x===b));
 });
 box.querySelectorAll('.mazediff').forEach(b=>b.onclick=()=>{
  selectedDiff=b.dataset.diff;box.querySelectorAll('.mazediff').forEach(x=>x.classList.toggle('selected',x===b));
 });
 box.querySelector('.mazego').onclick=runMaze;
 game.appendChild(box);
}

function runMaze(){
 active=true;
 const cfg=diffs[selectedDiff],ch=chars[selectedChar],cells=buildMaze(cfg.rows,cfg.cols),goal=farthest(cells);
 let player={r:0,c:0},moves=0,won=false;
 game.innerHTML='';
 const wrap=document.createElement('div');wrap.className='mazewrap';
 const status=document.createElement('div');status.className='mazestatus';
 status.innerHTML='<img src="'+ch.img+'" alt="'+ch.name+'"><span>'+ch.start+'</span>';
 const board=document.createElement('div');board.className='mazeboard';board.style.setProperty('--cols',cfg.cols);board.style.setProperty('--rows',cfg.rows);
 const cellEls=[];
 for(let r=0;r<cfg.rows;r++){
  cellEls[r]=[];
  for(let c=0;c<cfg.cols;c++){
   const x=document.createElement('div');x.className='mazecell'+
    (cells[r][c].t?' wt':'')+(cells[r][c].r?' wr':'')+(cells[r][c].b?' wb':'')+(cells[r][c].l?' wl':'');
   if(r===goal.r&&c===goal.c){const g=document.createElement('div');g.className='mazegoal';g.textContent=ch.goal;x.appendChild(g)}
   cellEls[r][c]=x;board.appendChild(x);
  }
 }
 const playerEl=document.createElement('img');playerEl.className='mazeplayer';playerEl.src=ch.img;playerEl.alt=ch.name;cellEls[0][0].appendChild(playerEl);

 const ctrl=document.createElement('div');ctrl.className='mazectrl';
 [['up','↑'],['left','←'],['down','↓'],['right','→']].forEach(([k,t])=>{const b=document.createElement('button');b.className='mazearrow '+k;b.textContent=t;b.onclick=()=>move(k);ctrl.appendChild(b)});

 function say(t){status.querySelector('span').textContent=t}
 function move(which){
  if(won)return;
  const map={up:dirs[0],right:dirs[1],down:dirs[2],left:dirs[3]},d=map[which];
  const here=cells[player.r][player.c];
  if(here[d.k]){say(ch.wall);status.animate([{transform:'translateX(0)'},{transform:'translateX(-5px)'},{transform:'translateX(5px)'},{transform:'translateX(0)'}],{duration:220});return}
  const nr=player.r+d.dr,nc=player.c+d.dc;
  if(nr<0||nr>=cfg.rows||nc<0||nc>=cfg.cols)return;
  player={r:nr,c:nc};moves++;cellEls[nr][nc].appendChild(playerEl);
  playerEl.animate([{transform:'scale(.9)'},{transform:'scale(1.08)'},{transform:'scale(1)'}],{duration:180});
  if(player.r===goal.r&&player.c===goal.c){
   won=true;say(ch.win);setTimeout(showWin,250);
  }else if(moves%5===0){
   say(selectedChar==='cinna'?'いいかんじ♪ もうすこし！':'そのちょうし〜！ がんばれ〜！');
  }else say('ごーるを めざそう！');
 }
 function showWin(){
  const w=document.createElement('div');w.className='mazewin';
  w.innerHTML='<img src="'+ch.img+'" alt="'+ch.name+'"><strong>'+ch.win+'</strong><span>'+moves+'かい うごいたよ！</span><button>もういちど</button><button class="mazechange">えらびなおす</button>';
  w.querySelector('button').onclick=runMaze;
  w.querySelector('.mazechange').onclick=setup;
  wrap.appendChild(w);
 }

 let sx=0,sy=0,tracking=false;
 board.addEventListener('pointerdown',e=>{tracking=true;sx=e.clientX;sy=e.clientY;board.setPointerCapture?.(e.pointerId)});
 board.addEventListener('pointerup',e=>{
  if(!tracking)return;tracking=false;
  const dx=e.clientX-sx,dy=e.clientY-sy;
  if(Math.max(Math.abs(dx),Math.abs(dy))<24)return;
  if(Math.abs(dx)>Math.abs(dy))move(dx>0?'right':'left');else move(dy>0?'down':'up');
 });
 board.addEventListener('pointercancel',()=>tracking=false);

 wrap.append(status,board,ctrl);game.appendChild(wrap);
}

btn.onclick=()=>{
 playMenu.style.display='none';miniArea.style.display='block';miniArea.classList.remove('hide-mode','riddle-mode');miniArea.classList.add('maze-mode');
 miniTitle.textContent='めいろ';start.style.display='none';gameMsg.textContent='';setup();
};
miniBack.addEventListener('click',()=>{active=false;miniArea.classList.remove('maze-mode')});
})();