// ── State ──────────────────────────────────────────────────────────────────
const g = {
  phase: 'betting',   // betting | playing | result
  busy: false,
  balance: 1000,
  bet: 0,
  wins: 0, losses: 0, pushes: 0,
  shoe: [], dealtCount: 0,
  playerCards: [], dealerCards: [],
  splitCard: null,    // held card for 2nd split hand
  splitBet: 0,
  hand1: null,        // { cards, bet } saved after hand 1 of a split
};

// ── Deck ───────────────────────────────────────────────────────────────────
function buildShoe() {
  const suits = ['♠','♥','♦','♣'];
  const vals  = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
  let deck = [];
  for (const s of suits)
    for (const v of vals)
      deck.push({ suit: s, value: v });
  let shoe = [];
  for (let i = 0; i < 6; i++) shoe = shoe.concat(deck);
  for (let i = shoe.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shoe[i], shoe[j]] = [shoe[j], shoe[i]];
  }
  return shoe;
}

function draw() {
  if (g.dealtCount >= 234) { g.shoe = buildShoe(); g.dealtCount = 0; }
  return g.shoe[g.dealtCount++];
}

// ── Hand math ──────────────────────────────────────────────────────────────
function handVal(cards) {
  let total = 0, aces = 0;
  for (const c of cards) {
    if (c.value === 'A')                   { total += 11; aces++; }
    else if ('JQK'.includes(c.value))        total += 10;
    else                                     total += parseInt(c.value);
  }
  while (total > 21 && aces > 0) { total -= 10; aces--; }
  return total;
}

function isBJ(cards) { return cards.length === 2 && handVal(cards) === 21; }
function isRed(c)    { return c.suit === '♥' || c.suit === '♦'; }

// ── Helpers ────────────────────────────────────────────────────────────────
const $ = id => document.getElementById(id);
const delay = ms => new Promise(r => setTimeout(r, ms));
const fmt = n => '$' + n.toLocaleString();

function updateBalance() { $('balance-display').textContent = 'Balance: ' + fmt(g.balance); }
function updateRecord()  { $('record').innerHTML = `W: ${g.wins} &nbsp;|&nbsp; L: ${g.losses} &nbsp;|&nbsp; P: ${g.pushes}`; }
function updateBet()     { $('bet-display').textContent = 'Bet: ' + fmt(g.bet); }
function updateDealBtn() { $('deal-btn').disabled = (g.bet < 10 || g.bet > g.balance); }

function showPhase(phase) {
  $('betting-controls').classList.toggle('hidden', phase !== 'betting');
  $('playing-controls').classList.toggle('hidden', phase !== 'playing');
  $('result-controls') .classList.toggle('hidden', phase !== 'result');
  if (phase === 'playing') {
    const twoCards = g.playerCards.length === 2;
    $('double-btn').classList.toggle('hidden', !twoCards || g.bet > g.balance);
    $('split-btn').classList.toggle('hidden',
      !twoCards || g.playerCards[0].value !== g.playerCards[1].value || g.bet > g.balance);
  }
}

function showHandVal(elId, cards, hide) {
  $(elId).textContent = hide ? '' : (handVal(cards) > 21 ? handVal(cards) + ' — Bust' : handVal(cards));
}

function banner(cls, text) {
  const b = $('result-banner');
  b.className = '';
  b.textContent = text;
  b.offsetHeight; // reflow
  b.className = 'show ' + cls;
}

function hideBanner() {
  const b = $('result-banner');
  b.className = '';
  b.textContent = '';
}

// ── Card DOM ───────────────────────────────────────────────────────────────
function cardHTML(c) {
  return `<div class="card-corner tl"><div class="cv">${c.value}</div><div class="cs">${c.suit}</div></div>
          <div class="cb">${c.suit}</div>
          <div class="card-corner br"><div class="cv">${c.value}</div><div class="cs">${c.suit}</div></div>`;
}

