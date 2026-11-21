const today = new Date();
const dateText = new Intl.DateTimeFormat('ar-EG', { weekday:'long', day:'numeric', month:'long', year:'numeric' }).format(today);
document.getElementById('todayDate').textContent = dateText;

const seedPatients = [
  {id:1,name:'سارة محمد علي',phone:'01012345678',age:24,visit:'2026-11-17',notes:'تنظيف ومتابعة'},
  {id:2,name:'أحمد محمود حسن',phone:'01123456789',age:32,visit:'2026-11-16',notes:'حشو ضرس'},
  {id:3,name:'نورهان خالد',phone:'01234567890',age:19,visit:'2026-11-12',notes:'استشارة تقويم'},
  {id:4,name:'يوسف إبراهيم',phone:'01098765432',age:41,visit:'2026-11-10',notes:'كشف دوري'},
  {id:5,name:'ملك مصطفى',phone:'01555555555',age:27,visit:'2026-11-08',notes:'تبييض الأسنان'}
];
const seedAppointments = [
  {id:101,patient:'سارة محمد علي',date:todayISO(),time:'10:30 ص',service:'تنظيف الأسنان',status:'قيد الانتظار'},
  {id:102,patient:'أحمد محمود حسن',date:todayISO(),time:'12:00 م',service:'حشو الأسنان',status:'مكتمل'},
  {id:103,patient:'نورهان خالد',date:todayISO(),time:'02:00 م',service:'استشارة تقويم',status:'قيد الانتظار'},
  {id:104,patient:'يوسف إبراهيم',date:shiftDate(1),time:'05:30 م',service:'كشف واستشارة',status:'قيد الانتظار'},
  {id:105,patient:'ملك مصطفى',date:shiftDate(-1),time:'01:00 م',service:'تبييض الأسنان',status:'ملغي'}
];
function todayISO(){return new Date().toISOString().slice(0,10)}
function shiftDate(n){const d=new Date();d.setDate(d.getDate()+n);return d.toISOString().slice(0,10)}
function readStore(key,fallback){try{return JSON.parse(localStorage.getItem(key))||fallback}catch{return fallback}}
let patients=readStore('pearl_patients',seedPatients);
let appointments=readStore('pearl_appointments',seedAppointments);
const $=s=>document.querySelector(s);
const $$=s=>document.querySelectorAll(s);
const save=()=>{localStorage.setItem('pearl_patients',JSON.stringify(patients));localStorage.setItem('pearl_appointments',JSON.stringify(appointments))};
const escapeHTML=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const initials=name=>escapeHTML(name.trim().charAt(0)||'؟');
const formatDate=d=>d?new Intl.DateTimeFormat('ar-EG',{day:'numeric',month:'short',year:'numeric'}).format(new Date(d+'T12:00:00')):'—';
const statusClass=s=>s==='مكتمل'?'done':s==='ملغي'?'cancel':'pending';
function patientCell(name){return `<div class="patient-cell"><span class="patient-avatar">${initials(name)}</span>${escapeHTML(name)}</div>`}
function statusPill(s){return `<span class="status ${statusClass(s)}">${escapeHTML(s)}</span>`}
function render(){
  $('#statPatients').textContent=patients.length;
  $('#statToday').textContent=appointments.filter(a=>a.date===todayISO()&&a.status!=='ملغي').length;
  $('#statDone').textContent=appointments.filter(a=>a.status==='مكتمل').length;
  $('#allAppointments').textContent=appointments.length;
  $('#pendingAppointments').textContent=appointments.filter(a=>a.status==='قيد الانتظار').length;
  $('#completedAppointments').textContent=appointments.filter(a=>a.status==='مكتمل').length;
  const upcoming=appointments.filter(a=>a.status!=='ملغي').sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time)).slice(0,5);
  $('#upcomingRows').innerHTML=upcoming.length?upcoming.map(a=>`<tr><td>${patientCell(a.patient)}</td><td>${escapeHTML(a.service)}</td><td>${escapeHTML(a.time)}</td><td>${statusPill(a.status)}</td></tr>`).join(''):'<tr><td colspan="4" class="empty">لا توجد مواعيد حالياً</td></tr>';
  renderPatients();renderAppointments();
}
function renderPatients(){
  const q=($('#patientSearch')?.value||'').trim().toLowerCase();
  const list=patients.filter(p=>(p.name+' '+p.phone).toLowerCase().includes(q));
  $('#patientCount').textContent=`${list.length} مريض`;
  $('#patientRows').innerHTML=list.length?list.map(p=>`<tr><td>${patientCell(p.name)}</td><td dir="ltr">${escapeHTML(p.phone)}</td><td>${escapeHTML(p.age)} سنة</td><td>${formatDate(p.visit)}</td><td><span class="status done">ملف نشط</span></td><td><button class="action-select" data-delete-patient="${p.id}">حذف</button></td></tr>`).join(''):'<tr><td colspan="6" class="empty">مفيش نتائج مطابقة للبحث</td></tr>';
}
function renderAppointments(){
  const q=($('#appointmentSearch')?.value||'').trim().toLowerCase(),filter=$('#statusFilter')?.value||'all';
  const list=appointments.filter(a=>a.patient.toLowerCase().includes(q)&&(filter==='all'||a.status===filter)).sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));
  $('#appointmentRows').innerHTML=list.length?list.map(a=>`<tr><td>${patientCell(a.patient)}</td><td>${formatDate(a.date)}</td><td>${escapeHTML(a.time)}</td><td>${escapeHTML(a.service)}</td><td>${statusPill(a.status)}</td><td><select class="action-select" data-status-id="${a.id}" aria-label="تغيير حالة الموعد"><option ${a.status==='قيد الانتظار'?'selected':''}>قيد الانتظار</option><option ${a.status==='مكتمل'?'selected':''}>مكتمل</option><option ${a.status==='ملغي'?'selected':''}>ملغي</option></select></td></tr>`).join(''):'<tr><td colspan="6" class="empty">لا توجد مواعيد مطابقة</td></tr>';
}
function showToast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2600)}
function openModal(){$('#patientModal').classList.add('show');$('#patientForm').elements.name.focus()}
function closeModal(){$('#patientModal').classList.remove('show')}
function navigate(page){
  if(!document.getElementById(page))return;
  $$('.page').forEach(p=>p.classList.toggle('active',p.id===page));
  $$('.nav-link').forEach(a=>a.classList.toggle('active',a.dataset.page===page));
  const titles={dashboard:'الرئيسية',patients:'المرضى',appointments:'المواعيد',services:'خدمات العيادة',clinic:'عن العيادة'};
  $('#pageTitle').textContent=titles[page]||'الرئيسية';
  $('#sidebar').classList.remove('open');window.location.hash=page;
}
$$('[data-page]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();navigate(a.dataset.page)}));
$$('[data-page-link]').forEach(a=>a.addEventListener('click',()=>navigate(a.dataset.pageLink)));
$$('[data-open-patient]').forEach(b=>b.addEventListener('click',openModal));
$$('[data-close-modal]').forEach(b=>b.addEventListener('click',closeModal));
$('#patientModal').addEventListener('click',e=>{if(e.target.id==='patientModal')closeModal()});
$('#patientForm').addEventListener('submit',e=>{
  e.preventDefault();const data=new FormData(e.currentTarget);
  const patient={id:Date.now(),name:data.get('name').trim(),phone:data.get('phone').trim(),age:Number(data.get('age')),visit:data.get('visit')||todayISO(),notes:data.get('notes').trim()};
  if(!patient.name||!patient.phone){showToast('من فضلك أدخلي الاسم ورقم الهاتف');return}
  patients.unshift(patient);save();render();e.currentTarget.reset();closeModal();navigate('patients');showToast('تمت إضافة المريض بنجاح ✨');
});
$('#patientSearch').addEventListener('input',renderPatients);
$('#appointmentSearch').addEventListener('input',renderAppointments);
$('#statusFilter').addEventListener('change',renderAppointments);
$('#patientRows').addEventListener('click',e=>{
  const btn=e.target.closest('[data-delete-patient]');if(!btn)return;
  const id=Number(btn.dataset.deletePatient);const p=patients.find(x=>x.id===id);
  if(!confirm(`هل تريدين حذف ملف ${p?.name||'المريض'}؟`))return;
  patients=patients.filter(x=>x.id!==id);save();render();showToast('تم حذف الملف');
});
$('#appointmentRows').addEventListener('change',e=>{
  const select=e.target.closest('[data-status-id]');if(!select)return;
  const a=appointments.find(x=>x.id===Number(select.dataset.statusId));if(a){a.status=select.value;save();render();showToast('تم تحديث حالة الموعد')}
});
$('#addAppointmentBtn').addEventListener('click',()=>{
  if(!patients.length){showToast('أضيفي مريضاً أولاً');navigate('patients');return}
  const name=prompt('اكتبي اسم المريض كما هو مسجل:');if(!name)return;
  const patient=patients.find(p=>p.name.trim().toLowerCase()===name.trim().toLowerCase());
  if(!patient){showToast('الاسم غير موجود في قائمة المرضى');return}
  const date=prompt('تاريخ الموعد (YYYY-MM-DD):',todayISO());if(!date)return;
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date)){showToast('صيغة التاريخ غير صحيحة');return}
  const time=prompt('وقت الموعد:', '04:00 م')||'04:00 م';
  const service=prompt('نوع الزيارة:', 'كشف واستشارة')||'كشف واستشارة';
  appointments.push({id:Date.now(),patient:patient.name,date,time,service,status:'قيد الانتظار'});save();render();showToast('تم تسجيل الموعد');
});
$('#contactBtn').addEventListener('click',()=>showToast('عدّلي رقم الهاتف والعنوان ببيانات العيادة الحقيقية'));
$('#menuBtn').addEventListener('click',()=>$('#sidebar').classList.toggle('open'));
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal()});
const initial=location.hash.replace('#','');if(initial&&document.getElementById(initial))navigate(initial);
render();
