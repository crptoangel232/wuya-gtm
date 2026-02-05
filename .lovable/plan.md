

# WUYA AI - Waste-to-Revenue GTM Intelligence Engine

## Overview
A hackathon MVP that captures urgent signals about produce at risk of being wasted in Sierra Leone, scores each signal for urgency and opportunity value, enriches buyer leads via FullEnrich, and enables GTM teams to act fast.

---

## Pages & Features

### 1. Landing Page
- Hero section with product one-liner and problem statement (food waste + market mismatch)
- "How it Works" section showing the flow: Signal → Score → Enrich → Export
- Two prominent CTAs: "Submit a Market Signal" and "View Dashboard"
- Clean, professional styling optimized for quick demos

### 2. Signal Submission Page
- Form with all required fields:
  - Produce type dropdown (tomato, onion, rice, cassava, pepper, potato, okra)
  - Quantity input with unit selector
  - District dropdown (Western Area, Bo, Kenema, Bombali, Port Loko, Tonkolili, Kailahun, Kono, Moyamba, etc.)
  - Harvest deadline (days until spoilage)
  - Price drop severity (Low/Medium/High)
  - Notes field
- On submit: saves to database, runs scoring engine, creates opportunity record
- Success feedback with link to view the new opportunity

### 3. Opportunities Dashboard
- Data-dense table view showing all opportunities with columns:
  - Produce, District, Quantity, Score (0-100), Urgency label, Recommended GTM action, Status, Created date
  - "View Details" button per row
- Filter controls for: Produce type, District, Urgency label, Status
- Quick status updates directly from table

### 4. Opportunity Detail Page
- Original signal details card
- Score breakdown with urgency explanation
- Recommended GTM outreach actions
- **Buyer Leads Section:**
  - Table of enriched leads (name, company, role, email, phone, LinkedIn)
  - "Enrich Buyer Leads" button to fetch from FullEnrich API
  - "Export CSV" button for opportunity + leads

---

## Backend (Supabase)

### Database Tables
- **signals**: captures raw market signals (produce, quantity, location, urgency data)
- **opportunities**: scored opportunities linked to signals with status tracking
- **buyer_leads**: enriched contact data from FullEnrich, linked to opportunities

### Edge Function
- **FullEnrich Integration**: Edge function that calls FullEnrich API with produce type + district, stores enriched contacts, with fallback demo data if API fails

---

## Scoring Engine (Client-Side Logic)
Rule-based scoring:
- Harvest deadline ≤2 days: +40 points
- Harvest deadline ≤5 days: +25 points
- Large quantity: +15 points
- High price drop severity: +25 points
- Location far from Freetown: +10 points

Urgency labels: Low (0-39), Medium (40-69), High (70-100)

Auto-generated GTM action recommendations based on score and context.

---

## Demo Data
- Pre-seeded with 10 signals across Sierra Leone districts
- 15-20 buyer leads so dashboard is never empty
- Ensures smooth demo experience out of the box

---

## Export Features
- CSV export of opportunity details
- CSV export of enriched buyer leads

