import React, { useEffect, useMemo, useState } from 'react';
import {
  LayoutDashboard, Users, CalendarCheck, CalendarDays, Wallet, ReceiptText,
  BarChart3, Building2, UserCog, LogOut, Search, Plus, RefreshCw, Menu,
  X, CheckCircle2, Clock3, AlertCircle, IndianRupee, ArrowUpRight
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const money = (v) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(v || 0));
const nice = (s='') => String(s).replaceAll('_',' ').replace(/\b\w/g, c => c.toUpperCase());
const dateText = (v) => v ? String(v).slice(0,10) : '—';

async function api(path, { token, method='GET', body } = {}) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    ...(body ? { body: JSON.stringify(body) } : {})
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`);
  return data;
}

const menu = [
  { id:'overview', label:'Overview', icon:LayoutDashboard, roles:['admin','hr_manager','accountant','employee_user'] },
  { id:'employees', label:'Employees', icon:Users, roles:['admin','hr_manager','accountant','employee_user'] },
  { id:'attendance', label:'Attendance', icon:CalendarCheck, roles:['admin','hr_manager','employee_user'] },
  { id:'leaves', label:'Leave Management', icon:CalendarDays, roles:['admin','hr_manager','employee_user'] },
  { id:'salaries', label:'Salary Details', icon:Wallet, roles:['admin','accountant','employee_user'] },
  { id:'payroll', label:'Payroll', icon:ReceiptText, roles:['admin','accountant','employee_user'] },
  { id:'reports', label:'Reports', icon:BarChart3, roles:['admin','hr_manager','accountant'] },
  { id:'departments', label:'Departments', icon:Building2, roles:['admin','hr_manager','accountant'] },
  { id:'users', label:'User Accounts', icon:UserCog, roles:['admin'] }
];

const pageConfig = {
  employees: {
    title:'Employees', endpoint:'/employees', addRoles:['admin','hr_manager'],
    fields:[
      ['deptId','Department ID','number',true], ['name','Full name','text',true],
      ['email','Email','email',true], ['phone','Phone','text',false],
      ['dob','Date of birth','date',false], ['designation','Designation','text',false],
      ['joinDate','Joining date','date',false]
    ],
    columns:['emp_id','name','dept_name','email','designation','join_date','employment_status']
  },
  attendance: {
    title:'Attendance', endpoint:'/attendance', addRoles:['admin','hr_manager'],
    fields:[
      ['empId','Employee ID','number',true], ['attendanceDate','Attendance date','date',true],
      ['checkIn','Check-in time','time',false], ['checkOut','Check-out time','time',false],
      ['status','Status','select',true,['Present','Absent','Late','Leave']]
    ],
    columns:['att_id','emp_id','name','attendance_date','check_in','check_out','status']
  },
  leaves: {
    title:'Leave Management', endpoint:'/leaves', addRoles:['admin','hr_manager','employee_user'],
    fields:[
      ['empId','Employee ID (HR only)','number',false], ['leaveType','Leave type','select',true,['Casual','Sick','Earned','Unpaid']],
      ['startDate','Start date','date',true], ['endDate','End date','date',true], ['reason','Reason','text',false]
    ],
    columns:['leave_id','emp_id','name','leave_type','start_date','end_date','status','reason']
  },
  salaries: {
    title:'Salary Details', endpoint:'/salaries', addRoles:['admin','accountant'],
    fields:[
      ['empId','Employee ID','number',true], ['salaryMonth','Salary month (1-12)','number',true],
      ['salaryYear','Salary year','number',true], ['basicSalary','Basic salary','number',true],
      ['allowances','Allowances','number',false], ['deductions','Deductions','number',false]
    ],
    columns:['salary_id','emp_id','salary_month','salary_year','basic_salary','allowances','deductions']
  },
  payroll: {
    title:'Payroll', endpoint:'/payroll', addRoles:[],
    fields:[
      ['empId','Employee ID','number',true], ['salaryMonth','Salary month (1-12)','number',true],
      ['salaryYear','Salary year','number',true]
    ],
    columns:['payroll_id','emp_id','name','salary_month','salary_year','gross_salary','tax_amount','total_deductions','net_salary']
  },
  departments: {
    title:'Departments', endpoint:'/departments', addRoles:[],
    columns:['dept_id','dept_name','location']
  }
};

function Login({ onLogin }) {
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  async function submit(e){
    e.preventDefault(); setBusy(true); setError('');
    try { const result=await api('/auth/login',{method:'POST',body:{email,password}}); onLogin(result); }
    catch(err){setError(err.message);}
    finally{setBusy(false);}
  }
  return <div className="login-shell">
    <div className="login-art">
      <div className="brand-mark">P<span>•</span></div>
      <div className="art-copy">
        <p className="eyebrow">PEOPLE • PAYROLL • PERFORMANCE</p>
        <h1>Workforce management, made clear.</h1>
        <p>One secure workspace for employee records, attendance, leave and payroll.</p>
        <div className="art-stats"><div><strong>01</strong><span>People</span></div><div><strong>02</strong><span>Attendance</span></div><div><strong>03</strong><span>Payroll</span></div></div>
      </div>
      <div className="art-orb orb-one"></div><div className="art-orb orb-two"></div>
    </div>
    <div className="login-panel">
      <div className="mobile-brand"><div className="brand-mark">P<span>•</span></div><span>Payroll Suite</span></div>
      <div className="login-form-wrap">
        <p className="eyebrow">WELCOME BACK</p><h2>Sign in to your account</h2>
        <p className="muted">Use the admin account you created to get started.</p>
        <form onSubmit={submit} className="form-stack">
          <label>Email address<input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="name@company.com" required /></label>
          <label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter your password" required /></label>
          {error && <div className="alert error"><AlertCircle size={16}/>{error}</div>}
          <button className="primary-btn full" disabled={busy}>{busy?'Signing in…':'Sign in'} <ArrowUpRight size={17}/></button>
        </form>
        <p className="login-foot">Secure role-based access • Payroll & Attendance Management</p>
      </div>
    </div>
  </div>;
}

function App() {
  const [session,setSession]=useState(()=>({token:localStorage.getItem('payroll_token'),user:JSON.parse(localStorage.getItem('payroll_user')||'null')}));
  const [page,setPage]=useState('overview');
  const [data,setData]=useState({});
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const [notice,setNotice]=useState('');
  const [modal,setModal]=useState(false);
  const [mobileOpen,setMobileOpen]=useState(false);
  const [search,setSearch]=useState('');
  const user=session.user;
  const role=user?.role || '';

  function saveSession(result){
    localStorage.setItem('payroll_token',result.token);
    localStorage.setItem('payroll_user',JSON.stringify(result.user));
    setSession({token:result.token,user:result.user});
  }
  function logout(){
    localStorage.removeItem('payroll_token');localStorage.removeItem('payroll_user');
    setSession({token:null,user:null});setData({});setPage('overview');
  }
  const allowedMenu=menu.filter(m=>m.roles.includes(role));
  useEffect(()=>{ if(user && !allowedMenu.some(m=>m.id===page)) setPage('overview'); },[role,page]);
  async function loadPage(target=page){
    if(!session.token)return;
    setBusy(true);setError('');
    try{
      if(target==='overview'){
        const tasks=[['employees','/employees'],['attendance','/attendance'],['leaves','/leaves'],['payroll','/payroll']];
        const results=await Promise.all(tasks.map(async ([k,p])=>{try{return [k,await api(p,{token:session.token})]}catch{return [k,[]]}}));
        setData(old=>({...old,...Object.fromEntries(results)}));
      } else if(target==='reports'){
        const endpoints = role==='hr_manager'
          ? [['attendanceSummary','/reports/attendance-summary']]
          : role==='accountant'
          ? [['monthlyPayroll','/reports/monthly-payroll']]
          : [['attendanceSummary','/reports/attendance-summary'],['monthlyPayroll','/reports/monthly-payroll']];
        const results=await Promise.all(endpoints.map(async ([k,p])=>{try{return [k,await api(p,{token:session.token})]}catch(e){return [k,[],e.message]}}));
        setData(old=>({...old,...Object.fromEntries(results.map(([k,v])=>[k,v]))}));
      } else {
        const cfg=pageConfig[target];
        if(cfg){const rows=await api(cfg.endpoint,{token:session.token});setData(old=>({...old,[target]:rows}));}
        else if(target==='users'){const rows=await api('/employees',{token:session.token});setData(old=>({...old,employees:rows}));}
      }
    }catch(e){setError(e.message);}
    finally{setBusy(false);}
  }
  useEffect(()=>{if(user)loadPage(page);},[page,session.token]);
  useEffect(()=>{if(notice){const t=setTimeout(()=>setNotice(''),3500);return()=>clearTimeout(t);}},[notice]);

  if(!session.token || !user) return <Login onLogin={saveSession}/>;

  async function submitRecord(form){
    setError('');
    try{
      if(page==='payroll'){
        const result=await api('/payroll/generate',{token:session.token,method:'POST',body:form});
        setNotice(result.message||'Payroll generated successfully.');
      } else if(page==='users'){
        await api('/auth/users',{token:session.token,method:'POST',body:form});
        setNotice('User account created successfully.');
      } else {
        const body={...form};
        if(page==='leaves' && role==='employee_user') delete body.empId;
        await api(pageConfig[page].endpoint,{token:session.token,method:'POST',body});
        setNotice(`${pageConfig[page].title} record saved successfully.`);
      }
      setModal(false);loadPage(page);
    }catch(e){setError(e.message);}
  }
  async function updateLeave(id,status){
    try{await api(`/leaves/${id}/status`,{token:session.token,method:'PUT',body:{status}});setNotice(`Leave ${status.toLowerCase()}.`);loadPage('leaves');}
    catch(e){setError(e.message);}
  }

  const rows=data[page]||[];
  const filtered=useMemo(()=>rows.filter(row=>JSON.stringify(row).toLowerCase().includes(search.toLowerCase())),[rows,search]);
  const title=menu.find(m=>m.id===page)?.label||'Overview';
  const employeeCount=(data.employees||[]).length;
  const attendanceRows=data.attendance||[];
  const payrollRows=data.payroll||[];
  const leaveRows=data.leaves||[];
  const isEmployee=role==='employee_user';

  return <div className="app-shell">
    <aside className={`sidebar ${mobileOpen?'open':''}`}>
      <div className="sidebar-brand"><div className="brand-mark small">P<span>•</span></div><div><strong>Payroll Suite</strong><small>WORKFORCE MANAGEMENT</small></div><button className="icon-btn close-nav" onClick={()=>setMobileOpen(false)}><X size={18}/></button></div>
      <div className="workspace-label">WORKSPACE</div>
      <nav>{allowedMenu.map(item=><button key={item.id} className={`nav-item ${page===item.id?'active':''}`} onClick={()=>{setPage(item.id);setSearch('');setMobileOpen(false);setError('');}}><item.icon size={18}/><span>{item.label}</span>{page===item.id&&<i/>}</button>)}</nav>
      <div className="sidebar-bottom"><div className="secure-note"><div className="secure-dot"></div><div><b>System connected</b><small>Protected workspace</small></div></div><button className="logout-btn" onClick={logout}><LogOut size={17}/> Sign out</button></div>
    </aside>
    <main className="main-area">
      <header className="topbar"><div className="top-left"><button className="icon-btn menu-toggle" onClick={()=>setMobileOpen(true)}><Menu size={20}/></button><div><div className="breadcrumb">Workspace <span>/</span> {title}</div><h1>{title}</h1></div></div><div className="top-actions"><button className="icon-btn" title="Refresh" onClick={()=>loadPage()}><RefreshCw size={17}/></button><div className="user-chip"><div className="avatar">{(user.name||'U').slice(0,1).toUpperCase()}</div><div><b>{user.name}</b><small>{nice(role)}</small></div></div></div></header>
      <section className="content">
        {error&&<div className="alert error"><AlertCircle size={16}/>{error}<button onClick={()=>setError('')}><X size={15}/></button></div>}
        {notice&&<div className="alert success"><CheckCircle2 size={16}/>{notice}</div>}
        {page==='overview' ? <Overview user={user} role={role} employees={data.employees||[]} attendance={attendanceRows} leaves={leaveRows} payroll={payrollRows} onNavigate={setPage}/> :
         page==='reports' ? <Reports data={data} role={role}/> :
         page==='users' ? <UsersPage token={session.token} employees={data.employees||[]} onCreate={()=>setModal(true)}/> :
         <DataPage page={page} rows={filtered} role={role} search={search} setSearch={setSearch} onAdd={()=>setModal(true)} onLeaveUpdate={updateLeave} />}
      </section>
    </main>
    {modal&&<RecordModal page={page} role={role} onClose={()=>setModal(false)} onSubmit={submitRecord}/>}
  </div>;
}

function Overview({user,role,employees,attendance,leaves,payroll,onNavigate}){
  const present=attendance.filter(x=>x.status==='Present').length;
  const pending=leaves.filter(x=>x.status==='Pending').length;
  const totalNet=payroll.reduce((s,x)=>s+Number(x.net_salary||0),0);
  const chart=[{name:'Present',value:attendance.filter(x=>x.status==='Present').length},{name:'Absent',value:attendance.filter(x=>x.status==='Absent').length},{name:'Late',value:attendance.filter(x=>x.status==='Late').length},{name:'Leave',value:attendance.filter(x=>x.status==='Leave').length}];
  return <div className="page-stack">
    <div className="welcome-row"><div><p className="eyebrow">YOUR WORKSPACE AT A GLANCE</p><h2>Hello, {user.name?.split(' ')[0] || 'there'} <span className="wave">✦</span></h2><p className="muted">{role==='employee_user'?'Here is your personal attendance and payroll overview.':'Here is what is happening across your workforce today.'}</p></div><span className="date-pill">{new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</span></div>
    <div className="stat-grid">
      <Stat icon={Users} label={role==='employee_user'?'My employee record':'Total employees'} value={employees.length} tone="violet" foot="Employee directory"/>
      <Stat icon={CalendarCheck} label="Attendance records" value={attendance.length} tone="blue" foot={`${present} marked present`}/>
      <Stat icon={CalendarDays} label="Pending leave requests" value={pending} tone="amber" foot="Awaiting review"/>
      <Stat icon={IndianRupee} label="Net payroll total" value={money(totalNet)} tone="green" foot={`${payroll.length} payroll records`}/>
    </div>
    <div className="dashboard-grid">
      <div className="panel chart-panel"><div className="panel-head"><div><h3>Attendance overview</h3><p>Records currently available in the system</p></div><span className="soft-tag">Summary</span></div>
        {attendance.length?<div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><BarChart data={chart} barSize={34}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#edf0f5"/><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill:'#8992a5',fontSize:12}}/><YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{fill:'#8992a5',fontSize:12}}/><Tooltip cursor={{fill:'#f5f6fb'}}/><Bar dataKey="value" fill="#7166e8" radius={[7,7,0,0]}/></BarChart></ResponsiveContainer></div>:<Empty text="Attendance data will appear here once records are available."/>}
      </div>
      <div className="panel quick-panel"><div className="panel-head"><div><h3>Quick actions</h3><p>Jump into common tasks</p></div></div><div className="quick-list">
        {role!=='employee_user'&&<Quick icon={Users} label="Manage employees" sub="View employee directory" onClick={()=>onNavigate('employees')}/>}
        <Quick icon={CalendarCheck} label="View attendance" sub="Check attendance records" onClick={()=>onNavigate('attendance')}/>
        <Quick icon={CalendarDays} label={role==='employee_user'?'Apply for leave':'Review leave requests'} sub="Manage leave records" onClick={()=>onNavigate('leaves')}/>
        <Quick icon={ReceiptText} label="Payroll details" sub="Review salary statements" onClick={()=>onNavigate('payroll')}/>
      </div></div>
    </div>
    <div className="panel recent-panel"><div className="panel-head"><div><h3>Recent payroll activity</h3><p>Latest generated payroll entries</p></div><button className="text-btn" onClick={()=>onNavigate('payroll')}>View all <ArrowUpRight size={15}/></button></div>
      {payroll.length?<div className="table-scroll"><table><thead><tr><th>Employee</th><th>Period</th><th>Gross salary</th><th>Net salary</th></tr></thead><tbody>{payroll.slice(0,5).map((r,i)=><tr key={r.payroll_id||i}><td><b>{r.name||`Employee #${r.emp_id}`}</b><small className="cell-sub">ID {r.emp_id}</small></td><td>{nice(`${r.salary_month}/${r.salary_year}`)}</td><td>{money(r.gross_salary)}</td><td><strong>{money(r.net_salary)}</strong></td></tr>)}</tbody></table></div>:<Empty text="No payroll entries yet. Generate payroll after adding salary records."/>}
    </div>
  </div>;
}
function Stat({icon:Icon,label,value,tone,foot}){return <div className="stat-card"><div className={`stat-icon ${tone}`}><Icon size={19}/></div><p>{label}</p><strong>{value}</strong><small>{foot}</small></div>}
function Quick({icon:Icon,label,sub,onClick}){return <button className="quick-item" onClick={onClick}><span className="quick-icon"><Icon size={18}/></span><span><b>{label}</b><small>{sub}</small></span><ArrowUpRight size={16} className="quick-arrow"/></button>}
function Empty({text}){return <div className="empty-state"><div className="empty-icon"><BarChart3 size={21}/></div><p>{text}</p></div>}

