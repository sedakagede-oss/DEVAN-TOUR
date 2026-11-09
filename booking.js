/* Form booking DEVAN TOUR → WhatsApp. Harga dari data/harga.json, deposit 40%. */
(function(){
  var me=document.currentScript,base=(me&&me.dataset.base)||'',data=null;
  var DUR={kintamani:['full','half'],lovina:['full','half'],ubud:['full','half'],uluwatu:['full','half']};
  function en(){return document.documentElement.lang==='en'}
  function L(i,e){return en()?e:i}
  function num(v){v=String(v==null?'':v).replace(/[^\d]/g,'');return v?parseInt(v,10):0}
  function rp(n){return 'Rp '+n.toLocaleString('id-ID')}
  function durLabel(d){return d==='full'?L('Full day (8–10 jam)','Full day (8–10 hours)'):L('Half day','Half day')}
  function calc(f){
    var s=f.paket.value,d=f.durasi.value,pax=Math.max(1,num(f.pax.value)||1),p=data&&data.paket&&data.paket[s];
    var dur=DUR[s]||['full'];
    var idr=0;
    if(p&&p.aktif){
      if(d==='half')idr=num(p.idr_half);
      else if(d===dur[0]||d==='full')idr=num(p.idr);
    }
    if(!idr)return {txt:L('Menyusul','To be confirmed'),dep:L('Menyusul','To be confirmed'),total:0};
    var per=!('satuan' in p);var total=per?idr*pax:idr;
    return {txt:rp(total)+(per?' ('+rp(idr)+L(' × '+pax+' orang',' × '+pax+' people')+')':L(' / tur',' / tour')),dep:rp(Math.ceil(total*0.4)),total:total};
  }
  function fillDur(f){
    var cur=f.durasi.value,dur=DUR[f.paket.value]||['full'];
    f.durasi.innerHTML='';
    ['full','half'].forEach(function(d){var o=document.createElement('option');o.value=d;
      var ok=dur.indexOf(d)>=0;
      var priced=ok&&data&&data.paket&&data.paket[f.paket.value]&&((d==='half')?num(data.paket[f.paket.value].idr_half):num(data.paket[f.paket.value].idr));
      o.textContent=durLabel(d)+(ok?(priced?'':L(' — harga menyusul',' — price TBC')):L(' — tidak tersedia',' — not available'));o.disabled=!ok;f.durasi.appendChild(o)});
    f.durasi.value=dur.indexOf(cur)>=0?cur:dur[0];
  }
  function upd(f){var c=calc(f);f.querySelector('.bk-price').textContent=c.txt;f.querySelector('.bk-dep').textContent=c.dep}
  function init(f){
    var d=f.tanggal,t=new Date();t.setDate(t.getDate()+1);d.min=t.toISOString().slice(0,10);
    fillDur(f);upd(f);
    f.paket.addEventListener('change',function(){fillDur(f);upd(f)});
    ['durasi','pax'].forEach(function(n){f[n].addEventListener('input',function(){upd(f)});f[n].addEventListener('change',function(){upd(f)})});
    f.addEventListener('submit',function(e){
      e.preventDefault();var err=f.querySelector('.bk-err'),bad=null;
      f.querySelectorAll('[required]').forEach(function(el){var ok=el.type==='checkbox'?el.checked:String(el.value).trim()!=='';if(el.name==='pax')ok=num(el.value)>=1;if(el.name==='tanggal'&&ok&&el.value<el.min)ok=false;el.classList.toggle('bk-bad',!ok);if(!ok&&!bad)bad=el});
      var k=f.kontak.value.trim();if(k&&!/@.+\./.test(k)&&num(k).toString().length<8){f.kontak.classList.add('bk-bad');bad=bad||f.kontak}
      if(bad){err.textContent=bad.name==='setuju'?L('Mohon setujui kebijakan deposit.','Please accept the deposit policy.'):L('Mohon lengkapi kolom yang ditandai dengan benar.','Please complete the highlighted fields correctly.');err.hidden=false;bad.focus();return}
      err.hidden=true;var c=calc(f),o=f.paket.options[f.paket.selectedIndex].text;
      var m=['*BOOKING DEVAN TOUR*','','Nama: '+f.nama.value.trim(),'Negara/asal: '+(f.negara.value.trim()||'-'),'WA/Email: '+k,'Paket: '+o,'Durasi: '+durLabel(f.durasi.value),'Tanggal tur: '+f.tanggal.value,'Jumlah orang: '+num(f.pax.value),'Lokasi jemput: '+f.jemput.value.trim(),'Catatan: '+(f.catatan.value.trim()||'-'),'','Harga: '+c.txt,'Deposit minimal 40%: '+c.dep,'Metode pembayaran deposit: QRIS / e-wallet (DANA, OVO, GoPay)','','Saya setuju: deposit minimal 40%, bila tamu membatalkan deposit hangus (tidak dapat dikembalikan).'].join('\n');
      window.open('https://wa.me/'+f.dataset.wa+'?text='+encodeURIComponent(m),'_blank','noopener');
    });
    f.addEventListener('input',function(e){e.target.classList&&e.target.classList.remove('bk-bad')});
    new MutationObserver(function(){fillDur(f);upd(f)}).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  }
  var fs=document.querySelectorAll('form.bk');if(!fs.length)return;
  fs.forEach(init);
  function loadHarga(url){return fetch(url,{cache:'no-store'}).then(function(r){if(!r.ok)throw new Error('harga');return r.json()})}
  loadHarga('/api/harga?v='+Date.now()).catch(function(){return loadHarga(base+'data/harga.json?v='+Date.now())}).then(function(d){data=d;fs.forEach(function(f){fillDur(f);upd(f)})}).catch(function(){});
})();
