// ── State ──────────────────────────────────────────────────────────────────
const g = {
  phase: 'betting',   // betting | playing | result
  busy: false,
  balance: 1000,
  bet: 0,
  wins: 0, losses: 0, pushes: 0,
  shoe: [], dealtCount: 0,
  playerCards: [], dealerCards: []
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
    await resolveHand();
    return;
  }

  g.busy = false;
  showPhase('playing');
}

async function playerHit() {
  if (g.phase !== 'playing' || g.busy) return;
  g.busy = true;
  showPhase('none');

  const c = draw(); g.playerCards.push(c);
  await dealCard($('player-cards'), c, false);
  showHandVal('player-value', g.playerCards, false);

  if (handVal(g.playerCards) > 21) {
    await resolveHand();
    return;
  }

  g.busy = false;
  showPhase('playing');
}

async function playerStand() {
  if (g.phase !== 'playing' || g.busy) return;
  g.busy = true;
  showPhase('none');
  await resolveHand();
}

async function resolveHand() {
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

  updateBalance();
  updateRecord();
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
  $('chip-stack').innerHTML = '';
  updateBet();
  updateDealBtn();
  hideBanner();
  showPhase('betting');
}

function newGame() {
  g.phase    = 'betting';
  g.busy     = false;
  g.balance  = 1000;
  g.wins = g.losses = g.pushes = 0;
  g.bet  = 0;
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
}

// ── Init ───────────────────────────────────────────────────────────────────
g.shoe = buildShoe();
updateBalance();
updateRecord();
updateDealBtn();
showPhase('betting');
