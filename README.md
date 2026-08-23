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
- Raven, Bambi, Candy, Cherry, and Dallas are reserved for later recruitment.
- Training costs $5,000 and removes the performer from revenue generation for 4 weeks while her contract continues counting down.
- Completed training advances one rank and increases her revenue contribution by 25%.
- After training, her weekly contract demand randomly rises by 0%, 5%, 10%, 15%, 20%, or 25%.

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
- Property tax: $100
- Operations: $500
- Advertising: $100
- Sheriff: $100
- Starting projected net: $500/week

## Planned, not yet implemented
- Performer contract marketplace
- Promotional nights (-10% to +25% prototype range)
- Facility and building artwork by level (missing art intentionally uses placeholders)
- Managers beyond Ted
- Multiple locations
- Hidden randomized location preferences
- Performer physical traits and specialties
- Travel and international expansion

The prototype should stay simple until the Belton economy is fun and understandable.
