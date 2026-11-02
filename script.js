const $=s=>document.querySelector(s),$$=s=>document.querySelectorAll(s);
const nav=$('#nav'),burger=$('#burger'),menu=$('#menu'),totop=$('#totop'),prog=$('#progress');
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
function onScroll(){const y=scrollY,h=document.documentElement.scrollHeight-innerHeight;
 nav.classList.toggle('scrolled',y>40);totop.classList.toggle('show',y>700);prog.style.width=(h>0?y/h*100:0)+'%';
 if(!reduce){const bg=$('.hero-bg');if(bg&&y<innerHeight)bg.style.translate=`0 ${y*.25}px`;}}
addEventListener('scroll',onScroll,{passive:true});onScroll();
function toggle(o){menu.classList.toggle('open',o);burger.classList.toggle('open',o);burger.setAttribute('aria-expanded',o);document.body.classList.toggle('menu-lock',o);nav.classList.toggle('menu-open',o);burger.setAttribute('aria-label',o?'Tutup menu':'Buka menu')}
burger.onclick=()=>toggle(!menu.classList.contains('open'));
menu.querySelectorAll('a').forEach(a=>a.onclick=()=>toggle(false));
totop.onclick=()=>scrollTo({top:0,behavior:reduce?'auto':'smooth'});
if('IntersectionObserver'in window&&!reduce){
 const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('show');io.unobserve(e.target)}}),{threshold:.12,rootMargin:'0px 0px -40px 0px'});
 $$('.reveal').forEach((el,i)=>{el.style.transitionDelay=(i%4)*80+'ms';io.observe(el)});
}else $$('.reveal').forEach(el=>el.classList.add('show'));
const lb=$('#lightbox'),lbImg=lb.querySelector('img');
$$('.gallery img').forEach(i=>i.onclick=()=>{lbImg.src=i.src;lbImg.alt=i.alt;lb.classList.add('open')});
lb.onclick=()=>lb.classList.remove('open');addEventListener('keydown',e=>{if(e.key==='Escape'){lb.classList.remove('open');toggle(false)}});
