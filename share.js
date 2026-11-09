/* Tombol bagikan halaman paket DEVAN TOUR: WhatsApp, Facebook, Twitter, Telegram, TikTok, salin tautan. */
(function(){
  function t(s){return window.t?window.t(s):s}
  function toPublic(u){try{var x=new URL(u,location.href);if(x.hostname==='sedakagede-oss.github.io'){x.protocol='https:';x.host='devan-tour.pages.dev';x.pathname=x.pathname.replace(/^\/DEVAN-TOUR\/?/,'/').replace(/^\/devan-bali-tour\/?/,'/')}return x.href.split('#')[0]}catch(e){return String(u||'').split('#')[0]}}
  function abs(u){return toPublic(u)}
  function cleanUrl(u){return toPublic(u)}
  function pageTitle(scope){
    if(scope){var h=scope.querySelector('h1,h3');if(h&&h.textContent.trim())return h.textContent.trim()}
    var h1=document.querySelector('main h1,h1');
    return (h1&&h1.textContent.trim())||document.title.replace(/\s+[—\-]\s+DEVAN TOUR.*/i,'').trim()||'DEVAN TOUR';
  }
  function svg(p){return '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">'+p+'</svg>'}
  var I={
    wa:svg('<path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2s-1 .3-3.4-.7a11.6 11.6 0 0 1-4.6-4.1c-.4-.6-1-1.8-1-2.9s.6-1.7.9-2 .5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .6l-.4.6-.4.4c-.1.2-.3.3-.1.6a8.6 8.6 0 0 0 1.6 2 7.8 7.8 0 0 0 2.3 1.4c.3.1.5.1.6-.1l.9-1.1c.2-.3.4-.2.6-.1l1.9.9c.3.1.5.2.5.3a2.4 2.4 0 0 1-.1 1.4z"/>'),
    fb:svg('<path fill="currentColor" d="M14 8h3V4h-3a4 4 0 0 0-4 4v2H8v4h2v8h4v-8h3l1-4h-4V8z"/>'),
    tg:svg('<path fill="currentColor" d="M21.5 4.5 2.8 11.6c-1.3.5-1.3 1.2-.2 1.5l4.8 1.5 1.8 5.6c.2.7.4 1 1 .1l2.6-2.5 5.1 3.8c.9.5 1.6.2 1.8-.9l3.3-15.6c.3-1.3-.5-1.9-1.5-1.5z"/>'),
    tw:svg('<path fill="currentColor" d="M22 5.8c-.7.3-1.5.5-2.4.6.8-.5 1.5-1.3 1.8-2.3-.8.5-1.7.8-2.6 1a4.1 4.1 0 0 0-7 3.7A11.7 11.7 0 0 1 2.7 4.9a4.1 4.1 0 0 0 1.3 5.5c-.7 0-1.3-.2-1.9-.5v.1a4.1 4.1 0 0 0 3.3 4 4 4 0 0 1-1.9.1 4.1 4.1 0 0 0 3.8 2.9A8.3 8.3 0 0 1 2 18.4 11.7 11.7 0 0 0 8.3 20.2c7.6 0 11.7-6.3 11.7-11.7v-.5c.8-.6 1.5-1.3 2-2.2z"/>'),
    tt:svg('<path fill="currentColor" d="M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 1 1-2.59-2.5c.28 0 .54.05.79.13V9.66c-.26-.03-.53-.05-.79-.05A5.69 5.69 0 0 0 4.17 15.3 5.69 5.69 0 0 0 9.86 21c3.14 0 5.69-2.55 5.69-5.7V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3a4.84 4.84 0 0 1-3.25-1.48z"/>'),
    copy:svg('<path fill="none" stroke="currentColor" stroke-width="2" d="M8 8h11v13H8z"/><path fill="none" stroke="currentColor" stroke-width="2" d="M5 16V3h11"/>'),
    share:svg('<path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7M16 6l-4-4-4 4M12 2v14"/>')
  };
  function link(href,cls,label,icon){
    var a=document.createElement('a');
    a.href=href;a.className='sharebtn '+cls;a.target='_blank';a.rel='noopener noreferrer';
    a.setAttribute('aria-label',label);a.title=label;
    a.innerHTML=icon+'<span>'+label+'</span>';
    return a;
  }
  function bar(url,title){
    url=cleanUrl(url);
    var wrap=document.createElement('div');
    wrap.className='sharebar';
    var lab=document.createElement('p');
    lab.className='sharebar-l';
    lab.textContent=t('Bagikan');
    var row=document.createElement('div');
    row.className='sharebar-row';
    var msg=title+' — DEVAN TOUR\n'+url;
    var encU=encodeURIComponent(url),encT=encodeURIComponent(title+' — DEVAN TOUR'),encAll=encodeURIComponent(msg);
    if(navigator.share){
      var ns=document.createElement('button');
      ns.type='button';ns.className='sharebtn share-native';
      ns.setAttribute('aria-label',t('Bagikan'));ns.title=t('Bagikan');
      ns.innerHTML=I.share+'<span>'+t('Bagikan')+'</span>';
      ns.addEventListener('click',function(){
        navigator.share({title:title+' — DEVAN TOUR',text:title+' — DEVAN TOUR',url:url}).catch(function(){});
      });
      row.appendChild(ns);
    }
    row.appendChild(link('https://wa.me/?text='+encAll,'share-wa',t('WhatsApp'),I.wa));
    row.appendChild(link('https://www.facebook.com/sharer/sharer.php?u='+encU,'share-fb',t('Facebook'),I.fb));
    row.appendChild(link('https://twitter.com/intent/tweet?text='+encT+'&url='+encU,'share-tw',t('Twitter'),I.tw));
    row.appendChild(link('https://t.me/share/url?url='+encU+'&text='+encT,'share-tg',t('Telegram'),I.tg));
    function writeClip(text,onOk){
      if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(text).then(onOk).catch(fb)}else fb();
      function fb(){var i=document.createElement('input');i.value=text;document.body.appendChild(i);i.select();try{if(document.execCommand('copy'))onOk()}catch(e){}document.body.removeChild(i)}
    }
    var tt=document.createElement('button');
    tt.type='button';tt.className='sharebtn share-tt';
    tt.setAttribute('aria-label',t('TikTok'));tt.title=t('TikTok');
    tt.innerHTML=I.tt+'<span>'+t('TikTok')+'</span>';
    tt.addEventListener('click',function(){
      var s=tt.querySelector('span');
      function flashed(){if(s)s.textContent=t('Tersalin!');setTimeout(function(){if(s)s.textContent=t('TikTok')},1800)}
      if(navigator.share){
        navigator.share({title:title+' — DEVAN TOUR',text:msg,url:url}).catch(function(err){
          if(err&&err.name==='AbortError')return;
          writeClip(msg,flashed);
        });
      }else writeClip(msg,flashed);
    });
    row.appendChild(tt);
    var copy=document.createElement('button');
    copy.type='button';copy.className='sharebtn share-copy';
    copy.setAttribute('aria-label',t('Salin tautan'));copy.title=t('Salin tautan');
    copy.innerHTML=I.copy+'<span>'+t('Salin tautan')+'</span>';
    function copied(){var s=copy.querySelector('span');if(s)s.textContent=t('Tersalin!');setTimeout(function(){if(s)s.textContent=t('Salin tautan')},1800)}
    copy.addEventListener('click',function(){
      if(navigator.clipboard&&navigator.clipboard.writeText){
        navigator.clipboard.writeText(url).then(copied).catch(fallback);
      }else fallback();
      function fallback(){
        var i=document.createElement('input');i.value=url;document.body.appendChild(i);i.select();
        try{if(document.execCommand('copy'))copied()}catch(e){}
        document.body.removeChild(i);
      }
    });
    row.appendChild(copy);
    wrap.appendChild(lab);wrap.appendChild(row);
    return wrap;
  }
  function mount(){
    document.querySelectorAll('.sharebar').forEach(function(el){el.remove()});
    document.querySelectorAll('aside.book').forEach(function(box){
      var el=bar(location.href,pageTitle(document));
      var btn=box.querySelector(':scope > a.btn.full')||box.querySelector('a.btn.full');
      if(btn)btn.insertAdjacentElement('afterend',el);
      else{
        var form=box.querySelector('.bk-side');
        if(form)box.insertBefore(el,form);else box.appendChild(el);
      }
    });
    document.querySelectorAll('article.card, article.pkg').forEach(function(card){
      var a=card.querySelector('a.btn-out[href*="paket/"], a.link[href*="paket/"], a[href*="paket/"]');
      if(!a)return;
      var el=bar(abs(a.getAttribute('href')),pageTitle(card));
      el.classList.add('sharebar-card');
      var crow=card.querySelector('.crow');
      if(crow)crow.parentNode.appendChild(el);
      else{
        var body=card.querySelector('.cbody, .pkg-body');
        (body||card).appendChild(el);
      }
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);
  else mount();
  new MutationObserver(function(){mount()}).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
})();
