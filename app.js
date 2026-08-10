const suspects = [
  { id: 'helena', name: 'Helena Vidal', role: 'A herdeira', initial: 'H', color: 'linear-gradient(145deg,#7b624d,#23241e)', clue: 'Helena discutiu com a vítima às 23h, mas uma camareira confirma que ela estava no terraço no horário do crime.' },
  { id: 'miguel', name: 'Miguel Torres', role: 'O sócio', initial: 'M', color: 'linear-gradient(145deg,#4b5f64,#20231f)', clue: 'Miguel conhecia a combinação do cofre. Em seu paletó há pó dourado igual ao da biblioteca.' },
  { id: 'beatriz', name: 'Beatriz Luz', role: 'A jornalista', initial: 'B', color: 'linear-gradient(145deg,#725e68,#22231f)', clue: 'A gravação de Beatriz registra o sino da recepção à meia-noite; ela estava no saguão.' },
  { id: 'dante', name: 'Dante Moretti', role: 'O chef', initial: 'D', color: 'linear-gradient(145deg,#605b49,#20211e)', clue: 'Dante preparou a bebida, porém o veneno foi colocado no copo depois que ele deixou o salão.' },
  { id: 'sophia', name: 'Sophia Reis', role: 'A curadora', initial: 'S', color: 'linear-gradient(145deg,#4f6656,#22231f)', clue: 'Sophia afirma não ter entrado na biblioteca, mas suas digitais estão no decantador da vítima.' }
];
const locations = [
  { id:'library', name:'Biblioteca', hint:'Cena do crime · 2 pistas', bg:'linear-gradient(135deg,#3a3024,#151713)', clue:{title:'Pó de restauração',type:'EVIDÊNCIA FÍSICA',text:'Há pó dourado no tapete, usado apenas na restauração dos quadros que Sophia supervisionava.'}},
  { id:'terrace', name:'Terraço', hint:'Último avistamento · 1 pista', bg:'linear-gradient(135deg,#1d3031,#101510)', clue:{title:'Fotografia às 00:03',type:'ÁLIBI',text:'Uma foto de outro hóspede mostra Helena no terraço três minutos após a meia-noite.'}},
  { id:'kitchen', name:'Cozinha', hint:'Origem da bebida · 1 pista', bg:'linear-gradient(135deg,#46362c,#151713)', clue:{title:'Garrafa intacta',type:'ANÁLISE',text:'A garrafa não contém veneno. A substância foi aplicada diretamente no decantador.'}},
  { id:'reception', name:'Recepção', hint:'Registros do hotel · 2 pistas', bg:'linear-gradient(135deg,#444032,#171814)', clue:{title:'Chave duplicada',type:'REGISTRO',text:'Sophia solicitou uma cópia da chave da biblioteca dois dias antes do crime.'}}
];
const botNames = ['Insp. Nogueira','Agente Lira','Det. Sombra','Comissária Maia','Agente Vale'];
const state = { screen:'home', player:'', room:'', players:[], round:1, actions:2, selected:null, selectedType:null, clues:[], investigated:new Set(), accused:false, difficulty:'inspector' };
const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

function showScreen(name){ $$('.screen').forEach(el=>el.classList.remove('active')); $(`#${name}-screen`).classList.add('active'); state.screen=name; }
function initials(name){ return name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase(); }
function roomCode(){ return Math.random().toString(36).slice(2,6).toUpperCase(); }
function toast(message){ const el=$('#toast'); el.textContent=message; el.classList.add('show'); setTimeout(()=>el.classList.remove('show'),2200); }
function log(title, text){ const el=document.createElement('div'); el.className='log-entry'; el.innerHTML=`<b>${title}</b>${text}<br><time>AGORA</time>`; $('#game-log').prepend(el); }

