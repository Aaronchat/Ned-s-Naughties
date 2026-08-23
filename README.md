# Ned's Naughties

A lightweight, mobile-first management game prototype inspired by old-school buy/sell management games.

## V0.1 — Belton Prototype

The first build deliberately focuses on one club in Belton, Texas so the core economy can be tested before adding cities, hidden location preferences, travel, advanced managers, specialties, or international properties.

### Starting state
- Cash: $10,000
- Building: Level 1 / 5
- Capacity: 2 performers at Level 1
- Starting performer: Zella
- Ted is the free friend/manager flavor character

### Facilities
Seven independently upgraded facilities:
1. Bar
2. Main Stage
3. VIP
4. Private Dance Area
5. DJ Booth
6. Dressing Room
7. Parking Lot

Each facility upgrade adds 5% to gross club revenue. Level 1 → 2 costs $1,000. Costs currently double at each subsequent facility level for easy prototype tuning.

All seven facilities must reach the next level before the Building itself can advance. Building upgrades begin at $2,000 and currently double by level.

Prototype building capacity: 2 / 3 / 4 / 5 / 6 performers.

### Performer contracts
- Every performer begins Rank F.
- Starting weekly contract cost: $200.
- Contract duration: 26 weeks.
- Zella is the starting performer.
- Raven, Bambi, Candy, Cherry, and Dallas appear in the Belton contract market.
- V0.1 hiring uses a $1,000 signing fee and must respect current building capacity.
- Early renewal offers a random 5-10% discount against the performer's current weekly rate and resets the contract to 26 weeks.
- Natural expiration moves the performer to Former Performers. Rehire keeps rank/history and adds a 10-20% ex-employee premium.
- Firing costs 50% of remaining contract value and moves the performer to Former Performers. Rehire keeps rank/history and adds a 20-35% fired-employee premium.
- Training costs $5,000 and removes the performer from revenue generation for 4 weeks while her contract continues counting down.
- Completed training advances one rank and increases her revenue contribution by 25%.
- After training, her weekly contract demand randomly rises by 0%, 5%, 10%, 15%, 20%, or 25%.

### Building operating expenses
| Building | Property Tax | Operations | Advertising | Sheriff |
| --- | ---: | ---: | ---: | ---: |
| L1 | $100 | $500 | $100 | $100 |
| L2 | $200 | $750 | $150 | $150 |
| L3 | $400 | $1,250 | $250 | $250 |
| L4 | $750 | $2,000 | $400 | $400 |
| L5 | $1,250 | $3,500 | $750 | $750 |

### Asset structure
- Building Level 1: `assets/buildings/neds-naughtiest-building-level-1.jpeg`
- Raven: `assets/performers/raven.jpeg`
- Bambi: `assets/performers/bambi.jpeg`
- Candy: `assets/performers/candy.jpeg`
- Cherry: `assets/performers/cherry.jpeg`
- Zella: `assets/performers/zella.jpeg`
- Dallas: `assets/performers/dallas.jpeg`

Missing future artwork intentionally falls back to in-game placeholders.

### Starting weekly economy
- Gross revenue: $1,500 with one working F-rank performer before facility bonuses
- Performer contract: $200
- Building Level 1 operating expenses: $800 total
- Starting projected net: $500/week

### Save and reset
- The browser saves locally after meaningful actions.
- New Game clears the local save and returns to the canonical Week 1 setup.

## V1.5 — Promotions & Random Events

- Promotional nights can be bought once per category each week.
- Promotion cost is `$1,000 x Building Level`.
- Each promotion rolls from -25% to +25% in 5% steps and applies to that week's revenue.
- Advancing a week has roughly a 35% chance to trigger one random event.
- Events include cash gains/losses, robberies, Sheriff Longhorns mood swings, performer injuries, and the hot-air-balloon champagne bottle disaster.
- Injured performers stay employed, keep costing money, occupy roster capacity, cannot train, and generate $0 until recovered.
- Major actions and weekly surprises are recorded in Club History.
- The Weekly Ledger separates performer revenue, facility effects, promotions, expenses, transactions, random events, and final net.

## Planned, not yet implemented
- Managers beyond Ted
- Multiple locations
- Hidden randomized location preferences
- Performer physical traits and specialties
- Travel and international expansion

The prototype should stay simple until the Belton economy is fun and understandable.