function makeCard(c, faceDown) {
  const el = document.createElement('div');
  el.className = 'card' + (faceDown ? ' face-down' : '');

  const inner = document.createElement('div');
  inner.className = 'card-inner';

  const front = document.createElement('div');
  front.className = 'card-front ' + (isRed(c) ? 'red' : 'black');
  front.innerHTML = cardHTML(c);

  const back = document.createElement('div');
  back.className = 'card-back';

  inner.appendChild(front);
  inner.appendChild(back);
  el.appendChild(inner);
  return el;
}

async function dealCard(rowEl, card, faceDown) {
  const el = makeCard(card, true); // always start face-down
  el.style.opacity = '0';
  rowEl.appendChild(el);

  // Offset from deck to card's resting spot
  const dr = $('deck').getBoundingClientRect();
  const cr = el.getBoundingClientRect();
  const dx = dr.left + dr.width  / 2 - (cr.left + cr.width  / 2);
  const dy = dr.top  + dr.height / 2 - (cr.top  + cr.height / 2);

  el.style.transform = `translate(${dx}px, ${dy}px)`;
  await delay(16);

  const SLIDE_MS  = 460;
  const FLIP_LAG  = 130; // ms after slide starts before flip begins
  const FLIP_MS   = SLIDE_MS - FLIP_LAG; // so both finish together

  // Start slide
  el.style.transition = `transform ${SLIDE_MS}ms cubic-bezier(0.2,0.8,0.25,1), opacity 0.15s ease`;
  el.style.transform = '';
  el.style.opacity   = '1';

  if (!faceDown) {
    // Flip starts slightly after, finishes with the slide
    setTimeout(() => {
      const inner = el.querySelector('.card-inner');
      inner.style.transition = `transform ${FLIP_MS}ms ease`;
      el.classList.remove('face-down');
    }, FLIP_LAG);
  }

  await delay(SLIDE_MS + 20);
  el.style.transition = '';
  if (!faceDown) el.querySelector('.card-inner').style.transition = '';

  return el;
}

async function flipHoleCard(el) {
  const inner = el.querySelector('.card-inner');
  inner.style.transition = 'transform 0.38s ease';
  el.classList.remove('face-down');
  await delay(400);
  inner.style.transition = '';
}

// ── Betting ────────────────────────────────────────────────────────────────
function addChip(amt) {
  if (g.phase !== 'betting' || g.busy) return;
  if (g.bet + amt > g.balance) return;
  g.bet += amt;
  updateBet();
  updateDealBtn();

  const chip = document.createElement('div');
  chip.className = `pc c${amt}`;
  chip.textContent = '$' + amt;
  $('chip-stack').appendChild(chip);
}

function clearBet() {
  if (g.phase !== 'betting' || g.busy) return;
  g.bet = 0;
  updateBet();
  updateDealBtn();
  $('chip-stack').innerHTML = '';
}

// ── Game flow ──────────────────────────────────────────────────────────────
async function startHand() {
  if (g.bet < 10 || g.bet > g.balance || g.busy) return;
  g.busy = true;
  g.phase = 'playing';
  g.playerCards = [];
  g.dealerCards = [];
  $('player-cards').innerHTML = '';
  $('dealer-cards').innerHTML = '';
  hideBanner();
  showPhase('none');
  $('player-value').textContent = '';
  $('dealer-value').textContent = '';

  // Deal order: player, dealer, player, dealer(hole)
  const c1 = draw(); g.playerCards.push(c1);
  await dealCard($('player-cards'), c1, false);

  const c2 = draw(); g.dealerCards.push(c2);
  await dealCard($('dealer-cards'), c2, false);

  const c3 = draw(); g.playerCards.push(c3);
  await dealCard($('player-cards'), c3, false);

  const hole = draw(); g.dealerCards.push(hole);
  await dealCard($('dealer-cards'), hole, true);

  showHandVal('player-value', g.playerCards, false);
  showHandVal('dealer-value', g.dealerCards, true);

  if (isBJ(g.playerCards)) {
    updateAdvisor('blackjack');
    await resolveHand();
    return;
  }

  g.busy = false;
  showPhase('playing');
  getAIAdvice();
}

