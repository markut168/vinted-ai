const $=id=>document.getElementById(id);let imgs=[],saved=JSON.parse(localStorage.getItem('vintedAI')||'[]');
function go(id){document.querySelectorAll('.screen').forEach(x=>x.classList.remove('active'));$(id).classList.add('active');if(id==='history')renderHistory();scrollTo(0,0)}
document.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>go(b.dataset.go));
$('theme').onclick=()=>document.body.classList.toggle('dark');
$('photos').onchange=e=>{imgs=[...e.target.files];$('preview').innerHTML='';imgs.forEach(f=>{let i=document.createElement('img');i.src=URL.createObjectURL(f);$('preview').appendChild(i)})};
$('generate').onclick=async()=>{
 if(!imgs.length){$('status').textContent='Aggiungi almeno una foto.';return}
 $('status').textContent='🔎 Analizzo le foto…';
 let fd=new FormData();imgs.forEach(f=>fd.append('images',f));
 ['brand','size','condition','price','extra'].forEach(k=>fd.append(k,$(k).value));
 try{let r=await fetch('/api/listing',{method:'POST',body:fd});let d=await r.json();if(!r.ok)throw Error(d.error||'Errore');
 $('title').value=d.title;$('description').value=d.description;$('category').value=d.category;$('hashtags').value=(d.hashtags||[]).join(' ');$('suggested').value=d.suggested_price?'€ '+d.suggested_price:'';
 $('status').textContent='Annuncio pronto ✓';go('listing')}catch(e){$('status').textContent='Errore: '+e.message}
};
$('copy').onclick=async()=>{await navigator.clipboard.writeText(`${$('title').value}\n\n${$('description').value}\n\n${$('hashtags').value}\nPrezzo: ${$('suggested').value}`);$('copy').textContent='Copiato ✓';setTimeout(()=>$('copy').textContent='Copia tutto',1200)};
$('save').onclick=()=>{saved.unshift({title:$('title').value,description:$('description').value,price:$('suggested').value,date:new Date().toLocaleDateString('it-IT')});saved=saved.slice(0,30);localStorage.setItem('vintedAI',JSON.stringify(saved));$('save').textContent='Salvato ✓';setTimeout(()=>$('save').textContent='💾 Salva annuncio',1200)};
function renderHistory(){let h=$('historyList');h.innerHTML=saved.length?saved.map(x=>`<div class="history-card"><b>${esc(x.title)}</b><small>${esc(x.date)} · ${esc(x.price)}</small><p>${esc(x.description).slice(0,180)}…</p></div>`).join(''):'<p>Nessun annuncio salvato.</p>'}
function esc(s){return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}
if('serviceWorker'in navigator)navigator.serviceWorker.register('/sw.js');