import { RiskLevel, BankMetadata, RecommendedAction } from './types';

export const BANK_REGISTRY: BankMetadata[] = [
  { 
    id: 'sbi', 
    name: "State Bank of India (SBI)", 
    email: "customercare@sbi.co.in", 
    hotline: "18001234", 
    portal: "https://onlinesbi.sbi" 
  },
  { 
    id: 'hdfc', 
    name: "HDFC Bank", 
    email: "support@hdfcbank.com", 
    hotline: "18002026161", 
    portal: "https://hdfcbank.com" 
  },
  { 
    id: 'icici', 
    name: "ICICI Bank", 
    email: "customer.care@icicibank.com", 
    hotline: "18001080", 
    portal: "https://icicibank.com" 
  },
  { 
    id: 'axis', 
    name: "Axis Bank", 
    email: "pno@axisbank.com", 
    hotline: "18004195959", 
    portal: "https://axisbank.com" 
  },
  {
    id: 'other',
    name: "Other / Not Listed",
    email: "customercare@bank.com",
    hotline: "1930",
    portal: "https://cybercrime.gov.in"
  }
];

export interface CaseStory {
  source: string;
  date: string;
  headline: string;
  link: string;
  outcomes: string[];
}

export const OFFICIAL_ADVISORIES: CaseStory[] = [
  {
    source: "RBI (Reserve Bank of India)",
    date: "Feb 2024",
    headline: "Advisory on Fake 'Digital Arrest' by Law Enforcement Agencies",
    link: "https://www.rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx?prid=57234",
    outcomes: ["Immediate Reporting", "Police Verification", "No Payment Made"]
  },
  {
    source: "CERT-In",
    date: "Jan 2024",
    headline: "Vulnerability in UPI Apps: Beware of 'Collect Request' Scams",
    link: "https://www.cert-in.org.in/s2c3u/Files/Advisory/CIAD-2024-0001.pdf",
    outcomes: ["Technical Audit", "App Update", "Cyber Cell Alert"]
  },
  {
    source: "Delhi Police Cyber Cell",
    date: "Dec 2023",
    headline: "Safety Protocols for Senior Citizens against KYC Update Scams",
    link: "https://cyber.delhipolice.gov.in/KYC-Update-Safety-Protocol",
    outcomes: ["Verification Desk", "Family Alert", "Official App Use"]
  }
];

export interface ScamTemplate {
  id: string;
  title: string;
  keywords: string[];
  explanation: string;
  actions_A: RecommendedAction[];
  actions_B: RecommendedAction[];
}

export const URGENCY_KEYWORDS = [
  "immediately", "within 10 minutes", "final warning", "legal action", 
  "court warrant", "urgent", "don't disconnect", "stay on call", 
  "strictly confidential", "police station", "arrest",
  "within 1 hour", "last chance", "action against you", "confidential"
];

export const SCAM_TEMPLATES: ScamTemplate[] = [
  {
    id: "digital_arrest",
    title: "Digital Arrest / Law Enforcement Impersonation",
    keywords: [
      "cbi", "police", "cyber crime", "cybercell", "crime branch", "customs",
      "court", "supreme court", "warrant", "summons", "fir", "case", "legal action",
      "arrest", "jail",
      "video call", "video called", "whatsapp call", "whatsapp video", "skype", "telegram call",
      "aadhaar", "aadhar", "adhaar", "pan", "kyc",
      "freeze", "freezed", "froze", "blocked", "block", "suspend", "suspended", "deactivate", "deactivated",
      "pay", "payment", "transfer", "send money", "fine", "penalty",
      "lakhs", "lakh", "2 lakh", "rs", "rupees",
      "owe", "owed", "due", "outstanding"
    ],
    explanation: "Scammers pose as officers via video calls, claiming you're under 'Digital Arrest' for illegal parcels or money laundering.",
    actions_A: [
      { title: "Disconnect & Block", steps: ["Hang up the call immediately.", "Do not stay on the line for 'verification'.", "Block the number on WhatsApp/Phone."], priority: 1 },
      { title: "Police Verification", steps: ["Call the local police station or 112 to verify any claims.", "Official agencies NEVER arrest someone over Skype or WhatsApp video."], priority: 2 }
    ],
    actions_B: [
      { title: "Report to 1930", steps: ["Immediately call 1930 (National Cyber Crime Helpline).", "Visit cybercrime.gov.in to file a detailed report."], priority: 1 },
      { title: "Bank Alert", steps: ["Contact your bank to report the fraudulent transfer.", "Request a 'Freeze' on the destination account if possible."], priority: 2 }
    ]
  },
  {
    id: "kyc_bank",
    title: "KYC Update / Bank Account Freeze Scam",
    keywords: ["kyc", "sim block", "bank account", "freeze", "update", "pan card", "net banking", "login", "expired", "deactivated"],
    explanation: "Scammers send fake SMS alerts about KYC expiry to trick you into clicking phishing links or sharing OTPs.",
    actions_A: [
      { title: "Check Official App", steps: ["Open your bank's official app to check status.", "Do NOT click any link in the SMS.", "Official banks never ask for KYC via SMS links."], priority: 1 }
    ],
    actions_B: [
      { title: "Block Cards", steps: ["Immediately block all credit/debit cards via the official app.", "Change your Net Banking password from a safe device."], priority: 1 }
    ]
  },
  {
    id: "upi_fraud",
    title: "UPI Collect Request / QR Code Scam",
    keywords: ["upi", "collect request", "payment link", "qr code", "scan to receive", "olx", "pin", "enter pin to get money"],
    explanation: "Fraudsters trick you into entering your UPI PIN to 'receive' money, which actually deducts it from your account.",
    actions_A: [
      { title: "Zero Action Required", steps: ["Decline any 'Collect' request you didn't initiate.", "Remember: You NEVER need to enter a PIN to receive money."], priority: 1 }
    ],
    actions_B: [
      { title: "Transaction ID", steps: ["Copy the Transaction ID from your UPI app.", "Report it immediately on the '1930' portal."], priority: 1 }
    ]
  },
  {
    id: "remote_access",
    title: "Remote Access / Screen Sharing Scam",
    keywords: ["anydesk", "teamviewer", "quicksupport", "rustdesk", "install app", "share code", "customer care", "refund"],
    explanation: "Scammers ask you to install apps like AnyDesk to 'help' with a refund, then steal your credentials by viewing your screen.",
    actions_A: [
      { title: "Uninstall & Reboot", steps: ["Uninstall any remote access apps immediately.", "Turn off your internet connection."], priority: 1 }
    ],
    actions_B: [
      { title: "Device Wipe", steps: ["Reset your phone to factory settings as it may be compromised.", "Use another device to change all your passwords."], priority: 1 }
    ]
  },
  {
    id: "job_task",
    title: "Job / Telegram Task / Part-time Scam",
    keywords: ["telegram", "task", "job", "part time", "like videos", "youtube", "earn money", "investment", "recharge", "crypto"],
    explanation: "Offers 'easy money' for liking videos, then asks for 'security deposits' or investments that you can never withdraw.",
    actions_A: [
      { title: "Exit Group", steps: ["Leave the Telegram/WhatsApp group immediately.", "Do not pay any 'registration' or 'tax' fee."], priority: 1 }
    ],
    actions_B: [
      { title: "Evidence Logging", steps: ["Take screenshots of the chat and payment proofs.", "File a report at your local Cyber Cell."], priority: 1 }
    ]
  }
];