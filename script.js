// ============================================================
//  Winner Holistic Consultants – Project Tracker
//  script.js — Final Consolidated (May-8 Update v2)
// ============================================================

const DB=FIREBASE_URL.replace(/\/$/,"");

async function fbGet(path){
  try{const r=await fetch(`${DB}/${path}.json`);return r.ok?r.json():null;}catch(e){return null;}
}
async function fbSet(path,data){
  try{const r=await fetch(`${DB}/${path}.json`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)});return r.ok;}catch(e){return false;}
}
async function fbDelete(path){
  try{const r=await fetch(`${DB}/${path}.json`,{method:"DELETE"});return r.ok;}catch(e){return false;}
}

function esc(v){
  return String(v==null?"":v)
    .replace(/&/g,"&amp;").replace(/"/g,"&quot;")
    .replace(/</g,"&lt;").replace(/>/g,"&gt;");
}
function fmtDate(d){
  if(!d)return"";
  try{const[y,m,day]=d.split("-").map(Number);return new Date(y,m-1,day).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"});}catch(e){return d;}
}
function fmtDateTime(iso){
  if(!iso)return"—";
  try{const d=new Date(iso);return d.toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})+" "+d.toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"});}catch(e){return iso;}
}

const PROJECT_TYPES_NEW=["Retail","Office","Industrial","Residential","Educational","Entertainment","Agricultural","Other"];
const FOLDER_CATEGORIES=["Fitout Folder","Live Folder","ID Folder","Private Folder"];

const STAGE_OPTIONS={
  scope:[
    {v:"",label:"— Select Status —"},{v:"requirement-pending",label:"Requirement list yet to send"},
    {v:"awaiting-docs",label:"Awaiting Documents / Details / Drawings"},
    {v:"not-received",label:"Not Received"},{v:"hold",label:"Hold"},{v:"received",label:"Received"}
  ],
  registration:[
    {v:"",label:"— Select Status —"},{v:"submitted",label:"Submitted in MePS"},
    {v:"under-review",label:"Under Review in MePS"},{v:"rejected",label:"Rejected"},
    {v:"approved",label:"Approved"},{v:"waiting-applicant",label:"Waiting on Applicant"}
  ],
  drawing_prep:[
    {v:"",label:"— Select Status —"},{v:"under-review",label:"Under Review"},
    {v:"under-preparation",label:"Under Preparation"},{v:"sent-client-review",label:"Sent for Client Review"},
    {v:"comments-shared",label:"Comments shared to client"},{v:"hold",label:"Hold"},
    {v:"completed-signed",label:"Completed - Signed Off"}
  ],
  approval_meps:[
    {v:"",label:"— Select Status —"},{v:"under-review-meps",label:"Under Review in MePS"},
    {v:"not-part-scope",label:"Not Part of scope"},{v:"rejected",label:"Rejected"},
    {v:"approved",label:"Approved"},{v:"waiting-applicant",label:"Waiting on Applicant"}
  ],
  approval_portal:[
    {v:"",label:"— Select Status —"},{v:"not-part-scope",label:"Not Part of scope"},
    {v:"under-review-portal",label:"Under Review in Portal"},{v:"rejected",label:"Rejected"},
    {v:"approved",label:"Approved"},{v:"waiting-applicant",label:"Waiting on Applicant"}
  ],
  site_work:[
    {v:"",label:"— Select Status —"},{v:"work-in-progress",label:"Work in Progress"},
    {v:"hold",label:"Hold"},{v:"completed",label:"Completed"}
  ],
  inspection:[
    {v:"",label:"— Select Status —"},{v:"not-part-scope",label:"Not Part of scope"},
    {v:"under-review-portal",label:"Under Review in Portal"},
    {v:"inspection-scheduled",label:"Inspection date Scheduled"},{v:"rejected",label:"Rejected"},
    {v:"approved",label:"Approved"},{v:"waiting-applicant",label:"Waiting on Applicant"}
  ],
  gis:[
    {v:"",label:"— Select Status —"},{v:"submitted-meps",label:"Submitted in MePS"},
    {v:"under-review-meps",label:"Under Review in MePS"},{v:"rejected",label:"Rejected"},
    {v:"approved-bcc",label:"Approved - BCC Received"},{v:"waiting-applicant",label:"Waiting on Applicant"}
  ],
  completed:[{v:"",label:"— Select Status —"},{v:"completed",label:"Project Fully Completed"}]
};

const STATUS_DISPLAY={
  "":                    {label:"Pending",                      cls:"b-pending"},
  "requirement-pending": {label:"Requirement list yet to send", cls:"b-pending"},
  "awaiting-docs":       {label:"Awaiting Documents",           cls:"b-authority"},
  "not-received":        {label:"Not Received",                 cls:"b-not-approved"},
  "hold":                {label:"Hold",                         cls:"b-hold"},
  "received":            {label:"Received",                     cls:"b-approved"},
  "submitted":           {label:"Submitted in MePS",            cls:"b-authority"},
  "under-review":        {label:"Under Review",                 cls:"b-authority"},
  "under-review-meps":   {label:"Under Review in MePS",         cls:"b-authority"},
  "under-review-portal": {label:"Under Review in Portal",       cls:"b-authority"},
  "rejected":            {label:"Rejected",                     cls:"b-not-approved"},
  "approved":            {label:"Approved",                     cls:"b-approved"},
  "waiting-applicant":   {label:"Waiting on Applicant",         cls:"b-hold"},
  "not-part-scope":      {label:"Not Part of Scope",            cls:"b-pending"},
  "under-preparation":   {label:"Under Preparation",            cls:"b-authority"},
  "sent-client-review":  {label:"Sent for Client Review",       cls:"b-authority"},
  "comments-shared":     {label:"Comments Shared to Client",    cls:"b-hold"},
  "completed-signed":    {label:"Completed - Signed Off",       cls:"b-approved"},
  "work-in-progress":    {label:"Work in Progress",             cls:"b-authority"},
  "completed":           {label:"Completed",                    cls:"b-approved"},
  "inspection-scheduled":{label:"Inspection Date Scheduled",    cls:"b-authority"},
  "submitted-meps":      {label:"Submitted in MePS",            cls:"b-authority"},
  "approved-bcc":        {label:"Approved - BCC Received",      cls:"b-approved"},
  "pending":             {label:"Pending",                      cls:"b-pending"},
  "authority-progress":  {label:"In-Progress",                  cls:"b-authority"},
  "not-approved":        {label:"Not Approved",                 cls:"b-not-approved"}
};

function isStageComplete(st){return["received","approved","completed","completed-signed","approved-bcc"].includes(st.status||"");}
function needsAppNum(type,status){
  if(type==="registration"&&status==="submitted")return true;
  if(type==="approval_meps"&&status==="under-review-meps")return true;
  if((type==="approval_portal"||type==="inspection")&&status==="under-review-portal")return true;
  if(type==="gis"&&status==="submitted-meps")return true;
  return false;
}
function hasDateFields(type){return!["scope","site_work","completed"].includes(type);}
function dateLabelA(type){return type==="drawing_prep"?"Drawing/Document Received":"Submission Date";}
function dateLabelB(type){return type==="drawing_prep"?"Document/Drawing Completed":"Approved Date";}
function stageIcon(st){
  const s=st.status||"";
  if(["received","approved","completed","completed-signed","approved-bcc"].includes(s))return"✓";
  if(["under-review","under-review-meps","under-review-portal","submitted","submitted-meps","under-preparation","sent-client-review","work-in-progress","inspection-scheduled"].includes(s))return"●";
  if(["rejected","not-received","not-approved"].includes(s))return"✗";
  if(["hold","comments-shared","waiting-applicant"].includes(s))return"⏸";
  return"○";
}
function stageCls(st){
  const s=st.status||"";
  if(["received","approved","completed","completed-signed","approved-bcc"].includes(s))return"si-approved";
  if(["under-review","under-review-meps","under-review-portal","submitted","submitted-meps","under-preparation","sent-client-review","work-in-progress","inspection-scheduled"].includes(s))return"si-authority";
  if(["rejected","not-received","not-approved"].includes(s))return"si-not-approved";
  if(["hold","comments-shared","waiting-applicant"].includes(s))return"si-hold";
  return"si-pending";
}
function actDotCls(status){
  if(["received","approved","completed","completed-signed","approved-bcc"].includes(status))return"act-dot-approved";
  if(["under-review","under-review-meps","under-review-portal","submitted","submitted-meps","under-preparation","sent-client-review","work-in-progress","inspection-scheduled"].includes(status))return"act-dot-authority";
  if(["rejected","not-received","not-approved"].includes(status))return"act-dot-rejected";
  if(["hold","comments-shared","waiting-applicant"].includes(status))return"act-dot-hold";
  return"act-dot-default";
}

function blankStage(name,type,time){return{name,type,status:"",note:"",time:time||"",appNum:"",dateA:"",dateB:""};}
function blankStages(){return[
  blankStage("Project Scope Analysis and Requirement Collection","scope",""),
  blankStage("Project Registration","registration","5 working days"),
  blankStage("ADM and CD-FLS – Drawing Preparation","drawing_prep",""),
  blankStage("ADM & CD-FLS Approval","approval_meps","10 working days"),
  blankStage("TAQA Drawing Preparation","drawing_prep",""),
  blankStage("TAQA Drawing Approval","approval_portal","10 working days"),
  blankStage("ADCD Shop Drawing Preparation","drawing_prep",""),
  blankStage("ADCD Shop Drawing Approval","approval_portal","5 working days"),
  blankStage("Work Start Notice Approval","approval_portal",""),
  blankStage("Commencement of Site Work","site_work",""),
  blankStage("TAQA Inspection Approval","inspection",""),
  blankStage("Hassantuk & AMC Application Submission Initiation","inspection",""),
  blankStage("ADCD Inspection","inspection","5-6 working days"),
  blankStage("ADM Completion Inspection","inspection","7 working days"),
  blankStage("GIS Approval","gis","4-5 working days"),
  blankStage("Project Fully Completed","completed","")
];}

function blankDocs(){return[
  {group:"Project Registration – Letters (Winner Provides)",fb:false,items:[
    {name:"Design and Supervision Letter",status:"pending"},{name:"Design Owner Approval Letter",status:"pending"},
    {name:"Project Estimation Value",status:"pending"},{name:"Contractor Authorization Letter",status:"pending"}
  ]},
  {group:"Project Registration – Tenant Documents",fb:false,items:[
    {name:"Tenant Authorized Signatory EID & POA",status:"pending"},{name:"Valid Lease Agreement / Tawtheeq",status:"pending"}
  ]},
  {group:"Project Registration – Landlord Documents",fb:false,items:[{name:"ADM NOC (Landlord)",status:"pending"}]},
  {group:"Architecture Drawing Approval (ADM & CD-FLS)",fb:false,items:[
    {name:"Architectural Drawings – Partition Layout (CAD)",status:"pending"},{name:"Furniture Layout (CAD)",status:"pending"},
    {name:"Two Internal Section Layout",status:"pending"},{name:"Material Details",status:"pending"},{name:"Door Details",status:"pending"}
  ]},
  {group:"TAQA Drawing Approval (Electricity)",fb:false,items:[
    {name:"Electrical Drawing – Lighting Layout",status:"pending"},{name:"Electrical Drawing – Cable Route",status:"pending"},
    {name:"Electrical Drawing – Power Layout",status:"pending"},{name:"Load Schedule & Emergency Lighting Layout",status:"pending"},
    {name:"SLD (Single Line Diagram)",status:"pending"},{name:"NOC addressing TAQA for Electricity & Water",status:"pending"},
    {name:"Meter Photo",status:"pending"},{name:"Latest Approved SLD / Base Built SLD",status:"pending"},{name:"Tawtheeq",status:"pending"}
  ]},
  {group:"TAQA Inspection (Electricity)",fb:false,items:[
    {name:"Commercial License of the Shop",status:"pending"},{name:"Switchgear Supply Certificate + ADQCC Approval Letter",status:"pending"},
    {name:"Tenant Account Details or Welcome Letter",status:"pending"}
  ]},
  {group:"ADCD Shop Drawing Approval",fb:false,items:[
    {name:"Shop Drawings – Fire Fighting Layout (CAD)",status:"pending"},{name:"Shop Drawings – Fire Alarm Layout (CAD)",status:"pending"},
    {name:"Emergency & Exit Light Layouts (CAD)",status:"pending"},{name:"Kitchen Ventilation Layout – F&B only",status:"na"},
    {name:"Fire Suppression / Wet Chemical Layout – F&B only",status:"na"},{name:"Undertaking Letter from All Installers",status:"pending"},
    {name:"Valid ADCD Safety & Installation Certificates – All Installers",status:"pending"},{name:"Valid ADCD Supply Certificates – All Suppliers",status:"pending"}
  ]},
  {group:"DOE Gas Drawing Approval",fb:true,items:[
    {name:"Third Party Approved Gas Drawings in .DWF format",status:"pending"},{name:"Third Party Drawing Approval Letter / Report",status:"pending"},
    {name:"Main/Gas Contractor – Valid Fitness Certificate",status:"pending"},{name:"Main/Gas Contractor – Valid ADCD Installation Certificate",status:"pending"},
    {name:"Gas Drawing Undertaking Letter – Main Contractor",status:"pending"},{name:"Gas Drawing Undertaking Letter – Gas Contractor",status:"pending"},
    {name:"Third Party COC Certificate",status:"pending"},{name:"Piping Size Calculation and Node Diagram",status:"pending"}
  ]},
  {group:"Work Start Notice",fb:false,items:[
    {name:"QR Code printed on A3 – Affixed on site (photo sent)",status:"pending"},{name:"Site Photos showing work commencement",status:"pending"}
  ]},
  {group:"ADCD Inspection",fb:false,items:[
    {name:"Valid Hassantuk Certificate (in Arabic)",status:"pending"},{name:"All Installers – Work Completion Letter (signed & stamped)",status:"pending"},
    {name:"All Suppliers – Supply Letter (signed & stamped)",status:"pending"},{name:"Fire-rated Gypsum Partitions Undertaking Letter (Arabic + specs)",status:"pending"},
    {name:"CD Approved AMC (all protection systems & quantities)",status:"pending"},{name:"Kitchen Duct, Fan & Wet Chemical Docs – F&B only",status:"na"}
  ]},
  {group:"DOE Gas Inspection",fb:true,items:[
    {name:"Material Form – Complete materials list (Gas Contractor letterhead)",status:"pending"},
    {name:"Gas Contractor – Trade License, Safety & Installation Certificate",status:"pending"},
    {name:"Gas Supplier – Trade License, Safety & Supply Certificate",status:"pending"},
    {name:"Third Party Inspection Report for Gas System",status:"pending"},{name:"GAS AMC Contract for the Shop",status:"pending"},
    {name:"TPI COC (Third Party Inspection Certificate)",status:"pending"}
  ]},
  {group:"ADM Completion Inspection",fb:false,items:[
    {name:"100% Site Work Completed Photos",status:"pending"},
    {name:"Pest Control Documents (Tenant + Company License + Tadweer Agreement) – F&B only",status:"na"}
  ]}
];}

function makeId(){return"p"+Date.now()+"_"+Math.random().toString(36).substr(2,6);}

function newProj(title){
  return{
    id:makeId(),
    createdAt:new Date().toISOString().split("T")[0],
    workflowStatus:"proposal",
    activityLog:[],
    proposalLog:[],
   proposal:{
      scopeHtml:"",scopeItems:[],estimatedValue:"",expectedStartDate:"",
      submittedBy:"",submittedAt:"",
      quotationNumber:"",
      projectTypes:[],
      reapprovals:[]
    },
    project:{
      title:title||"New Project",client:"",location:"",unit:"",
      unitType:[],coordinator:"",
      consultant:"Winner Holistic Consultants"
    },
    stages:blankStages(),docs:blankDocs()
  };
}

function migrateProject(p){
  if(!p)return p;
  if(!p.workflowStatus)p.workflowStatus="allocated";
  if(!p.activityLog)p.activityLog=[];
  if(!p.proposalLog)p.proposalLog=[];
  if(!p.proposal)p.proposal={scopeHtml:"",estimatedValue:"",expectedStartDate:"",submittedBy:"",submittedAt:"",quotationNumber:"",projectTypes:[],reapprovals:[]};
  if(!p.proposal.quotationNumber)p.proposal.quotationNumber="";
  if(!p.proposal.projectTypes)p.proposal.projectTypes=[];
  if(!p.proposal.reapprovals)p.proposal.reapprovals=[];
    if(!p.proposal.reapprovals)p.proposal.reapprovals=[];
  if(!p.proposal.scopeItems)p.proposal.scopeItems=[];
  if(p.project){
    if(!p.project.coordinator)p.project.coordinator="";
    if(!p.project.unitType)p.project.unitType=[];
    else if(!Array.isArray(p.project.unitType))p.project.unitType=[p.project.unitType];
    if(p.project.customUnitType!=null)delete p.project.customUnitType;
  }
  if(p.stages&&Array.isArray(p.stages)){
    p.stages=p.stages.map(st=>({type:"scope",appNum:"",dateA:"",dateB:"",...st}));
  }
  return p;
}

const urlParams=new URLSearchParams(window.location.search);
const PROJECT_ID=urlParams.get("id");
let ALL_PROJECTS={},PROJ=null;
let S={
  mode:PROJECT_ID?"client":"landing",
  tab:"stages",loginErr:"",
  authedCoord:false,authedAdmin:false,authedProposal:false,
  saved:false,saving:false,modal:null,
  search:"",filterStatus:"all",filterType:"all",
  filterCoord:"all",filterStage:"all",filterProjType:"all",
  adminTab:"proposals",
  adminPopup:null,
  coordName:"",coordSearch:"",
  coordFilterStatus:"all",coordFilterProjType:"all",
  coordFilterStage:"all",coordFilterReapp:"all",coordFilterQuot:"",
  proposalTab:"new",  propFilterCoord:"",propFilterProjType:"all",propFilterDateFrom:"",propFilterDateTo:"",
  propFilterClient:"",propFilterValue:"",propFilterQuot:"",propFilterReapp:"all",
  selectedStages:[],bulkStatus:""
};

let _dragSrc=null;
function dragStart(e,i){
  if(["INPUT","SELECT","TEXTAREA","BUTTON"].includes(e.target.tagName)){e.preventDefault();return;}
  _dragSrc=i;e.dataTransfer.effectAllowed="move";e.dataTransfer.setData("text/plain",String(i));
  setTimeout(()=>{const rows=document.querySelectorAll(".se");if(rows[i])rows[i].classList.add("dragging");},0);
}
function dragOver(e,i){
  e.preventDefault();e.dataTransfer.dropEffect="move";
  document.querySelectorAll(".se").forEach((el,idx)=>{el.classList.toggle("drag-over",idx===i&&_dragSrc!==null&&_dragSrc!==i);});
}
function dragLeave(e){if(!e.currentTarget.contains(e.relatedTarget))e.currentTarget.classList.remove("drag-over");}
function dragDrop(e,i){
  e.preventDefault();e.stopPropagation();_clearDrag();
  if(_dragSrc!==null&&_dragSrc!==i&&PROJ){const[moved]=PROJ.stages.splice(_dragSrc,1);PROJ.stages.splice(i,0,moved);S.selectedStages=[];S.bulkStatus="";render();}
  _dragSrc=null;
}
function dragEnd(){_clearDrag();_dragSrc=null;}
function _clearDrag(){document.querySelectorAll(".se").forEach(el=>el.classList.remove("dragging","drag-over"));}

async function boot(){
  if(PROJECT_ID){
    const data=await fbGet("projects/"+PROJECT_ID);
    if(data){PROJ=migrateProject(data);S.mode="client";render();}
    else document.getElementById("app").innerHTML=`<div style="padding:60px 20px;text-align:center"><div style="font-size:40px;margin-bottom:12px">🔍</div><div style="font-size:16px;font-weight:600;color:#333;margin-bottom:6px">Project Not Found</div><div style="font-size:13px;color:#888">This link may be invalid or the project was deleted.</div></div>`;
  } else{S.mode="landing";render();}
}
async function saveProj(){
  if(!PROJ)return;S.saving=true;render();
  const ok=await fbSet("projects/"+PROJ.id,PROJ);
  S.saving=false;S.saved=ok;render();
  setTimeout(()=>{S.saved=false;render();},2500);
}
async function loadAll(){
  document.getElementById("app").innerHTML=`<div class="loading"><div class="spinner"></div><div style="font-size:13px;color:#888">Loading all projects...</div></div>`;
  ALL_PROJECTS=(await fbGet("projects"))||{};S.mode="admin";render();
}
async function loadCoordProjects(){ALL_PROJECTS=(await fbGet("projects"))||{};}
async function loadProposalProjects(){
  document.getElementById("app").innerHTML=`<div class="loading"><div class="spinner"></div><div style="font-size:13px;color:#888">Loading projects...</div></div>`;
  ALL_PROJECTS=(await fbGet("projects"))||{};S.mode="proposals";render();
}

function isFB(){return PROJ&&natureArr(PROJ.project.unitType).includes("F&B");}
function visStages(){return PROJ?PROJ.stages:[];}
function doneCount(){return visStages().filter(s=>isStageComplete(s)).length;}
function pct(){return Math.round(doneCount()/Math.max(visStages().length,1)*100);}
function projectLink(id){return window.location.origin+window.location.pathname+"?id="+id;}function projPct(p){const vis=p.stages||[];return Math.round(vis.filter(s=>isStageComplete(s)).length/Math.max(vis.length,1)*100);}
function projStatus(p){
  if(p.workflowStatus==="proposal")return"proposal";
  if(p.workflowStatus==="allocated")return"allocated";
  const pc=projPct(p);if(pc===100)return"done";
  const act=["under-review","under-review-meps","under-review-portal","submitted","submitted-meps","under-preparation","sent-client-review","work-in-progress","inspection-scheduled","authority-progress"];
  if(pc>0||(p.stages||[]).some(s=>act.includes(s.status)))return"active";
  return"new";
}
function dIc(s){
  if(s==="received"||s==="done")return"dic-received";
  if(s==="not-received")return"dic-not-received";
  if(s==="correction")return"dic-correction";
  if(s==="na")return"dic-na";
  return"dic-required";
}
function dCh(s){if(s==="received"||s==="done")return"✓";if(s==="not-received")return"✗";if(s==="correction")return"!";if(s==="na")return"–";return"○";}
function dTag(s){
  if(s==="received"||s==="done")return`<span class="dtag dt-received">Received</span>`;
  if(s==="not-received")return`<span class="dtag dt-not-received">Not Received</span>`;
  if(s==="correction")return`<span class="dtag dt-correction">Correction Required</span>`;
  if(s==="na")return`<span class="dtag dt-na">N/A</span>`;
  return`<span class="dtag dt-required">Required</span>`;
}
function copyText(txt){navigator.clipboard.writeText(txt).then(()=>alert("Link copied!\n\n"+txt)).catch(()=>prompt("Copy this link:",txt));}

function csvEsc(v){
  const s=String(v==null?"":v);
  if(/[",\n]/.test(s))return'"'+s.replace(/"/g,'""')+'"';
  return s;
}
function exportFilteredCSV(){
  const rows=_lastFilteredProjects||[];
  if(!rows.length){alert("No records to export.");return;}
  const headers=["Project Folder","Client","Location","Unit","Nature of the Project","Coordinator","Status","Quotation Number","Quotation Value (AED)","Re-approvals Count","Stages Completed","Total Stages","Progress %","Active Stage","Created Date","Client Link"];
  const lines=[headers.map(csvEsc).join(",")];
  rows.forEach(p=>{
    const pr=p.project||{},prop=p.proposal||{};
    const st=projStatus(p),pc=projPct(p);
    const stCls={done:"Completed",active:"In Progress",proposal:"Proposal",allocated:"Allocated",new:"Not Started"}[st]||st;
    const stages=p.stages||[];
    const doneN=stages.filter(s=>isStageComplete(s)).length;
    const activeStage=stages.find(s=>{const sv=s.status||"";return sv&&!["received","approved","completed","completed-signed","approved-bcc"].includes(sv);});
    const reapps=(prop.reapprovals||[]).length;
    lines.push([
      pr.title||"",pr.client||"",pr.location||"",pr.unit||"",natureCSV(pr.unitType),pr.coordinator||"",
      stCls,prop.quotationNumber||"",prop.estimatedValue||"",
      reapps,doneN,stages.length,pc,activeStage?activeStage.name:"",p.createdAt||"",projectLink(p.id)
    ].map(csvEsc).join(","));
  });
  const csv=lines.join("\r\n");
  const blob=new Blob([csv],{type:"text/csv;charset=utf-8;"});
  const url=URL.createObjectURL(blob);
  const a=document.createElement("a");
  a.href=url;
  a.download=`WHC_Projects_Export_${new Date().toISOString().split("T")[0]}.csv`;
  document.body.appendChild(a);a.click();document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function exportProposalPDF(id){
  const p=ALL_PROJECTS[id];if(!p)return;
  const pr=p.project||{},prop=p.proposal||{};
  const items=prop.scopeItems||[];
  const reapps=prop.reapprovals||[];
  const win=window.open("","_blank");
  if(!win){alert("Please allow popups for this site to export as PDF.");return;}
  win.document.write(`<!DOCTYPE html><html><head><title>${esc(pr.title||"Project Proposal")}</title>
  <meta charset="UTF-8"/>
  <style>
    body{font-family:Arial,Helvetica,sans-serif;color:#222;padding:30px;font-size:13px;max-width:900px;margin:0 auto}
    h1{font-size:20px;margin:0 0 4px}
    h2{font-size:14px;margin:20px 0 8px;border-bottom:1px solid #ccc;padding-bottom:4px;color:#1a3a5c}
    table{width:100%;border-collapse:collapse;margin-top:4px}
    td,th{border:1px solid #ddd;padding:6px 8px;font-size:12px;text-align:left;vertical-align:top}
    th{background:#f7f7f7;width:160px}
    .meta{font-size:12px;color:#555;margin-bottom:10px}
    .totrow td{font-weight:700}
    .reapp{margin-bottom:12px;padding:8px 10px;background:#fdf6ef;border:1px solid #e8c090;border-radius:6px}
    @media print{body{padding:10px}}
  </style></head><body>
  <h1>${esc(pr.title||"Project Proposal")}</h1>
  <div class="meta">${esc(pr.client||"")} · ${esc(pr.location||"")} · Unit: ${esc(pr.unit||"")}</div>
  <h2>Project Details</h2>
  <table>
    <tr><th>Client</th><td>${esc(pr.client||"")}</td></tr>
    <tr><th>Location</th><td>${esc(pr.location||"")}</td></tr>
    <tr><th>Unit</th><td>${esc(pr.unit||"")}</td></tr>
    <tr><th>Nature of the Project</th><td>${esc(natureDisplay(pr.unitType))}</td></tr>
    <tr><th>Coordinator</th><td>${esc(pr.coordinator||"")}</td></tr>
  </table>
  <h2>Main Quotation</h2>
  <table>
    <tr><th>Quotation Number</th><td>${esc(prop.quotationNumber||"")}</td></tr>
    <tr><th>Quotation Value (AED)</th><td>${esc(prop.estimatedValue||"")}</td></tr>
  </table>
  <h2>Scope of Works</h2>
  <table><tr><th style="width:60px">Ref</th><th style="width:auto">Title</th><th>Details</th><th style="width:90px">AED</th></tr>
  ${items.map(it=>`<tr><td>${esc(it.ref||"")}</td><td>${esc(it.title||"")}</td><td>${esc(it.details||"")}</td><td>${fmtMoney(it.value||0)}</td></tr>`).join("")}
  <tr><td colspan="3" style="text-align:right">Sub-Total</td><td>${fmtMoney(scopeSubtotal(items))}</td></tr>
  <tr><td colspan="3" style="text-align:right">VAT (5%)</td><td>${fmtMoney(scopeVat(items))}</td></tr>
  <tr class="totrow"><td colspan="3" style="text-align:right">Total incl. VAT</td><td>${fmtMoney(scopeTotal(items))}</td></tr>
  </table>
  ${prop.scopeHtml?`<h2>Additional Notes</h2><div>${prop.scopeHtml}</div>`:""}
  ${reapps.length?`<h2>Re-approval Quotations</h2>${reapps.map((r,ri)=>`<div class="reapp">
    <strong>Re-approval ${ri+1}${r.title?" — "+esc(r.title):""}</strong>
    ${r.quotationNumber?" · "+esc(r.quotationNumber):""}${r.value?" · AED "+fmtMoney(r.value):""}
    <div style="margin-top:4px">${r.scopeHtml||""}</div>
  </div>`).join("")}`:""}
  </body></html>`);
  win.document.close();
  const doPrint=()=>{try{win.focus();win.print();}catch(e){}};
  win.onload=doPrint;
  setTimeout(doPrint,400);
}

function propLog(action,by,detail){
  if(!PROJ)return;
  if(!PROJ.proposalLog)PROJ.proposalLog=[];
  PROJ.proposalLog.push({action,by:by||"Unknown",detail:detail||"",at:new Date().toISOString()});
}

function stageStatusChange(i,newStatus){
  if(!PROJ)return;
  const st=PROJ.stages[i];
  const oldStatus=st.status||"";
  if(!PROJ.activityLog)PROJ.activityLog=[];
  if(oldStatus!==newStatus){
    PROJ.activityLog.push({stageName:st.name||"Stage "+(i+1),oldStatus,newStatus,by:S.coordName||"Coordinator",note:st.note||"",at:new Date().toISOString()});
  }
  PROJ.stages[i].status=newStatus;
  render();
}

function toggleStageSelect(i){
  const idx=S.selectedStages.indexOf(i);
  if(idx>-1)S.selectedStages.splice(idx,1);
  else S.selectedStages.push(i);
  S.bulkStatus="";
  render();
}
function clearStageSelection(){S.selectedStages=[];S.bulkStatus="";render();}
function commonStageOptions(){
  if(!PROJ||!S.selectedStages.length)return[];
  const types=S.selectedStages.map(i=>(PROJ.stages[i]&&PROJ.stages[i].type)||"scope");
  const optionSets=types.map(t=>STAGE_OPTIONS[t]||STAGE_OPTIONS.scope);
  const first=optionSets[0];
  return first.filter(o=>optionSets.every(set=>set.some(o2=>o2.v===o.v)));
}
function applyBulkStatus(newStatus){
  if(!PROJ||!S.selectedStages.length||newStatus===undefined)return;
  if(!PROJ.activityLog)PROJ.activityLog=[];
  S.selectedStages.forEach(i=>{
    const st=PROJ.stages[i];if(!st)return;
    const oldStatus=st.status||"";
    if(oldStatus!==newStatus){
      PROJ.activityLog.push({stageName:st.name||"Stage "+(i+1),oldStatus,newStatus,by:S.coordName||"Coordinator",note:st.note||"",at:new Date().toISOString()});
    }
    st.status=newStatus;
  });
  S.selectedStages=[];S.bulkStatus="";
  render();
}
function moveStageUp(i){
  if(!PROJ||i<=0)return;
  const arr=PROJ.stages;
  [arr[i-1],arr[i]]=[arr[i],arr[i-1]];
  S.selectedStages=S.selectedStages.map(s=>s===i?i-1:s===i-1?i:s);
  render();
}
function moveStageDown(i){
  if(!PROJ||i>=PROJ.stages.length-1)return;
  const arr=PROJ.stages;
  [arr[i+1],arr[i]]=[arr[i],arr[i+1]];
  S.selectedStages=S.selectedStages.map(s=>s===i?i+1:s===i+1?i:s);
  render();
}

function rteToolbar(targetId){
  return`<div class="rte-toolbar">
    <select class="rte-select" onchange="document.execCommand('formatBlock',false,this.value);this.value='p';document.getElementById('${targetId}').focus()">
      <option value="p">Paragraph</option><option value="h2">Heading 1</option>
      <option value="h3">Heading 2</option><option value="h4">Heading 3</option>
    </select>
    <select class="rte-select" onchange="document.execCommand('fontSize',false,this.value);document.getElementById('${targetId}').focus()">
      <option value="">Font Size</option><option value="1">Small</option><option value="3">Normal</option>
      <option value="4">Large</option><option value="5">X-Large</option>
    </select>
    <div class="rte-sep"></div>
    <button class="rte-btn" title="Bold" onmousedown="event.preventDefault();document.execCommand('bold')"><b>B</b></button>
    <button class="rte-btn" title="Italic" onmousedown="event.preventDefault();document.execCommand('italic')"><i>I</i></button>
    <button class="rte-btn" title="Underline" onmousedown="event.preventDefault();document.execCommand('underline')"><u>U</u></button>
    <div class="rte-sep"></div>
    <button class="rte-btn" onmousedown="event.preventDefault();document.execCommand('insertUnorderedList')">• List</button>
    <button class="rte-btn" onmousedown="event.preventDefault();document.execCommand('insertOrderedList')">1. List</button>
    <div class="rte-sep"></div>
    <button class="rte-btn" onmousedown="event.preventDefault();document.execCommand('indent')">→</button>
    <button class="rte-btn" onmousedown="event.preventDefault();document.execCommand('outdent')">←</button>
    <div class="rte-sep"></div>
    <button class="rte-btn" onmousedown="event.preventDefault();document.execCommand('justifyLeft')">≡L</button>
    <button class="rte-btn" onmousedown="event.preventDefault();document.execCommand('justifyCenter')">≡C</button>
    <button class="rte-btn" onmousedown="event.preventDefault();document.execCommand('justifyRight')">≡R</button>
    <div class="rte-sep"></div>
    <button class="rte-btn" title="Insert Table" onmousedown="event.preventDefault();insertRteTable('${targetId}')">⊞ Table</button>
  </div>
  <div class="rte-editor" id="${targetId}" contenteditable="true" placeholder="Enter scope of work..."></div>`;
}
function insertRteTable(targetId){
  const rows=parseInt(prompt("Number of rows:",3)||3);
  const cols=parseInt(prompt("Number of columns:",3)||3);
  if(!rows||!cols)return;
  let table="<table>";
  table+="<tr>"+Array(cols).fill("<th>Header</th>").join("")+"</tr>";
  for(let r=1;r<rows;r++)table+="<tr>"+Array(cols).fill("<td>Cell</td>").join("")+"</tr>";
  table+="</table><p></p>";
  document.getElementById(targetId)?.focus();
  document.execCommand("insertHTML",false,table);
}
function rteInit(id,html){
  setTimeout(()=>{const el=document.getElementById(id);if(el&&html!==undefined)el.innerHTML=html||"";},60);
}

let _newReapprovals=[];
function addNewReapprovalEntry(){
  _newReapprovals.push({title:"",quotationNumber:"",value:"",scopeHtml:""});
  renderNewReapprovals();
}
function removeNewReapprovalEntry(i){
  _newReapprovals.splice(i,1);
  renderNewReapprovals();
}
function renderNewReapprovals(){
  const container=document.getElementById("pp-reapp-list");
  if(!container)return;
  container.innerHTML=_newReapprovals.map((r,i)=>`
    <div class="reapp-entry">
      <div class="reapp-entry-num">RE-APPROVAL #${i+1}</div>
      <div class="fgrid" style="margin-bottom:8px">
        <div class="ff"><div class="fl">Re-approval Title <span class="req-star">*</span></div>
          <input class="fi" value="${esc(r.title)}" oninput="_newReapprovals[${i}].title=this.value" placeholder="e.g. TAQA Drawing Re-submission"/></div>
        <div><div class="fl">Quotation Number <span class="req-star">*</span></div>
          <input class="fi" value="${esc(r.quotationNumber)}" oninput="_newReapprovals[${i}].quotationNumber=this.value" placeholder="e.g. WHC-2026-042-R1"/></div>
        <div><div class="fl">Re-approval Value (AED) <span class="req-star">*</span></div>
          <input class="fi" type="number" value="${esc(r.value)}" oninput="_newReapprovals[${i}].value=this.value" placeholder="e.g. 5000"/></div>
      </div>
      <div class="fl" style="margin-bottom:5px">Re-approval Scope <span class="req-star">*</span></div>
      <div class="rte-wrap">${rteToolbar("new-reapp-editor-"+i)}</div>
      <button class="btn btn-sm btn-red" style="margin-top:7px" onclick="removeNewReapprovalEntry(${i})">✕ Remove</button>
    </div>`).join("");
  _newReapprovals.forEach((_,i)=>{rteInit("new-reapp-editor-"+i,_newReapprovals[i].scopeHtml||"");});
}
// ── Scope of Works templates & helpers ────────────────────────
const SCOPE_TEMPLATES={
  "fnb_kitchen":{
    label:"F&B with Kitchen Ventilation",
    items:[
      {ref:"B.1",title:"ADM Submission Package & Fire/Life Safety Strategy",details:"Preparation of ADM Submission Package including Key Plan, Partition Layout & Section based on Final Architectural Drawings (CAD Files). Preparation of Fire and Life Safety Strategy Layout. Submission to ADM/ADCD and obtain approval.",value:11000},
      {ref:"B.2",title:"Fire Protection System Shop Drawings approval from ADCD",details:"Receipt of Fire Protection (Fire Fighting, Fire Alarm, Emergency, Exit & Fire Suppression System) shop drawings from the Fire Contractor. Completeness check, submission to ADCD, follow-up and obtain approval.",value:5000},
      {ref:"B.3",title:"Kitchen Ventilation System Design Drawings for ADCD Approval",details:"Collection of complete set of Kitchen Ventilation System Drawings & Design Calculation Notes from the Specialist Contractor. Compilation and submission to ADCD for approval.",value:5000},
      {ref:"B.4",title:"Completion Certificate from ADCD",details:"Coordination with Main Contractor & Fire Contractor, collect and compile documents, apply for site inspection and obtain the completion certificate.",value:500},
      {ref:"B.5",title:"Completion Certificate from ADM",details:"Coordination with Main Contractor & Fire Contractor, collect and compile documents, apply for site inspection and obtain the completion certificate.",value:500},
      {ref:"B.6",title:"Scope of the Local Civil Contractor",details:"Pull out the Modification Building Permit from ADM after completion of approval (item B.1). Provide letters, certificates & shop drawing approvals/completion certificates from ADM/ADCD.",value:3000}
    ]
  },
  "retail":{
    label:"Retail (basic)",
    items:[
      {ref:"A.1",title:"Project Registration in MePS",details:"Registration of project in MePS portal, submission of required letters and documents.",value:3000},
      {ref:"A.2",title:"Architectural Drawing Approval (ADM & CD-FLS)",details:"Preparation and submission of partition layout, furniture layout, sections and material details.",value:8000},
      {ref:"A.3",title:"TAQA Drawing Approval",details:"Preparation and submission of electrical drawings, SLD and load schedule for TAQA approval.",value:6000}
    ]
  }
};

function blankScopeItem(){return{ref:"",title:"New scope item",details:"",value:0};}
function scopeSubtotal(items){return(items||[]).reduce((s,i)=>s+(Number(i.value)||0),0);}
function scopeVat(items){return scopeSubtotal(items)*0.05;}
function scopeTotal(items){return scopeSubtotal(items)+scopeVat(items);}
function fmtMoney(n){return Number(n||0).toLocaleString(undefined,{maximumFractionDigits:0});}

let _newScopeItems=[];

let _scopeDragSrc=null;
function toggleNatureStyle(i){
  const cb=document.getElementById("nature-"+i);
  const opt=document.getElementById("nature-opt-"+i);
  if(cb&&opt)opt.classList.toggle("selected",cb.checked);
}
function natureArr(u){return Array.isArray(u)?u:(u?[u]:[]);}
function natureDisplay(u){const a=natureArr(u);return a.length?a.join(", "):"—";}
function natureCSV(u){return natureArr(u).join("; ");}
function scopeDragStart(e,arrName,i){
  if(["INPUT","SELECT","TEXTAREA","BUTTON"].includes(e.target.tagName)){e.preventDefault();return;}
  _scopeDragSrc=i;e.dataTransfer.effectAllowed="move";e.dataTransfer.setData("text/plain",String(i));
  setTimeout(()=>{const rows=document.querySelectorAll(`.${arrName}-row`);if(rows[i])rows[i].classList.add("dragging");},0);
}
function scopeDragOver(e,arrName,i){
  e.preventDefault();e.dataTransfer.dropEffect="move";
  document.querySelectorAll(`.${arrName}-row`).forEach((el,idx)=>{el.classList.toggle("drag-over",idx===i&&_scopeDragSrc!==null&&_scopeDragSrc!==i);});
}
function scopeDragLeave(e){if(!e.currentTarget.contains(e.relatedTarget))e.currentTarget.classList.remove("drag-over");}
function _clearScopeDrag(arrName){document.querySelectorAll(`.${arrName}-row`).forEach(el=>el.classList.remove("dragging","drag-over"));}
function scopeDragEnd(arrName){_clearScopeDrag(arrName);_scopeDragSrc=null;}

function newScopeDrop(e,i){
  e.preventDefault();e.stopPropagation();_clearScopeDrag("new-scope");
  if(_scopeDragSrc!==null&&_scopeDragSrc!==i){const[moved]=_newScopeItems.splice(_scopeDragSrc,1);_newScopeItems.splice(i,0,moved);renderNewScopeItems();}
  _scopeDragSrc=null;
}
function editScopeDrop(e,i){
  e.preventDefault();e.stopPropagation();_clearScopeDrag("ep-scope");
  if(_scopeDragSrc!==null&&_scopeDragSrc!==i&&PROJ){const[moved]=PROJ.proposal.scopeItems.splice(_scopeDragSrc,1);PROJ.proposal.scopeItems.splice(i,0,moved);renderEditScopeItems();}
  _scopeDragSrc=null;
}

function loadScopeTemplateNew(){
  const sel=document.getElementById("pp-scope-template");
  const key=sel?sel.value:"";
  if(!key||!SCOPE_TEMPLATES[key])return;
  _newScopeItems=JSON.parse(JSON.stringify(SCOPE_TEMPLATES[key].items));
  renderNewScopeItems();
}
function addNewScopeItem(){_newScopeItems.push(blankScopeItem());renderNewScopeItems();}
function removeNewScopeItem(i){_newScopeItems.splice(i,1);renderNewScopeItems();}
function scopeItemRow(item,i,arrName,getArr){
  return`<div class="se ${arrName}-row" draggable="true"
    ondragstart="scopeDragStart(event,'${arrName}',${i})" ondragover="scopeDragOver(event,'${arrName}',${i})"
    ondragleave="scopeDragLeave(event)" ondrop="${arrName==="new-scope"?"newScopeDrop":"editScopeDrop"}(event,${i})" ondragend="scopeDragEnd('${arrName}')">
    <div class="se-drag-handle" title="Drag to reorder">⠿</div>
    <div class="se-num">${esc(item.ref||(i+1))}</div>
    <div class="se-body">
      <input class="se-ni" value="${esc(item.title||"")}" oninput="${getArr}[${i}].title=this.value" placeholder="Item title"/>
      <textarea class="scope-details-fi" oninput="${getArr}[${i}].details=this.value" placeholder="Details / bullet points">${esc(item.details||"")}</textarea>
      <div class="se-r">
        <input class="se-time" value="${esc(item.ref||"")}" oninput="${getArr}[${i}].ref=this.value" placeholder="Ref (e.g. B.1)" style="width:90px"/>
        <span class="se-label">AED</span>
        <input class="se-time" type="number" value="${esc(item.value||0)}" oninput="${getArr}[${i}].value=this.value;${arrName==="new-scope"?"renderNewScopeItems()":"renderEditScopeItems()"}" placeholder="0"/>
      </div>
    </div>
    <button class="btn-del" onclick="${arrName==="new-scope"?`removeNewScopeItem(${i})`:`PROJ.proposal.scopeItems.splice(${i},1);renderEditScopeItems()`}">✕</button>
  </div>`;
}
function scopeTotalsBlock(items){
  return`<div style="margin-top:8px;border-top:1px solid #eee;padding-top:8px;font-size:12px">
    <div style="display:flex;justify-content:space-between;padding:2px 0;color:#666"><span>Sub-Total</span><span>AED ${fmtMoney(scopeSubtotal(items))}</span></div>
    <div style="display:flex;justify-content:space-between;padding:2px 0;color:#666"><span>VAT (5%)</span><span>AED ${fmtMoney(scopeVat(items))}</span></div>
    <div style="display:flex;justify-content:space-between;padding:2px 0;font-weight:700;color:#222"><span>Total incl. VAT</span><span>AED ${fmtMoney(scopeTotal(items))}</span></div>
  </div>`;
}
function renderNewScopeItems(){
  const container=document.getElementById("pp-scope-items");
  if(!container)return;
  container.innerHTML=_newScopeItems.map((item,i)=>scopeItemRow(item,i,"new-scope","_newScopeItems")).join("")
    +scopeTotalsBlock(_newScopeItems);
}
function renderEditScopeItems(){
  const container=document.getElementById("ep-scope-items");
  if(!container||!PROJ)return;
  const items=PROJ.proposal.scopeItems||[];
  container.innerHTML=items.map((item,i)=>scopeItemRow(item,i,"ep-scope","PROJ.proposal.scopeItems")).join("")
    +scopeTotalsBlock(items);
}
function addEditScopeItem(){
  if(!PROJ.proposal.scopeItems)PROJ.proposal.scopeItems=[];
  PROJ.proposal.scopeItems.push(blankScopeItem());
  renderEditScopeItems();
}
function loadScopeTemplateEdit(){
  const sel=document.getElementById("ep-scope-template");
  const key=sel?sel.value:"";
  if(!key||!SCOPE_TEMPLATES[key]||!PROJ)return;
  if(PROJ.proposal.scopeItems&&PROJ.proposal.scopeItems.length){
    if(!confirm("This will replace the current scope items with the selected template. Continue?"))return;
  }
  PROJ.proposal.scopeItems=JSON.parse(JSON.stringify(SCOPE_TEMPLATES[key].items));
  renderEditScopeItems();
}
function addCoordReapproval(){
  if(!PROJ.proposal.reapprovals)PROJ.proposal.reapprovals=[];
  PROJ.proposal.reapprovals.push({title:"",quotationNumber:"",value:"",scopeHtml:""});
  render();
}
function saveCoordScope(){
  if(!PROJ)return;
  const scopeEl=document.getElementById("coord-scope-editor");
  if(scopeEl)PROJ.proposal.scopeHtml=scopeEl.innerHTML;
  (PROJ.proposal.reapprovals||[]).forEach((_,ri)=>{
    const ed=document.getElementById("coord-reapp-editor-"+ri);
    if(ed)PROJ.proposal.reapprovals[ri].scopeHtml=ed.innerHTML;
  });
  saveProj();
}

function showAdminPopup(title,subtitle,projects){
  S.adminPopup={title,subtitle,projects:projects||[]};render();
}
function closeAdminPopup(){S.adminPopup=null;render();}

function openAdminPopupById(id){
  const all=Object.values(ALL_PROJECTS);
  const proposals=all.filter(p=>p.workflowStatus==="proposal"||p.workflowStatus==="allocated");
  const projects=all.filter(p=>p.workflowStatus!=="proposal"&&p.workflowStatus!=="allocated");
  const attention=[];
  projects.forEach(p=>{
    (p.stages||[]).forEach(st=>{
      if(["hold","waiting-applicant","rejected","not-received","comments-shared"].includes(st.status||""))
        attention.push(p);
    });
  });
  const uniqueAttn=[...new Map(attention.map(p=>[p.id,p])).values()];
  const map={
    "prop-all":      {title:"All Proposals",sub:`${proposals.length} total proposals`,list:proposals},
    "prop-pending":  {title:"Pending Allocation",sub:"Not yet assigned to a coordinator",list:proposals.filter(p=>p.workflowStatus==="proposal")},
    "prop-alloc":    {title:"Allocated Proposals",sub:"Assigned to coordinators",list:proposals.filter(p=>p.workflowStatus==="allocated")},
    "prop-reapp":    {title:"Proposals with Re-approvals",sub:"These proposals have re-approval quotations",list:proposals.filter(p=>p.proposal&&p.proposal.reapprovals&&p.proposal.reapprovals.length>0)},
    "proj-all":      {title:"All Projects",sub:`${projects.length} total projects`,list:projects},
    "proj-active":   {title:"In Progress Projects",sub:"Currently active projects",list:projects.filter(p=>projStatus(p)==="active")},
    "proj-done":     {title:"Completed Projects",sub:"All completed projects",list:projects.filter(p=>projStatus(p)==="done")},
    "proj-new":      {title:"Not Started Projects",sub:"No activity yet",list:projects.filter(p=>projStatus(p)==="new")},
    "proj-attention":{title:"Blocked Stages",sub:"Hold / Rejected / Waiting on Applicant",list:uniqueAttn},
    "proj-reapp":    {title:"Projects with Re-approvals",sub:"",list:projects.filter(p=>p.proposal&&p.proposal.reapprovals&&p.proposal.reapprovals.length>0)},
  };
  const entry=map[id];
  if(!entry)return;
  showAdminPopup(entry.title,entry.sub,entry.list);
}
function openAdminPopupByType(field,val){
  const all=Object.values(ALL_PROJECTS);
  const proposals=all.filter(p=>p.workflowStatus==="proposal"||p.workflowStatus==="allocated");
  showAdminPopup(val+" Proposals","Proposals with this project type",proposals.filter(p=>p.project&&natureArr(p.project.unitType).includes(val)));
}
function openAdminPopupByCategory(cat){
  const all=Object.values(ALL_PROJECTS);
  const proposals=all.filter(p=>p.workflowStatus==="proposal"||p.workflowStatus==="allocated");
  showAdminPopup(cat,"Proposals in this folder category",proposals.filter(p=>p.proposal&&(p.proposal.projectTypes||[]).includes(cat)));
}
function openAdminPopupByCoord(name){
  const all=Object.values(ALL_PROJECTS);
  const projects=all.filter(p=>p.workflowStatus!=="proposal"&&p.workflowStatus!=="allocated");
  showAdminPopup(name+" — Projects","All projects assigned to this coordinator",projects.filter(p=>p.project&&p.project.coordinator===name));
}
function openAdminPopupByProjType(t){
  const all=Object.values(ALL_PROJECTS);
  const projects=all.filter(p=>p.workflowStatus!=="proposal"&&p.workflowStatus!=="allocated");
  showAdminPopup(t+" Projects","",projects.filter(p=>p.project&&natureArr(p.project.unitType).includes(t)));
}

function render(){
  const root=document.getElementById("app");
  let overlay="";
  if(S.modal==="showlink"&&PROJ){
    const link=projectLink(PROJ.id);
    overlay=`<div class="overlay"><div class="modal">
      <h3>Project Link Ready</h3>
      <p>Share this link with your client. They can open it on any device.</p>
      <div style="font-size:11px;color:#555;font-family:monospace;background:#f7f7f7;padding:10px;border-radius:8px;word-break:break-all;margin-bottom:12px">${link}</div>
      <div class="modal-btns">
        <button class="btn btn-gold" onclick="copyText('${link}')">Copy Link</button>
        <button class="btn btn-green" onclick="S.modal=null;render()">Done</button>
      </div>
    </div></div>`;
  }
  if(S.modal==="delproj"){
    overlay=`<div class="overlay"><div class="modal">
      <h3>Delete Project?</h3>
      <p>This will permanently delete <strong>${esc(PROJ?PROJ.project.title:"this project")}</strong>. Cannot be undone.</p>
      <div class="modal-btns">
        <button class="btn" style="background:#f0f0f0;color:#666" onclick="S.modal=null;render()">Cancel</button>
        <button class="btn btn-red" onclick="confirmDelete()">Delete Permanently</button>
      </div>
    </div></div>`;
  }
  if(S.adminPopup){
    const pop=S.adminPopup;
    overlay+=`<div class="admin-popup-overlay" onclick="if(event.target===this)closeAdminPopup()">
      <div class="admin-popup">
        <div class="admin-popup-hdr">
          <div>
            <div class="admin-popup-title">${esc(pop.title)}</div>
            ${pop.subtitle?`<div class="admin-popup-sub">${esc(pop.subtitle)}</div>`:""}
          </div>
          <button class="admin-popup-close" onclick="closeAdminPopup()">✕</button>
        </div>
        <div class="admin-popup-body">
          ${pop.projects&&pop.projects.length?pop.projects.map(p=>{
            const pr=p.project||{},prop=p.proposal||{};
            const st=projStatus(p),pc=projPct(p);
            const cCls=st==="done"?"chip-done":st==="active"?"chip-active":st==="proposal"?"chip-proposal":st==="allocated"?"chip-allocated":"chip-new";
            const cTxt=st==="done"?"Completed":st==="active"?"In Progress":st==="proposal"?"Proposal":st==="allocated"?"Allocated":"Not Started";
            const ptypes=prop.projectTypes||[];
            return`<div class="admin-popup-proj-row" onclick="closeAdminPopup();openProject('${p.id}')">
              <div style="flex:1">
                <div style="font-size:13px;font-weight:600;color:#1a1a1a;margin-bottom:3px">${esc(pr.title||"Unnamed")}</div>
                <div style="font-size:11px;color:#888;margin-bottom:5px">${esc(pr.client||"—")} · ${esc(pr.location||"—")} · Unit: ${esc(pr.unit||"—")}${pr.coordinator?" · <strong>"+esc(pr.coordinator)+"</strong>":""}</div>
                <div style="display:flex;gap:5px;flex-wrap:wrap">
                  <span class="status-chip ${cCls}">${cTxt}</span>
                  ${prop.quotationNumber?`<span class="status-chip" style="background:#e8f4ff;color:#1a5276">📄 ${esc(prop.quotationNumber)}</span>`:""}
                  ${ptypes.map(t=>`<span class="proj-type-tag">${esc(t)}</span>`).join("")}
                </div>
              </div>
              <div style="text-align:right;flex-shrink:0">
                <div style="font-size:13px;font-weight:700;color:#0d2137">${pc}%</div>
                <div class="mini-bar-bg" style="margin-top:4px"><div class="mini-bar-fill" style="width:${pc}%"></div></div>
                <div style="font-size:10px;color:#aaa;margin-top:3px">Tap to open →</div>
              </div>
            </div>`;
          }).join(""):`<div class="admin-popup-empty">No entries in this category.</div>`}
        </div>
      </div>
    </div>`;
  }
  switch(S.mode){
    case"landing":       root.innerHTML=renderLanding()+overlay;break;
    case"coordName":     root.innerHTML=renderCoordNameStep()+overlay;break;
    case"client":        root.innerHTML=renderClient()+overlay;break;
    case"coord":         root.innerHTML=renderCoord()+overlay;break;
    case"admin":         root.innerHTML=renderAdmin()+overlay;break;
 case"proposals":     root.innerHTML=renderProposals()+overlay;break;
    default: root.innerHTML=`<div class="loading"><div class="spinner"></div></div>`+overlay;
  }
  if(S.mode==="proposals"){
    if(S.editingProposalId)renderEditScopeItems();
    else if(S.proposalTab==="new")renderNewScopeItems();
  }
}

function renderLanding(){
  return`<div class="landing-hero">
    <div class="landing-brand">Winner Holistic Consultants</div>
    <div class="landing-title">Projects Management System</div>
    <div class="landing-sub">Abu Dhabi Municipal Approvals & Internal Project Management</div>
  </div>
  <div class="login-wrap" style="padding-top:28px"><div class="login-box">
    ${S.loginErr?`<div class="err-msg">${esc(S.loginErr)}</div>`:""}
    <div class="fl" style="margin-bottom:12px">Enter your password🔑</div>
    <input class="fi" type="password" id="pw" placeholder="Password" style="margin-bottom:14px"
      onkeydown="if(event.key==='Enter')tryUnifiedLogin()"/>
    <button class="btn btn-gold" style="width:100%;padding:11px;font-size:13px" onclick="tryUnifiedLogin()">Login →</button>
  </div></div>
  <div style="text-align:center;margin-top:20px;font-size:15px;color:#bbb">
    Unified Login Portal
  </div>`;
}
function tryUnifiedLogin(){
  const v=document.getElementById("pw")?.value||"";
  if(v===PROPOSAL_PW){
    S.loginErr="";S.authedProposal=true;loadProposalProjects();
  } else if(v===COORD_PW){
    S.loginErr="";S.authedCoord=true;S.mode="coordName";render();
  } else if(v===ADMIN_PW){
    S.loginErr="";S.authedAdmin=true;loadAll();
  } else{
    S.loginErr="Incorrect password. Please try again.";render();
  }
}

function renderCoordNameStep(){
  return`<div style="background:linear-gradient(135deg,#0d2137,#1a3a5c);padding:28px 20px;color:#fff;text-align:center">
    <div style="font-size:9px;letter-spacing:2px;color:#c9a752;text-transform:uppercase;font-weight:600;margin-bottom:8px">Winner Holistic Consultants</div>
    <div style="font-size:18px;font-weight:700;margin-bottom:4px">Welcome, Coordinator</div>
    <div style="font-size:11px;color:rgba(255,255,255,0.5)">Enter your name to see your assigned projects</div>
  </div>
  <div class="login-wrap" style="padding-top:28px"><div class="coord-name-box">
    <div style="font-size:9px;font-weight:600;color:#0d2137;margin-bottom:6px">Hello</div>
    <div style="font-size:9px;color:#888;margin-bottom:18px;line-height:1.6">Your name is used to filter projects assigned to you.</div>
    <div class="fl">Enter your Name <span class="req-star">*</span></div>
    <input class="fi" id="coord-name-input" placeholder="e.g. Ahmed Al Rashidi" style="margin-bottom:14px"
      onkeydown="if(event.key==='Enter')submitCoordName()"/>
    <button class="btn btn-gold" style="width:100%;padding:11px;font-size:13px" onclick="submitCoordName()">Continue to My Projects →</button>
  </div></div>`;
}
async function submitCoordName(){
  const name=(document.getElementById("coord-name-input")?.value||"").trim();
  if(!name){alert("Please enter your name to continue.");return;}
  S.coordName=name;
  document.getElementById("app").innerHTML=`<div class="loading"><div class="spinner"></div><div style="font-size:13px;color:#888">Loading your projects...</div></div>`;
  await loadCoordProjects();
  S.mode="coord";S.tab="list";render();
}

function renderProposals(){
  if(S.editingProposalId)return renderEditProposalScope();
  const allProjs=Object.values(ALL_PROJECTS);
  const myProposals=allProjs.filter(p=>p.workflowStatus==="proposal"||p.workflowStatus==="allocated");
  const tab=S.proposalTab||"new";

  let h=`<div class="pbar-header">
    <div class="pbar-label">📋 Proposals Module</div>
    <div style="display:flex;gap:7px;align-items:center">
      <button class="btn btn-sm" style="background:rgba(255,255,255,0.2);color:#c4b5fd;border:1px solid rgba(255,255,255,0.2)"
onclick="S.proposalTab='new';_newReapprovals=[];_newScopeItems=[];render()"      <button class="btn btn-sm" style="background:rgba(255,255,255,0.1);color:#c4b5fd"
        onclick="S.proposalTab='list';render()">Submitted (${myProposals.length})</button>
    </div>
  </div>
  <div class="tabs">
    <div class="tab ${tab==="new"?"on":""}" onclick="S.proposalTab='new';render()">New Project</div>
    <div class="tab ${tab==="list"?"on":""}" onclick="S.proposalTab='list';render()">Submitted Proposals
      <span style="background:#ede8fe;color:#4a1fb8;font-size:10px;padding:1px 7px;border-radius:10px;margin-left:4px">${myProposals.length}</span>
    </div>
  </div>
  <div class="body">`;

  if(tab==="new"){
      h+=`<div class="sbox">
      <div class="sbox-title">Project Details</div>
      <div class="fgrid">
        <div class="ff"><div class="fl">Project Folder <span class="req-star">*</span></div>
          <input class="fi" id="pp-title" placeholder="e.g. Marina Mall – Shop No. 42"/></div>
        <div><div class="fl">Client Name <span class="req-star">*</span></div>
          <input class="fi" id="pp-client" placeholder="e.g. Al Baraka Trading LLC"/></div>
        <div><div class="fl">Unit / Shop No. <span class="req-star">*</span></div>
          <input class="fi" id="pp-unit" placeholder="e.g. G-42"/></div>
        <div class="ff"><div class="fl">Location / Mall <span class="req-star">*</span></div>
          <input class="fi" id="pp-location" placeholder="e.g. Marina Mall, Abu Dhabi"/></div>
        <div class="ff"><div class="fl" style="margin-bottom:6px">Nature of the Project <span class="req-star">*</span>
          <span style="font-size:10px;color:#888;font-weight:400;margin-left:6px">(select all that apply)</span>
        </div>
        <div class="proj-type-grid">
          ${PROJECT_TYPES_NEW.map((t,i)=>`
            <label class="proj-type-option" id="nature-opt-${i}">
              <input type="checkbox" id="nature-${i}" value="${t}" onchange="toggleNatureStyle(${i})"/>
              <span class="proj-type-label">${t}</span>
            </label>`).join("")}
        </div>
        </div>
        <div><div class="fl">Expected Start Date</div>
          <input class="fi" type="date" id="pp-start"/></div>
        <div><div class="fl">Assign to Coordinator <span class="req-star">*</span></div>
          <input class="fi" id="pp-coord" placeholder="Coordinator name"/></div>
        <div><div class="fl">Submitted By <span class="req-star">*</span></div>
          <input class="fi" id="pp-by" placeholder="Your name"/></div>
      </div>
      <div style="margin-top:12px">
        <div class="fl" style="margin-bottom:6px">Project Folder Category <span class="req-star">*</span></div>
        <select class="fi" id="pp-folder-category">
          <option value="">— Select Folder Category —</option>
          ${FOLDER_CATEGORIES.map(t=>`<option value="${t}">${t}</option>`).join("")}
        </select>
      </div>
    </div>
    <div class="quot-box">
      <div class="quot-box-title">💼 Main Quotation</div>
      <div class="fgrid">
        <div><div class="fl">Quotation Number <span class="req-star">*</span></div>
          <input class="fi" id="pp-quot-num" placeholder="e.g. WHC-2026-042"/></div>
        <div><div class="fl">Quotation Value (AED) <span class="req-star">*</span></div>
          <input class="fi" type="number" id="pp-quot-val" placeholder="e.g. 85000"/></div>
      </div>
    </div>
    <div class="sbox">
    <div class="sbox-title">Scope of Works <span class="req-star">*</span></div>
    <div style="display:flex;gap:8px;align-items:flex-end;margin-bottom:10px;flex-wrap:wrap">
      <div style="flex:1;min-width:160px">
        <div class="fl">Load Template</div>        <select class="fi" id="pp-scope-template" onchange="loadScopeTemplateNew()">
          <option value="">— Select Template —</option>
          ${Object.entries(SCOPE_TEMPLATES).map(([k,t])=>`<option value="${k}">${esc(t.label)}</option>`).join("")}
        </select>
      </div>
  <button class="btn btn-sm" style="background:#fff8e6;color:#a06b00;border:1px solid #e8c96a"
        onclick="addNewScopeItem()">+ Add Item</button>
    </div>
    <div id="pp-scope-items"></div>
  </div>
  <div class="sbox">
    <div class="sbox-title">Additional Notes / Scope Description</div>
    <div class="rte-wrap">${rteToolbar("pp-scope-editor")}</div>
  </div>
    <div class="reapp-box">
      <div class="reapp-box-title">🔄 Re-approval Quotations
        <span style="font-size:10px;font-weight:400;color:#c08060">Add if any re-approvals are needed</span>
      </div>
      <div id="pp-reapp-list"></div>
      <button class="btn btn-sm" style="background:#fde8d8;color:#a04800;border:1px solid #e8a060;margin-top:4px"
        onclick="addNewReapprovalEntry()">+ Add Re-approval Quotation</button>
    </div>
    <button class="btn btn-purple" style="width:100%;margin-top:4px;padding:12px;font-size:13px"
      onclick="submitProposal()">Submit Project to Coordinator →</button>`;
    rteInit("pp-scope-editor","");

  } else {
    const coords=[...new Set(myProposals.map(p=>p.project&&p.project.coordinator).filter(Boolean))].sort();
    h+=`<div class="prop-filters">
      <div class="prop-filter-item">
        <div class="prop-filter-label">Coordinator</div>
        <select class="prop-filter-input" onchange="S.propFilterCoord=this.value;render()">
          <option value="">All Coordinators</option>
          ${coords.map(c=>`<option value="${c}" ${S.propFilterCoord===c?"selected":""}>${esc(c)}</option>`).join("")}
        </select>
      </div>
      <div class="prop-filter-item">
        <div class="prop-filter-label">Nature of the Project</div>
        <select class="prop-filter-input" onchange="S.propFilterProjType=this.value;render()">
          <option value="all">All Natures</option>
          ${PROJECT_TYPES_NEW.map(t=>`<option value="${t}" ${S.propFilterProjType===t?"selected":""}>${t}</option>`).join("")}
        </select>
      </div>
      <div class="prop-filter-item">
        <div class="prop-filter-label">Date From</div>
        <input type="date" class="prop-filter-input" value="${S.propFilterDateFrom||""}" onchange="S.propFilterDateFrom=this.value;render()"/>
      </div>
      <div class="prop-filter-item">
        <div class="prop-filter-label">Date To</div>
        <input type="date" class="prop-filter-input" value="${S.propFilterDateTo||""}" onchange="S.propFilterDateTo=this.value;render()"/>
      </div>
      <div class="prop-filter-item">
        <div class="prop-filter-label">Client Name</div>
        <input class="prop-filter-input" placeholder="Search client..." value="${S.propFilterClient||""}" oninput="S.propFilterClient=this.value;render()"/>
      </div>
      <div class="prop-filter-item">
        <div class="prop-filter-label">Quotation No.</div>
        <input class="prop-filter-input" placeholder="e.g. WHC-2026-042" value="${S.propFilterQuot||""}" oninput="S.propFilterQuot=this.value;render()"/>
      </div>
      <div class="prop-filter-item">
        <div class="prop-filter-label">Min Value (AED)</div>
        <input type="number" class="prop-filter-input" placeholder="e.g. 50000" value="${S.propFilterValue||""}" oninput="S.propFilterValue=this.value;render()"/>
      </div>
      <div class="prop-filter-item">
        <div class="prop-filter-label">Re-approvals</div>
        <select class="prop-filter-input" onchange="S.propFilterReapp=this.value;render()">
          <option value="all">All</option>
          <option value="yes" ${S.propFilterReapp==="yes"?"selected":""}>Has Re-approvals</option>
          <option value="no" ${S.propFilterReapp==="no"?"selected":""}>No Re-approvals</option>
        </select>
      </div>
    </div>`;

    let filtered=myProposals.filter(p=>{
      const pr=p.project||{},prop=p.proposal||{};
      if(S.propFilterCoord&&pr.coordinator!==S.propFilterCoord)return false;
      if(S.propFilterProjType!=="all"&&!natureArr(pr.unitType).includes(S.propFilterProjType))return false;
      if(S.propFilterDateFrom&&(p.createdAt||"")<S.propFilterDateFrom)return false;
      if(S.propFilterDateTo&&(p.createdAt||"")>S.propFilterDateTo)return false;
      if(S.propFilterClient&&!(pr.client||"").toLowerCase().includes(S.propFilterClient.toLowerCase()))return false;
      if(S.propFilterQuot&&!(prop.quotationNumber||"").toLowerCase().includes(S.propFilterQuot.toLowerCase()))return false;
      if(S.propFilterValue&&parseFloat(prop.estimatedValue||0)<parseFloat(S.propFilterValue))return false;
      if(S.propFilterReapp==="yes"&&(!prop.reapprovals||!prop.reapprovals.length))return false;
      if(S.propFilterReapp==="no"&&prop.reapprovals&&prop.reapprovals.length>0)return false;
      return true;
    }).sort((a,b)=>(b.createdAt||"").localeCompare(a.createdAt||""));

    h+=`<div style="font-size:12px;color:#888;margin-bottom:8px">Showing ${filtered.length} of ${myProposals.length} proposals</div>`;

    if(!filtered.length){
      h+=`<div style="text-align:center;padding:30px;color:#aaa;font-size:13px">No proposals match the selected filters.</div>`;
    } else {
      filtered.forEach(p=>{
        const pr=p.project||{},prop=p.proposal||{};
        const ws=p.workflowStatus;
        const wsCls=ws==="allocated"?"chip-allocated":"chip-proposal";
        const wsTxt=ws==="allocated"?"Allocated to Coordinator":"Pending Allocation";
        const reapps=prop.reapprovals||[];
        const ptypes=prop.projectTypes||[];
        const plog=p.proposalLog||[];
        h+=`<div class="prop-card">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:6px">
            <div style="flex:1">
              <div class="prop-card-title">${esc(pr.title||"Unnamed")}</div>
              <div class="prop-card-meta">${esc(pr.client||"—")} · ${esc(pr.location||"—")} · Unit: ${esc(pr.unit||"—")}</div>
              <div style="margin-top:5px;display:flex;gap:5px;flex-wrap:wrap">
                <span class="status-chip ${wsCls}">${wsTxt}</span>
                ${pr.coordinator?`<span class="status-chip chip-allocated">👤 ${esc(pr.coordinator)}</span>`:""}
                <span class="status-chip chip-new">${esc(p.createdAt||"")}</span>
                ${prop.quotationNumber?`<span class="status-chip" style="background:#e8f4ff;color:#1a5276">📄 ${esc(prop.quotationNumber)}</span>`:""}
                ${prop.estimatedValue?`<span class="status-chip" style="background:#f0fdf4;color:#166a3f">AED ${esc(prop.estimatedValue)}</span>`:""}
                <span class="status-chip" style="background:#f0f0f0;color:#666">${esc(natureDisplay(pr.unitType))}</span>
              </div>
              ${ptypes.length?`<div style="margin-top:5px;display:flex;gap:4px;flex-wrap:wrap">${ptypes.map(t=>`<span class="proj-type-tag">${esc(t)}</span>`).join("")}</div>`:""}
            </div>
          </div>
          ${prop.scopeHtml?`<div class="prop-scope-preview">${prop.scopeHtml}</div>`:""}
          ${reapps.length?`<div style="margin-top:8px;padding:8px 10px;background:#fdf0e6;border-radius:8px;border:1px solid #e8c090">
            <div style="font-size:10px;font-weight:700;color:#a04800;margin-bottom:5px">🔄 ${reapps.length} Re-approval(s)</div>
            ${reapps.map((r,ri)=>`<div style="font-size:11px;color:#555;padding:3px 0;border-bottom:1px solid #f5ddc0">
              <strong>${ri+1}. ${esc(r.title||"Re-approval")}</strong>
              ${r.quotationNumber?` · 📄 ${esc(r.quotationNumber)}`:""}
              ${r.value?` · AED ${esc(r.value)}`:""}
            </div>`).join("")}
          </div>`:""}
          ${plog.length?`<div style="margin-top:8px;padding:8px 10px;background:#f7f7f7;border-radius:8px;border:1px solid #eee">
            <div style="font-size:10px;font-weight:700;color:#666;margin-bottom:5px">📝 Activity (${plog.length} entries)</div>
            ${plog.slice(-3).reverse().map(l=>`<div class="prop-act-row">
              <div class="prop-act-dot"></div>
              <div class="prop-act-body"><strong>${esc(l.by)}</strong> — ${esc(l.action)}${l.detail?" · "+esc(l.detail):""}</div>
              <div class="prop-act-time">${fmtDateTime(l.at)}</div>
            </div>`).join("")}
          </div>`:""}
          <div class="prop-card-btns">
            <button class="btn btn-sm btn-purple" onclick="editProposalScope('${p.id}')">Edit Scope & Quotations</button>
            ${ws==="proposal"?`<button class="btn btn-sm btn-gold" onclick="allocateProposal('${p.id}')">Mark as Allocated</button>`:""}
            <button class="btn btn-sm" style="background:#e8f4ff;color:#1a5276;border:1px solid #b3d4f0" onclick="duplicateProposal('${p.id}')">⧉ Duplicate</button>
            <button class="btn btn-sm" style="background:#f0f0f0;color:#444;border:1px solid #ddd" onclick="exportProposalPDF('${p.id}')">⬇ Export PDF</button>
            <button class="btn btn-sm btn-red" onclick="deleteProposal('${p.id}')">🗑 Delete</button>
          </div>
        </div>`;
      });
    }
  }
  h+=`</div><div class="footer">Winner Holistic Consultants · Proposals Module · <a href="${window.location.pathname}" style="color:#888">Back</a></div>`;
  return h;
}

async function submitProposal(){
  const title=(document.getElementById("pp-title")?.value||"").trim();
  const client=(document.getElementById("pp-client")?.value||"").trim();
  const unit=(document.getElementById("pp-unit")?.value||"").trim();
  const location=(document.getElementById("pp-location")?.value||"").trim();
  const coord=(document.getElementById("pp-coord")?.value||"").trim();
  const by=(document.getElementById("pp-by")?.value||"").trim();
  const unitType=PROJECT_TYPES_NEW.filter((_,i)=>document.getElementById("nature-"+i)?.checked);
  const startDate=(document.getElementById("pp-start")?.value||"").trim();
  const quotNum=(document.getElementById("pp-quot-num")?.value||"").trim();
  const quotVal=(document.getElementById("pp-quot-val")?.value||"").trim();
  const scopeEl=document.getElementById("pp-scope-editor");
  const scopeHtml=scopeEl?scopeEl.innerHTML:"";
  const folderCat=document.getElementById("pp-folder-category")?.value||"";
  const finalReapprovals=_newReapprovals.map((r,i)=>{
    const ed=document.getElementById("new-reapp-editor-"+i);
    return{...r,scopeHtml:ed?ed.innerHTML:r.scopeHtml||""};
  });
  if(!title||!client||!unit||!location||!coord||!by){alert("Please fill in all required fields.");return;}
  if(!_newScopeItems.length){alert("Please add at least one Scope of Works item (or load a template).");return;}
  if(!folderCat){alert("Please select a Project Folder Category.");return;}
  if(!unitType.length){alert("Please select at least one Nature of the Project.");return;}
  if(!quotNum||!quotVal){alert("Please enter the main Quotation Number and Value.");return;}
  document.getElementById("app").innerHTML=`<div class="loading"><div class="spinner"></div><div style="font-size:13px;color:#888">Submitting project...</div></div>`;
  const p=newProj(title);
  p.project.client=client;p.project.unit=unit;p.project.location=location;
  p.project.unitType=unitType;p.project.coordinator=coord;
  p.proposal.scopeHtml=scopeHtml;p.proposal.scopeItems=JSON.parse(JSON.stringify(_newScopeItems));p.proposal.estimatedValue=quotVal;
  p.proposal.expectedStartDate=startDate;p.proposal.submittedBy=by;
  p.proposal.submittedAt=new Date().toISOString().split("T")[0];
  p.proposal.quotationNumber=quotNum;
  p.proposal.reapprovals=finalReapprovals;
  p.proposal.projectTypes=[folderCat];
  p.workflowStatus="allocated";
  p.activityLog=[{stageName:"Project Created",oldStatus:"",newStatus:"allocated",by,note:"Submitted by proposals team",at:new Date().toISOString()}];
  p.proposalLog=[{action:"Project Created",by,detail:`Quot: ${quotNum} · AED ${quotVal} · Folder: ${folderCat}`,at:new Date().toISOString()}];
  _newReapprovals=[];
  _newScopeItems=[];
 
  const ok=await fbSet("projects/"+p.id,p);
  if(ok){ALL_PROJECTS[p.id]=p;S.proposalTab="list";render();}
  else{alert("Error saving. Check Firebase connection.");loadProposalProjects();}
}

async function allocateProposal(id){
  const p=ALL_PROJECTS[id];if(!p)return;
  p.workflowStatus="allocated";
  if(!p.proposalLog)p.proposalLog=[];
  p.proposalLog.push({action:"Marked as Allocated",by:"Proposals Team",detail:"",at:new Date().toISOString()});
  await fbSet("projects/"+id,p);render();
}
async function duplicateProposal(id){
  const src=ALL_PROJECTS[id];if(!src)return;
  document.getElementById("app").innerHTML=`<div class="loading"><div class="spinner"></div><div style="font-size:13px;color:#888">Duplicating project...</div></div>`;
  const copy=JSON.parse(JSON.stringify(src));
  copy.id=makeId();
  copy.createdAt=new Date().toISOString().split("T")[0];
  copy.workflowStatus="proposal";
  copy.activityLog=[];
  copy.proposalLog=[{action:"Duplicated",by:"Proposals Team",detail:`Copied from "${src.project&&src.project.title||"project"}"`,at:new Date().toISOString()}];
  if(copy.project)copy.project.title=(src.project&&src.project.title?src.project.title:"New Project")+" (Copy)";
  if(!copy.stages)copy.stages=blankStages();
  copy.stages=copy.stages.map(st=>({...st,status:"",appNum:"",dateA:"",dateB:""}));
  if(!copy.docs)copy.docs=blankDocs();
  copy.docs=(copy.docs||[]).map(g=>({...g,items:(g.items||[]).map(it=>({...it,status:"pending"}))}));
  const ok=await fbSet("projects/"+copy.id,copy);
  if(ok){ALL_PROJECTS[copy.id]=copy;S.proposalTab="list";render();}
  else{alert("Error duplicating. Check Firebase connection.");render();}
}
async function deleteProposal(id){
  const p=ALL_PROJECTS[id];if(!p)return;
  const title=(p.project&&p.project.title)||"this project";
  if(!confirm(`Delete "${title}"? This cannot be undone.`))return;
  document.getElementById("app").innerHTML=`<div class="loading"><div class="spinner"></div><div style="font-size:13px;color:#888">Deleting...</div></div>`;
  const ok=await fbDelete("projects/"+id);
  if(ok){delete ALL_PROJECTS[id];render();}
  else{alert("Error deleting. Check Firebase connection.");render();}
}
async function editProposalScope(id){
  document.getElementById("app").innerHTML=`<div class="loading"><div class="spinner"></div><div style="font-size:13px;color:#888">Loading proposal...</div></div>`;
  const data=await fbGet("projects/"+id);
  if(!data){alert("Could not load this proposal. Check Firebase connection.");render();return;}
  PROJ=migrateProject(data);
  S.editingProposalId=id;
  render();
}
function cancelEditProposal(){
  S.editingProposalId=null;S.proposalTab="list";render();
}
function addEditReapproval(){
  if(!PROJ.proposal.reapprovals)PROJ.proposal.reapprovals=[];
  PROJ.proposal.reapprovals.push({title:"",quotationNumber:"",value:"",scopeHtml:""});
  render();
}
function removeEditReapproval(i){
  PROJ.proposal.reapprovals.splice(i,1);
  render();
}
async function saveProposalEdit(){
  if(!PROJ)return;
  const quotNum=(document.getElementById("ep-quot-num")?.value||"").trim();
  const quotVal=(document.getElementById("ep-quot-val")?.value||"").trim();
  if(!quotNum||!quotVal){alert("Please enter the main Quotation Number and Value.");return;}
  if(!PROJ.proposal.scopeItems||!PROJ.proposal.scopeItems.length){alert("Please keep at least one Scope of Works item.");return;}
  const scopeEl=document.getElementById("ep-scope-editor");
  if(scopeEl)PROJ.proposal.scopeHtml=scopeEl.innerHTML;
  (PROJ.proposal.reapprovals||[]).forEach((_,ri)=>{
    const ed=document.getElementById("ep-reapp-editor-"+ri);
    if(ed)PROJ.proposal.reapprovals[ri].scopeHtml=ed.innerHTML;
  });
  PROJ.proposal.quotationNumber=quotNum;
  PROJ.proposal.estimatedValue=quotVal;
  if(!PROJ.proposalLog)PROJ.proposalLog=[];
  PROJ.proposalLog.push({action:"Scope & Quotation Updated",by:"Proposals Team",detail:`Quot: ${quotNum} · AED ${quotVal}`,at:new Date().toISOString()});
  S.saving=true;render();
  const ok=await fbSet("projects/"+PROJ.id,PROJ);
  S.saving=false;
  if(ok){
    ALL_PROJECTS[PROJ.id]=PROJ;
    S.editingProposalId=null;
    S.proposalTab="list";
    render();
  } else {
    alert("Error saving. Check Firebase connection.");
    render();
  }
}
function renderEditProposalScope(){
  const d=PROJ;
  if(!d)return`<div class="loading"><div class="spinner"></div></div>`;
  const pr=d.project||{},prop=d.proposal||{};
  let h=`<div class="pbar-header">
    <div class="pbar-label" style="cursor:pointer" onclick="cancelEditProposal()">← Editing: ${esc(pr.title||"Proposal")}</div>
    <div style="display:flex;gap:7px;align-items:center">
      ${S.saving?`<span style="font-size:11px;color:#c9a752">Saving...</span>`:""}
      <button class="btn btn-sm" style="background:rgba(255,255,255,0.1);color:#c4b5fd" onclick="cancelEditProposal()">Cancel</button>
      <button class="btn btn-sm btn-gold" onclick="saveProposalEdit()">Save Changes</button>
    </div>
  </div>
  <div class="body">
    <div class="sbox">
      <div class="sbox-title">Project Details <span style="font-size:10px;color:#888;font-weight:400;margin-left:6px">(read-only)</span></div>
      <div class="fgrid">
        <div class="ff"><div class="fl">Project Folder</div><div style="font-size:13px;color:#222;padding:6px 0">${esc(pr.title||"—")}</div></div>
        <div><div class="fl">Client Name</div><div style="font-size:13px;color:#222;padding:6px 0">${esc(pr.client||"—")}</div></div>
        <div><div class="fl">Unit / Shop No.</div><div style="font-size:13px;color:#222;padding:6px 0">${esc(pr.unit||"—")}</div></div>
        <div class="ff"><div class="fl">Location / Mall</div><div style="font-size:13px;color:#222;padding:6px 0">${esc(pr.location||"—")}</div></div>
        <div><div class="fl">Nature of the Project</div><div style="font-size:13px;color:#222;padding:6px 0">${esc(natureDisplay(pr.unitType))}</div></div>
        <div><div class="fl">Coordinator</div><div style="font-size:13px;color:#222;padding:6px 0">${esc(pr.coordinator||"—")}</div></div>
      </div>
    </div>
    <div class="quot-box">
      <div class="quot-box-title">💼 Main Quotation</div>
      <div class="fgrid">
        <div><div class="fl">Quotation Number <span class="req-star">*</span></div>
          <input class="fi" id="ep-quot-num" value="${esc(prop.quotationNumber||"")}"/></div>
        <div><div class="fl">Quotation Value (AED) <span class="req-star">*</span></div>
          <input class="fi" type="number" id="ep-quot-val" value="${esc(prop.estimatedValue||"")}"/></div>
      </div>
    </div>
    <div class="sbox">
      <div class="sbox-title">Scope of Works <span class="req-star">*</span></div>
      <div style="display:flex;gap:8px;align-items:flex-end;margin-bottom:10px;flex-wrap:wrap">
        <div style="flex:1;min-width:160px">
          <div class="fl">Load Template</div>
          <select class="fi" id="ep-scope-template" onchange="loadScopeTemplateEdit()">
            <option value="">— Select Template —</option>
            ${Object.entries(SCOPE_TEMPLATES).map(([k,t])=>`<option value="${k}">${esc(t.label)}</option>`).join("")}
          </select>
        </div>
        <button class="btn btn-sm" style="background:#fff8e6;color:#a06b00;border:1px solid #e8c96a" onclick="addEditScopeItem()">+ Add Item</button>
      </div>
      <div id="ep-scope-items"></div>
    </div>
    <div class="sbox">
      <div class="sbox-title">Additional Notes / Scope Description</div>
      <div class="rte-wrap">${rteToolbar("ep-scope-editor")}</div>
    </div>
    <div class="reapp-box">
      <div class="reapp-box-title">🔄 Re-approval Quotations
        <span style="font-size:10px;font-weight:400;color:#c08060">Add if any re-approvals are needed</span>
      </div>
      ${(prop.reapprovals||[]).map((r,i)=>`
        <div class="reapp-entry">
          <div class="reapp-entry-num">RE-APPROVAL #${i+1}</div>
          <div class="fgrid" style="margin-bottom:8px">
            <div class="ff"><div class="fl">Re-approval Title <span class="req-star">*</span></div>
              <input class="fi" value="${esc(r.title)}" oninput="PROJ.proposal.reapprovals[${i}].title=this.value" placeholder="e.g. TAQA Drawing Re-submission"/></div>
            <div><div class="fl">Quotation Number <span class="req-star">*</span></div>
              <input class="fi" value="${esc(r.quotationNumber)}" oninput="PROJ.proposal.reapprovals[${i}].quotationNumber=this.value" placeholder="e.g. WHC-2026-042-R1"/></div>
            <div><div class="fl">Re-approval Value (AED) <span class="req-star">*</span></div>
              <input class="fi" type="number" value="${esc(r.value)}" oninput="PROJ.proposal.reapprovals[${i}].value=this.value" placeholder="e.g. 5000"/></div>
          </div>
          <div class="fl" style="margin-bottom:5px">Re-approval Scope</div>
          <div class="rte-wrap">${rteToolbar("ep-reapp-editor-"+i)}</div>
          <button class="btn btn-sm btn-red" style="margin-top:7px" onclick="removeEditReapproval(${i})">✕ Remove</button>
        </div>`).join("")}
      <button class="btn btn-sm" style="background:#fde8d8;color:#a04800;border:1px solid #e8a060;margin-top:4px"
        onclick="addEditReapproval()">+ Add Re-approval Quotation</button>
    </div>
    <button class="btn btn-purple" style="width:100%;margin-top:4px;padding:12px;font-size:13px"
      onclick="saveProposalEdit()">Save Changes</button>
  </div>
  <div class="footer">Winner Holistic Consultants · Proposals Module · <a href="${window.location.pathname}" style="color:#888">Back</a></div>`;
  rteInit("ep-scope-editor",prop.scopeHtml||"");
  (prop.reapprovals||[]).forEach((r,i)=>rteInit("ep-reapp-editor-"+i,r.scopeHtml||""));
  return h;
}

function renderClient(){
  const d=PROJ;if(!d)return"";
  const fb=natureArr(d.project.unitType).includes("F&B");
  const stages=visStages();
  const currentStage=stages.find(s=>{const sv=s.status||"";return sv&&!["received","approved","completed","completed-signed","approved-bcc"].includes(sv);});
  const allDone=doneCount()===stages.length&&stages.length>0;

  let h=`<div class="hdr">
    <div class="hdr-logo">Winner Holistic Consultants</div>
    <div class="hdr-title">${esc(d.project.title||"Project")}</div>
    <div class="hdr-sub">${esc(d.project.location||"")}</div>
    <div class="pills">
      <div class="pill">Client: ${esc(d.project.client||"—")}</div>
      <div class="pill">Unit: ${esc(d.project.unit||"—")}</div>
      <div class="pill">Coordinator: ${esc(d.project.coordinator||"—")}</div>
      <div class="pill ${fb?"pill-fb":""}">${fb?"F&amp;B Unit – Gas Approval Included":esc(natureDisplay(d.project.unitType))}</div>
    </div>
    <div class="pbar-row"><span>Overall Approval Progress</span><span>${pct()}% Complete</span></div>
    <div class="pbar-bg"><div class="pbar-fill" style="width:${pct()}%"></div></div>
  </div>
  <div class="topbar">
    <span style="font-size:12px;color:#888">${doneCount()} of ${stages.length} stages completed</span>
   <div class="login-links">
      ${S.authedCoord?`<button class="btn btn-sm btn-gold" onclick="S.mode='coord';S.tab='stages';render()">Edit Mode</button>`:""}
    </div>
  </div>
  <div class="tabs">
    <div class="tab ${S.tab==="stages"?"on":""}" onclick="S.tab='stages';render()">Approval Stages</div>
    <div class="tab ${S.tab==="docs"?"on":""}" onclick="S.tab='docs';render()">Documents</div>
    ${d.proposal&&(d.proposal.scopeHtml||d.proposal.reapprovals&&d.proposal.reapprovals.length)?`<div class="tab ${S.tab==="scope"?"on":""}" onclick="S.tab='scope';render()">Scope of Work</div>`:""}
  </div><div class="body">`;

  if(S.tab==="stages"){
    h+=`<div class="sec-label">${doneCount()} of ${stages.length} stages complete</div>
    <div class="milestone-label" ${allDone?'style="border-color:#a3d4b8;background:#f0fdf4"':''}>
      <div class="milestone-icon">${allDone?"🎉":currentStage?"📍":"🕐"}</div>
      <div class="milestone-text">
        <div class="milestone-title" ${allDone?'style="color:#166a3f"':''}>Current Milestone</div>
        <div class="milestone-value" ${allDone?'style="color:#166a3f"':''}>${allDone?"Project Fully Completed ✓":currentStage?esc(currentStage.name):"Awaiting First Stage Update"}</div>
        ${currentStage&&currentStage.note?`<div class="milestone-note">${esc(currentStage.note)}</div>`:""}
      </div>
      ${currentStage?`<span class="badge ${(STATUS_DISPLAY[currentStage.status||""]||STATUS_DISPLAY[""]).cls}">${(STATUS_DISPLAY[currentStage.status||""]||STATUS_DISPLAY[""]).label}</span>`:""}
    </div>`;
    stages.forEach((st,i)=>{
      const last=i===stages.length-1,type=st.type||"scope";
      const disp=STATUS_DISPLAY[st.status||""]||STATUS_DISPLAY[""];
      h+=`<div class="sw">
        <div class="sl">
          <div class="si ${stageCls(st)}">${stageIcon(st)}</div>
          ${!last?`<div class="sline ${isStageComplete(st)?"sline-done":""}"></div>`:""}
        </div>
        <div class="sr">
          <div class="sname">${esc(st.name)}</div>
          ${st.time?`<div class="stime">⏱ ${esc(st.time)}</div>`:""}
          <div class="badge ${disp.cls}">${disp.label}</div>
          ${needsAppNum(type,st.status||"")&&st.appNum?`<div class="s-appnum">📋 Application No: <strong>${esc(st.appNum)}</strong></div>`:""}
          ${hasDateFields(type)&&st.dateA?`<div class="s-date">📅 ${dateLabelA(type)}: <strong>${fmtDate(st.dateA)}</strong></div>`:""}
          ${hasDateFields(type)&&st.dateB?`<div class="s-date">✅ ${dateLabelB(type)}: <strong>${fmtDate(st.dateB)}</strong></div>`:""}
          ${st.note?`<div class="snote">${esc(st.note)}</div>`:""}
        </div>
      </div>`;
    });
  } else if(S.tab==="docs"){
    if(fb)h+=`<div class="nb nb-fb">This is an F&amp;B unit. Gas approval documents are included below.</div>`;
    else h+=`<div class="nb">Documents marked <strong>Required</strong> must be submitted before the relevant stage can proceed.</div>`;
    d.docs.filter(g=>!g.fb||fb).forEach(g=>{
      h+=`<div class="dc"><div class="dch ${g.fb?"dch-fb":""}">${esc(g.group)}${g.fb?`<span style="font-size:9px;background:#fde8d8;color:#a04800;padding:1px 7px;border-radius:8px;font-weight:700;margin-left:6px">F&amp;B/Gas</span>`:""}</div>`;
      g.items.forEach(item=>{h+=`<div class="dr"><div class="dic ${dIc(item.status)}">${dCh(item.status)}</div><span>${esc(item.name)}</span>${dTag(item.status)}</div>`;});
      h+=`</div>`;
    });
  } else if(S.tab==="scope"){
    const prop=d.proposal||{};
    const reapps=prop.reapprovals||[];
    const ptypes=prop.projectTypes||[];
    h+=`<div class="sbox">
      <div class="sbox-title">Scope of Work</div>
      ${ptypes.length?`<div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:10px">${ptypes.map(t=>`<span class="proj-type-tag">${esc(t)}</span>`).join("")}</div>`:""}
      <div style="font-size:13px;color:#222;line-height:1.8">${prop.scopeHtml||"<span style='color:#aaa'>Scope not yet entered.</span>"}</div>
      ${prop.quotationNumber?`<div style="margin-top:12px;padding-top:10px;border-top:1px solid #f0f0f0;font-size:12px;color:#666">Quotation Reference: <strong>${esc(prop.quotationNumber)}</strong></div>`:""}
      ${prop.expectedStartDate?`<div style="font-size:12px;color:#666;margin-top:4px">Expected Start: <strong>${fmtDate(prop.expectedStartDate)}</strong></div>`:""}
    </div>
    ${reapps.length?`<div style="margin-bottom:10px">
      <div style="font-size:10px;letter-spacing:1px;text-transform:uppercase;color:#a04800;font-weight:700;margin-bottom:8px">🔄 Re-approval Quotations</div>
      ${reapps.map((r,ri)=>`<div class="reapp-client-box">
        <div class="reapp-client-hdr">🔄 Re-approval ${ri+1}${r.title?" — "+esc(r.title):""}
          ${r.quotationNumber?`<span style="margin-left:auto;font-size:10px;background:#fff;color:#a04800;padding:1px 7px;border-radius:8px;border:1px solid #e8a060">${esc(r.quotationNumber)}</span>`:""}
        </div>
        <div class="reapp-client-body">
          ${r.scopeHtml?`<div style="font-size:12px;color:#333;line-height:1.7">${r.scopeHtml}</div>`:"<div style='font-size:12px;color:#aaa'>Scope not yet entered.</div>"}
        </div>
      </div>`).join("")}
    </div>`:""}`;
  }
  h+=`</div><div class="footer">Winner Holistic Consultants &nbsp;·&nbsp; Abu Dhabi MEPS Portal & Overall Project Management &nbsp;·&nbsp; All information subject to authority requirements</div>`;
  return h;
}

function renderCoord(){
  const d=PROJ,fb=d&&natureArr(d.project.unitType).includes("F&B"),link=d?projectLink(d.id):"";

  if(S.tab==="list"||!d){
    const myProjects=Object.values(ALL_PROJECTS).filter(p=>{
      const coord=(p.project&&p.project.coordinator)||"";
      return S.coordName?coord.toLowerCase().includes(S.coordName.toLowerCase()):true;
    });
    let filtered=myProjects.filter(p=>{
      const pr=p.project||{},prop=p.proposal||{};
      const st=projStatus(p);
      if(S.coordFilterStatus!=="all"&&st!==S.coordFilterStatus)return false;
      if(S.coordFilterProjType!=="all"&&!natureArr(pr.unitType).includes(S.coordFilterProjType))return false;
      if(S.coordFilterReapp==="yes"&&(!prop.reapprovals||!prop.reapprovals.length))return false;
      if(S.coordFilterReapp==="no"&&prop.reapprovals&&prop.reapprovals.length>0)return false;
      if(S.coordFilterQuot&&!(prop.quotationNumber||"").toLowerCase().includes(S.coordFilterQuot.toLowerCase()))return false;
      if(S.coordFilterStage!=="all"){
        const hasStage=(p.stages||[]).some(s=>s.name===S.coordFilterStage&&(s.status||"")!=="");
        if(!hasStage)return false;
      }
      const q=(S.coordSearch||"").toLowerCase();
      if(q){
        const pr2=p.project||{};
        if(!(pr2.title||"").toLowerCase().includes(q)&&!(pr2.client||"").toLowerCase().includes(q)&&!(pr2.unit||"").toLowerCase().includes(q)&&!(pr2.location||"").toLowerCase().includes(q))return false;
      }
      return true;
    }).sort((a,b)=>(b.createdAt||"").localeCompare(a.createdAt||""));

    const stageNames=["Project Scope Analysis and Requirement Collection","Project Registration","ADM and CD-FLS – Drawing Preparation","ADM & CD-FLS Approval","TAQA Drawing Preparation","TAQA Drawing Approval","ADCD Shop Drawing Preparation","ADCD Shop Drawing Approval","Work Start Notice Approval","Commencement of Site Work","TAQA Inspection Approval","Hassantuk & AMC Application Submission Initiation","ADCD Inspection","ADM Completion Inspection","GIS Approval","Project Fully Completed"];

    const totalMy=myProjects.length;
    const activeMy=myProjects.filter(p=>projStatus(p)==="active").length;
    const doneMy=myProjects.filter(p=>projStatus(p)==="done").length;
    const allocMy=myProjects.filter(p=>projStatus(p)==="allocated").length;
    const attnMy=myProjects.reduce((acc,p)=>acc+(p.stages||[]).filter(s=>["hold","waiting-applicant","rejected","not-received","comments-shared"].includes(s.status||"")).length,0);

    return`<div class="cbar">
     <div class="clabel">⚙ ${S.coordName?esc(S.coordName)+" – Coordinator":"Coordinator Mode"}</div>
    </div>
    <div style="background:#fff;padding:12px 18px;border-bottom:1px solid #e5e5e5">
      <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-bottom:10px">
        ${[
          {n:totalMy,l:"Total",c:"#0d2137",f:"all"},
          {n:allocMy,l:"Allocated",c:"#0369a1",f:"allocated"},
          {n:activeMy,l:"Active",c:"#a06b00",f:"active"},
          {n:doneMy,l:"Done",c:"#166a3f",f:"done"},
          {n:attnMy,l:"Attention",c:"#e24b4a",f:"all"}
        ].map(k=>`<div style="background:#f7f7f7;border-radius:8px;padding:8px;text-align:center;cursor:pointer"
          onclick="S.coordFilterStatus='${k.f}';render()">
          <div style="font-size:18px;font-weight:700;color:${k.c}">${k.n}</div>
          <div style="font-size:9px;color:#888;text-transform:uppercase;letter-spacing:0.5px;margin-top:2px">${k.l}</div>
        </div>`).join("")}
      </div>
    </div>
    <div class="coord-search-bar">
      <input class="coord-search-input" placeholder="Search by project, client, unit, location..."
        value="${esc(S.coordSearch||"")}" oninput="S.coordSearch=this.value;render()"/>
      <select class="coord-filter-sel" onchange="S.coordFilterStatus=this.value;render()">
        <option value="all">All Status</option>
        <option value="proposal" ${S.coordFilterStatus==="proposal"?"selected":""}>Proposal</option>
        <option value="allocated" ${S.coordFilterStatus==="allocated"?"selected":""}>Allocated</option>
        <option value="new" ${S.coordFilterStatus==="new"?"selected":""}>Not Started</option>
        <option value="active" ${S.coordFilterStatus==="active"?"selected":""}>In Progress</option>
        <option value="done" ${S.coordFilterStatus==="done"?"selected":""}>Completed</option>
      </select>
      <select class="coord-filter-sel" onchange="S.coordFilterProjType=this.value;render()">
        <option value="all">All Natures</option>
        ${PROJECT_TYPES_NEW.map(t=>`<option value="${t}" ${S.coordFilterProjType===t?"selected":""}>${t}</option>`).join("")}
      </select>
      <select class="coord-filter-sel" onchange="S.coordFilterReapp=this.value;render()">
        <option value="all">All</option>
        <option value="yes" ${S.coordFilterReapp==="yes"?"selected":""}>Has Re-approvals</option>
        <option value="no" ${S.coordFilterReapp==="no"?"selected":""}>No Re-approvals</option>
      </select>
      <select class="coord-filter-sel" onchange="S.coordFilterStage=this.value;render()">
        <option value="all">All Stages</option>
        ${stageNames.map(sn=>`<option value="${esc(sn)}" ${S.coordFilterStage===sn?"selected":""}>${esc(sn)}</option>`).join("")}
      </select>
      <input class="coord-filter-sel" placeholder="Quotation No." value="${esc(S.coordFilterQuot||"")}"
        oninput="S.coordFilterQuot=this.value;render()" style="min-width:120px"/>
    </div>
    <div style="padding:8px 18px 2px;font-size:12px;color:#888">
      ${S.coordName?`Projects assigned to <strong>${esc(S.coordName)}</strong>`:"All projects"} — ${filtered.length} found
    </div>
    <div style="padding:0 18px 16px">
      ${filtered.length===0?`<div style="padding:24px;text-align:center;color:#aaa;font-size:13px;margin-top:8px">No projects match your filters.</div>`:""}
      ${filtered.map(p=>{
        const pr=p.project||{};const pc=projPct(p),st=projStatus(p);
        const cCls=st==="done"?"chip-done":st==="active"?"chip-active":st==="allocated"?"chip-allocated":"chip-new";
        const cTxt=st==="done"?"Completed":st==="active"?"In Progress":st==="allocated"?"Allocated":"Not Started";
        const activeStage=(p.stages||[]).find(s=>{const sv=s.status||"";return sv&&!["received","approved","completed","completed-signed","approved-bcc"].includes(sv);});
        const ptypes=(p.proposal&&p.proposal.projectTypes)||[];
        const reapps=(p.proposal&&p.proposal.reapprovals)||[];
        const attnCount=(p.stages||[]).filter(s=>["hold","waiting-applicant","rejected","not-received","comments-shared"].includes(s.status||"")).length;
        return`<div class="proj-row" style="margin-top:8px" onclick="openProject('${p.id}')">
          <div class="proj-row-top">
            <div>
              <div class="proj-row-title">${esc(pr.title||"Unnamed")}</div>
              <div class="proj-row-meta">${esc(pr.client||"—")} · ${esc(pr.location||"—")} · Unit: ${esc(pr.unit||"—")}</div>
              <div style="margin-top:5px;display:flex;gap:5px;flex-wrap:wrap">
                <span class="status-chip ${cCls}">${cTxt}</span>
                <span class="status-chip chip-new">${esc(p.createdAt||"")}</span>
                <span class="status-chip" style="background:#f0f0f0;color:#666">${esc(natureDisplay(pr.unitType))}</span>
                ${activeStage?`<span class="status-chip" style="background:#eef4ff;color:#1a3a5c;font-size:10px">📍 ${esc(activeStage.name)}</span>`:""}
                ${reapps.length?`<span class="status-chip" style="background:#fde8d8;color:#a04800">🔄 ${reapps.length} Re-approval(s)</span>`:""}
                ${attnCount?`<span class="status-chip" style="background:#fde8e8;color:#a32d2d">⚠ ${attnCount} blocked</span>`:""}
                ${ptypes.map(t=>`<span class="proj-type-tag">${esc(t)}</span>`).join("")}
              </div>
            </div>
            <div class="proj-row-right">
              <div class="proj-pct">${pc}%</div>
              <div class="mini-bar-bg"><div class="mini-bar-fill" style="width:${pc}%"></div></div>
            </div>
          </div>
        </div>`;
      }).join("")}
    </div>`;
  }

  const prop=d.proposal||{};
  const reapps=prop.reapprovals||[];
  const ptypes=prop.projectTypes||[];

  let h=`<div class="cbar">
    <div class="clabel" style="cursor:pointer" onclick="PROJ=null;S.tab='list';render()">← ${S.coordName?esc(S.coordName):" Coordinator"}</div>
    <div style="display:flex;gap:7px;align-items:center;flex-wrap:wrap">
      ${S.saving?`<span style="font-size:11px;color:#c9a752">Saving...</span>`:""}
      ${S.saved?`<span class="saved-chip">✓ Saved</span>`:""}
      <button class="btn btn-sm" style="background:#1a3a5c;color:#c9a752;border:none" onclick="S.modal='showlink';render()">Share</button>
      <button class="btn btn-out btn-sm" onclick="S.mode='client';S.tab='stages';render()">Preview</button>
      <button class="btn btn-gold btn-sm" onclick="saveProj()">Save</button>
    </div>
  </div>
  <div class="linkbox" style="margin:0;border-radius:0;border-left:none;border-right:none">
    <div class="linkbox-title">Client Link</div>
    <div class="linkbox-url">${link}</div>
    <div class="linkbox-btns">
      <button class="btn btn-sm btn-navy" onclick="copyText('${link}')">Copy Link</button>
      <button class="btn btn-sm" style="background:#f0f0f0;color:#555;border:none" onclick="window.open('${link}','_blank')">Open Tab</button>
      <button class="btn btn-sm btn-red" onclick="S.modal='delproj';render()">Delete</button>
    </div>
  </div>
  <div class="tabs">
    <div class="tab ${S.tab==="proj"?"on":""}" onclick="S.tab='proj';render()">Project Info</div>
    <div class="tab ${S.tab==="scope"?"on":""}" onclick="S.tab='scope';render()">Scope & Quotations</div>
    <div class="tab ${S.tab==="stages"?"on":""}" onclick="S.tab='stages';render()">Stages</div>
    <div class="tab ${S.tab==="docs"?"on":""}" onclick="S.tab='docs';render()">Documents</div>
    <div class="tab ${S.tab==="activity"?"on":""}" onclick="S.tab='activity';render()">Activity Log</div>
  </div><div class="body">`;

  if(S.tab==="proj"){
    h+=`<div class="sbox">
      <div class="sbox-title">Project Information <span style="font-size:10px;font-weight:400;color:#bbb;margin-left:6px">(set by Proposals Team)</span></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        <div class="ff"><div class="fl">Project Folder</div><div style="font-size:13px;color:#222;padding:6px 0">${esc(d.project.title||"—")}</div></div>
        <div><div class="fl">Client Name</div><div style="font-size:13px;color:#222;padding:6px 0">${esc(d.project.client||"—")}</div></div>
        <div><div class="fl">Project Coordinator</div><div style="font-size:13px;color:#222;padding:6px 0">${esc(d.project.coordinator||"—")}</div></div>
        <div><div class="fl">Unit / Shop No.</div><div style="font-size:13px;color:#222;padding:6px 0">${esc(d.project.unit||"—")}</div></div>
        <div class="ff"><div class="fl">Location / Mall</div><div style="font-size:13px;color:#222;padding:6px 0">${esc(d.project.location||"—")}</div></div>
        <div><div class="fl">Nature of the Project</div><div style="font-size:13px;color:#222;padding:6px 0">${esc(natureDisplay(d.project.unitType))}</div></div>
        <div><div class="fl">Expected Start</div><div style="font-size:13px;color:#222;padding:6px 0">${fmtDate(prop.expectedStartDate)||"—"}</div></div>
        <div><div class="fl">Quotation No.</div><div style="font-size:13px;color:#1a5276;padding:6px 0;font-weight:600">${esc(prop.quotationNumber||"—")}</div></div>
        <div><div class="fl">Quotation Value</div><div style="font-size:13px;color:#166a3f;padding:6px 0;font-weight:600">${prop.estimatedValue?"AED "+esc(prop.estimatedValue):"—"}</div></div>
        <div><div class="fl">Submitted By</div><div style="font-size:13px;color:#222;padding:6px 0">${esc(prop.submittedBy||"—")}</div></div>
      </div>
      ${ptypes.length?`<div style="margin-top:8px"><div class="fl" style="margin-bottom:5px">Project Folder Categories</div><div style="display:flex;gap:5px;flex-wrap:wrap">${ptypes.map(t=>`<span class="proj-type-tag">${esc(t)}</span>`).join("")}</div></div>`:""}
    </div>
    ${reapps.length?`<div class="reapp-box">
      <div class="reapp-box-title">🔄 Re-approval Quotations (${reapps.length})</div>
      ${reapps.map((r,ri)=>`<div class="reapp-entry">
        <div class="reapp-entry-num">RE-APPROVAL #${ri+1}</div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:6px">
          <div><div class="fl">Title</div><div style="font-size:12px;color:#222">${esc(r.title||"—")}</div></div>
          <div><div class="fl">Quotation No.</div><div style="font-size:12px;color:#1a5276;font-weight:600">${esc(r.quotationNumber||"—")}</div></div>
          <div><div class="fl">Value (AED)</div><div style="font-size:12px;color:#166a3f;font-weight:600">${r.value?"AED "+esc(r.value):"—"}</div></div>
        </div>
        ${r.scopeHtml?`<div style="font-size:12px;color:#333;line-height:1.7;background:#f9f5ff;padding:8px 10px;border-radius:6px">${r.scopeHtml}</div>`:""}
      </div>`).join("")}
    </div>`:""}
    <div class="nb">Project information is managed by the Proposals Team. Contact them to update project details or quotations.</div>`;

  } else if(S.tab==="scope"){
    h+=`<div class="nb" style="margin-bottom:12px">📋 This tab reflects data entered by the Proposals Team. Contact them to make changes.</div>
    <div class="sbox">
      <div class="sbox-title">Project Folder Categories</div>
      ${ptypes.length?`<div style="display:flex;gap:6px;flex-wrap:wrap">${ptypes.map(t=>`<span class="proj-type-tag">${esc(t)}</span>`).join("")}</div>`:`<div style="font-size:12px;color:#aaa">Not set</div>`}
    </div>
    <div class="quot-box">
      <div class="quot-box-title">💼 Main Quotation ${prop.quotationNumber?`<span class="quot-num-badge">${esc(prop.quotationNumber)}</span>`:""}</div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px">
        <div>
          <div class="fl">Quotation Number</div>
          <div style="font-size:13px;color:#1a5276;font-weight:600;padding:6px 0">${esc(prop.quotationNumber||"—")}</div>
        </div>
        <div>
          <div class="fl">Quotation Value</div>
          <div style="font-size:13px;color:#166a3f;font-weight:600;padding:6px 0">${prop.estimatedValue?"AED "+esc(prop.estimatedValue):"—"}</div>
        </div>
        <div>
          <div class="fl">Expected Start</div>
          <div style="font-size:13px;color:#222;padding:6px 0">${fmtDate(prop.expectedStartDate)||"—"}</div>
        </div>
      </div>
    </div>
    <div class="sbox">
      <div class="sbox-title">Scope of Work
        ${prop.submittedBy?`<span style="font-size:10px;color:#aaa;font-weight:400;margin-left:6px">by ${esc(prop.submittedBy)} on ${fmtDate(prop.submittedAt)}</span>`:""}
      </div>
      <div style="font-size:13px;color:#222;line-height:1.8;min-height:60px">${prop.scopeHtml||"<span style='color:#aaa;font-size:12px'>No scope entered yet.</span>"}</div>
    </div>
    ${reapps.length?`<div class="reapp-box">
      <div class="reapp-box-title">🔄 Re-approval Quotations <span style="font-size:10px;font-weight:400;color:#c08060">${reapps.length} entry(s)</span></div>
      ${reapps.map((r,ri)=>`<div class="reapp-entry">
        <div class="reapp-entry-num">RE-APPROVAL #${ri+1}</div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:8px">
          <div><div class="fl">Title</div><div style="font-size:12px;color:#222;padding:4px 0">${esc(r.title||"—")}</div></div>
          <div><div class="fl">Quotation No.</div><div style="font-size:12px;color:#1a5276;font-weight:600;padding:4px 0">${esc(r.quotationNumber||"—")}</div></div>
          <div><div class="fl">Value (AED)</div><div style="font-size:12px;color:#166a3f;font-weight:600;padding:4px 0">${r.value?"AED "+esc(r.value):"—"}</div></div>
        </div>
        ${r.scopeHtml?`<div style="font-size:12px;color:#333;line-height:1.7;background:#fdf8f5;padding:10px 12px;border-radius:8px">${r.scopeHtml}</div>`:""}
      </div>`).join("")}
    </div>`:""}`;

  } else if(S.tab==="stages"){
    const commonOpts=commonStageOptions();
    h+=`<div class="sbox">
      <div class="sbox-title">Approval Stages <span style="font-size:10px;color:#bbb;font-weight:400;margin-left:8px">⠿ Drag or use ↑↓ to reorder</span></div>`;
    if(S.selectedStages.length>0){
      h+=`<div class="bulk-bar">
        <span class="bulk-bar-count">${S.selectedStages.length} stage(s) selected</span>
        <select class="se-sel" style="flex:1;min-width:160px" onchange="S.bulkStatus=this.value;render()">
          <option value="">— Set status for selected —</option>
          ${commonOpts.map(o=>`<option value="${o.v}" ${S.bulkStatus===o.v?"selected":""}>${o.label}</option>`).join("")}
        </select>
        <button class="btn btn-sm btn-gold" ${S.bulkStatus===""?"disabled":""} onclick="applyBulkStatus(S.bulkStatus)">Apply</button>
        <button class="btn btn-sm" style="background:#f0f0f0;color:#666" onclick="clearStageSelection()">Clear</button>
      </div>
      ${!commonOpts.length?`<div style="font-size:11px;color:#a04800;margin-bottom:8px">Selected stages have no common status options. Select stages of the same type to bulk-update.</div>`:""}`;
    }
    d.stages.forEach((st,i)=>{h+=seRow(st,i,d.stages.length);});
    h+=`<div class="btn-add btn-add-prep" onclick="addDrawingPrepStage()">+ Add Drawing Preparation Stage</div>
    <div class="btn-add btn-add-approval" onclick="addDrawingApprovalStage()">+ Add Drawing Approval Stage</div></div>`;

  } else if(S.tab==="docs"){
    h+=`<div class="sbox"><div class="sbox-title">Standard Document Groups</div>`;
    d.docs.forEach((g,gi)=>{if(g.fb)return;h+=degRow(g,gi,false);});
    h+=`<div class="btn-add" onclick="PROJ.docs.push({group:'New Group',fb:false,items:[]});render()">+ Add Document Group</div></div>`;
    h+=`<div class="sbox sbox-fb"><div class="sbox-title sbox-title-fb">F&amp;B / Gas Documents
      <span style="font-size:9px;background:#fde8d8;color:#a04800;padding:1px 7px;border-radius:8px;margin-left:4px">${fb?"VISIBLE TO CLIENT":"HIDDEN"}</span>
    </div>`;
    d.docs.forEach((g,gi)=>{if(!g.fb)return;h+=degRow(g,gi,true);});
    h+=`<div class="btn-add" style="border-color:#e8a060;color:#a04800"
      onclick="PROJ.docs.push({group:'New F&amp;B/Gas Group',fb:true,items:[]});render()">+ Add F&amp;B/Gas Group</div></div>`;

  } else if(S.tab==="activity"){
    const stageLogs=(d.activityLog||[]).map(log=>({...log,_kind:"stage"}));
    const propLogs=(d.proposalLog||[]).map(log=>({...log,_kind:"proposal"}));
    const logs=[...stageLogs,...propLogs].sort((a,b)=>new Date(b.at||0)-new Date(a.at||0));
    h+=`<div class="sbox">
      <div class="sbox-title">Activity Log <span style="font-size:10px;color:#bbb;font-weight:400;margin-left:6px">${logs.length} entries · full project timeline</span></div>
      ${logs.length===0?`<div style="text-align:center;padding:20px;color:#bbb;font-size:13px">No activity recorded yet.<br><span style="font-size:11px">Stage status changes appear here automatically.</span></div>`:""}
      ${logs.map(log=>{
        if(log._kind==="proposal"){
          return`<div class="act-row">
            <div class="act-dot" style="background:#7c3aed"></div>
            <div class="act-body">
              <div class="act-stage">📋 ${esc(log.action||"Proposal Update")}</div>
              <div class="act-detail">${log.by?`<strong>${esc(log.by)}</strong>`:""}${log.detail?` · ${esc(log.detail)}`:""}</div>
            </div>
            <div class="act-time">${fmtDateTime(log.at)}</div>
          </div>`;
        }
        const disp=STATUS_DISPLAY[log.newStatus||""]||STATUS_DISPLAY[""];
        return`<div class="act-row">
          <div class="act-dot ${actDotCls(log.newStatus||"")}"></div>
          <div class="act-body">
            <div class="act-stage">${esc(log.stageName||"")}</div>
            <div class="act-detail">Status → <span class="badge ${disp.cls}">${disp.label}</span>${log.by?` · <strong>${esc(log.by)}</strong>`:""}</div>
            ${log.note?`<div class="act-detail" style="margin-top:2px;font-style:italic">"${esc(log.note)}"</div>`:""}
          </div>
          <div class="act-time">${fmtDateTime(log.at)}</div>
        </div>`;
      }).join("")}
    </div>`;
  }
  h+=`</div>`;return h;
}

function renderAdmin(){
  const all=Object.values(ALL_PROJECTS);
  const proposals=all.filter(p=>p.workflowStatus==="proposal"||p.workflowStatus==="allocated");
  const projects=all.filter(p=>p.workflowStatus!=="proposal"&&p.workflowStatus!=="allocated");
  const total=all.length;
  const proposalCount=proposals.length;
  const active=all.filter(p=>projStatus(p)==="active").length;
  const done=all.filter(p=>projStatus(p)==="done").length;
  const totalReapprovals=all.reduce((s,p)=>s+(p.proposal&&p.proposal.reapprovals?p.proposal.reapprovals.length:0),0);

  const coordinators=[...new Set(all.map(p=>p.project&&p.project.coordinator).filter(Boolean))].sort();

  let filtered=all.filter(p=>{
    const q=S.search.toLowerCase(),pr=p.project||{};
    const mS=!q||(pr.title||"").toLowerCase().includes(q)||(pr.client||"").toLowerCase().includes(q)||
      (pr.location||"").toLowerCase().includes(q)||(pr.coordinator||"").toLowerCase().includes(q)||
      (pr.unit||"").toLowerCase().includes(q);
    const mStatus=S.filterStatus==="all"||projStatus(p)===S.filterStatus;
    const mType=S.filterType==="all"||natureArr(pr.unitType).includes(S.filterType);
    const mStage=!S.filterStage||S.filterStage==="all"||(p.stages||[]).some(st=>st.name===S.filterStage&&(st.status||"")!=="");
    const mCoord=!S.filterCoord||S.filterCoord==="all"||pr.coordinator===S.filterCoord;
    const mProjType=!S.filterProjType||S.filterProjType==="all"||(p.proposal&&(p.proposal.projectTypes||[]).includes(S.filterProjType));
    return mS&&mStatus&&mType&&mStage&&mCoord&&mProjType;
  }).sort((a,b)=>(b.createdAt||"").localeCompare(a.createdAt||""));

  if(!S.adminTab)S.adminTab="proposals";

  let h=`<div class="admin-hdr">
    <div class="hdr-logo">Winner Holistic Consultants</div>
    <div class="admin-title">Admin Dashboard</div>
    <div class="admin-sub">Live data · All projects & proposals</div>
  </div>
  <div class="admin-nav-tabs">
    <div class="admin-nav-tab ${S.adminTab==="proposals"?"on":""}" onclick="S.adminTab='proposals';render()">📋 Proposals</div>
    <div class="admin-nav-tab ${S.adminTab==="projects"?"on":""}" onclick="S.adminTab='projects';render()">🏗️ Projects</div>
    <div class="admin-nav-tab ${S.adminTab==="all"?"on":""}" onclick="S.adminTab='all';render()">📁 All Records</div>
  </div>`;

  if(S.adminTab==="proposals"){
    const pendingAlloc=proposals.filter(p=>p.workflowStatus==="proposal").length;
    const allocated=proposals.filter(p=>p.workflowStatus==="allocated").length;
    const propWithReapp=proposals.filter(p=>p.proposal&&p.proposal.reapprovals&&p.proposal.reapprovals.length>0).length;
    const totalPropReapp=proposals.reduce((s,p)=>s+(p.proposal&&p.proposal.reapprovals?p.proposal.reapprovals.length:0),0);

    h+=`<div class="dash-body">
      <div class="kpi-grid">
        <div class="kpi-card kpi-proposal" style="cursor:pointer" onclick="openAdminPopupById('prop-all')">
          <div class="kpi-num">${proposalCount}</div><div class="kpi-label">Total Proposals</div>
          <div class="kpi-click-hint">Tap to view →</div>
        </div>
        <div class="kpi-card" style="cursor:pointer" onclick="openAdminPopupById('prop-pending')">
          <div class="kpi-num" style="color:#e24b4a">${pendingAlloc}</div><div class="kpi-label">Pending Alloc.</div>
          <div class="kpi-click-hint">Tap to view →</div>
        </div>
        <div class="kpi-card" style="cursor:pointer" onclick="openAdminPopupById('prop-alloc')">
          <div class="kpi-num" style="color:#0369a1">${allocated}</div><div class="kpi-label">Allocated</div>
          <div class="kpi-click-hint">Tap to view →</div>
        </div>
        <div class="kpi-card kpi-reapp" style="cursor:pointer" onclick="openAdminPopupById('prop-reapp')">
          <div class="kpi-num">${propWithReapp}</div><div class="kpi-label">With Re-approvals</div>
          <div class="kpi-click-hint">Tap to view →</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-num" style="color:#a04800">${totalPropReapp}</div><div class="kpi-label">Total Re-approvals</div>
        </div>
      </div>

      <div class="dash-card" style="margin-bottom:12px">
        <div class="dash-card-title">Nature of the Project Breakdown — Proposals</div>
        <div style="display:flex;flex-wrap:wrap;gap:8px">
          ${PROJECT_TYPES_NEW.map(t=>{
            const cnt=proposals.filter(p=>p.project&&natureArr(p.project.unitType).includes(t)).length;
            return`<div style="background:#fff8e6;border:1px solid #e8c96a;border-radius:10px;padding:10px 14px;text-align:center;min-width:80px;cursor:pointer;transition:all 0.15s"
              onclick="openAdminPopupByType('projtype','${t}')"
              onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform=''">
              <div style="font-size:20px;font-weight:700;color:#a06b00">${cnt}</div>
              <div style="font-size:10px;color:#888;margin-top:2px">${t}</div>
            </div>`;
          }).join("")}
        </div>
      </div>

      <div class="dash-card" style="margin-bottom:12px">
        <div class="dash-card-title">Folder Category Breakdown</div>
        <div style="display:flex;flex-wrap:wrap;gap:8px">
          ${FOLDER_CATEGORIES.map(t=>{
            const cnt=proposals.filter(p=>p.proposal&&(p.proposal.projectTypes||[]).includes(t)).length;
            return`<div style="background:#ede8fe;border:1px solid #c4b5fd;border-radius:10px;padding:10px 14px;text-align:center;min-width:80px;cursor:pointer;transition:all 0.15s"
              onclick="openAdminPopupByCategory('${t}')"
              onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform=''">
              <div style="font-size:20px;font-weight:700;color:#4a1fb8">${cnt}</div>
              <div style="font-size:10px;color:#7c3aed;margin-top:2px">${t}</div>
            </div>`;
          }).join("")}
        </div>
      </div>

      <div class="dash-card">
        <div class="dash-card-title">🔄 Re-approval Summary</div>
        ${proposals.filter(p=>p.proposal&&p.proposal.reapprovals&&p.proposal.reapprovals.length>0).length===0
          ?`<div class="dash-empty">No re-approvals recorded yet.</div>`
          :proposals.filter(p=>p.proposal&&p.proposal.reapprovals&&p.proposal.reapprovals.length>0).map(p=>{
            const pr=p.project||{};const reapps=p.proposal.reapprovals||[];
            return`<div class="attn-row" onclick="openProject('${p.id}')">
              <div class="attn-stage">${esc(pr.title||"Unnamed")}</div>
              <div class="attn-proj">${esc(pr.coordinator||"")}</div>
              <div style="display:flex;gap:5px;flex-wrap:wrap">
                ${reapps.map(r=>`<span style="background:#fde8d8;color:#a04800;font-size:10px;font-weight:600;padding:2px 8px;border-radius:8px">
                  ${esc(r.title||"Re-approval")}${r.quotationNumber?" · "+esc(r.quotationNumber):""}
                </span>`).join("")}
              </div>
            </div>`;
          }).join("")
        }
      </div>
    </div>`;

  } else if(S.adminTab==="projects"){
    const notStarted=projects.filter(p=>projStatus(p)==="new").length;
    const attention=[];
    projects.forEach(p=>{
      (p.stages||[]).forEach(st=>{
        if(["hold","waiting-applicant","rejected","not-received","comments-shared"].includes(st.status||""))
          attention.push({proj:p,stage:st});
      });
    });
    const coordLoad={};
    projects.forEach(p=>{
      const c=(p.project&&p.project.coordinator)||"Unassigned";
      if(!coordLoad[c])coordLoad[c]={total:0,active:0,done:0,projs:[]};
      coordLoad[c].total++;coordLoad[c].projs.push(p);
      const st=projStatus(p);
      if(st==="active")coordLoad[c].active++;
      if(st==="done")coordLoad[c].done++;
    });

    h+=`<div class="dash-body">
      <div class="kpi-grid">
        <div class="kpi-card" style="cursor:pointer" onclick="openAdminPopupById('proj-all')">
          <div class="kpi-num">${projects.length}</div><div class="kpi-label">Total Projects</div>
          <div class="kpi-click-hint">Tap to view →</div>
        </div>
        <div class="kpi-card kpi-active" style="cursor:pointer" onclick="openAdminPopupById('proj-active')">
          <div class="kpi-num">${active}</div><div class="kpi-label">In Progress</div>
          <div class="kpi-click-hint">Tap to view →</div>
        </div>
        <div class="kpi-card kpi-done" style="cursor:pointer" onclick="openAdminPopupById('proj-done')">
          <div class="kpi-num">${done}</div><div class="kpi-label">Completed</div>
          <div class="kpi-click-hint">Tap to view →</div>
        </div>
        <div class="kpi-card" style="cursor:pointer" onclick="openAdminPopupById('proj-new')">
          <div class="kpi-num" style="color:#888">${notStarted}</div><div class="kpi-label">Not Started</div>
          <div class="kpi-click-hint">Tap to view →</div>
        </div>
        <div class="kpi-card kpi-warn" style="cursor:pointer" onclick="openAdminPopupById('proj-attention')">
          <div class="kpi-num">${attention.length}</div><div class="kpi-label">Blocked Stages</div>
          <div class="kpi-click-hint">Tap to view →</div>
        </div>
        <div class="kpi-card kpi-reapp" style="cursor:pointer" onclick="openAdminPopupById('proj-reapp')">
          <div class="kpi-num">${totalReapprovals}</div><div class="kpi-label">Re-approvals</div>
          <div class="kpi-click-hint">Tap to view →</div>
        </div>
      </div>

      <div class="dash-row">
        <div class="dash-card">
          <div class="dash-card-title">Status Breakdown</div>
          ${[
            {label:"In Progress",cnt:active,cls:"bar-active",filter:"proj-active"},
            {label:"Completed",cnt:done,cls:"bar-done",filter:"proj-done"},
            {label:"Not Started",cnt:notStarted,cls:"bar-new",filter:"proj-new"}
          ].map(({label,cnt,cls,filter})=>{
            const p2=projects.length?Math.round(cnt/projects.length*100):0;
            return`<div class="bar-row" onclick="openAdminPopupById('${filter}')">
              <div class="bar-label">${label}</div>
              <div class="bar-track"><div class="bar-fill ${cls}" style="width:${p2}%"></div></div>
              <div class="bar-count">${cnt}</div>
            </div>`;
          }).join("")}
        </div>
        <div class="dash-card">
          <div class="dash-card-title">Nature of the Project</div>
          ${PROJECT_TYPES_NEW.map(t=>{
            const cnt=projects.filter(p=>p.project&&natureArr(p.project.unitType).includes(t)).length;
            const p2=projects.length?Math.round(cnt/projects.length*100):0;
            return`<div class="bar-row" onclick="openAdminPopupByProjType('${t}')">
              <div class="bar-label" style="width:100px;font-size:11px">${t}</div>
              <div class="bar-track"><div class="bar-fill bar-active" style="width:${p2}%"></div></div>
              <div class="bar-count">${cnt}</div>
            </div>`;
          }).join("")}
        </div>
      </div>

      <div class="dash-card" style="margin-top:12px">
        <div class="dash-card-title">Coordinator Workload</div>
        ${Object.keys(coordLoad).length===0?`<div class="dash-empty">No coordinators assigned yet.</div>`:""}
        <div class="coord-table">
          <div class="coord-thead"><div>Coordinator</div><div>Total</div><div>Active</div><div>Done</div><div>Progress</div></div>
          ${Object.entries(coordLoad).map(([name,dl])=>{
            const p2=dl.total?Math.round(dl.done/dl.total*100):0;
            const safeName=name.replace(/\\/g,"\\\\").replace(/'/g,"\\'");
            return`<div class="coord-row" onclick="openAdminPopupByCoord('${safeName}')">
              <div class="coord-name">${esc(name)}</div><div>${dl.total}</div>
              <div><span class="status-chip chip-active">${dl.active}</span></div>
              <div><span class="status-chip chip-done">${dl.done}</span></div>
              <div style="display:flex;align-items:center;gap:6px">
                <div class="bar-track" style="flex:1"><div class="bar-fill bar-done" style="width:${p2}%"></div></div>
                <span style="font-size:11px;color:#666;width:28px">${p2}%</span>
              </div>
            </div>`;
          }).join("")}
        </div>
      </div>

      <div class="dash-card" style="margin-top:12px">
        <div class="dash-card-title">⚠ Stages Needing Attention</div>
        ${attention.length===0?`<div class="dash-empty" style="color:#166a3f">✓ No stages currently blocked.</div>`:""}
        ${attention.map(({proj,stage})=>{
          const disp=STATUS_DISPLAY[stage.status||""]||STATUS_DISPLAY[""];
          return`<div class="attn-row" onclick="openProject('${proj.id}')">
            <div class="attn-stage">${esc(stage.name)}</div>
            <div class="attn-proj">${esc(proj.project&&proj.project.title||"")}</div>
            <div><span class="badge ${disp.cls}">${disp.label}</span></div>
            <span style="font-size:10px;color:#888">${esc(proj.project&&proj.project.coordinator||"")}</span>
          </div>`;
        }).join("")}
      </div>
    </div>`;

  } else if(S.adminTab==="all"){
    const stageNames=["Project Scope Analysis and Requirement Collection","Project Registration","ADM and CD-FLS – Drawing Preparation","ADM & CD-FLS Approval","TAQA Drawing Preparation","TAQA Drawing Approval","ADCD Shop Drawing Preparation","ADCD Shop Drawing Approval","Work Start Notice Approval","Commencement of Site Work","TAQA Inspection Approval","Hassantuk & AMC Application Submission Initiation","ADCD Inspection","ADM Completion Inspection","GIS Approval","Project Fully Completed"];
    h+=`<div class="search-bar">
      <input class="search-input" placeholder="Search project, client, unit, coordinator..."
        value="${esc(S.search)}" oninput="S.search=this.value;render()"/>
      <select class="filter-sel" onchange="S.filterStatus=this.value;render()">
        <option value="all">All Status</option>
        <option value="proposal" ${S.filterStatus==="proposal"?"selected":""}>Proposal</option>
        <option value="allocated" ${S.filterStatus==="allocated"?"selected":""}>Allocated</option>
        <option value="new" ${S.filterStatus==="new"?"selected":""}>Not Started</option>
        <option value="active" ${S.filterStatus==="active"?"selected":""}>In Progress</option>
        <option value="done" ${S.filterStatus==="done"?"selected":""}>Completed</option>
      </select>
      <select class="filter-sel" onchange="S.filterType=this.value;render()">
        <option value="all">All Natures</option>
        ${PROJECT_TYPES_NEW.map(t=>`<option value="${t}" ${S.filterType===t?"selected":""}>${t}</option>`).join("")}
      </select>
      <select class="filter-sel" onchange="S.filterCoord=this.value;render()">
        <option value="all">All Coordinators</option>
        ${coordinators.map(c=>`<option value="${esc(c)}" ${S.filterCoord===c?"selected":""}>${esc(c)}</option>`).join("")}
      </select>
      <select class="filter-sel" onchange="S.filterProjType=this.value;render()">
        <option value="all">All Folder Categories</option>
        ${FOLDER_CATEGORIES.map(t=>`<option value="${t}" ${S.filterProjType===t?"selected":""}>${t}</option>`).join("")}
      </select>
      <select class="filter-sel" onchange="S.filterStage=this.value;render()">
        <option value="all">All Stages</option>
        ${stageNames.map(sn=>`<option value="${esc(sn)}" ${S.filterStage===sn?"selected":""}>${esc(sn)}</option>`).join("")}
      </select>
      <button class="btn btn-gold btn-sm" onclick="loadAll()">↻ Refresh</button>
      <button class="btn btn-sm" style="background:#d4f0e3;color:#166a3f" onclick="exportFilteredCSV()">⬇ Export CSV</button>
    </div>
    <div style="padding:8px 18px 0;font-size:12px;color:#888">Showing ${filtered.length} of ${total} records</div>
    <div class="proj-table">`;
    _lastFilteredProjects=filtered;

    if(!filtered.length)h+=`<div style="padding:40px;text-align:center;color:#aaa;font-size:13px">No records match the selected filters.</div>`;

    filtered.forEach(p=>{
      const pc=projPct(p),st=projStatus(p),pr=p.project||{},prop=p.proposal||{};
      const cCls=st==="done"?"chip-done":st==="active"?"chip-active":st==="proposal"?"chip-proposal":st==="allocated"?"chip-allocated":"chip-new";
      const cTxt=st==="done"?"Completed":st==="active"?"In Progress":st==="proposal"?"Proposal":st==="allocated"?"Allocated":"Not Started";
      const link=projectLink(p.id);
      const activeStage=(p.stages||[]).find(s=>{const sv=s.status||"";return sv&&!["received","approved","completed","completed-signed","approved-bcc"].includes(sv);});
      const stageDisp=activeStage?(STATUS_DISPLAY[activeStage.status||""]||STATUS_DISPLAY[""]):null;
      const ptypes=prop.projectTypes||[];
      const reapps=prop.reapprovals||[];

      h+=`<div class="proj-row" onclick="openProject('${p.id}')">
        <div class="proj-row-top">
          <div>
            <div class="proj-row-title">${esc(pr.title||"Unnamed Project")}</div>
            <div class="proj-row-meta">${esc(pr.client||"No client")} &nbsp;·&nbsp; ${esc(pr.location||"—")} &nbsp;·&nbsp; Unit: ${esc(pr.unit||"—")}${pr.coordinator?" &nbsp;·&nbsp; <strong>"+esc(pr.coordinator)+"</strong>":""}</div>
            <div style="margin-top:5px;display:flex;gap:5px;flex-wrap:wrap">
              <span class="status-chip ${cCls}">${cTxt}</span>
              <span class="status-chip" style="background:#f0f0f0;color:#666">${esc(natureDisplay(pr.unitType))}</span>
              <span class="status-chip chip-new">${esc(p.createdAt||"")}</span>
              ${activeStage?`<span class="status-chip" style="background:#eef4ff;color:#1a3a5c;font-size:10px">📍 ${esc(activeStage.name)}: <span class="badge ${stageDisp.cls}" style="font-size:9px;padding:1px 6px">${stageDisp.label}</span></span>`:""}
              ${prop.quotationNumber?`<span class="status-chip" style="background:#e8f4ff;color:#1a5276">📄 ${esc(prop.quotationNumber)}</span>`:""}
              ${reapps.length?`<span class="status-chip" style="background:#fde8d8;color:#a04800">🔄 ${reapps.length} Re-approval(s)</span>`:""}
              ${ptypes.map(t=>`<span class="proj-type-tag">${esc(t)}</span>`).join("")}
            </div>
          </div>
          <div class="proj-row-right">
            <div class="proj-pct">${pc}%</div>
            <div class="mini-bar-bg"><div class="mini-bar-fill" style="width:${pc}%"></div></div>
          </div>
        </div>
        <div class="proj-row-btns" onclick="event.stopPropagation()">
          <button class="btn btn-sm btn-navy" onclick="copyText('${link}')">Copy Client Link</button>
          <button class="btn btn-sm btn-gold" onclick="openProject('${p.id}')">Edit Project</button>
          <button class="btn btn-sm" style="background:#f0f0f0;color:#555;border:none" onclick="window.open('${link}','_blank')">View as Client</button>
        </div>
      </div>`;
    });
    h+=`</div>`;
  }

  h+=`<div class="footer">Winner Holistic Consultants &nbsp;·&nbsp; Admin Dashboard &nbsp;·&nbsp; <a href="${window.location.pathname}" style="color:#888">Back to Login</a></div>`;
  return h;
}

function seRow(st,i,total){
  const type=st.type||"scope";
  const opts=STAGE_OPTIONS[type]||STAGE_OPTIONS.scope;
  const curStatus=st.status||"";
  const checked=S.selectedStages.includes(i);
  return`<div class="se ${checked?"se-selected":""}" draggable="true"
    ondragstart="dragStart(event,${i})" ondragover="dragOver(event,${i})"
    ondragleave="dragLeave(event)" ondrop="dragDrop(event,${i})" ondragend="dragEnd()">
    <input type="checkbox" class="se-check" title="Select for bulk update" ${checked?"checked":""} onchange="toggleStageSelect(${i})"/>
    <div class="se-drag-handle" title="Drag to reorder">⠿</div>
    <div class="se-reorder">
      <button class="se-reorder-btn" title="Move up" ${i===0?"disabled":""} onclick="moveStageUp(${i})">▲</button>
      <button class="se-reorder-btn" title="Move down" ${i===(total-1)?"disabled":""} onclick="moveStageDown(${i})">▼</button>
    </div>
    <div class="se-num">${i+1}</div>
    <div class="se-body">
      <input class="se-ni" value="${esc(st.name||"")}" oninput="PROJ.stages[${i}].name=this.value" placeholder="Stage name"/>
      <div class="se-r">
        <select class="se-sel" onchange="stageStatusChange(${i},this.value)">
          ${opts.map(o=>`<option value="${o.v}" ${curStatus===o.v?"selected":""}>${o.label}</option>`).join("")}
        </select>
        <input class="se-time" value="${esc(st.time||"")}" oninput="PROJ.stages[${i}].time=this.value" placeholder="e.g. 5 working days"/>
      </div>
      ${needsAppNum(type,curStatus)?`<div class="se-appnum-row">
        <span class="se-label">Application No. <span class="req-star">*</span></span>
        <input class="se-appnum-fi" value="${esc(st.appNum||"")}" oninput="PROJ.stages[${i}].appNum=this.value" placeholder="Enter application number"/>
      </div>`:""}
      ${hasDateFields(type)?`<div class="se-date-row">
        <div class="se-date-field">
          <span class="se-label">${dateLabelA(type)}</span>
          <input type="date" class="se-date-fi" value="${esc(st.dateA||"")}" oninput="PROJ.stages[${i}].dateA=this.value"/>
        </div>
        <div class="se-date-field">
          <span class="se-label">${dateLabelB(type)}</span>
          <input type="date" class="se-date-fi" value="${esc(st.dateB||"")}" oninput="PROJ.stages[${i}].dateB=this.value"/>
        </div>
      </div>`:""}
      <input class="se-note" value="${esc(st.note||"")}" oninput="PROJ.stages[${i}].note=this.value" placeholder="Status note for client..."/>
    </div>
    <button class="btn-del" onclick="PROJ.stages.splice(${i},1);S.selectedStages=[];render()">✕</button>
  </div>`;
}

function degRow(g,gi,fbRow){
  let h=`<div class="deg ${fbRow?"deg-fb":""}">
    <div class="deg-h">
      <input class="deg-name" value="${esc(g.group)}" oninput="PROJ.docs[${gi}].group=this.value"/>
      <button class="btn-del-sm" onclick="PROJ.docs.splice(${gi},1);render()">✕ Remove</button>
    </div>`;
  g.items.forEach((item,ii)=>{
    h+=`<div class="die-r">
      <select class="die-sel" onchange="PROJ.docs[${gi}].items[${ii}].status=this.value;render()">
        <option value="required" ${item.status==="required"||item.status==="pending"?"selected":""}>Required</option>
        <option value="received" ${item.status==="received"||item.status==="done"?"selected":""}>Received</option>
        <option value="not-received" ${item.status==="not-received"?"selected":""}>Not Received</option>
        <option value="correction" ${item.status==="correction"?"selected":""}>Correction Required</option>
        <option value="na" ${item.status==="na"?"selected":""}>N/A</option>
      </select>
      <input class="die-n" value="${esc(item.name)}" oninput="PROJ.docs[${gi}].items[${ii}].name=this.value"/>
      <button class="btn-del" onclick="PROJ.docs[${gi}].items.splice(${ii},1);render()">✕</button>
    </div>`;
  });
  h+=`<div class="btn-add" style="margin-top:4px${fbRow?";border-color:#e8a060;color:#a04800":""}"
    onclick="PROJ.docs[${gi}].items.push({name:'',status:'pending'});render()">+ Add Document</div></div>`;
  return h;
}

function addDrawingPrepStage(){PROJ.stages.push({name:"New Drawing Preparation Stage",type:"drawing_prep",status:"",note:"",time:"",appNum:"",dateA:"",dateB:""});render();}
function addDrawingApprovalStage(){PROJ.stages.push({name:"New Drawing Approval Stage",type:"approval_portal",status:"",note:"",time:"",appNum:"",dateA:"",dateB:""});render();}

async function openProject(id){
  document.getElementById("app").innerHTML=`<div class="loading"><div class="spinner"></div></div>`;
  const data=await fbGet("projects/"+id);
  if(data){PROJ=migrateProject(data);S.authedCoord=true;S.mode="coord";S.tab="proj";S.adminPopup=null;render();}
}
async function confirmDelete(){
  if(!PROJ)return;
  await fbDelete("projects/"+PROJ.id);
  PROJ=null;S.modal=null;S.mode="coord";S.tab="list";render();
}

boot();
window.addEventListener("scroll",()=>{
  const btn=document.getElementById("scrollTopBtn");
  if(btn)btn.classList.toggle("visible",window.scrollY>300);
});