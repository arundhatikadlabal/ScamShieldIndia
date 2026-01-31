# Scam Shield India 
**Citizen Support & Fraud Defense (India)**  
A safety-first web app that helps families—especially **senior citizens**—quickly recognize common scams and follow the right next steps.

---

## Problem
A growing number of “Digital Arrest” scams in India specifically target **senior citizens and older adults**—people who may not be fully comfortable with new banking apps, cybercrime portals, or how impersonation scams work.

Scammers call or message pretending to be **Police/CBI**, a **bank**, or a “government authority”, then create fear and urgency:
- “Your Aadhaar/phone number is linked to a crime.”
- “You are under digital arrest—don’t tell anyone.”
- “Transfer money now to verify / freeze / clear your name.”

Because the threat sounds official and time-sensitive, many older people **panic**, get isolated from family, and end up:
- sending money quickly,
- sharing sensitive info (OTP/UPI PIN),
- deleting evidence,
- and not knowing what to do next or who to contact.

The biggest gap isn’t just detection—it’s **instant, calm, step-by-step help** that an older person (or their family) can follow in minutes.

**Scam Shield India exists to turn panic into a clear plan:**  
**Assess risk → Stop loss → Report correctly → Contact the bank → Alert family.**

---

## Solution (What this app does)
Scam Shield India takes a user’s incident description (typed / dictated / screenshot text extraction) and provides:
- A **Risk Meter** (visual “how risky is this?” score)
- A likely scam category (e.g., **Digital Arrest / Bank Impersonation**)
- Clear actions based on whether the user **has paid / hasn’t paid**
- One-click helpers to:
  - open official reporting resources (manual action)
  - prepare a **bank email draft** (user reviews and sends)
  - open WhatsApp with a **pre-filled family alert message**

---

## Key Features
- **Risk Analysis**: Converts the user’s story into a risk score and scam type
- **Paid vs Not Paid path**: Different actions depending on whether money was transferred
- **Official Reporting section**: Fast access to reporting steps (user must submit manually)
- **Bank Protocol**:
  - Select a bank and generate a ready-to-send email draft
  - Clear note that the user must manually press **Send**
- **Family Support**:
  - Save trusted contacts
  - Opens WhatsApp with an automated alert message (user must press **Send**)
- **Evidence-first reminders**: Don’t delete chats/call logs, take screenshots, note UPI IDs

---

## How it works 
1. User pastes/records scam description (or uploads screenshot for extraction)
2. App analyzes the text and estimates risk + scam pattern
3. App displays a simple plan:
   - Immediate safety steps
   - Reporting guidance
   - Bank contact workflow
   - Family alert workflow

---
## Important Note (Safety & Responsibility)
- Scam Shield India gives **step-by-step guidance** to help you respond safely. It is not legal advice.
- The app **does not** file complaints or contact banks for you automatically **you must review and press Send/Submit manually**.
- For your safety, it only prepares drafts and links — **you must review and press Send/Submit manually**.
- Always use official channels (bank helpline, cybercrime portal, local police) for final action.


## Tech Stack
- **Frontend:** React + TypeScript + Vite
- **AI:** Gemini API (text analysis + optional OCR/extraction)

---

## Getting Started (Run locally)
**Prerequisites:** Node.js installed

1. Install dependencies:
   ```bash
   npm install
