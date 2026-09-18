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
  window.clearImport=function(){const f=document.getElementById('file');if(f)f.value='';const im=document.getElementById('im');const ip=document.getElementById('ip');if(im)im.innerHTML='';if(ip)ip.innerHTML='';};
  const oldImport=window.importar;
  if(oldImport)window.importar=function(){oldImport();const file=document.getElementById('file');if(file&&!document.getElementById('cancel-import')){const c=document.createElement('button');c.id='cancel-import';c.className='btn danger';c.textContent='Cancelar / limpar';c.onclick=window.clearImport;file.parentElement?.appendChild(c)}};
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
  if(oldRender)window.render=function(p){oldRender(p);setTimeout(patchResearchers,0)};
  window.createR=async function(){const name=(document.getElementById('rn')?.value||'').trim(),phone=(document.getElementById('rp')?.value||'').trim(),sector=document.getElementById('rs')?.value,box=document.getElementById('rm'),btn=document.getElementById('crb');if(!name){if(box)box.innerHTML='<div class="notice err">Informe o nome do pesquisador.</div>';return}if(btn)btn.disabled=true;if(box)box.innerHTML='<div class="notice">Criando acesso do pesquisador…</div>';try{await window.api('create_link',{role:'researcher',display_name:name,sector_id:sector,phone});await window.load();window.render('pesquisadores')}catch(e){if(box)box.innerHTML='<div class="notice err">'+window.esc(e.message)+'</div>'}finally{if(btn)btn.disabled=false}};
  const oldDir=window.diretoria;
  if(oldDir)window.diretoria=function(){oldDir();if(window.access?.role!=='admin'){const card=[...document.querySelectorAll('h2')].find(h=>h.textContent.trim()==='Aplicativo por função')?.closest('.card');card?.remove()}};
})();
