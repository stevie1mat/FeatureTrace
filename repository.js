const API='https://api.github.com';
export function parseRepository(input){
 let value=String(input).trim();
 if(/^https?:\/\//i.test(value)){
  const u=new URL(value);if(u.protocol!=='https:'||u.hostname!=='github.com'||u.username||u.password||u.port)throw new Error('Use an HTTPS github.com repository URL.');
  const parts=u.pathname.replace(/^\/|\/$/g,'').split('/');if(parts.length!==2)throw new Error('Paste the repository root URL. Enter a branch separately.');value=parts.join('/');
 }
 value=value.replace(/\.git$/,'');if(!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(value))throw new Error('Enter a public GitHub URL or owner/repository.');return value;
}
export async function openPublicRepository({app,brand,back,input,branch}){
 let repository;try{repository=parseRepository(input);}catch(error){const e=document.querySelector('#repo-error');e.hidden=false;e.textContent=error.message;return;}
 const controller=new AbortController();let selection=0;let activePath='';const cache=new Map();
 app.innerHTML=`<main class="workbench repository-workbench"><header>${brand()}<span class="workspace-divider"></span><span id="public-repo-name"></span><span class="branch-pill" id="public-branch"></span><button class="text-button" id="repo-back">Change project</button></header><section class="workspace-heading"><div><span class="overline orange">PUBLIC REPOSITORY</span><h1>Start with the source.</h1><p id="repo-summary" role="status">Reading repository metadata…</p></div><a class="repo-external" target="_blank" rel="noopener noreferrer">Open on GitHub ↗</a></section><p class="repository-limit">Source exploration only. Files are never executed. A repo link does not provide a live website, observed requests, database access, or test results.</p><div class="repository-grid"><section class="repo-files"><div class="panel-title"><h2>Repository files</h2><span id="file-count"></span></div><label class="file-search-label" for="repo-filter">Find a file</label><input id="repo-filter" type="search" placeholder="Search file paths…"><div id="repo-file-list"></div></section><section class="repo-source"><div class="panel-title"><h2 id="selected-file">Select a source file</h2><a id="file-github" target="_blank" rel="noopener noreferrer" hidden>View source ↗</a></div><p id="file-status" role="status">Waiting for the repository…</p><pre id="public-source" tabindex="0" aria-label="Repository source code"></pre><section class="source-connections"><h2>Source references</h2><p>Literal relative imports found in the selected JS/TS file. These are source candidates, not verified runtime connections.</p><div id="import-list"></div></section></section></div></main>`;
 document.querySelector('#public-repo-name').textContent=repository;document.querySelector('.repo-external').href=`https://github.com/${repository}`;
 document.querySelector('#repo-back').onclick=()=>{controller.abort();selection++;back();};
 async function json(path){let response;try{response=await fetch(`${API}/repos/${repository}${path}`,{signal:controller.signal,headers:{Accept:'application/vnd.github+json'}});}catch(e){if(e.name==='AbortError')throw e;throw new Error('Could not reach GitHub. Check your network and try again.');}
  if(!response.ok){if(response.status===403||response.status===429)throw new Error('GitHub request limit reached or access denied. Try later. Public access has a limited request budget.');if(response.status===404)throw new Error('Repository or branch not found. Only public repositories are supported.');if(response.status===409)throw new Error('This repository is empty. Choose one containing source files.');throw new Error(`GitHub returned ${response.status}. Try again later.`);}return response.json();}
 try{
  const meta=await json('');if(meta.private)throw new Error('Only public repositories are supported.');
  const ref=String(branch||'').trim()||meta.default_branch;
  const commit=await json(`/commits/${encodeURIComponent(ref)}`);const sha=commit.sha;
  if(!/^[a-f0-9]{40}$/.test(sha))throw new Error('GitHub did not return a valid commit.');
  document.querySelector('#public-branch').textContent=`${ref} · ${sha.slice(0,7)}`;
  const tree=await json(`/git/trees/${sha}?recursive=1`);
  const files=(tree.tree||[]).filter(f=>f.type==='blob'&&f.mode!=='120000');
  const textFiles=files.filter(f=>/\.(?:[cm]?[jt]sx?|json|md|mdx|css|scss|html|vue|svelte|py|rb|go|rs|java|sql|yml|yaml|toml|txt|sh|graphql)$/i.test(f.path)&&!/(^|\/)(?:node_modules|vendor|dist|build)\//.test(f.path)&&!/(?:package-lock\.json|yarn\.lock|pnpm-lock\.yaml)$/.test(f.path));
  const byPath=new Map(files.map(f=>[f.path,f]));
  document.querySelector('#repo-summary').textContent=`${files.length.toLocaleString()} files listed · ${textFiles.length.toLocaleString()} supported text files · pinned to commit ${sha.slice(0,7)}${tree.truncated?' · GitHub truncated this tree; listing is incomplete.':''}`;
  document.querySelector('#file-count').textContent=String(textFiles.length);
  function renderFiles(){const list=document.querySelector('#repo-file-list');list.replaceChildren();const q=document.querySelector('#repo-filter').value.toLowerCase();const matches=textFiles.filter(f=>f.path.toLowerCase().includes(q));for(const file of matches.slice(0,200)){const button=document.createElement('button');button.className='repo-file';button.textContent=file.path;button.title=file.path;button.dataset.path=file.path;button.setAttribute('aria-pressed',String(file.path===activePath));button.onclick=()=>showFile(file);list.append(button);}if(!matches.length){const p=document.createElement('p');p.textContent='No supported files match your search.';list.append(p);}if(matches.length>200){const p=document.createElement('p');p.textContent=`Showing 200 of ${matches.length} matches. Refine the search.`;list.append(p);}}
  document.querySelector('#repo-filter').oninput=renderFiles;renderFiles();
  async function showFile(file){const token=++selection;activePath=file.path;document.querySelector('#selected-file').textContent=file.path;document.querySelector('#public-source').textContent='';document.querySelector('#import-list').replaceChildren();document.querySelector('#file-status').textContent='Loading source…';const link=document.querySelector('#file-github');link.hidden=false;link.href=`https://github.com/${repository}/blob/${sha}/${file.path.split('/').map(encodeURIComponent).join('/')}`;renderFiles();
   if(file.size>300000){document.querySelector('#file-status').textContent='File exceeds the 300 KB preview limit. Open it on GitHub.';return;}
   try{let text=cache.get(file.sha);if(text===undefined){const blob=await json(`/git/blobs/${encodeURIComponent(file.sha)}`);if(blob.size>300000||blob.encoding!=='base64')throw new Error('This file cannot be previewed within the 300 KB text limit.');const encoded=String(blob.content).replace(/\s/g,'');if(encoded.length>410000)throw new Error('File exceeds preview limits.');text=new TextDecoder().decode(Uint8Array.from(atob(encoded),c=>c.charCodeAt(0)));if(text.includes('\u0000'))throw new Error('This file appears to be binary. Open it on GitHub.');cache.set(file.sha,text);}
    if(token!==selection||controller.signal.aborted)return;
    document.querySelector('#public-source').textContent=text;document.querySelector('#file-status').textContent=`Source loaded from commit ${sha.slice(0,7)} · ${text.split('\n').length} lines · not executed`;
    const imports=new Set();const regex=/(?:\bfrom\s*|\bimport\s*\(\s*|\brequire\s*\(\s*|\bimport\s*)["'](\.[^"'\n]+)["']/g;
    if(/\.[cm]?[jt]sx?$/.test(file.path))for(const match of text.matchAll(regex))imports.add(match[1]);
    const list=document.querySelector('#import-list');
    for(const spec of [...imports].slice(0,60)){const parts=file.path.split('/').slice(0,-1);for(const part of spec.split('/')){if(part==='..')parts.pop();else if(part!=='.')parts.push(part);}const base=parts.join('/');const targets=[base,...['.ts','.tsx','.js','.jsx','.mjs','.json','/index.ts','/index.tsx','/index.js','/index.jsx'].map(s=>base+s)];const resolved=targets.find(t=>byPath.has(t));const row=document.createElement(resolved?'button':'p');row.className='import-reference';row.textContent=resolved?`${spec} → ${resolved}`:`${spec} — unresolved (aliases/build rules may apply)`;if(resolved)row.onclick=()=>showFile(byPath.get(resolved));list.append(row);}
    if(!imports.size){const p=document.createElement('p');p.textContent='No supported literal relative imports found. This does not mean the file has no dependencies.';list.append(p);}
   }catch(error){if(error.name!=='AbortError'&&token===selection)document.querySelector('#file-status').textContent=error.message;}
  }
  document.querySelector('#file-status').textContent='Choose a file to inspect its source.';
  if(textFiles.length){const first=textFiles.find(f=>/^src\/.*\.[jt]sx?$/.test(f.path))||textFiles.find(f=>f.path==='README.md')||textFiles[0];await showFile(first);}
 }catch(error){if(error.name!=='AbortError'){document.querySelector('#repo-summary').textContent=error.message;document.querySelector('#file-status').textContent='Use Change project to try another repository or branch.';}}
}