async function playerHit() {
  if (g.phase !== 'playing' || g.busy) return;
  g.busy = true;
  showPhase('none');

  const c = draw(); g.playerCards.push(c);
  await dealCard($('player-cards'), c, false);
  const hv = handVal(g.playerCards);
  const hvStr = hv > 21 ? hv + ' — Bust' : String(hv);
  $('player-value').textContent = g.splitCard || g.hand1 ? 'Hand ' + (g.hand1 ? '2' : '1') + ': ' + hvStr : hvStr;

  if (hv > 21) {
    if (g.splitCard) { await startHand2(); return; }
    updateAdvisor('busted');
    await resolveHand();
    return;
  }

  g.busy = false;
  showPhase('playing');
  getAIAdvice();
}

async function playerStand() {
  if (g.phase !== 'playing' || g.busy) return;
  g.busy = true;
  showPhase('none');
  if (g.splitCard) { await startHand2(); return; }
  await resolveHand();
}

async function playerDouble() {
  if (g.phase !== 'playing' || g.busy || g.playerCards.length !== 2 || g.bet > g.balance) return;
  g.busy = true;
  g.bet *= 2;
  updateBet();
  showPhase('none');

  const c = draw(); g.playerCards.push(c);
  await dealCard($('player-cards'), c, false);
  showHandVal('player-value', g.playerCards, false);

  await resolveHand();
}

async function playerSplit() {
  if (g.phase !== 'playing' || g.busy || g.playerCards.length !== 2) return;
  if (g.playerCards[0].value !== g.playerCards[1].value || g.bet > g.balance) return;
  g.busy = true;
  showPhase('none');

  // Hold second card for hand 2; deal a new card to hand 1
  g.splitCard = g.playerCards.pop();
  g.splitBet  = g.bet;
  const c1 = draw(); g.playerCards.push(c1);

  $('player-cards').innerHTML = '';
  for (const c of g.playerCards) await dealCard($('player-cards'), c, false);
  $('player-value').textContent = 'Hand 1: ' + handVal(g.playerCards);

  g.busy = false;
  showPhase('playing');
  getAIAdvice();
}

async function startHand2() {
  // Save hand 1 and switch to hand 2
  g.hand1     = { cards: [...g.playerCards], bet: g.bet };
  g.playerCards = [g.splitCard];
  g.bet         = g.splitBet;
  g.splitCard   = null;
  g.splitBet    = 0;

  const c2 = draw(); g.playerCards.push(c2);
  $('player-cards').innerHTML = '';
  for (const c of g.playerCards) await dealCard($('player-cards'), c, false);
  $('player-value').textContent = 'Hand 2: ' + handVal(g.playerCards);

  if (handVal(g.playerCards) >= 21) {
    await resolveHand();
    return;
  }

  g.busy = false;
  showPhase('playing');
  getAIAdvice();
}

