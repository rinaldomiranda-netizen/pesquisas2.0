(()=>{
  const originalApi=window.api;
  if(originalApi) window.api=async function(action,body={},auth=true){
    const h={"Content-Type":"application/json"};
    if(auth&&window.session)h["x-field-session"]=window.session;
    const r=await fetch(window.API,{method:"POST",headers:h,cache:"no-store",body:JSON.stringify({action,...body,_refresh:Date.now()})});
    const j=await r.json(); if(!r.ok)throw Error(j.error||"Erro"); return j;
  };
  window.refreshActive=async function(active){try{await window.load();window.render(active)}catch(e){alert("Não foi possível atualizar os dados: "+(e.message||"Erro"))}};
  const oldShell=window.shell;
  if(oldShell){
    window.shell=function(title,sub,body,active){
      oldShell(title,sub,body,active);
      const buttons=[...document.querySelectorAll('.top .actions .btn')];
      const refresh=buttons.find(b=>b.textContent.includes('Atualizar'));
      if(refresh)refresh.onclick=()=>window.refreshActive(active);
      const role=window.access?.role||'admin';
      const manifest=document.querySelector('link[rel="manifest"]');
      if(manifest)manifest.href=role==='admin'?'./manifest-admin.webmanifest':role==='director'?'./manifest-diretoria.webmanifest':'./manifest-pesquisador.webmanifest';
    };
  }
  function clearImport(){const f=document.getElementById('file');if(f)f.value='';const im=document.getElementById('im');const ip=document.getElementById('ip');if(im)im.innerHTML='<div class="notice">Importação cancelada. Os dados já gravados no sistema permanecem intactos.</div>';if(ip)ip.innerHTML='';}
  window.clearImport=clearImport;
  function renderPersistentBase(){
    if(window.access?.role!=='admin'||typeof window.$!=='function')return;
    const ip=document.getElementById('ip'); if(!ip)return;
    const locations=window.data?.locations||[], sections=window.data?.sections||[];
    if(!locations.length){ip.innerHTML='<br><div class="notice">Nenhuma base importada está gravada no sistema ainda.</div>';return;}
    const rows=locations.flatMap(l=>sections.filter(s=>s.polling_location_id===l.id).map(s=>'<tr><td>'+window.esc(l.zone||s.zone||'')+'</td><td>'+window.esc(l.school_name||'')+'</td><td>'+window.esc(s.section||'')+'</td><td>'+window.esc((window.data.sectors||[]).find(x=>x.id===l.sector_id)?.name||'')+'</td></tr>')).join('');
    ip.innerHTML='<br><div class="card" style="padding:14px"><div class="actions" style="justify-content:space-between"><div><h3 style="margin:0">Base gravada no sistema</h3><p class="muted" style="margin:4px 0 0">Esta lista vem diretamente do banco de dados. Pode sair do menu e voltar sem perder os registros.</p></div><span class="tag ok">'+locations.length+' escola(s) · '+sections.length+' seção(ões)</span></div><br><div class="table"><table><tr><th>Zona</th><th>Escola</th><th>Seção</th><th>Setor</th></tr>'+rows+'</table></div></div>';
  }
  const oldImport=window.importar;
  if(oldImport)window.importar=function(){oldImport();const file=document.getElementById('file');if(file&&!document.getElementById('cancel-import')){const c=document.createElement('button');c.id='cancel-import';c.className='btn danger';c.textContent='Cancelar / limpar';c.onclick=window.clearImport;file.parentElement?.appendChild(c)}renderPersistentBase()};
  function patchResearchers(){
    if(window.access?.role!=='admin')return;
    const table=document.querySelector('.table table');if(!table)return;
    const head=table.querySelector('tr');if(!head)return;
    const th=[...head.children];
    if(!th.some(x=>x.textContent.trim()==='Telefone')){const phoneTh=document.createElement('th');phoneTh.textContent='Telefone';head.insertBefore(phoneTh,th[2]||null)}
    const links=(window.data?.links||[]).filter(x=>x.role==='researcher'&&x.active!==false),researchers=window.data?.researchers||[];
    [...table.querySelectorAll('tr')].slice(1).forEach((tr,i)=>{const r=researchers[i];if(!r)return;const link=links.find(x=>x.id===r.access_link_id||x.researcher_id===r.id||(x.display_name===r.full_name&&x.sector_id===r.sector_id));const url=r.access_url||link?.url||link?.access_url||'';const td=document.createElement('td');td.textContent=r.phone||'';tr.insertBefore(td,tr.children[2]||null);const linkCell=tr.children[3];if(linkCell&&url&&!linkCell.textContent.includes(url)){linkCell.innerHTML='';const copy=document.createElement('button');copy.className='btn small';copy.textContent='Copiar link';copy.onclick=()=>navigator.clipboard?.writeText(url);const wa=document.createElement('a');wa.className='btn success small';wa.target='_blank';wa.href='https://wa.me/?text='+encodeURIComponent('Acesso Pesquisa 2.0 — Pesquisador\n'+url+'\nSenha inicial: 1234');wa.textContent='WhatsApp';linkCell.append(copy,wa,document.createElement('br'));const small=document.createElement('small');small.className='muted';small.textContent=url;linkCell.append(small)}})
  }
  const oldRender=window.render;
  if(oldRender)window.render=function(p){oldRender(p);setTimeout(()=>{patchResearchers();if(p==='importar')renderPersistentBase()},0)};
  window.createR=async function(){const name=(document.getElementById('rn')?.value||'').trim(),phone=(document.getElementById('rp')?.value||'').trim(),sector=document.getElementById('rs')?.value,box=document.getElementById('rm'),btn=document.getElementById('crb');if(!name){if(box)box.innerHTML='<div class="notice err">Informe o nome do pesquisador.</div>';return}if(btn)btn.disabled=true;if(box)box.innerHTML='<div class="notice">Criando acesso do pesquisador…</div>';try{await window.api('create_link',{role:'researcher',display_name:name,sector_id:sector,phone});await window.load();window.render('pesquisadores')}catch(e){if(box)box.innerHTML='<div class="notice err">'+window.esc(e.message)+'</div>'}finally{if(btn)btn.disabled=false}};
  const oldDir=window.diretoria;
  if(oldDir)window.diretoria=function(){oldDir();if(window.access?.role!=='admin'){const card=[...document.querySelectorAll('h2')].find(h=>h.textContent.trim()==='Aplicativo por função')?.closest('.card');card?.remove()}};
})();
