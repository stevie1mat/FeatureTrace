import 'dotenv/config';
import express from 'express';
import cookieSession from 'cookie-session';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(root, 'data');
const dbFile = path.join(dataDir, 'featuretrace.json');
const app = express();

app.disable('x-powered-by');
app.use(express.json({ limit: '1mb' }));
app.use(cookieSession({
  name: 'featuretrace.session',
  keys: [process.env.SESSION_SECRET || 'development-session-secret-change-me'],
  maxAge: 24 * 60 * 60 * 1000,
  sameSite: 'lax',
  httpOnly: true
}));

await mkdir(dataDir, { recursive: true });
async function readDb(){
  try{return JSON.parse(await readFile(dbFile,'utf8'));}catch{return {projects:[],traces:[]};}
}
async function writeDb(db){await writeFile(dbFile,JSON.stringify(db,null,2));}
function requireAuth(req,res,next){
  if(!req.session?.userId)return res.status(401).json({error:'Authentication required'});
  next();
}

app.get('/api/health',(_req,res)=>res.json({status:'ok'}));
app.get('/api/auth/me',(req,res)=>{
  if(!req.session?.userId)return res.status(401).json({authenticated:false});
  res.json({authenticated:true,user:req.session.user});
});
app.post('/api/auth/login',(req,res)=>{
  const {email,password}=req.body||{};
  if(!email || !password)return res.status(400).json({error:'Email and password are required'});
  if(password!==process.env.MASTER_PASSWORD && password!==process.env.VITE_MASTER_PASSWORD){
    return res.status(401).json({error:'Incorrect master password'});
  }
  req.session.userId='owner';
  req.session.user={email:String(email).trim()};
  res.json({authenticated:true,user:req.session.user});
});
app.post('/api/auth/logout',(req,res)=>{
  req.session=null;
  res.json({ok:true});
});

app.get('/api/projects',requireAuth,async(req,res)=>{
  const db=await readDb();
  res.json(db.projects.filter(project=>project.owner===req.session.user.email));
});
app.post('/api/projects',requireAuth,async(req,res)=>{
  const {name,repository,branch}=req.body||{};
  if(!String(repository||'').trim())return res.status(400).json({error:'Repository is required'});
  const db=await readDb();
  const existing=db.projects.find(project=>project.owner===req.session.user.email&&project.repository===String(repository).trim()&&project.branch===((String(branch||'').trim())||null));
  if(existing)return res.status(200).json(existing);
  const project={id:crypto.randomUUID(),owner:req.session.user.email,name:String(name||repository).trim(),repository:String(repository).trim(),branch:String(branch||'').trim()||null,createdAt:new Date().toISOString()};
  db.projects.push(project);
  await writeDb(db);
  res.status(201).json(project);
});
app.delete('/api/projects/:id',requireAuth,async(req,res)=>{
  const db=await readDb();
  const before=db.projects.length;
  db.projects=db.projects.filter(project=>!(project.id===req.params.id && project.owner===req.session.user.email));
  if(db.projects.length===before)return res.status(404).json({error:'Project not found'});
  await writeDb(db);
  res.json({ok:true});
});

app.get('/api/traces',requireAuth,async(req,res)=>{
  const db=await readDb();
  res.json(db.traces.filter(trace=>trace.owner===req.session.user.email));
});
app.post('/api/traces',requireAuth,async(req,res)=>{
  const {projectId,name,type,data}=req.body||{};
  if(!String(name||'').trim())return res.status(400).json({error:'Trace name is required'});
  const db=await readDb();
  const trace={id:crypto.randomUUID(),owner:req.session.user.email,projectId:String(projectId||''),name:String(name).trim(),type:String(type||'manual'),data:data||{},createdAt:new Date().toISOString()};
  db.traces.push(trace);
  await writeDb(db);
  res.status(201).json(trace);
});

app.post('/api/traces/ingest',async(req,res)=>{
  const key=req.headers['x-featuretrace-key'];
  if(!process.env.TRACE_INGEST_SECRET || key!==process.env.TRACE_INGEST_SECRET)return res.status(401).json({error:'Invalid trace key'});
  const {owner,name,projectId,type,data}=req.body||{};
  if(!owner||!name)return res.status(400).json({error:'Owner and trace name are required'});
  const db=await readDb();
  const trace={id:crypto.randomUUID(),owner:String(owner),projectId:String(projectId||''),name:String(name),type:String(type||'runtime'),data:data||{},createdAt:new Date().toISOString()};
  db.traces.push(trace);
  await writeDb(db);
  res.status(201).json(trace);
});

if(process.env.NODE_ENV==='production'){
  app.use(express.static(path.join(root,'dist')));
  app.get('*',(_req,res)=>res.sendFile(path.join(root,'dist','index.html')));
}

const port=Number(process.env.API_PORT||4181);
app.listen(port,'127.0.0.1',()=>console.log(`FeatureTrace API listening on http://127.0.0.1:${port}`));
