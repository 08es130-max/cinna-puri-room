(()=>{
const btn=document.querySelector('.minisel[data-mini="clock"]');
const playMenu=document.getElementById('playMenu'),miniArea=document.getElementById('miniArea'),miniTitle=document.getElementById('miniTitle'),game=document.getElementById('game'),start=document.getElementById('start'),gameMsg=document.getElementById('gameMsg'),miniBack=document.getElementById('miniBack');
if(!btn||!game)return;
let level='hour',q=null,answered=false;
const rnd=n=>Math.floor(Math.random()*n);
function choose(){
 game.innerHTML='<div class="clockchoose"><div class="clockhead">どこまで やってみる？</div><button data-l="hour">🕐<b>なんじ？</b><small>ちょうどの じかん</small></button><button data-l="half">🕧<b>なんじ 30ぷん？</b><small>30ぷんも でるよ</small></button><button data-l="five">🕒<b>なんじ なんぷん？</b><small>5ぷんごとに よもう</small></button></div>';
 game.querySelectorAll('[data-l]').forEach(b=>b.onclick=()=>{level=b.dataset.l;next()});
}
function makeQ(){
 const h=1+rnd(12);let m=0;
 if(level==='half')m=rnd(2)*30;
 if(level==='five')m=rnd(12)*5;
 return {h,m};
}
function label(h,m){return m===0?h+'じ':h+'じ '+m+'ぷん'}
function choicesFor(x){
 const vals=[label(x.h,x.m)],seen=new Set(vals);
 while(vals.length<4){
  let h=x.h,m=x.m;
  if(level==='hour')h=1+rnd(12);
  else if(level==='half'){h=1+rnd(12);m=rnd(2)*30}
  else {h=1+rnd(12);m=rnd(12)*5}
  const z=label(h,m);if(!seen.has(z)){seen.add(z);vals.push(z)}
 }
 return vals.sort(()=>Math.random()-.5);
}
function face(h,m){
 let nums='';for(let i=1;i<=12;i++){const a=(i-3)*Math.PI/6,x=150+112*Math.cos(a),y=150+112*Math.sin(a);nums+='<text x="'+x.toFixed(1)+'" y="'+(y+7).toFixed(1)+'" text-anchor="middle">'+i+'</text>'}
 const ma=m*6,ha=(h%12)*30+m*.5;
 return '<svg viewBox="0 0 300 300" aria-label="とけい"><circle cx="150" cy="150" r="140"/>'+nums+'<g transform="rotate('+ha+' 150 150)"><line class="hourhand" x1="150" y1="158" x2="150" y2="82"/></g><g transform="rotate('+ma+' 150 150)"><line class="minutehand" x1="150" y1="160" x2="150" y2="48"/></g><circle class="pin" cx="150" cy="150" r="8"/></svg>';
}
function next(){q=makeQ();answered=false;game.innerHTML='<div class="clockgame"><div class="clockprompt">とけいは なんじ？</div><div class="clockface">'+face(q.h,q.m)+'</div><div class="clockchoices"></div><div class="clockmsg"></div></div>';const c=game.querySelector('.clockchoices');choicesFor(q).forEach(x=>{const b=document.createElement('button');b.textContent=x;b.onclick=()=>answer(b,x);c.appendChild(b)})}
function answer(b,x){
 if(answered)return;const right=label(q.h,q.m),msg=game.querySelector('.clockmsg');
 if(x!==right){b.classList.add('wrong');msg.textContent='もういちど！';setTimeout(()=>b.classList.remove('wrong'),450);return}
 answered=true;b.classList.add('right');game.querySelectorAll('.clockchoices button').forEach(x=>x.disabled=true);msg.innerHTML='せいかい！　<b>'+right+'</b>';
 const n=document.createElement('button');n.className='clocknext';n.textContent='つぎの もんだい';n.onclick=next;msg.appendChild(n);
}
function open(){playMenu.style.display='none';miniArea.style.display='block';miniArea.classList.remove('hide-mode','riddle-mode','maze-mode','math-mode','trace-mode','kanji-mode','name-mode');miniArea.classList.add('clock-mode');miniTitle.textContent='とけいを よもう';start.style.display='none';gameMsg.style.display='none';choose()}
btn.onclick=open;miniBack.addEventListener('click',()=>miniArea.classList.remove('clock-mode'));
})();