function DataPage({page,rows,role,search,setSearch,onAdd,onLeaveUpdate}){
  const cfg=pageConfig[page];
  const canAdd=cfg.addRoles.includes(role);
  const canApprove=page==='leaves'&&['admin','hr_manager'].includes(role);
  const cols=cfg.columns;
  function cell(key,row){
    const value=row[key];
    if(value===null||value===undefined||value==='')return '—';
    if(['basic_salary','allowances','deductions','gross_salary','tax_amount','total_deductions','net_salary'].includes(key))return money(value);
    if(key.includes('date')||key==='join_date')return dateText(value);
    if(key==='status')return <span className={`status ${String(value).toLowerCase()}`}>{value}</span>;
    if(key==='employment_status')return <span className="status present">{value}</span>;
    return String(value);
  }
  return <div className="page-stack">
    <div className="page-intro"><div><p className="eyebrow">MANAGE YOUR DATA</p><h2>{cfg.title}</h2><p className="muted">{page==='employees'?'Maintain employee information and department assignments.':page==='attendance'?'Review daily check-in, check-out and attendance status.':page==='leaves'?'Track leave applications and review pending requests.':page==='salaries'?'Maintain monthly salary components for each employee.':page==='payroll'?'View generated payroll and calculate net salary.':'Explore the departments in your organisation.'}</p></div>{canAdd&&<button className="primary-btn" onClick={onAdd}><Plus size={17}/>{page==='leaves'&&role==='employee_user'?'Apply for leave':page==='payroll'?'Generate payroll':'Add new'}</button>}</div>
    <div className="panel data-panel"><div className="table-toolbar"><div><h3>{cfg.title} list</h3><p>{rows.length} record{rows.length===1?'':'s'} found</p></div><div className="table-tools"><div className="search-box"><Search size={16}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search records…"/></div></div></div>
      {rows.length?<div className="table-scroll"><table><thead><tr>{cols.map(c=><th key={c}>{nice(c)}</th>)}{canApprove&&<th>Actions</th>}</tr></thead><tbody>{rows.map((row,i)=><tr key={row[Object.keys(row).find(k=>k.endsWith('_id'))]||i}>{cols.map(c=><td key={c}>{cell(c,row)}</td>)}{canApprove&&<td><div className="row-actions"><button className="approve-btn" disabled={row.status==='Approved'} onClick={()=>onLeaveUpdate(row.leave_id,'Approved')}>Approve</button><button className="reject-btn" disabled={row.status==='Rejected'} onClick={()=>onLeaveUpdate(row.leave_id,'Rejected')}>Reject</button></div></td>}</tr>)}</tbody></table></div>:<Empty text="No records found. Add a record or refresh after loading sample data."/>}
    </div>
  </div>;
}

