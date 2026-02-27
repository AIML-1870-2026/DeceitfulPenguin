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
    updateAdvisor('blackjack');
    await resolveHand();
    return;
  }

  g.busy = false;
  showPhase('playing');
  updateAdvisor('playing');
}

async function playerHit() {
  if (g.phase !== 'playing' || g.busy) return;
  g.busy = true;
  showPhase('none');

  const c = draw(); g.playerCards.push(c);
  await dealCard($('player-cards'), c, false);
  showHandVal('player-value', g.playerCards, false);

  if (handVal(g.playerCards) > 21) {
    updateAdvisor('busted');
    await resolveHand();
    return;
  }

  g.busy = false;
  showPhase('playing');
  updateAdvisor('playing');
}

async function playerStand() {
  if (g.phase !== 'playing' || g.busy) return;
  g.busy = true;
  showPhase('none');
  await resolveHand();
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
//  ADVISOR — Basic Strategy engine
// ══════════════════════════════════════════════════════════════════════════

let advisorEnabled = localStorage.getItem('advisorEnabled') !== 'false';

// Numeric value of a single card for strategy lookup (Ace = 11)
function cardNumVal(card) {
  if (card.value === 'A') return 11;
  if ('JQK'.includes(card.value)) return 10;
  return parseInt(card.value);
}

// True if the hand contains an Ace that can still be counted as 11
function isSoft(cards) {
  if (!cards.some(c => c.value === 'A')) return false;
  let nonAceTotal = 0;
  for (const c of cards) {
    if (c.value === 'A') continue;
    nonAceTotal += 'JQK'.includes(c.value) ? 10 : parseInt(c.value);
  }
  return nonAceTotal + 11 <= 21;
}

// ── Pure strategy function ─────────────────────────────────────────────────
// Source: 6-deck, dealer stands on soft 17, blackjack-strategy.co
// Returns { action: string, reason: string }
function getRecommendation(playerHand, dealerUpcard, canDouble, canSplit) {
  const pTotal = handVal(playerHand);
  const dVal   = cardNumVal(dealerUpcard); // 2–11 (Ace = 11)
  const dWeak  = dVal >= 2 && dVal <= 6;  // dealer bust zone

  // ── 1. Pairs ────────────────────────────────────────────────────────────
  if (canSplit && playerHand.length === 2) {
    const pv = cardNumVal(playerHand[0]);

    if (pv === cardNumVal(playerHand[1])) {
      let shouldSplit = false;

      if      (pv === 11) shouldSplit = true;                        // A-A: always SP
      else if (pv === 10) shouldSplit = false;                       // 10-10: always S
      else if (pv === 9)  shouldSplit = dWeak || dVal === 8 || dVal === 9; // SP vs 2-6,8-9 | S vs 7,10,A
      else if (pv === 8)  shouldSplit = true;                        // 8-8: always SP
      else if (pv === 7)  shouldSplit = dWeak || dVal === 7;         // SP vs 2-7 | H vs 8+
      else if (pv === 6)  shouldSplit = dWeak;                       // SP vs 2-6 | H vs 7+
      else if (pv === 5)  shouldSplit = false;                       // 5-5: never SP — treat as hard 10
      else if (pv === 4)  shouldSplit = dVal === 5 || dVal === 6;    // SP vs 5-6 | H otherwise
      else                shouldSplit = dWeak || dVal === 7;         // 2-2 / 3-3: SP vs 2-7 | H vs 8+

      if (shouldSplit) {
        let reason;
        if      (pv === 11) reason = 'Always split Aces — maximum opportunity.';
        else if (pv === 8)  reason = 'Always split Eights — 16 is the worst hand.';
        else if (dWeak)     reason = `Dealer shows ${dealerUpcard.value} — split and let them bust.`;
        else                reason = 'Splitting gives you the best odds here.';
        return { action: 'Split', reason };
      }
    }
  }

  // ── 2. Soft hands ────────────────────────────────────────────────────────
  if (isSoft(playerHand)) {
    // A,9+ (soft 20): always stand
    if (pTotal >= 20)
      return { action: 'Stand', reason: 'Soft 20 is nearly unbeatable — stand pat.' };

    // A,8 (soft 19): always stand — no double in S17
    if (pTotal === 19)
      return { action: 'Stand', reason: 'Soft 19 is a strong hand — always stand.' };

    // A,7 (soft 18): D vs 3-6 | S vs 2,7,8 | H vs 9,10,A
    if (pTotal === 18) {
      if (canDouble && dVal >= 3 && dVal <= 6)
        return { action: 'Double Down', reason: 'Soft 18 vs weak dealer — double your advantage.' };
      if (dVal >= 9)
        return { action: 'Hit', reason: 'Dealer is strong — improve your soft 18.' };
      return { action: 'Stand', reason: 'Soft 18 — stand against dealer 2, 7, or 8.' };
    }

    // A,6 (soft 17): D vs 3-6 | H otherwise
    if (pTotal === 17) {
      if (canDouble && dVal >= 3 && dVal <= 6)
        return { action: 'Double Down', reason: `Dealer shows ${dealerUpcard.value} — double on soft 17.` };
      return { action: 'Hit', reason: "Hit soft 17 — you can't bust and can only improve." };
    }

    // A,5 / A,4 (soft 15-16): D vs 4-6 | H otherwise
    if (pTotal === 16 || pTotal === 15) {
      if (canDouble && dVal >= 4 && dVal <= 6)
        return { action: 'Double Down', reason: `Dealer shows ${dealerUpcard.value} — prime doubling spot.` };
      return { action: 'Hit', reason: "Hit — you can't bust and need a stronger hand." };
    }

    // A,3 / A,2 (soft 13-14): D vs 5-6 | H otherwise
    if (canDouble && dVal >= 5 && dVal <= 6)
      return { action: 'Double Down', reason: `Dealer shows ${dealerUpcard.value} — squeeze that doubling opportunity.` };
    return { action: 'Hit', reason: "Hit — build your hand, you can't bust with that Ace." };
  }

  // ── 3. Hard hands ────────────────────────────────────────────────────────
  if (pTotal >= 17)
    return { action: 'Stand', reason: 'Hard 17 or better — always stand.' };

  if (pTotal >= 13 && pTotal <= 16) {
    if (dWeak)
      return { action: 'Stand', reason: `Dealer shows ${dealerUpcard.value} — let them bust!` };
    return { action: 'Hit', reason: `Hard ${pTotal} vs dealer's ${dealerUpcard.value} — take the hit.` };
  }

  if (pTotal === 12) {
    // S vs 4-6 | H vs everything else (including 2-3)
    if (dVal >= 4 && dVal <= 6)
      return { action: 'Stand', reason: `Dealer shows ${dealerUpcard.value} — let them bust.` };
    return { action: 'Hit', reason: `Hard 12 vs dealer's ${dealerUpcard.value} — hit it.` };
  }

  if (pTotal === 11) {
    // D vs 2-10 | H vs A
    if (canDouble && dVal !== 11)
      return { action: 'Double Down', reason: '11 is the best doubling hand in the game!' };
    return { action: 'Hit', reason: 'Strong hitting hand — go for 21.' };
  }

  if (pTotal === 10) {
    // D vs 2-9 | H vs 10-A
    if (canDouble && dVal <= 9)
      return { action: 'Double Down', reason: `Dealer shows ${dealerUpcard.value} — strong doubling position.` };
    return { action: 'Hit', reason: 'Hit for a strong total.' };
  }

  if (pTotal === 9) {
    // D vs 3-6 | H otherwise
    if (canDouble && dVal >= 3 && dVal <= 6)
      return { action: 'Double Down', reason: `Dealer shows ${dealerUpcard.value} — press your bet on 9.` };
    return { action: 'Hit', reason: 'Hit to build a stronger hand.' };
  }

  return { action: 'Hit', reason: 'Always hit low totals.' };
}

// ── Advisor display ────────────────────────────────────────────────────────
function updateAdvisor(state, extraData) {
  const panel    = $('advisor-panel');
  const actionEl = $('advisor-action');
  const reasonEl = $('advisor-reason');

  // Always update the element text, but hide panel if toggled off
  if (!advisorEnabled || !panel) return;

  if (state === 'idle') {
    actionEl.textContent = 'Place your bet and deal!';
    reasonEl.textContent = '';
    return;
  }

  if (state === 'playing') {
    const canDouble = g.playerCards.length === 2;
    const canSplit  = g.playerCards.length === 2 &&
                      cardNumVal(g.playerCards[0]) === cardNumVal(g.playerCards[1]);
    const rec = getRecommendation(g.playerCards, g.dealerCards[0], canDouble, canSplit);
    actionEl.textContent = rec.action;
    reasonEl.textContent = rec.reason;
    return;
  }

  if (state === 'blackjack') {
    actionEl.textContent = 'Blackjack! 🎉';
    reasonEl.textContent = 'Perfect hand — collect that 3:2 bonus!';
    return;
  }

  if (state === 'busted') {
    actionEl.textContent = 'Busted!';
    reasonEl.textContent = 'Tough break — shake it off.';
    return;
  }

  if (state === 'dealer') {
    actionEl.textContent = 'Waiting for dealer...';
    reasonEl.textContent = '';
    return;
  }

  if (state === 'result') {
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
  if (advisorEnabled && g.phase === 'betting') updateAdvisor('idle');
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
}());