async function resolveHand() {
  // Show dealer-turn message (only when player didn't bust — bust message stays otherwise)
  if (handVal(g.playerCards) <= 21) updateAdvisor('dealer');

  // Flip hole card
  const holeEl = $('dealer-cards').querySelector('.face-down');
  if (holeEl) await flipHoleCard(holeEl);
  showHandVal('dealer-value', g.dealerCards, false);

  // Dealer draws until 17+
  while (handVal(g.dealerCards) < 17) {
    await delay(280);
    const c = draw(); g.dealerCards.push(c);
    await dealCard($('dealer-cards'), c, false);
    showHandVal('dealer-value', g.dealerCards, false);
  }

  await delay(200);

  const pv = handVal(g.playerCards);
  const dv = handVal(g.dealerCards);
  const pBJ = isBJ(g.playerCards);
  const dBJ = isBJ(g.dealerCards);

  let outcome;
  if (pBJ && dBJ)    outcome = 'push';
  else if (pBJ)      outcome = 'bj';
  else if (pv > 21)  outcome = 'loss';
  else if (dv > 21)  outcome = 'win';
  else if (pv > dv)  outcome = 'win';
  else if (pv < dv)  outcome = 'loss';
  else               outcome = 'push';

  if (outcome === 'bj') {
    const gain = Math.floor(g.bet * 1.5);
    g.balance += gain;
    g.wins++;
    banner('bj', '🦖 DINO-JACK!  +' + fmt(gain));
  } else if (outcome === 'win') {
    g.balance += g.bet;
    g.wins++;
    banner('win', dv > 21 ? '🦴 Rex Busts  +' + fmt(g.bet) : '🦕 You Win  +' + fmt(g.bet));
  } else if (outcome === 'push') {
    g.pushes++;
    banner('push', '🦴 Standoff');
  } else {
    g.balance -= g.bet;
    g.losses++;
    banner('loss', pv > 21 ? '💀 Fossilized  −' + fmt(g.bet) : '🦖 Rex Wins  −' + fmt(g.bet));
  }

  // Settle hand 1 of a split against the same dealer total
  if (g.hand1) {
    const pv1 = handVal(g.hand1.cards);
    let o1;
    if (pv1 > 21)      o1 = 'loss';
    else if (dv > 21)  o1 = 'win';
    else if (pv1 > dv) o1 = 'win';
    else if (pv1 < dv) o1 = 'loss';
    else               o1 = 'push';
    if (o1 === 'win')  { g.balance += g.hand1.bet; g.wins++; }
    else if (o1 === 'loss') { g.balance -= g.hand1.bet; g.losses++; }
    else               g.pushes++;
    g.hand1 = null;
  }

  updateBalance();
  updateRecord();
  updateAdvisor('result', outcome);
  g.phase = 'result';
  g.busy  = false;

  if (g.balance <= 0) {
    await delay(1100);
    $('broke-overlay').classList.add('show');
  } else {
    showPhase('result');
  }
}

function nextHand() {
  g.phase = 'betting';
  g.bet   = 0;
  g.splitCard = null; g.splitBet = 0; g.hand1 = null;
  $('chip-stack').innerHTML = '';
  updateBet();
  updateDealBtn();
  hideBanner();
  showPhase('betting');
  updateAdvisor('idle');
}

function newGame() {
  g.phase    = 'betting';
  g.busy     = false;
  g.balance  = 1000;
  g.wins = g.losses = g.pushes = 0;
  g.bet  = 0;
  g.splitCard = null; g.splitBet = 0; g.hand1 = null;
  g.playerCards = [];
  g.dealerCards = [];
  $('player-cards').innerHTML = '';
  $('dealer-cards').innerHTML = '';
  $('player-value').textContent = '';
  $('dealer-value').textContent = '';
  $('chip-stack').innerHTML  = '';
  $('broke-overlay').classList.remove('show');
  hideBanner();
  updateBalance();
  updateRecord();
  updateBet();
  updateDealBtn();
  showPhase('betting');
  updateAdvisor('idle');
}

// ══════════════════════════════════════════════════════════════════════════
//  ADVISOR — AI-Powered (Anthropic API)
// ══════════════════════════════════════════════════════════════════════════

let advisorEnabled = localStorage.getItem('advisorEnabled') !== 'false';
let openaiApiKey = '';
let requestCounter = 0;

function isSoft(cards) {
  if (!cards.some(c => c.value === 'A')) return false;
  let nonAceTotal = 0;
  for (const c of cards) {
    if (c.value === 'A') continue;
    nonAceTotal += 'JQK'.includes(c.value) ? 10 : parseInt(c.value);
  }
  return nonAceTotal + 11 <= 21;
}