function Reports({data,role}){
  const payroll=data.monthlyPayroll||[], attendance=data.attendanceSummary||[];
  return <div className="page-stack"><div className="page-intro"><div><p className="eyebrow">INSIGHTS & ANALYTICS</p><h2>Reports</h2><p className="muted">A consolidated view of payroll and attendance performance.</p></div></div>
    {payroll.length>0&&<div className="panel"><div className="panel-head"><div><h3>Monthly payroll by department</h3><p>Gross and net payroll totals returned by the database</p></div></div><div className="table-scroll"><table><thead><tr>{['Department','Month','Year','Employees','Total gross','Total net'].map(x=><th key={x}>{x}</th>)}</tr></thead><tbody>{payroll.map((r,i)=><tr key={i}><td>{r.dept_name}</td><td>{r.salary_month}</td><td>{r.salary_year}</td><td>{r.employee_count}</td><td>{money(r.total_gross)}</td><td><b>{money(r.total_net)}</b></td></tr>)}</tbody></table></div></div>}
    {attendance.length>0&&<div className="panel"><div className="panel-head"><div><h3>Attendance summary by employee</h3><p>Present, absent, late and leave day counts</p></div></div><div className="table-scroll"><table><thead><tr>{['Employee ID','Employee','Total records','Present','Absent','Late','Leave'].map(x=><th key={x}>{x}</th>)}</tr></thead><tbody>{attendance.map(r=><tr key={r.emp_id}><td>{r.emp_id}</td><td><b>{r.name}</b></td><td>{r.total_records}</td><td>{r.present_days}</td><td>{r.absent_days}</td><td>{r.late_days}</td><td>{r.leave_days}</td></tr>)}</tbody></table></div></div>}
    {!payroll.length&&!attendance.length&&<div className="panel"><Empty text="No report data is available for your role or database yet."/></div>}
  </div>;
}