$('#join-toggle').addEventListener('click',()=>{ const fields=$('#join-fields'); fields.classList.toggle('open'); fields.setAttribute('aria-hidden',!fields.classList.contains('open')); });
$('#entry-form').addEventListener('submit',(e)=>{
  e.preventDefault(); const name=$('#player-name').value.trim(); if(!name) return;
  state.player=name; state.room=$('#room-code-input').value.trim().toUpperCase() || roomCode();
  state.players=[{name,score:0,host:true}];
  renderLobby(); showScreen('lobby');
});
$$('[data-action="leave"]').forEach(btn=>btn.addEventListener('click',()=>showScreen('home')));
$('#copy-code').addEventListener('click',async()=>{ try{await navigator.clipboard.writeText(state.room);toast('Código copiado.');}catch{toast(`Código: ${state.room}`);} });
$('#add-bot').addEventListener('click',()=>{ if(state.players.length>=6)return toast('A sala já está cheia.'); const name=botNames.find(n=>!state.players.some(p=>p.name===n)); state.players.push({name,score:0,bot:true}); renderLobby(); });
$('#difficulty').addEventListener('change',(e)=>state.difficulty=e.target.value);
$('#start-game').addEventListener('click',()=>{ if(state.players.length<3)return toast('Adicione pelo menos 2 detetives simulados.'); startGame(); });

