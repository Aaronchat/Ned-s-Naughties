# Ned's Naughties — Living Game Design

This file is the source of truth for the conceptual redesign of Ned's Naughties.

## How to use this file

- **DECIDED** = We agreed on the direction. Do not casually redesign it later. Reopen it deliberately if needed.
- **IDEA / NOT DECIDED** = Discussed and potentially promising, but not locked in.
- **REJECTED** = We decided against it. Do not re-suggest it unless we deliberately reopen it.
- **CURRENT QUESTION** = The part of the redesign currently being worked out.

The goal is to prevent good decisions from disappearing across long ChatGPT conversations.

---

# Core Problem With Current Game

The current game has systems, but not enough meaningful player choice.

A typical loop can become:

1. Advance week.
2. Read what randomly happened.
3. Earn or lose money.
4. Buy the next obvious upgrade when affordable.
5. Repeat.

The redesign should move toward the Drug Lord 2 inspiration: randomness creates situations, but the player frequently decides how to respond.

**Core design rule:**

> Randomness creates the situation. The player decides what to do about it.

The game can have complicated calculations underneath, but the information shown to the player should remain simple and understandable.

---

# Existing Game — Keep

## DECIDED

- Weekly turn structure / Advance Week.
- Locations.
  - Belton, Texas starts owned.
  - Austin, Texas can be purchased later.
- Building progression from Level 1 through Level 5.
- Existing seven amenities remain as concepts:
  - Bar
  - Main Stage
  - VIP
  - Private Dance Area
  - DJ Booth
  - Dressing Room
  - Parking Lot
- Performer rank progression remains F → E → D → C → B → A.
- Performer training remains an important progression mechanic.
  - Current cost: $5,000 per training session.
  - Current duration: 4 weeks.
  - One rank gained per completed training session.
- Performer contracts remain.
- Cash remains a central resource.
- Performers remain a major part of club progression.

---

# Existing Game — Problems Identified

## Amenities

Currently all seven amenities are mechanically too similar. Their levels essentially act as differently named revenue bonuses.

Because all amenities must be upgraded before the building itself advances, upgrading them becomes a checklist rather than a meaningful strategic choice.

## Promotions

Current Promotions are rarely worth interacting with from a gameplay perspective. The player pays a fee and receives a random revenue result from -100% through +100%.

The named promotion and facility do not create enough distinct strategy.

## Random Events

Current random events mostly happen **to** the player rather than creating decisions.

Examples include:

- Good radio mention.
- Bad radio mention.
- Bachelor party.
- Bachelor party damage.
- Longhorns win / sheriff skips payment.
- Longhorns loss / sheriff demands a large payment.
- Robbery.
- Found wallet.
- Performer groin injury.
- Champagne bottle / hot-air-balloon performer death gag.

## Champagne Bottle Death

The unavoidable performer death/reset event is especially frustrating because it can erase a heavily trained performer and interfere with the player's natural goal of eventually having maxed clubs with full A-rank rosters.

## Property Managers

The current Ted → Susan → Barbara → Myrtle → Gertrude system is mostly an escalating salary / performer-renewal automation ladder. It does not create enough interesting management decisions.

## Ledger and History

Both are useful records but are rarely consulted during normal play. They should not become the primary way the player has to understand the simulation.

---

# Major Redesign Direction

## DECIDED

### More Player Agency

The redesign should substantially increase the number of situations where the player chooses what happens next.

Not every event must require a choice, but significant events should generally create decisions rather than simply adding or subtracting money.

### Interconnected Club Simulation

Systems should influence one another instead of operating as isolated money generators.

Broad intended relationship:

**Amenities → customer experience / attendance / performer experience**

**Performers → attendance / customer experience / revenue potential**

**Customers → actual spending / revenue**

**Revenue → upgrades / performers / staffing / expansion**

The exact formulas are NOT decided yet.

### Simple Player-Facing Information