function UsersPage({employees,onCreate}){
  return <div className="page-stack"><div className="page-intro"><div><p className="eyebrow">ACCESS CONTROL</p><h2>User Accounts</h2><p className="muted">Create secure logins and assign application roles.</p></div><button className="primary-btn" onClick={onCreate}><Plus size={17}/>Create account</button></div>
    <div className="panel info-panel"><div className="info-symbol"><UserCog size={22}/></div><div><h3>Role-based access</h3><p>Admin can create accounts for Admin, HR Manager, Accountant and Employee. Employee accounts must be linked to an existing Employee ID.</p><div className="role-pills"><span>Admin</span><span>HR Manager</span><span>Accountant</span><span>Employee</span></div></div></div>
    <div className="panel"><div className="panel-head"><div><h3>Employee records available for linking</h3><p>Select an employee ID when creating an employee login.</p></div></div><div className="table-scroll"><table><thead><tr><th>Employee ID</th><th>Name</th><th>Email</th><th>Designation</th></tr></thead><tbody>{employees.map(e=><tr key={e.emp_id}><td>{e.emp_id}</td><td><b>{e.name}</b></td><td>{e.email}</td><td>{e.designation||'—'}</td></tr>)}</tbody></table></div></div>
  </div>;
}

function RecordModal({page,role,onClose,onSubmit}){
  const [values,setValues]=useState({});
  const [busy,setBusy]=useState(false);
  const [err,setErr]=useState('');
  const isUser=page==='users';
  const isLeave=page==='leaves';
  const fields=isUser?[
    ['fullName','Full name','text',true],['email','Email','email',true],['password','Temporary password (8+ characters)','password',true],
    ['role','Role','select',true,['admin','hr_manager','accountant','employee_user']],['empId','Employee ID (required for employee)','number',false]
  ]:page==='payroll'?pageConfig.payroll.fields:pageConfig[page].fields.filter(f=>!(isLeave&&role==='employee_user'&&f[0]==='empId'));
  async function submit(e){e.preventDefault();setBusy(true);setErr('');
    const body={...values};
    for(const f of fields) if(f[2]==='number'&&body[f[0]]!==undefined&&body[f[0]]!=='')body[f[0]]=Number(body[f[0]]);
    if(page==='attendance'&&body.status==='')body.status='Present';
    try{await onSubmit(body);}catch(e){setErr(e.message);}finally{setBusy(false);}
  }
  return <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onClose();}}><div className="modal"><div className="modal-head"><div><p className="eyebrow">NEW RECORD</p><h2>{isUser?'Create user account':page==='payroll'?'Generate payroll':isLeave&&role==='employee_user'?'Apply for leave':`Add ${pageConfig[page].title.slice(0,-1)}`}</h2></div><button className="icon-btn" onClick={onClose}><X size={19}/></button></div>
    <form onSubmit={submit}><div className="modal-fields">{fields.map(([key,label,type,required,options])=><label key={key}>{label}{type==='select'?<select required={required} value={values[key]||''} onChange={e=>setValues(v=>({...v,[key]:e.target.value}))}><option value="">Select…</option>{options.map(o=><option key={o} value={o}>{nice(o)}</option>)}</select>:<input type={type} required={required} min={type==='number'?0:undefined} value={values[key]||''} onChange={e=>setValues(v=>({...v,[key]:e.target.value}))} placeholder={label}/>}</label>)}</div>
    {err&&<div className="alert error"><AlertCircle size={16}/>{err}</div>}<div className="modal-actions"><button type="button" className="secondary-btn" onClick={onClose}>Cancel</button><button className="primary-btn" disabled={busy}>{busy?'Saving…':'Save record'}</button></div></form>
  </div></div>;
}

export default App;
