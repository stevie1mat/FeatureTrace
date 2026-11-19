import React,{useEffect,useState} from 'react';
import {createRoot} from 'react-dom/client';
import './style.css';

const icon=(name)=>(
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {name==='logo'&&<><path d="M5 5h5v5H5zm9 9h5v5h-5zM7.5 10v6.5H14M10 7.5h6.5V14"/></>}
    {name==='arrow'&&<path d="M4 12h16m-6-6 6 6-6 6"/>}
    {name==='git'&&<><circle cx="7" cy="5" r="2"/><circle cx="17" cy="7" r="2"/><circle cx="7" cy="19" r="2"/><path d="M7 7v10m10-8c0 4-10 1-10 6"/></>}
    {name==='code'&&<path d="m8 7-5 5 5 5m8-10 5 5-5 5m-3-13-2 20"/>}
    {name==='api'&&<path d="M4 8h16m-4-4 4 4-4 4M20 16H4m4-4-4 4 4 4"/>}
    {name==='db'&&<><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 4 16 4 16 0V5M4 12c0 4 16 4 16 0"/></>}
    {name==='test'&&<path d="M9 3h6m-5 0v7L4 20h16l-6-10V3M8 14h8"/>}
  </svg>
);
function Brand(){
 return <a className="brand" href="#landing" aria-label="FeatureTrace home">{icon('logo')}<span>FeatureTrace</span></a>;
}
async function api(path,options={}){
 const response=await fetch(path,{headers:{'Content-Type':'application/json',...(options.headers||{})},credentials:'same-origin',...options});
 const body=await response.json().catch(()=>({}));
 if(!response.ok)throw new Error(body.error||`Request failed (${response.status})`);
 return body;
}
function ThemeToggle({landing=false}){
 const [theme,setTheme]=useState(()=>localStorage.getItem('featuretrace.theme')==='light'?'light':'dark');
 useEffect(()=>{document.documentElement.dataset.theme=theme;localStorage.setItem('featuretrace.theme',theme);},[theme]);
 return <button className={`theme-toggle${landing?' landing-theme-toggle':''}`} type="button" aria-label={`Switch to ${theme==='light'?'dark':'light'} mode`} aria-pressed={theme==='light'} onClick={()=>setTheme(theme==='light'?'dark':'light')}>{theme==='light'?'Dark mode':'Light mode'}</button>;
}
function TraceAnimation(){
 const [paused,setPaused]=useState(false);
 return <div className={`trace-animation${paused?' paused':''}`} role="group" aria-label="Illustrative animation tracing a checkout click to its API and database">
  <div className="scene-topline"><span>A FEATURE, IN MOTION</span><button type="button" id="motion-toggle" aria-label={paused?'Play animation':'Pause animation'} onClick={()=>setPaused(value=>!value)}>{paused?'Play':'Pause'} <span>{paused?'▷':'Ⅱ'}</span></button></div>
  <svg className="trace-wires" viewBox="0 0 600 420" fill="none" aria-hidden="true">
   <defs><linearGradient id="wire-color"><stop stopColor="#eeb387"/><stop offset="1" stopColor="#8fcab3"/></linearGradient></defs>
   <path className="wire-base" d="M245 123 H300 Q320 123 320 143 V188 Q320 208 340 208 H368"/>
   <path className="wire-base" d="M458 252 V305 Q458 325 438 325 H280"/>
   <path className="wire-base wire-return" d="M142 290 V248 Q142 228 122 228 H100 Q80 228 80 208 V171"/>
   <path className="wire-signal signal-api" pathLength="100" d="M245 123 H300 Q320 123 320 143 V188 Q320 208 340 208 H368"/>
   <path className="wire-signal signal-db" pathLength="100" d="M458 252 V305 Q458 325 438 325 H280"/>
   <path className="wire-signal signal-return" pathLength="100" d="M142 290 V248 Q142 228 122 228 H100 Q80 228 80 208 V171"/>
  </svg>
  <div className="scene-browser">
   <div className="scene-browser-bar"><div><i/><i/><i/></div><span>storefront / checkout</span></div>
   <div className="scene-browser-content"><span className="mini-eyebrow">YOUR ORDER</span><div className="mini-product"><div className="mini-product-art">{icon('code')}</div><div><strong>Everyday essentials</strong><small>Ready when you are.</small></div></div><div className="mini-pay">Pay now <span>↗</span><i className="click-ripple"/></div></div>
   <svg className="scene-cursor" viewBox="0 0 24 30" fill="#f9e3ce" stroke="#422c1b" strokeWidth="1"><path d="M3 2v22l6-6 5 10 5-3-6-9h8L3 2Z"/></svg>
   <span className="component-chip">{icon('code')} CheckoutButton.tsx</span>
  </div>
  <div className="scene-api"><div className="scene-node-icon">{icon('api')}</div><div><span className="mini-eyebrow">API REQUEST</span><strong><em>POST</em> /api/checkout</strong></div><span className="scene-success">200</span></div>
  <div className="scene-database"><div className="scene-node-icon">{icon('db')}</div><div><span className="mini-eyebrow">DATABASE</span><strong>orders</strong></div><span className="database-state">+ 1 row</span></div>
  <div className="scene-caption"><span className="phase phase-one">01 <b>Select the interaction</b></span><span className="phase phase-two">02 <b>Follow the request</b></span><span className="phase phase-three">03 <b>Find the connection</b></span><span className="scene-demo">ILLUSTRATIVE TRACE</span></div>
 </div>;
}
function Landing(){
 useEffect(()=>{
  document.documentElement.dataset.theme='light';
  const observer=new IntersectionObserver(entries=>{
   entries.forEach(entry=>{
    if(entry.isIntersecting)entry.target.classList.add('is-visible');
   });
  },{threshold:.14});
  document.querySelectorAll('.reveal').forEach(element=>observer.observe(element));
  function parallax(){
   document.querySelectorAll('[data-parallax]').forEach(element=>{
    const rect=element.getBoundingClientRect();
    const speed=Number(element.dataset.parallax||0);
    const offset=(rect.top-window.innerHeight*.5)*speed;
    element.style.setProperty('--parallax-y',`${offset}px`);
   });
  }
  parallax();
  window.addEventListener('scroll',parallax,{passive:true});
  return()=>{
   observer.disconnect();
   window.removeEventListener('scroll',parallax);
  };
 },[]);
 return <main className="landing-page">
 <nav className="landing-nav" aria-label="Main navigation"><Brand/><div><a href="#product">Product</a><a href="#how">How it works</a><a href="#evidence">Evidence</a><a href="#login" className="landing-nav-login">Sign in {icon('arrow')}</a></div></nav>
  <section className="landing-hero" id="product">
   <div className="landing-hero-copy reveal"><span className="landing-kicker">APPLICATION MAP <i/> 2026</span><h1>Follow the<br/><em>whole feature.</em></h1><p>FeatureTrace reveals the component, request, source, and related tests behind one interaction—so engineers can understand the full feature without guesswork.</p><div className="landing-actions"><a className="primary" href="#login">Explore a feature {icon('arrow')}</a><a className="landing-secondary" href="#how">View the trace ↓</a></div><div className="landing-hero-proof"><span><b>Public source</b><small>GitHub repository links</small></span><span><b>Evidence labels</b><small>Observed / source / inferred</small></span></div></div>
   <div className="landing-hero-visual reveal" data-parallax="-0.035"><TraceAnimation/></div>
  </section>
  <section className="landing-proof reveal"><p><span>01</span> SELECT THE INTERACTION</p><p><span>02</span> FOLLOW THE REQUEST</p><p><span>03</span> READ THE SOURCE</p><p><span>04</span> CHECK RELATED TESTS</p></section>
  <section className="landing-section landing-problem" id="how"><div className="landing-section-copy reveal" data-parallax="0.025"><span className="overline orange">FROM SURFACE TO SYSTEM</span><h2>One interaction.<br/>A complete path.</h2><p>Start where users act. Follow the request. Find the implementation and test surface behind it—all in one focused view.</p></div><div className="landing-path reveal" data-parallax="-0.018"><div className="landing-path-node"><span>01 · SELECT</span>{icon('arrow')}<strong>Inspect</strong><p>Choose a visible button, link, form action, or element.</p></div><div className="landing-path-node"><span>02 · FOLLOW</span>{icon('api')}<strong>Trace</strong><p>Follow the browser request and any mapped application layer.</p></div><div className="landing-path-node"><span>03 · UNDERSTAND</span>{icon('code')}<strong>Connect</strong><p>Locate literal source references and the tests associated with the feature.</p></div></div></section>
  <section className="landing-section landing-evidence" id="evidence"><div className="evidence-orbit" data-parallax="0.04" aria-hidden="true"><span/><span/><span/></div><div className="landing-section-copy reveal"><span className="overline orange">CONTEXT YOU CAN TRUST</span><h2>Every signal.<br/>Honest labels.</h2><p>FeatureTrace distinguishes what was observed, what came from source, and what is only inferred. No live result is presented as verified.</p></div><div className="evidence-cards reveal"><article><span>Observed · example request</span><strong>POST /api/checkout</strong><p>Network timing and response shown as demo evidence.</p></article><article><span>Source reference</span><strong>CheckoutButton.tsx</strong><p>Literal implementation location with a direct source link.</p></article><article><span>Inferred relationship</span><strong>orders · Stripe</strong><p>Requires instrumented runtime or verified source evidence.</p></article></div></section>
  <section className="landing-section landing-workspace"><div className="workspace-preview reveal" data-parallax="-0.02"><div className="workspace-preview-bar"><div><i/><i/><i/></div><span>Checkout feature map</span></div><div className="workspace-preview-body"><div className="workspace-preview-step is-active"><span>01 · INTERFACE</span><strong>CheckoutButton.tsx</strong></div><div className="workspace-preview-step"><span>02 · REQUEST</span><strong>POST /api/checkout</strong></div><div className="workspace-preview-step"><span>03 · CONNECTION</span><strong>orders · Stripe</strong></div></div></div><div className="landing-section-copy reveal"><span className="overline orange">ONE EXPLORABLE VIEW</span><h2>Keep the whole<br/>feature in reach.</h2><p>Save public repositories, pin branches to commits, inspect supported source files, and disclose unresolved imports or incomplete GitHub trees.</p><a className="primary" href="#login">Open FeatureTrace {icon('arrow')}</a></div></section>
  <section className="landing-section landing-final reveal"><span className="overline">READY WHEN YOU ARE</span><h2>Find the story<br/>behind your next click.</h2><a className="primary" href="#login">Start tracing {icon('arrow')}</a></section>
  <footer className="landing-footer"><Brand/><span>© 2026 FeatureTrace</span><a href="#login">Sign in</a></footer>
 </main>;
}
function Login({onLogin}){
 const [email,setEmail]=useState('');
 const [password,setPassword]=useState('');
 const [show,setShow]=useState(false);
 const [status,setStatus]=useState('');
 async function submit(event){
  event.preventDefault();setStatus('');
  try{await api('/api/auth/login',{method:'POST',body:JSON.stringify({email,password})});onLogin();}
  catch(error){setStatus(error.message);}
 }
 return <main className="login-page"><section className="login-story"><div className="login-story-top"><Brand/><span className="pill">FROM INTERFACE TO IMPLEMENTATION</span></div><div className="login-story-visual"><TraceAnimation/><div className="login-story-content"><span className="overline">WELCOME BACK</span><h1>See the path<br/>behind the feature.</h1><p>Sign in to continue exploring the connections in your application.</p></div></div></section><section className="login-panel"><div className="login-card"><span className="overline orange">FEATURETRACE ACCOUNT</span><h2>Sign in</h2><p className="login-intro">Enter your details to continue.</p><form id="login-form" onSubmit={submit}><label>Email<div className="input-wrap"><input id="login-email" type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@company.com"/></div></label><label htmlFor="login-password">Password</label><div className="input-wrap password-wrap"><input id="login-password" type={show?'text':'password'} autoComplete="current-password" required minLength="6" value={password} onChange={e=>setPassword(e.target.value)} placeholder="At least 6 characters"/><button type="button" id="password-toggle" aria-label={show?'Hide password':'Show password'} aria-pressed={show} onClick={()=>setShow(!show)}>{show?'Hide':'Show'}</button></div><button className="primary" type="submit">Continue {icon('arrow')}</button></form>{status&&<p className="login-status" role="status">{status}</p>}<p className="login-preview-note">Uses the master password configured on the server.</p></div></section></main>;
}
function Setup({user,onLogout,onWorkspace,onProject}){
 const [projects,setProjects]=useState([]);
 const [repo,setRepo]=useState('');
 const [branch,setBranch]=useState('');
 const [status,setStatus]=useState('');
 useEffect(()=>{api('/api/projects').then(setProjects).catch(error=>setStatus(error.message));},[]);
 async function create(event){
  event.preventDefault();setStatus('');
  try{
   const project=await api('/api/projects',{method:'POST',body:JSON.stringify({name:repo.split('/').pop()||repo,repository:repo,branch})});
   setProjects(current=>[project,...current]);setRepo('');setBranch('');
   setStatus('Project added.');
   onProject(project);
  }catch(error){setStatus(error.message);}
 }
 async function remove(id){
  await api(`/api/projects/${id}`,{method:'DELETE'});
  setProjects(current=>current.filter(project=>project.id!==id));
 }
 return <main className="onboarding setup-page"><section className="setup"><header className="setup-top"><Brand/><div className="setup-account"><span>{user.email}</span><button className="text-button" type="button" onClick={onLogout}>Sign out</button></div></header><div className="setup-content"><div className="setup-copy"><h2>Meet your code.<br/>Through your product.</h2><p className="intro">Add a public GitHub repository to your workspace.</p><form id="project-form" onSubmit={create}><label>Repository<div className="input-wrap">{icon('git')}<input name="repo" required value={repo} onChange={e=>setRepo(e.target.value)} placeholder="https://github.com/owner/repository"/></div></label><div className="form-row repo-branch-row"><label className="branch-label">Branch<div className="input-wrap">{icon('git')}<input name="branch" value={branch} onChange={e=>setBranch(e.target.value)} placeholder="Default"/></div></label></div><button className="primary" type="submit">Save repository {icon('arrow')}</button></form>{status&&<p id="repo-error" role="status">{status}</p>}<button className="text-button demo-link" type="button" onClick={onWorkspace}>Explore demo {icon('arrow')}</button></div><aside className="setup-projects"><div className="setup-projects-heading"><span className="overline">SAVED PROJECTS</span><span>{projects.length}</span></div><div className="project-list">{projects.length?projects.map(project=><div className="project-row" key={project.id}> <button type="button" onClick={()=>onProject(project)}><strong>{project.name}</strong><span>{project.repository}</span></button><button type="button" aria-label={`Remove ${project.name}`} onClick={()=>remove(project.id)}>Remove</button></div>):<div className="setup-projects-empty"><strong>No projects yet</strong><p>Saved repositories will appear here.</p></div>}</div></aside></div></section></main>;
}
function Workspace({user,onBack,onLogout,project}){ 
 const [files,setFiles]=useState([]);const [selected,setSelected]=useState(null);const [source,setSource]=useState('');const [status,setStatus]=useState('Loading repository…');const [filter,setFilter]=useState('');
 useEffect(()=>{
  async function load(){try{
   const match=String(project?.repository||'').match(/github\.com\/([^/]+\/[^/]+)/);
   const repo=match?match[1].replace(/\.git$/,''):project?.repository||'';
   if(!repo.includes('/'))throw new Error('Open a valid public GitHub repository.');
   const meta=await fetch(`https://api.github.com/repos/${repo}`).then(r=>r.ok?r.json():Promise.reject(new Error('Repository not found or GitHub rate limited')));
   const branch=project?.branch||meta.default_branch;
   const commit=await fetch(`https://api.github.com/repos/${repo}/commits/${encodeURIComponent(branch)}`).then(r=>r.ok?r.json():Promise.reject(new Error('Branch not found')));
   const tree=await fetch(`https://api.github.com/repos/${repo}/git/trees/${commit.sha}?recursive=1`).then(r=>r.ok?r.json():Promise.reject(new Error('Could not load repository tree')));
   const supported=(tree.tree||[]).filter(f=>f.type==='blob'&&/\.(?:[cm]?[jt]sx?|json|md|css|scss|html|vue|svelte|py|rb|go|rs|java|sql|yml|yaml|toml|txt|graphql)$/i.test(f.path)&&f.size<=300000);
   setFiles(supported);setStatus(`${supported.length} supported text files · pinned to ${commit.sha.slice(0,7)}${tree.truncated?' · listing incomplete':''}`);
   if(supported.length){setSelected(supported[0]);await showSource(repo,commit.sha,supported[0]);}
  }catch(error){setStatus(error.message);}}load();
 },[project]);
 async function showSource(repo,sha,file){if(!file)return;setStatus('Loading source…');try{const blob=await fetch(`https://api.github.com/repos/${repo}/git/blobs/${file.sha}`).then(r=>r.ok?r.json():Promise.reject(new Error('Could not load source')));const text=new TextDecoder().decode(Uint8Array.from(atob(String(blob.content).replace(/\s/g,'')),c=>c.charCodeAt(0)));setSource(text);setStatus(`Source loaded · ${file.path} · ${text.split('\n').length} lines · not executed`);}catch(error){setStatus(error.message);}}
 async function selectFile(file){setSelected(file);const match=String(project?.repository||'').match(/github\.com\/([^/]+\/[^/]+)/);const repo=match?match[1].replace(/\.git$/,''):project?.repository||'';if(repo.includes('/')){const meta=await fetch(`https://api.github.com/repos/${repo}`).then(r=>r.json()).catch(()=>null);const branch=project?.branch||meta?.default_branch;const commit=await fetch(`https://api.github.com/repos/${repo}/commits/${encodeURIComponent(branch||'main')}`).then(r=>r.json()).catch(()=>null);if(commit?.sha)showSource(repo,commit.sha,file);}}
 const matches=files.filter(file=>file.path.toLowerCase().includes(filter.toLowerCase())).slice(0,200);
 return <main className="workbench repository-workbench"><header><Brand/><span className="workspace-divider"/><span className="repo-label">{icon('git')}<span>{project?.repository||'Public repository'}</span></span><button className="text-button" type="button" onClick={onBack}>Change project</button><button className="text-button" type="button" onClick={onLogout}>Sign out</button></header><section className="workspace-heading"><div><span className="overline orange">PUBLIC REPOSITORY</span><h1>Start with the source.</h1><p role="status">{status}</p></div></section><div className="repository-grid"><section className="repo-files"><div className="panel-title"><h2>Repository files</h2><span id="file-count">{matches.length}</span></div><label className="file-search-label" htmlFor="repo-filter">Find a file</label><input id="repo-filter" type="search" value={filter} onChange={e=>setFilter(e.target.value)} placeholder="Search file paths…"/><div id="repo-file-list">{matches.map(file=><button className="repo-file" type="button" key={file.path} aria-pressed={selected?.path===file.path} onClick={()=>selectFile(file)}>{file.path}</button>)}</div></section><section className="repo-source"><div className="panel-title"><h2>{selected?.path||'Select a source file'}</h2></div><p id="file-status" role="status">{status}</p><pre id="public-source" tabIndex="0">{source||'Repository source will appear here.'}</pre></section></div></main>;
}
function App(){
 const [auth,setAuth]=useState(undefined);
 const [route,setRoute]=useState(location.hash.slice(1)||'landing');
 const [selectedProject,setSelectedProject]=useState(null);
 useEffect(()=>{api('/api/auth/me').then(data=>setAuth(data.user)).catch(()=>setAuth(null));},[]);
 useEffect(()=>{const update=()=>setRoute(location.hash.slice(1)||'landing');window.addEventListener('hashchange',update);return()=>window.removeEventListener('hashchange',update);},[]);
 async function logout(){await api('/api/auth/logout',{method:'POST',body:'{}'});setAuth(null);location.hash='login';}
 if(auth===undefined)return <><main className="login-page"/><ThemeToggle/></>;
 if(route==='landing'||route==='')return <Landing/>;
 if(!auth && route==='login')return <><Login onLogin={()=>{setAuth({email:document.querySelector('#login-email')?.value||'owner'});location.hash='setup';}}/><ThemeToggle/></>;
 if(!auth)return <><Landing/><ThemeToggle/></>;
 if(route==='workspace')return <><Workspace user={auth} project={selectedProject} onBack={()=>location.hash='setup'} onLogout={logout}/><ThemeToggle/></>;
 return <><Setup user={auth} onLogout={logout} onWorkspace={()=>location.hash='workspace'} onProject={project=>{setSelectedProject(project);location.hash='workspace';}}/><ThemeToggle/></>;
}
createRoot(document.querySelector('#app')).render(<App/>);