function renderLobby(){
  $('#room-code').textContent=state.room; $('#player-count').textContent=`${state.players.length} / 6`;
  $('#lobby-players').innerHTML=state.players.map((p,i)=>`<div class="player-row"><i class="avatar">${initials(p.name)}</i><span>${p.name}</span><small class="${p.host?'host':''}">${p.host?'ANFITRIÃO':p.bot?'SIMULADO':'CONECTADO'}</small></div>`).join('');
}
function startGame(){
  state.round=1;state.actions=2;state.clues=[{title:'Relógio quebrado',type:'CENA DO CRIME',text:'O relógio da biblioteca parou às 00:02. A morte ocorreu entre 23:58 e 00:04.'}];state.investigated=new Set();state.accused=false;state.selected=null;
  renderGame(); showScreen('game'); log('Caso aberto','Os detetives receberam o relatório inicial.');
}
function renderGame(){
  $('#round-current').textContent=state.round;$('#actions-left').textContent=state.actions;$('#clue-count').textContent=state.clues.length;
  $('#game-players').innerHTML=state.players.map((p,i)=>`<div class="player-row ${i===0?'active':''}"><i class="avatar">${initials(p.name)}</i><span>${p.name}</span><small class="score">${p.score} XP</small></div>`).join('');
  $('#turn-name').textContent='Seu turno';
  $('#suspect-grid').innerHTML=suspects.map(s=>`<button class="suspect-card ${state.selected===s.id?'selected':''}" data-select="${s.id}" data-type="suspect"><div class="portrait" style="--portrait:${s.color}" data-initial="${s.initial}"></div><h3>${s.name}</h3><p>${s.role.toUpperCase()}</p><span class="status-tag">${state.investigated.has(s.id)?'INTERROGADO':'NÃO INTERROGADO'}</span></button>`).join('');
  $('#location-grid').innerHTML=locations.map(l=>`<button class="location-card ${state.selected===l.id?'selected':''} ${state.investigated.has(l.id)?'done':''}" style="--bg:${l.bg}" data-select="${l.id}" data-type="location"><b>${l.name}</b><span>${state.investigated.has(l.id)?'LOCAL INVESTIGADO':l.hint.toUpperCase()}</span></button>`).join('');
  $('#clue-list').innerHTML=state.clues.map(c=>`<article class="clue-card"><span>${c.type}</span><h3>${c.title}</h3><p>${c.text}</p></article>`).join('');
  $('#investigate-button').disabled=!state.selected||state.actions<=0||state.investigated.has(state.selected);
  $$('[data-select]').forEach(btn=>btn.addEventListener('click',()=>{state.selected=btn.dataset.select;state.selectedType=btn.dataset.type;renderGame();}));
}
$$('.tab').forEach(btn=>btn.addEventListener('click',()=>{ $$('.tab,.tab-content').forEach(el=>el.classList.remove('active'));btn.classList.add('active');$(`#${btn.dataset.tab}-tab`).classList.add('active'); }));
$('#investigate-button').addEventListener('click',()=>{
  if(!state.selected||state.actions<=0)return;
  const item=state.selectedType==='suspect'?suspects.find(s=>s.id===state.selected):locations.find(l=>l.id===state.selected);
  const clue=state.selectedType==='suspect'?{title:`Depoimento: ${item.name}`,type:'INTERROGATÓRIO',text:item.clue}:item.clue;
  state.clues.push(clue);state.investigated.add(item.id);state.actions--;state.players[0].score+=10;log(state.selectedType==='suspect'?'Interrogatório concluído':'Local investigado',`${item.name}: nova pista adicionada.`);state.selected=null;renderGame();
  openModal(`<p class="eyebrow">NOVA PISTA</p><h2>${clue.title}</h2><p>${clue.text}</p><button class="button primary modal-ok">ARQUIVAR E CONTINUAR</button>`);
  $('.modal-ok').addEventListener('click',()=>{closeModal(); if(state.actions===0)setTimeout(endTurn,400);});
});
function endTurn(){
  state.players.slice(1).forEach((p,i)=>{p.score+=10;const target=[...suspects,...locations][Math.floor(Math.random()*9)];log(p.name,`${target.name} foi investigado.`)});
  state.round++;state.actions=2;
  if(state.round>5){ finish(false);return; }
  renderGame();toast(`Rodada ${state.round} iniciada.`);
}
$('#accuse-button').addEventListener('click',showAccusation);
function showAccusation(){
  openModal(`<p class="eyebrow">DECISÃO IRREVERSÍVEL</p><h2>Quem matou Augusto Vidal?</h2><p>Uma acusação errada encerra sua investigação e custa 20 XP.</p><div class="accuse-options">${suspects.map(s=>`<button class="accuse-option" data-accuse="${s.id}">${s.name} — ${s.role}</button>`).join('')}</div><button id="confirm-accuse" class="button danger" disabled>CONFIRMAR ACUSAÇÃO</button>`);
  let choice=null;$$('[data-accuse]').forEach(btn=>btn.addEventListener('click',()=>{$$('[data-accuse]').forEach(b=>b.classList.remove('selected'));btn.classList.add('selected');choice=btn.dataset.accuse;$('#confirm-accuse').disabled=false;}));
  $('#confirm-accuse').addEventListener('click',()=>{closeModal();state.accused=true;if(choice==='sophia'){state.players[0].score+=100;renderGame();finish(true);}else{state.players[0].score=Math.max(0,state.players[0].score-20);openModal(`<div class="result-seal">ACUSAÇÃO<br>INCORRETA</div><h2>O caso continua</h2><p>As evidências não sustentam sua acusação. Você perdeu 20 XP e não poderá acusar novamente nesta demonstração.</p><button class="button primary modal-ok">CONTINUAR INVESTIGAÇÃO</button>`);$('.modal-ok').addEventListener('click',closeModal);$('#accuse-button').disabled=true;renderGame();}});
}
function finish(won){
  openModal(`<div class="result-seal">${won?'CASO<br>ENCERRADO':'TEMPO<br>ESGOTADO'}</div><h2>${won?'Você encontrou a culpada!':'Sophia escapou.'}</h2><p>${won?'Sophia usou a chave duplicada, contaminou o decantador e deixou pó da restauração na biblioteca. Você venceu a investigação.':'As cinco rodadas terminaram. A culpada era Sophia Reis, a curadora.'}</p><button class="button primary" id="play-again">VOLTAR AO LOBBY</button>`);
  $('#play-again').addEventListener('click',()=>{closeModal();renderLobby();showScreen('lobby');});
}
$('#rules-button').addEventListener('click',()=>{openModal(`<p class="eyebrow">PROTOCOLO DE INVESTIGAÇÃO</p><h2>Como jogar</h2><p>Cada rodada concede 2 ações. Use-as para interrogar suspeitos ou investigar locais. As pistas são privadas; no jogo online, você decide o que compartilhar. Faça uma acusação quando conseguir ligar motivo, meio e oportunidade.</p><button class="button primary modal-ok">ENTENDIDO</button>`);$('.modal-ok').addEventListener('click',closeModal);});
function openModal(html){$('#modal-content').innerHTML=html;$('#modal').classList.add('open');$('#modal').setAttribute('aria-hidden','false');}
function closeModal(){$('#modal').classList.remove('open');$('#modal').setAttribute('aria-hidden','true');}
$('.modal-close').addEventListener('click',closeModal);$('#modal').addEventListener('click',(e)=>{if(e.target.id==='modal')closeModal();});
