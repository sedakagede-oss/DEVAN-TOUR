const $=s=>document.querySelector(s),$$=s=>document.querySelectorAll(s);
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const menu=$('#menu'),burger=$('#burger'),tr=s=>window.t?window.t(s):s;
function toggle(o){menu.classList.toggle('open',o);burger.classList.toggle('open',o);burger.setAttribute('aria-expanded',o);document.body.classList.toggle('menu-lock',o);burger.setAttribute('aria-label',tr(o?'Tutup menu':'Buka menu'))}
burger.onclick=()=>toggle(!menu.classList.contains('open'));
menu.querySelectorAll('a[href]:not([data-style]):not(.on)').forEach(a=>a.addEventListener('click',()=>toggle(false)));
addEventListener('keydown',e=>{if(e.key==='Escape')toggle(false)});
$$('.theme-btn').forEach(b=>b.onclick=()=>{const d=document.documentElement,n=d.dataset.theme==='dark'?'light':'dark';d.dataset.theme=n;try{localStorage.setItem('dbt-theme',n)}catch(e){}});
$$('.stylesw a').forEach(a=>a.addEventListener('click',e=>{if(a.classList.contains('on')){e.preventDefault();return}try{localStorage.setItem('dbt-style',a.dataset.style)}catch(x){}}));
const sl=$$('.slide'),dots=$$('.dot');let si=0,timer;
function go(i){sl[si].classList.remove('on');dots[si].classList.remove('on');si=(i+sl.length)%sl.length;sl[si].classList.add('on');dots[si].classList.add('on')}
if(sl.length){dots.forEach((d,i)=>d.onclick=()=>{go(i);clearInterval(timer)});if(!reduce)timer=setInterval(()=>go(si+1),5500)}
if('IntersectionObserver'in window&&!reduce){const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('show');io.unobserve(e.target)}}),{threshold:.1});$$('.reveal').forEach(el=>io.observe(el))}else $$('.reveal').forEach(el=>el.classList.add('show'));
(function(){const v=document.querySelector('.hero-video');if(!v)return;const c=navigator.connection||{};
if(reduce||c.saveData||/(^|-)2g/.test(c.effectiveType||'')){v.remove();return}
v.querySelectorAll('source').forEach(s=>s.src=s.dataset.src);v.load();
v.addEventListener('playing',()=>{v.closest('.hero').classList.add('has-video');clearInterval(timer)},{once:true});
const p=v.play();if(p)p.catch(()=>{});})();
