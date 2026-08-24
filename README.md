# Ned's Naughties

A lightweight, mobile-first strip-club management game set in Belton, Texas. It uses plain HTML, CSS, and JavaScript: no build step, package install, React, or Vite.

## Run the game

Open `index.html` in a browser. The game saves automatically in that browser using the existing save key:

`neds-naughties-v01-save`

Old saves using that key continue through the built-in save migration and cleanup.

## Current game: v1.7

### Starting state

- Cash: $10,000
- Building: Level 1 of 5
- Capacity: 2 performers at Level 1
- Starting performer: Zella
- Starting gross revenue: $1,500 before facility bonuses
- Starting projected net: $400 per week

### Buildings and facilities

The seven facilities are Bar, Main Stage, VIP, Private Dance Area, DJ Booth, Dressing Room, and Parking Lot.

Each facility level above Level 1 adds 5% to gross club revenue. A facility upgrade starts at $1,000 and doubles at each level. All seven facilities must reach the next level before the building can advance. Building upgrades start at $2,000 and also double at each level.

Building capacity is 2 / 3 / 4 / 5 / 6 performers across Levels 1–5.

### Performers and contracts

- The current pool includes Zella, Raven, Bambi, Candy, Cherry, Dallas, Cinnamon, and Lola.
- Performers are ranked F, E, D, C, B, or A.
- Rank determines both weekly revenue and the performer's share.
- Contracts last 26 weeks.
- Hiring or rehiring costs a $1,000 signing fee and respects building capacity.
- Renewal opens only when exactly 1 week remains.
- Each contract gets one renewal offer, from $1,000 to $5,000, with higher acceptance odds for larger offers.
- A rejected renewal costs nothing, but no second offer is allowed on that contract.
- Firing costs 50% of the remaining contract value.
- Expired or fired performers move to Former Performers and may return to the market.
- Training costs $5,000, lasts 4 weeks, and advances one rank.
- Training is disabled at Rank A.

Rank pay shares are F 20%, E 25%, D 30%, C 35%, B 40%, and A 50%.

### Promotions, events, and ledger

- One promotion per category may be bought each week.
- Promotion cost is $1,000 times the current Building Level.
- Promotion results are -100%, -75%, -50%, -25%, 0%, +25%, +50%, +75%, or +100%.
- Weekly random events can affect cash, Sheriff expenses, injuries, and performer availability.
- The Weekly Ledger separates performer revenue, facility effects, promotions, random events, one-time transactions, recurring expenses, and final net.
- Club History records major purchases, contract changes, promotions, and weekly surprises.
- Random events open as large notifications.
- A performer reaching 1 contract week remaining triggers a large renewal warning with a direct link to her profile.
- Every ledger category displays its own subtotal.
- Advance One Week stays visible below the collapsible Weekly Ledger.

### Building expenses

| Building | Property Tax | Operations | Advertising | Sheriff |
| --- | ---: | ---: | ---: | ---: |
| L1 | $100 | $500 | $100 | $100 |
| L2 | $200 | $750 | $150 | $150 |
| L3 | $400 | $1,250 | $250 | $250 |
| L4 | $750 | $2,000 | $400 | $400 |
| L5 | $1,250 | $3,500 | $750 | $750 |

## Code structure

- `index.html` — screen layout and script-loading order
- `styles.css` — all visual styling
- `assets/buildings/` — Building Level 1–5 artwork
- `assets/performers/` — performer portraits
- `src/data.js` — game constants, performer records, and asset paths
- `src/state.js` — new game state, browser saves, migration, history, and selected profile
- `src/economy.js` — revenue, expenses, promotions, events, ledger math, and weekly settlement
- `src/contracts.js` — hiring, renewals, firing, former performers, and market rules
- `src/training.js` — training and rank advancement
- `src/upgrades.js` — facility and building upgrades
- `src/render.js` — all screen drawing
- `src/main.js` — button connections and startup

The files are ordinary browser scripts loaded in that order. Keep the order in `index.html` unless their dependencies are deliberately changed.

## Planned, not implemented

- Managers beyond Ted
- Multiple cities and locations
- Hidden location preferences
- Performer physical traits and specialties
- Travel and international expansion

The current Belton game should remain simple until its economy and weekly loop are fully tuned.