// ── Strategy stats helpers ─────────────────────────────────────────────────
const DEALER_BUST_PCT = {
  '2': 35, '3': 38, '4': 40, '5': 43, '6': 42,
  '7': 26, '8': 24, '9': 23, '10': 21, 'J': 21, 'Q': 21, 'K': 21, 'A': 12
};

function calcBustPct() {
  const remaining = g.shoe.slice(g.dealtCount);
  if (!remaining.length) return 0;
  const busts = remaining.filter(c => handVal([...g.playerCards, c]) > 21).length;
  return Math.round(busts / remaining.length * 100);
}

function updateStrategyStats(action, canDouble, canSplit) {
  const statsEl = $('strategy-stats');
  if (!statsEl) return;

  const soft = isSoft(g.playerCards);
  const total = handVal(g.playerCards);
  const bustPct = calcBustPct();
  const dBustPct = DEALER_BUST_PCT[g.dealerCards[0]?.value] ?? 0;

  $('stat-hand-badge').textContent = (soft ? 'Soft ' : 'Hard ') + total;
  $('pill-double').classList.toggle('hidden', !canDouble);
  $('pill-split').classList.toggle('hidden', !canSplit);

  ['pill-hit', 'pill-stand', 'pill-double', 'pill-split'].forEach(id => $(id).classList.remove('active'));
  const norm = action?.toUpperCase().replace(/[^A-Z]/g, '');
  const pillMap = { HIT: 'pill-hit', STAND: 'pill-stand', DOUBLE: 'pill-double', SPLIT: 'pill-split' };
  if (pillMap[norm]) $(pillMap[norm]).classList.add('active');

  // Reset bars to 0, unhide, then animate to target values
  $('stat-bust-bar').style.width = '0%';
  $('stat-dealer-bar').style.width = '0%';
  statsEl.classList.remove('hidden');
  requestAnimationFrame(() => requestAnimationFrame(() => {
    $('stat-bust-bar').style.width = bustPct + '%';
    $('stat-bust-pct').textContent = bustPct + '%';
    $('stat-dealer-bar').style.width = dBustPct + '%';
    $('stat-dealer-pct').textContent = dBustPct + '%';
  }));
}

function clearStrategyStats() {
  $('strategy-stats')?.classList.add('hidden');
}

