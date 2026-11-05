/* Menampilkan harga dari data/harga.json. Jika kosong / tidak aktif, teks "Harga segera hadir" tetap tampil. */
(function(){
  var me=document.currentScript,base=(me&&me.dataset.base)||'',data=null;
  function num(v){v=String(v==null?'':v).replace(/[^\d]/g,'');return v?parseInt(v,10):0}
  function render(){
    if(!data||!data.paket)return;var en=document.documentElement.lang==='en';
    document.querySelectorAll('[data-harga]').forEach(function(el){
      var p=data.paket[el.dataset.harga],idr=p&&num(p.idr);
      if(!p||!p.aktif||!idr){if(el.dataset.done){el.innerHTML=el.dataset.orig;delete el.dataset.done}return}
      if(!el.dataset.done)el.dataset.orig=el.innerHTML;el.dataset.done=1;
      var usd=num(p.usd),note=en?(p.catatan_en||p.catatan):p.catatan;
      var rp='Rp '+idr.toLocaleString('id-ID');if(el.dataset.only){el.textContent=rp;return}
      var u=('satuan' in p)?(en?(p.satuan_en!=null?p.satuan_en:p.satuan):p.satuan):(en?'/ person':'/ orang');
      var h='<b>'+rp+'</b>'+(u?' '+String(u).replace(/[<>&]/g,''):'');
      if(usd)h+=' <small class="usd">≈ US$'+usd.toLocaleString('en-US')+'</small>';
      if(note&&el.dataset.full)h+='<small class="pnote">'+String(note).replace(/[<>&]/g,'')+'</small>';
      else if(note)h+=' <small class="pnote-i">· '+String(note).replace(/[<>&]/g,'')+'</small>';
      el.innerHTML=h;el.classList.add('has-price');
    });
  }
  fetch(base+'data/harga.json?v='+Date.now(),{cache:'no-store'}).then(function(r){return r.json()}).then(function(d){data=d;render()}).catch(function(){});
  new MutationObserver(function(){setTimeout(render,0)}).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  window.renderHarga=function(d){if(d)data=d;render()};
})();