The simulation can be complicated internally, but the player should not need to understand a spreadsheet of percentages.

Prefer understandable information such as:

- Attendance rising or falling.
- Customers are Happy / Okay / Unhappy.
- Performers are Happy / Okay / Unhappy.
- Heat is Low / Moderate / High.
- Plain-English explanations of major problems and strengths.

Exact visible stats are not yet locked in.

### Amenities Need Distinct Purposes

The seven amenities should stop being interchangeable revenue multipliers.

Each should eventually affect different parts of the club simulation.

Possible examples discussed, but exact effects are NOT locked in:

- Bar → drink spending / customer experience.
- Main Stage → entertainment / attendance / performer usefulness.
- VIP → high-roller attraction and spending.
- Private Dance Area → private-dance revenue.
- DJ Booth → atmosphere / customer experience / performer effort.
- Dressing Room → performer morale / effort.
- Parking Lot → attendance capacity / customer convenience.

### Remove Current Promotions System

The current random ± revenue Promotions system should be removed/replaced rather than expanded.

### Replace Property Managers With an Owner

The player should be the manager and answer to an owner rather than hiring increasingly powerful property managers.

The owner creates pressure through goals and expectations.

Examples discussed:

- Increase weekly revenue by a target amount before a deadline.
- Increase attendance.
- Reach a combination of business targets.

Exact owner goals, rewards, punishments, personality, and timing are NOT decided yet.

### Sheriff Needs a Reason to Exist

The sheriff currently receives money even though the club is not meaningfully doing anything illegal.

The redesign should connect the sheriff/police pressure to actual illegal activity.

### Illegal Activity / Heat Direction

Illegal activity is intended to replace the gameplay space currently occupied by Promotions.

Examples discussed:

- Prostitution.
- Drugs.

Greater illegal activity should create greater reward and greater risk/Heat.

The exact illegal activities, Heat scale, sheriff behavior, police consequences, and economics are NOT decided yet.

### Remove Unavoidable Champagne Death/Reset

The current unavoidable random performer death/reset mechanic should not survive in its present form.

The joke itself could potentially return in another form, but it should not arbitrarily erase long-term performer progression without meaningful player agency.

---

# Choice-Driven Event Direction

## DECIDED

Events should often present tradeoffs with short- and long-term consequences.

### Repair Example

Discussed example: plumbing breaks.

Possible responses:

- Fix it yourself — free, but likely temporary.
- Hire cheap professional — cheaper, but problem may return.
- Hire expensive professional — expensive, durable/permanent repair.
- Hire full-time maintenance worker — ongoing expense that can solve/reduce future maintenance problems.

Exact costs and probabilities are NOT decided.

### Robbery Example

Instead of automatically losing money, robbery can create choices.

Possible responses discussed:

- Fight the robber(s).
- Pay/bribe them.
- Pay more to learn who sent them.
- Rely on hired security later in the game.

A robbery may potentially reveal or begin a rival-club storyline.

Exact choices and outcomes are NOT decided.

---

# Customers / Attendance

## IDEA / NOT DECIDED

Adding actual attendance is a leading redesign idea and is currently the next major system to work out.

Instead of performers magically generating all club revenue, the intended direction is that the club attracts customers and those customers spend money.

Possible customer groups discussed:

- Cheap customers.
- Regular customers.
- High rollers.

Different customers could have different expectations and spending behavior.

Example concept:

Better performers + strong VIP facilities may attract more high rollers, while cheaper/basic offerings may attract more price-sensitive customers.

The player should be able to understand changes without seeing the underlying formulas.

**No exact customer categories, attendance formula, spending formula, capacity system, or customer-return system has been approved yet.**

---

# Performer Morale / Effort

## IDEA / NOT DECIDED

Performers may eventually have a simple morale/effort component.

Potential influences discussed:

