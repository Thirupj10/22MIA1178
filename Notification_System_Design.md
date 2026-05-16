# Stage 1: Notification System Design

## Problem Statement

Students receive a high volume of campus notifications across three categories: Placements, Results, and Events. The goal is to implement a **Priority Inbox** that always surfaces the top `n` most important unread notifications first, using a combination of type-based weight and recency.

---

## Priority Algorithm

### Scoring Formula

Priority Score = (Type Weight × 40) + Recency Score

### Type Weights

| Type      | Weight |
|-----------|--------|
| Placement | 3      |
| Result    | 2      |
| Event     | 1      |

**Rationale:** Placements are the most time-sensitive and career-critical. Results directly affect academic standing. Events are informational and lower urgency.

### Recency Score
Recency Score = max(0, 100 - ageInMinutes × 0.1)

### Final Sort

All notifications are scored and sorted in **descending order**. The top `n` are returned (default n=10, configurable to 15, 20).

---

## Maintaining Top N Efficiently as New Notifications Arrive

### Solution: Min-Heap of Size N

- Maintain a **min-heap** of size `n` keyed by priority score
- When a new notification arrives:
  - Compute its priority score
  - If heap has fewer than `n` items → push it
  - If its score > heap minimum → pop minimum, push new one
  - Otherwise → discard
- This keeps top `n` updated in **O(log n)** per notification

---

## Data Flow
Notification API (GET)
↓
fetchNotifications()
↓
calculatePriorityScore() for each
↓
Sort descending by score
↓
Return top N
↓
Display in Priority Inbox UI

---

## Logging Integration

Every significant step is logged via `Log(stack, level, package, message)`:

- API fetch start/success/failure → `info` / `error`
- Priority computation → `info`
- Fatal crashes → `fatal`

---

## Technologies Used

- **Language:** TypeScript
- **Runtime:** Node.js / Next.js
- **API:** Affordmed Evaluation Notification API (Bearer token auth)
- **Logging:** Custom reusable `Log()` middleware → Affordmed Log API