// ── API key UI ─────────────────────────────────────────────────────────────
function parseKeyFile(content, filename) {
  const lower = filename.toLowerCase();
  if (lower.endsWith('.env') || lower === '.env') {
    for (const line of content.split('\n')) {
      const m = line.match(/^\s*([\w_]+)\s*=\s*(.+)\s*$/);
      if (!m) continue;
      const k = m[1].toLowerCase();
      const v = m[2].trim().replace(/^["']|["']$/g, '');
      if (k.includes('openai')) return v;
    }
  } else if (lower.endsWith('.csv')) {
    const lines = content.split('\n').map(l => l.trim()).filter(Boolean);
    let start = 0;
    if (lines.length > 0) {
      const first = lines[0].toLowerCase();
      if (first.includes('provider') || (first.includes('key') && !first.startsWith('sk-'))) start = 1;
    }
    for (let i = start; i < lines.length; i++) {
      const parts = lines[i].split(',').map(p => p.trim());
      if (parts.length < 2) continue;
      if (parts[0].toLowerCase().includes('openai')) return parts[1];
    }
  }
  return null;
}

function handleKeyFile(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const key = parseKeyFile(e.target.result, file.name);
    if (!key) {
      $('drop-zone-msg').textContent = 'No OpenAI key found — check file format.';
      $('drop-zone-msg').style.color = '#e05050';
      return;
    }
    applyKey(key);
  };
  reader.readAsText(file);
}

function pasteKey() {
  const input = $('paste-key-input');
  const key = input.value.trim();
  if (!key) return;
  input.value = '';
  applyKey(key);
}

function applyKey(key) {
  openaiApiKey = key;
  $('api-key-entry').classList.add('hidden');
  $('api-key-masked').textContent = key.slice(0, 7) + '••••••••' + key.slice(-4);
  $('api-key-saved').classList.remove('hidden');
  if (advisorEnabled && g.phase === 'betting') updateAdvisor('idle');
}

function changeApiKey() {
  openaiApiKey = '';
  $('api-key-saved').classList.add('hidden');
  $('api-key-entry').classList.remove('hidden');
  $('drop-zone-msg').textContent = 'Drop .env or .csv key file here';
  $('drop-zone-msg').style.color = '';
}

// ── AI advice call ─────────────────────────────────────────────────────────
async function getAIAdvice() {
  if (!advisorEnabled) return;
  if (!openaiApiKey) {
    $('advisor-action').textContent = 'Load your API key above to activate Dr. Fossil.';
    $('advisor-reason').textContent = '';
    return;
  }

  const myRequest = ++requestCounter;
  const panel    = $('advisor-panel');
  const actionEl = $('advisor-action');
  const reasonEl = $('advisor-reason');

  actionEl.textContent = 'Thinking…';
  reasonEl.textContent = '';
  panel.classList.add('advisor-loading');

  const canDouble = g.playerCards.length === 2;
  const canSplit  = g.playerCards.length === 2 &&
    g.playerCards[0].value === g.playerCards[1].value;

  const handStr = g.playerCards.map(c => c.value + c.suit).join(', ');
  const total   = handVal(g.playerCards);
  const softPfx = isSoft(g.playerCards) ? 'soft ' : '';
  const dealer  = g.dealerCards[0];

  const options = ['Hit', 'Stand'];
  if (canDouble) options.push('Double Down');
  if (canSplit)  options.push('Split');

  const systemPrompt =
    'You are Dr. Fossil, a witty Jurassic-themed blackjack advisor. You give sharp, confident advice ' +
    'in one short sentence, with a subtle dinosaur flavour. Never be verbose.';

  const userPrompt =
    `Player hand: [${handStr}] (${softPfx}${total})\n` +
    `Dealer shows: ${dealer.value}${dealer.suit}\n` +
    `Bet: $${g.bet} | Balance: $${g.balance}\n` +
    `Options available: ${options.join(', ')}\n\n` +
    `What should the player do? Reply with the action first (HIT / STAND / DOUBLE / SPLIT), ` +
    `then one sentence of reasoning. Keep it under 20 words total.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 80,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user',   content: userPrompt },
        ],
      }),
    });

    if (myRequest !== requestCounter) return;
    const data = await response.json();
    if (myRequest !== requestCounter) return;

    panel.classList.remove('advisor-loading');

    if (!response.ok) {
      actionEl.textContent = 'API Error';
      reasonEl.textContent = data.error?.message || 'Unknown error.';
      return;
    }

    const text = data.choices[0].message.content.trim();
    const spaceIdx = text.indexOf(' ');
    const validActions = ['HIT', 'STAND', 'DOUBLE', 'SPLIT'];

    if (spaceIdx !== -1) {
      const firstWord = text.slice(0, spaceIdx).toUpperCase().replace(/[^A-Z]/g, '');
      if (validActions.includes(firstWord)) {
        actionEl.textContent = text.slice(0, spaceIdx);
        reasonEl.textContent = text.slice(spaceIdx + 1).trim();
        updateStrategyStats(firstWord, canDouble, canSplit);
        return;
      }
    }

    // fallback: unrecognised action word
    actionEl.textContent = text;
    reasonEl.textContent = '';
    updateStrategyStats(null, canDouble, canSplit);

  } catch {
    if (myRequest !== requestCounter) return;
    panel.classList.remove('advisor-loading');
    actionEl.textContent = 'Network Error';
    reasonEl.textContent = 'Check your API key and try again.';
  }
}

// ── Advisor display (non-playing states) ──────────────────────────────────
function updateAdvisor(state, extraData) {
  const panel    = $('advisor-panel');
  const actionEl = $('advisor-action');
  const reasonEl = $('advisor-reason');

  if (!advisorEnabled || !panel) return;

  if (state === 'idle') {
    clearStrategyStats();
    actionEl.textContent = openaiApiKey
      ? 'Place your bet and deal!'
      : 'Load your API key above to activate Dr. Fossil.';
    reasonEl.textContent = '';
    return;
  }

  if (state === 'blackjack') {
    clearStrategyStats();
    actionEl.textContent = 'Blackjack! 🎉';
    reasonEl.textContent = 'Perfect hand — collect that 3:2 bonus!';
    return;
  }

  if (state === 'busted') {
    clearStrategyStats();
    actionEl.textContent = 'Busted!';
    reasonEl.textContent = 'Tough break — shake it off.';
    return;
  }

  if (state === 'dealer') {
    clearStrategyStats();
    actionEl.textContent = 'Waiting for dealer...';
    reasonEl.textContent = '';
    return;
  }

  if (state === 'result') {
    clearStrategyStats();
    const outcome = extraData;
    if (outcome === 'bj') {
      actionEl.textContent = 'Blackjack! 🎉';
      reasonEl.textContent = 'Dinosaur-sized win!';
    } else if (outcome === 'win') {
      actionEl.textContent = 'Nice hand!';
      reasonEl.textContent = 'Well played — on to the next one!';
    } else if (outcome === 'push') {
      actionEl.textContent = 'Push.';
      reasonEl.textContent = 'A tie — your chips live to fight another round.';
    } else {
      actionEl.textContent = 'Better luck next time.';
      reasonEl.textContent = 'Stay patient — the fossils will turn in your favor.';
    }
  }
}

function toggleAdvisor() {
  advisorEnabled = !advisorEnabled;
  localStorage.setItem('advisorEnabled', advisorEnabled);
  const btn   = $('advisor-toggle');
  const panel = $('advisor-panel');
  btn.textContent = 'Advisor: ' + (advisorEnabled ? 'ON' : 'OFF');
  btn.classList.toggle('active', advisorEnabled);
  panel.classList.toggle('hidden', !advisorEnabled);
  if (!advisorEnabled) {
    requestCounter++; // cancel any in-flight request
    panel.classList.remove('advisor-loading');
    $('advisor-action').textContent = '';
    $('advisor-reason').textContent = '';
    clearStrategyStats();
  } else if (g.phase === 'betting') {
    updateAdvisor('idle');
  }
}

// ── Init ───────────────────────────────────────────────────────────────────
g.shoe = buildShoe();
updateBalance();
updateRecord();
updateDealBtn();
showPhase('betting');

// Apply saved advisor toggle state on load
(function initAdvisor() {
  const btn   = $('advisor-toggle');
  const panel = $('advisor-panel');
  btn.textContent = 'Advisor: ' + (advisorEnabled ? 'ON' : 'OFF');
  btn.classList.toggle('active', advisorEnabled);
  panel.classList.toggle('hidden', !advisorEnabled);
  updateAdvisor('idle');

  // Drop zone events
  const dz = $('drop-zone');
  dz.addEventListener('dragover', e => { e.preventDefault(); dz.classList.add('drag-over'); });
  dz.addEventListener('dragleave', () => dz.classList.remove('drag-over'));
  dz.addEventListener('drop', e => {
    e.preventDefault();
    dz.classList.remove('drag-over');
    handleKeyFile(e.dataTransfer.files[0]);
  });
  $('key-file-input').addEventListener('change', e => handleKeyFile(e.target.files[0]));
}());