- Dressing Room quality.
- Club quality.
- Player decisions during performer events.
- Time-off decisions.
- Working through injury.
- Bonuses or treatment.
- Security/safety problems.

A high-rank performer who is miserable could potentially perform below her theoretical maximum.

Keep this simple if implemented. Do not turn every performer into a giant character-stat spreadsheet.

---

# Maintenance Staff

## IDEA / NOT DECIDED

A full-time maintenance worker could be a strategic alternative to repeatedly paying for repairs.

This would create an ongoing salary in exchange for reducing future maintenance costs/problems.

Exact implementation is not decided.

---

# Security

## IDEA / NOT DECIDED

Security could become a staff/progression system later.

Possible concept: different security hires have different costs, effectiveness, and compatibility with illegal activity.

Examples discussed conceptually:

- Cheap/basic bouncer.
- Better professional security.
- Off-duty police officer.
- Sketchier muscle willing to tolerate criminal activity.

Exact staff, stats, salaries, combat system, and consequences are NOT decided.

---

# Rival Clubs

## IDEA / NOT DECIDED

Rival clubs could become a later-game system after the core club simulation and player-choice systems work.

A rival may emerge organically from an event—for example, paying a robber extra to reveal which club sent them.

Possible responses discussed:

- Ignore the rival.
- Negotiate.
- Poach performers/staff.
- Compete on pricing/business.
- Retaliate.
- Rob/attack/sabotage the rival.

This is deliberately a later system. Do not build it before the core redesign is fun.

---

# Victory / Long-Term Goal

## IDEA / NOT DECIDED

One possible natural achievement is a "perfect empire":

- Belton at Building Level 5.
- All Belton amenities Level 5.
- Full Belton roster of A-rank performers.
- Austin at Building Level 5.
- All Austin amenities Level 5.
- Full Austin roster of A-rank performers.

The game could record the week this is achieved without necessarily forcing the run to end.

A fixed campaign length similar to Drug Lord 2 has also been discussed, but has NOT been chosen.

---

# Complexity Guardrail

## DECIDED

Do not turn Ned's Naughties into a game where the player must babysit a dozen meters and understand every calculation.

Potential systems such as money, owner expectations, Heat, customers, performer morale, security, maintenance, reputation, etc. should not all become equally prominent dashboard statistics.

The game should expose only the information needed to make understandable decisions.

The underlying systems can interact heavily without forcing the player to manually calculate them.

---

# Development Approach

## DECIDED

Do not redesign and implement everything at once.

Work through the redesign in small systems, play/test each one, and then continue.

Do not add more cities, performers, facilities, or building levels merely to create more content while the core decision-making loop is unresolved.

The current codebase should be evolved rather than automatically thrown away and rewritten from scratch.

---

# Rejected / Do Not Re-Suggest Without Reopening

## REJECTED

- Keeping the current Promotions system unchanged.
- Keeping amenities as seven interchangeable percentage-based revenue boosters.
- Keeping the current unavoidable champagne-bottle performer death/reset mechanic.
- Treating "add more passive random events" as the solution to the agency problem.
- Exposing a giant wall of simulation percentages and formulas to the player.
- Building all proposed redesign systems simultaneously.

---

# Current Question

## CUSTOMER / ATTENDANCE SYSTEM

Before implementing major redesign code, determine in plain English:

1. Who comes into Ned's?
2. Why do they choose Ned's?
3. What do they spend money on?
4. What makes them happy or unhappy?
5. What makes attendance rise or fall?
6. How do performers affect attendance and spending?
7. How do the seven amenities affect customers differently?
8. How much of this information should the player actually see?

Do not lock formulas until the conceptual answers make sense.

---

# Design Log

## 2026-08-31

Created this living design document after recognizing that the redesign was accumulating too many decisions across long conversations to reliably preserve by memory alone.

Initial document records the major agreements, open ideas, rejected directions, and current customer/attendance design question from the redesign discussion.