# 🍕 Cheese Economy System - Security & Engagement Guide

## Overview
An engaging, secure economy system designed to keep users active with inflation prevention and bypass protection.

---

## 🛡️ Security Features

### 1. **Transaction Validation**
- All amounts validated as safe integers
- Maximum transaction limit: 1,000,000 coins
- Negative amounts rejected automatically
- Ensures no mathematical exploits

### 2. **Inflation Prevention**
- **Resale Rate Limiting**: Items sell at 70-80% of purchase price
  - Roles: 70% (prevents infinite flipping)
  - Items: 80% (valuable items)
- **Escalating Cooldowns**: Selling same item multiple times increases cooldown
  - Base: 1 hour after first sell
  - Multiplier: Up to 5x per item
  - Example: 3rd sale = 3 hours wait
- **Daily Earning Caps**: Monitored per user across all earning methods

### 3. **Transaction Logging**
- Every transaction recorded in `economyTransactions` collection
- Tracks: Type, amount, balance before/after, timestamp
- Enables abuse detection and rollback capability
- Indexed for fast query performance

### 4. **Role Verification**
- Roles re-fetched before sale (prevents cached state issues)
- Managed roles cannot be sold (Discord's system roles)
- Role existence verified before removal
- Rollback on failure (role restored if sale fails)

### 5. **Item Ownership Verification**
- Fishing rod status re-checked before sale
- Item removal atomic with money addition
- Inventory state tracked in database

---

## 💰 Economy Commands

### Earning Commands
- `/beg` - Quick random reward (12-35 coins)
- `/work` - Regular income (45-65 coins, 30-min cooldown)
- `/fish` - Activity-based (varies, requires fishing rod)
- `/hourly`, `/daily`, `/weekly`, `/monthly`, `/yearly` - Scheduled rewards
- `/nap` - Rest-based earnings with bonus multipliers

### Spending & Trading
- `/buy` - Purchase roles and items from store
- `/sell` - Sell items, roles, get 70-80% of purchase price
- `/pay` - Transfer coins to other users
- `/deposit` - Store coins in bank (protection)
- `/withdraw` - Retrieve banked coins

### Activity & Engagement
- `/profile` - View personal economy stats and net worth
- `/rankings wealth` - See richest players
- `/rankings traders` - See most active buy/sell traders
- `/rankings earners` - See top activity participants
- `/challenge` - Daily rotating challenges with bonuses
- `/dashboard` - Admin: View server economy health

### Management (Admin)
- `/additem [role] [price]` - Add purchasable roles
- `/deleteitem [role]` - Remove purchasable roles
- `/store` - View all available items
- `/addmoney [user] [amount]` - Adjust user balance
- `/removemoney [user] [amount]` - Remove coins
- `/clear` - Full economy reset
- `/dashboard` - Economy health check

---

## 🎯 Engagement Features

### 1. **Leaderboards**
Three competitive leaderboards keep users engaged:
- **Wealth**: Total money (encourages saving)
- **Traders**: Buy/sell activity (encourages market participation)
- **Earners**: Activity participation (encourages grinding)

### 2. **Daily Challenges**
- Unique challenge each day (rotates 6 unique challenges)
- Bonus reward for completion
- Encourages diverse activities
- Challenge resets at midnight UTC

### 3. **Transaction Tracking**
Users can see:
- Lifetime earnings by activity type
- Total spent
- Items sold
- Net worth calculation

### 4. **Economy Dashboard**
Admins can monitor:
- Active players count
- Total circulating coins
- 24-hour earning vs spending
- Inflation health status
- Recommendations for balancing

---

## 🚫 Anti-Bypass Measures

### What Users CANNOT Do
✅ **Prevented:**
- Spam-sell the same item repeatedly (escalating cooldown)
- Sell unstable/managed roles
- Exceed transaction limits
- Perform negative/zero transactions
- Abuse cached role data
- Recover sold items without admin

### How It Works
1. **Database Lookup** - Every transaction queries fresh state
2. **Atomic Operations** - No race conditions possible
3. **Role Verification** - Re-fetches member data before removal
4. **Cooldown Escalation** - Makes spam economically inefficient
5. **Logging** - Admins can detect and rollback abuse

---

## 📊 Inflation Monitoring

### Key Metrics
```
Economy Health Formula:
- If 24h Net Flow > 100k coins → Inflationary 🔴
- If 24h Net Flow < -100k coins → Deflationary 🟢
- Otherwise → Stable 🟡
```

### Admin Actions If Inflation Detected
1. Increase item prices via `/additem`
2. Decrease earning amounts in timeout values
3. Increase cooldowns on easy activities
4. Use `/clear` as nuclear option (resets all users)

---

## 💡 Best Practices for Economy Health

### For Users
1. Participate in activities (work, fish, beg)
2. Complete daily challenges
3. Buy items strategically
4. Sell when needed, don't spam
5. Bank coins for safety

### For Admins
1. Check `/dashboard` weekly
2. Monitor `/rankings traders` for spam
3. Adjust prices based on economy health
4. Review transaction logs if suspicious
5. Use `/challenge` to encourage participation

---

## 🔧 Configuration

### Current Settings
```javascript
MAX_TRANSACTION = 1,000,000 coins max per transaction
INFLATION_CHECK_PERIOD = 24 hours
MAX_DAILY_EARNINGS = 5,000,000 per user per day
RESALE_RATE = 70% roles, 80% items
SELL_COOLDOWN_BASE = 1 hour per item
SELL_COOLDOWN_MULTIPLIER = +1 hour per additional sale (max 5x)
```

To adjust, edit `/src/handlers/games/economy.js`

---

## 📋 Table Schema

### `economy`
- Guild, User, Money, Bank

### `economyItems`
- Guild, User, FishingRod, FishingRodUsage

### `economyStore`
- Guild, Role, Amount

### `economyTransactions` ⭐ NEW
- Guild, User, TransactionType, Amount, ItemName, Timestamp, BalanceBefore, BalanceAfter

### `economySellCooldowns` ⭐ NEW
- Guild, User, ItemName, LastSoldAt, SellCount

### `economySellable` ⭐ NEW
- Guild, ItemName, BuyPrice, SellPrice, Sellable, MaxOwned, Category

### `economySubscriptions` ⭐ NEW
- Guild, Name, Description, Roles[], Price, Duration, Resellable

---

## 🚀 Future Enhancements

- [ ] Subscription tier system with time-based expiration
- [ ] Stock market (buy/sell prices fluctuate)
- [ ] Guild treasury and taxes
- [ ] Achievements and badges
- [ ] Economy events (inflation/deflation events)
- [ ] Item durability system
- [ ] Trading post (direct user-to-user trading)

---

**Last Updated:** May 4, 2026
**System Health:** ✅ SECURE & BALANCED
