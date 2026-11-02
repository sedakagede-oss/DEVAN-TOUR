const nav=document.getElementById('nav'),burger=document.getElementById('burger'),menu=document.getElementById('menu');
addEventListener('scroll',()=>nav.classList.toggle('scrolled',scrollY>60));
burger.onclick=()=>{menu.classList.toggle('open');burger.classList.toggle('open')};
menu.querySelectorAll('a').forEach(a=>a.onclick=()=>{menu.classList.remove('open');burger.classList.remove('open')});
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('show');io.unobserve(e.target)}}),{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
const lb=document.getElementById('lightbox');
document.querySelectorAll('.gallery img').forEach(i=>i.onclick=()=>{lb.querySelector('img').src=i.src;lb.classList.add('open')});
lb.onclick=()=>lb.classList.remove('open');
