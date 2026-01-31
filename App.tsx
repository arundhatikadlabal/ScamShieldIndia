import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  Copy, 
  Download, 
  RefreshCw, 
  Smartphone, 
  Phone, 
  FileText, 
  ChevronRight, 
  Mic, 
  Square, 
  Users, 
  Send, 
  ExternalLink, 
  Mail, 
  Trash2, 
  Plus, 
  Landmark, 
  X, 
  Image as ImageIcon, 
  Loader2,
  Moon,
  Sun,
  ChevronDown,
  AlertCircle,
  AlertOctagon,
  BookOpen,
  Newspaper
} from 'lucide-react';
import { analyzeIncident, analyzeImageOCR } from './services/geminiService';
import { 
  ScamShieldResult, 
  RiskLevel, 
  ScenarioBranch, 
  TrustedContact,
  BankMetadata
} from './types';
import { BANK_REGISTRY, OFFICIAL_ADVISORIES, CaseStory } from './constants';

// --- Components ---

const RiskMeter: React.FC<{ percent: number; label: RiskLevel }> = ({ percent, label }) => {
  const radius = 90;
  const circumference = Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;
  
  const getColor = () => {
    if (percent > 85) return "#f43f5e"; // rose-500
    if (percent > 60) return "#f59e0b"; // amber-500
    if (percent > 30) return "#10b981"; // emerald-500
    return "#3b82f6"; // blue-500
  };

  return (
    <div className="gauge-container flex flex-col items-center py-8">
      <svg width="240" height="140" viewBox="0 0 240 140" className="drop-shadow-2xl">
        <path className="gauge-bg" d="M30 110 A 90 90 0 0 1 210 110" />
        <path 
          className="gauge-value" 
          d="M30 110 A 90 90 0 0 1 210 110" 
          stroke={getColor()}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-4 text-center">
        <div className="text-4xl font-black text-slate-900 dark:text-white">{percent}%</div>
        <div className="text-xs font-black uppercase tracking-[0.2em] mt-1" style={{ color: getColor() }}>
          {label} Risk
        </div>
      </div>
    </div>
  );
};

const Modal: React.FC<{ title: string; children: React.ReactNode; onClose: () => void }> = ({ title, children, onClose }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 dark:bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300">
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-8 w-full max-w-md shadow-2xl animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h3>
        <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"><X size={20}/></button>
      </div>
      {children}
    </div>
  </div>
);

const Toast: React.FC<{ message: string; type: 'error' | 'success'; onClose: () => void }> = ({ message, type, onClose }) => (
  <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl animate-in slide-in-from-bottom-4 duration-300 border ${type === 'error' ? 'bg-rose-600 border-rose-400 text-white' : 'bg-emerald-600 border-emerald-400 text-white'}`}>
    {type === 'error' ? <AlertCircle size={20}/> : <CheckCircle size={20}/>}
    <span className="font-bold">{message}</span>
    <button onClick={onClose} className="ml-2 hover:opacity-70 transition-opacity"><X size={18}/></button>
  </div>
);

const CaseStoryItem: React.FC<{ story: CaseStory }> = ({ story }) => {
  const [localError, setLocalError] = useState(false);

  // Pre-calculate safe link for the href attribute to ensure standard behavior
  const rawUrl = story.link?.trim() || "";
  let safeLink = rawUrl;
  
  if (safeLink && safeLink !== "#" && !safeLink.startsWith('http')) {
    safeLink = `https://${safeLink}`;
  }

  try {
    if (safeLink && safeLink !== "#") {
      safeLink = encodeURI(safeLink);
    }
  } catch (err) {
    safeLink = "#";
  }

  const handleLinkClick = (e: React.MouseEvent) => {
    setLocalError(false);

    // Validation check before allowing navigation
    if (!rawUrl || rawUrl === "#" || rawUrl === "") {
      e.preventDefault();
      console.warn("[ScamShield] Invalid article link detected");
      setLocalError(true);
      return;
    }

    console.log(`[DEBUG] Navigating to article: ${safeLink}`);
  };

  return (
    <div className="relative">
      <a 
        href={safeLink}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleLinkClick}
        className={`w-full text-left block p-5 bg-slate-50 dark:bg-slate-950/50 border rounded-2xl transition-all group ${localError ? 'border-rose-500 animate-pulse' : 'border-slate-200 dark:border-slate-800 hover:border-emerald-500/50'}`}
      >
        <div className="flex justify-between items-start mb-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{story.source} • {story.date}</span>
          <ExternalLink size={14} className={`transition-colors ${localError ? 'text-rose-500' : 'text-slate-400 group-hover:text-emerald-500'}`} />
        </div>
        <h4 className={`text-base font-bold mb-3 transition-colors ${localError ? 'text-rose-500' : 'text-slate-900 dark:text-white group-hover:text-emerald-500'}`}>
          {story.headline}
        </h4>
        <div className="flex flex-wrap gap-2">
          {story.outcomes.map((outcome, idx) => (
            <span key={idx} className={`px-2 py-1 text-[10px] font-bold rounded-md uppercase tracking-wider ${localError ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'}`}>
              {outcome}
            </span>
          ))}
        </div>
        {localError && (
          <p className="mt-3 text-[10px] font-black text-rose-500 uppercase tracking-widest">
            Article link missing or invalid — try another story.
          </p>
        )}
      </a>
    </div>
  );
};

// --- App ---

const App: React.FC = () => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScamShieldResult | null>(null);
  const [branch, setBranch] = useState<ScenarioBranch>(ScenarioBranch.NOT_PAID);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [errorToast, setErrorToast] = useState<string | null>(null);
  const [escalationStatus, setEscalationStatus] = useState<'idle' | 'opened' | 'no_contacts'>('idle');
  const [caseTab, setCaseTab] = useState<'advisories' | 'search'>('advisories');
  
  // Voice & Media
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Contacts
  const [contacts, setContacts] = useState<TrustedContact[]>([]);
  const [newContact, setNewContact] = useState({ name: '', phone: '' });

  // Bank
  const [selectedBank, setSelectedBank] = useState<BankMetadata>(BANK_REGISTRY[0]);
  const [emailModal, setEmailModal] = useState(false);

  useEffect(() => {
    // Theme setup
    const savedTheme = localStorage.getItem('scamshield_theme') as 'dark' | 'light' | null;
    const initialTheme = savedTheme || 'dark';
    setTheme(initialTheme);
    document.documentElement.classList.toggle('dark', initialTheme === 'dark');

    // Contacts setup
    const savedContacts = localStorage.getItem('scam_shield_contacts');
    if (savedContacts) setContacts(JSON.parse(savedContacts));

    // Web Speech API Init
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-IN';

      recognitionRef.current.onstart = () => setIsRecording(true);
      recognitionRef.current.onend = () => setIsRecording(false);
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((res: any) => res[0].transcript)
          .join('');
        setInput(transcript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        if (event.error === 'not-allowed') {
          setErrorToast('Microphone permission denied.');
        } else {
          setErrorToast('Error during speech recognition.');
        }
        setIsRecording(false);
      };
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('scamshield_theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const saveContacts = (updated: TrustedContact[]) => {
    setContacts(updated);
    localStorage.setItem('scam_shield_contacts', JSON.stringify(updated));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        // Now using local OCR
        const text = await analyzeImageOCR(base64, file.type);
        setInput(prev => prev + (prev ? "\n\n" : "") + text);
        setLoading(false);
      };
    } catch (err) {
      setErrorToast("Failed to process image locally.");
      setLoading(false);
    }
  };

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      setErrorToast('Speech recognition not supported in this browser.');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error("Recognition start failed", e);
      }
    }
  };

  const handleAnalyze = async () => {
    if (!input.trim()) {
      setErrorToast("Please enter or record a summary first.");
      return;
    }
    setLoading(true);
    try {
      // Now using local rule engine
      const data = await analyzeIncident(input);
      setResult(data);
      setEscalationStatus('idle'); // Reset status on new analysis
    } catch (err) {
      setErrorToast("Failed to analyze threat locally.");
    } finally {
      setLoading(false);
    }
  };

  const getEmailBody = () => {
    return `To: ${selectedBank.name} Support Team,

I am writing to report a fraudulent incident regarding my account. 

Incident Summary: ${result?.scamType || "Digital Fraud"}
Details Provided: ${input.substring(0, 200)}...

PLEASE FREEZE MY ACCOUNT IMMEDIATELY.

My Details:
- Name: [Your Full Name]
- Registered Phone: [Your Registered Phone]
- Account/Card Last 4 Digits: [XXXX]

Transaction Details (If any):
- Date/Time: [Date] at [Time]
- Amount: [Amount]
- Transaction ID: [TXN ID]
- Scammer Info: [UPI ID or Account]

Sent via Scam Shield India Safety Portal.`;
  };

  const openGmail = () => {
    const subject = encodeURIComponent(`URGENT: Request to Block Account - Fraud Alert`);
    const body = encodeURIComponent(getEmailBody());
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${selectedBank.email}&su=${subject}&body=${body}`, '_blank');
  };

  const downloadEML = () => {
    const subject = `URGENT: Request to Block Account - Fraud Alert`;
    const body = getEmailBody();
    const emlContent = `To: ${selectedBank.email}
Subject: ${subject}
X-Unsent: 1
Content-Type: text/plain; charset="UTF-8"

${body}`;

    const blob = new Blob([emlContent], { type: 'message/rfc822' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Freeze_Request_${selectedBank.id}.eml`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const sendWhatsAppAlert = (contact: TrustedContact) => {
    const text = encodeURIComponent(`URGENT: I may be targeted by a scam call/message. Please call me back immediately. Do NOT share any OTP. I am taking steps to report (1930/cybercrime.gov.in).`);
    window.open(`https://wa.me/91${contact.phone}?text=${text}`, '_blank');
    setEscalationStatus('opened');
  };

  const handleEscalateNow = () => {
    if (contacts.length === 0) {
      setEscalationStatus('no_contacts');
      setErrorToast("Please add a family contact first.");
      return;
    }
    // Escalate to the first contact by default
    sendWhatsAppAlert(contacts[0]);
  };

  const handleNewsSearch = () => {
    const query = result?.scamType 
      ? `${result.scamType} scam India 1930 cybercrime`
      : "online scam India 1930 cybercrime";
    const url = `https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=nws`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const currentActions = branch === ScenarioBranch.NOT_PAID ? result?.actions_A : result?.actions_B;

  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col items-center transition-colors duration-300">
      {/* Header */}
      <header className="w-full max-w-4xl px-6 py-6 flex justify-between items-center border-b border-slate-200 dark:border-slate-900 sticky top-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-lg z-50">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-600 p-2 rounded-xl shadow-lg shadow-emerald-900/40">
            <Shield size={24} className="text-white" />
          </div>
          <h1 className="text-xl font-black tracking-tighter text-slate-900 dark:text-white">Scam Shield India</h1>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={toggleTheme} className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors bg-slate-100 dark:bg-slate-900 rounded-full">
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </header>

      <main className="w-full max-w-4xl px-6 py-12 space-y-12 pb-32">
        {/* INPUT SECTION */}
        <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-xl dark:shadow-2xl border border-slate-100 dark:border-slate-800 space-y-8 animate-reveal">
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 flex items-center justify-center gap-3 p-4 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-2xl border border-slate-200 dark:border-slate-700 transition-all font-bold group"
            >
              <ImageIcon size={20} className="text-emerald-500 group-hover:scale-110 transition-transform" />
              Upload Screenshot
            </button>
            <button 
              onClick={toggleRecording}
              className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-2xl border transition-all font-bold group ${isRecording ? 'bg-rose-600/10 border-rose-500 text-rose-500' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
            >
              {isRecording ? <Square size={20} className="animate-pulse"/> : <Mic size={20} className="text-emerald-500 group-hover:scale-110 transition-transform" />}
              {isRecording ? 'Stop Recording' : 'Record Summary'}
            </button>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
          </div>

          <div className="space-y-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Captured evidence text will appear here. Or describe what happened..."
              className="w-full h-48 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 text-lg text-slate-800 dark:text-slate-200 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all resize-none shadow-inner"
            />
            {input.trim() === '' && (
              <p className="text-xs text-slate-400 font-medium px-4 tracking-wide">Enter text or use Record/Upload to begin analysis.</p>
            )}
          </div>

          <button
            onClick={handleAnalyze}
            disabled={loading || !input.trim()}
            className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 text-white font-black text-xl rounded-2xl shadow-xl shadow-emerald-900/30 transition-all flex items-center justify-center gap-3 group"
          >
            {loading ? <Loader2 className="animate-spin" size={24}/> : 'ANALYZE RISK'}
            {!loading && <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform"/>}
          </button>
        </section>

        {result && (
          <>
            {/* RISK METER */}
            <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 border border-slate-100 dark:border-slate-800 text-center space-y-6 shadow-xl dark:shadow-2xl animate-reveal" style={{ animationDelay: '0.1s' }}>
              <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">Analysis Result</h2>
              <RiskMeter percent={result.riskPercent} label={result.riskLabel} />
              <div className="space-y-2">
                <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">{result.scamType}</h3>
                <p className="text-slate-500 dark:text-slate-400 font-medium italic text-lg">"{result.summary}"</p>
              </div>
            </section>

            {/* TABBED ACTIONS */}
            <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-xl dark:shadow-2xl animate-reveal" style={{ animationDelay: '0.2s' }}>
              <div className="flex bg-slate-50 dark:bg-slate-950 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 mb-10 shadow-inner">
                <button 
                  onClick={() => setBranch(ScenarioBranch.NOT_PAID)}
                  className={`flex-1 py-4 rounded-xl font-black text-sm uppercase transition-all ${branch === ScenarioBranch.NOT_PAID ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'}`}
                >
                  Haven't Paid
                </button>
                <button 
                  onClick={() => setBranch(ScenarioBranch.ALREADY_PAID)}
                  className={`flex-1 py-4 rounded-xl font-black text-sm uppercase transition-all ${branch === ScenarioBranch.ALREADY_PAID ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'}`}
                >
                  Already Paid
                </button>
              </div>

              <div className="space-y-10">
                {currentActions?.map((action, idx) => (
                  <div key={idx} className="flex gap-6 group">
                    <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-black rounded-2xl border border-emerald-500/20 shrink-0 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                      {idx + 1}
                    </div>
                    <div>
                      <h4 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-3 leading-none">{action.title}</h4>
                      <ul className="space-y-3">
                        {action.steps.map((step, sIdx) => (
                          <li key={sIdx} className="text-lg text-slate-600 dark:text-slate-300 font-medium leading-relaxed flex items-start gap-3">
                            <CheckCircle size={18} className="text-emerald-500 mt-1 shrink-0" />
                            {step}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {/* OFFICIAL REPORTING */}
        <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-xl dark:shadow-2xl animate-reveal" style={{ animationDelay: '0.3s' }}>
          <h2 className="text-xl font-black uppercase text-slate-900 dark:text-white mb-8 flex items-center gap-3">
            <FileText className="text-emerald-500" />
            Official Reporting
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button 
              onClick={() => window.open('https://cybercrime.gov.in', '_blank')}
              className="py-5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-lg rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-emerald-900/30 transition-all active:scale-[0.98]"
            >
              FILE COMPLAINT <ExternalLink size={20}/>
            </button>
            <a 
              href="tel:1930"
              className="py-5 bg-rose-600 hover:bg-rose-500 text-white font-black text-lg rounded-2xl flex flex-col items-center justify-center gap-1 shadow-xl shadow-rose-900/30 transition-all active:scale-[0.98]"
            >
              CALL 1930 NOW
              <span className="text-[10px] uppercase tracking-widest opacity-60">National Helpline</span>
            </a>
          </div>
          <p className="mt-6 text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest text-center italic">
            Note: These are manual actions. Scam Shield cannot file reports automatically.
          </p>
        </section>

        {/* BANK PROTOCOL */}
        <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-xl dark:shadow-2xl animate-reveal" style={{ animationDelay: '0.4s' }}>
          <h2 className="text-xl font-black uppercase text-slate-900 dark:text-white mb-8 flex items-center gap-3">
            <Landmark className="text-emerald-500" />
            Contact Your Bank
          </h2>
          
          <div className="relative mb-8 group">
            <select 
              value={selectedBank.id}
              onChange={(e) => setSelectedBank(BANK_REGISTRY.find(b => b.id === e.target.value) || BANK_REGISTRY[0])}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 text-xl font-black text-slate-900 dark:text-white outline-none focus:border-emerald-500 appearance-none transition-all shadow-inner"
            >
              {BANK_REGISTRY.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
            <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none transition-transform group-hover:translate-y-[-40%]" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-2">
              <button 
                onClick={() => setEmailModal(true)}
                className="flex-1 py-5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-2xl flex flex-col items-center gap-2 font-black transition-all group shadow-lg"
              >
                <Mail className="text-emerald-500 group-hover:scale-110 transition-transform"/> Draft Email
              </button>
            </div>
            <a 
              href={`tel:${selectedBank.hotline}`}
              className="flex-1 py-5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-2xl flex flex-col items-center gap-2 font-black transition-all group shadow-lg"
            >
              <Phone className="text-emerald-500 group-hover:scale-110 transition-transform"/> Call Bank
            </a>
            <button 
              onClick={() => window.open(selectedBank.portal, '_blank')}
              className="flex-1 py-5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-2xl flex flex-col items-center gap-2 font-black transition-all group shadow-lg"
            >
              <ExternalLink className="text-emerald-500 group-hover:scale-110 transition-transform"/> Bank Portal
            </button>
          </div>
          <p className="mt-4 text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest text-center leading-relaxed">
            Opens your email app with a pre-filled draft to your bank. Review and tap Send to submit.<br/>
            If your browser blocks email drafts, we’ll download the draft instead—open it and tap Send.
          </p>
        </section>

        {/* FAMILY SUPPORT */}
        <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-xl dark:shadow-2xl animate-reveal" style={{ animationDelay: '0.5s' }}>
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-black uppercase text-slate-900 dark:text-white flex items-center gap-3">
              <Users className="text-emerald-500" />
              Family Support
            </h2>
            <button 
              onClick={handleEscalateNow}
              className="px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white font-black text-sm rounded-xl shadow-lg transition-all flex items-center gap-2 active:scale-95"
            >
              <AlertOctagon size={18} />
              ESCALATE NOW
            </button>
          </div>

          <div className="mb-8 p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${escalationStatus === 'idle' ? 'bg-slate-300 dark:bg-slate-700' : escalationStatus === 'opened' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-rose-500'}`}></div>
            <span className="text-sm font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
              Status: {escalationStatus === 'idle' ? 'Not sent yet' : escalationStatus === 'opened' ? 'Opened WhatsApp with prefilled message' : 'No contacts saved'}
            </span>
          </div>
          
          <div className="space-y-4 mb-10">
            {contacts.map(c => (
              <div key={c.id} className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl flex items-center justify-between group hover:border-emerald-500/30 transition-all shadow-inner">
                <div>
                  <div className="text-lg font-black text-slate-900 dark:text-white">{c.name}</div>
                  <div className="text-sm text-slate-500 font-bold">+91 {c.phone}</div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => sendWhatsAppAlert(c)}
                    className="p-3 bg-emerald-600/10 text-emerald-500 rounded-xl hover:bg-emerald-600 hover:text-white transition-all"
                    title="Send WhatsApp Alert"
                  >
                    <Send size={20}/>
                  </button>
                  <button 
                    onClick={() => saveContacts(contacts.filter(con => con.id !== c.id))}
                    className="p-3 bg-rose-600/10 text-rose-500 rounded-xl hover:bg-rose-600 hover:text-white transition-all"
                    title="Remove Contact"
                  >
                    <Trash2 size={20}/>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col md:flex-row gap-2">
            <input 
              placeholder="Full Name" 
              value={newContact.name}
              onChange={e => setNewContact({...newContact, name: e.target.value})}
              className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-slate-900 dark:text-white outline-none focus:border-emerald-500 shadow-inner"
            />
            <input 
              placeholder="10-digit Phone" 
              value={newContact.phone}
              onChange={e => setNewContact({...newContact, phone: e.target.value})}
              className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-slate-900 dark:text-white outline-none focus:border-emerald-500 shadow-inner"
            />
            <button 
              onClick={() => {
                if (newContact.name && /^[6-9]\d{9}$/.test(newContact.phone)) {
                  saveContacts([...contacts, { id: Date.now().toString(), ...newContact }]);
                  setNewContact({ name: '', phone: '' });
                } else {
                  setErrorToast("Please enter a valid name and 10-digit Indian phone number.");
                }
              }}
              className="bg-emerald-600 px-10 rounded-2xl text-white font-black hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-900/30"
            >
              ADD
            </button>
          </div>
          <p className="mt-6 text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest text-center italic leading-relaxed">
            "This opens WhatsApp; you must press Send manually."<br/>
            We auto-prepare the message. WhatsApp will open—please review and tap Send.
          </p>
        </section>

        {/* REAL CASES SECTION */}
        <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-xl dark:shadow-2xl animate-reveal" style={{ animationDelay: '0.6s' }}>
          <div className="mb-8">
            <h2 className="text-xl font-black uppercase text-slate-900 dark:text-white flex items-center gap-3">
              <BookOpen className="text-emerald-500" />
              Real Cases & Verified Stories
            </h2>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mt-1">
              For awareness only. Finish the steps above first.
            </p>
          </div>

          <div className="flex bg-slate-50 dark:bg-slate-950 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 mb-8 shadow-inner">
            <button 
              onClick={() => setCaseTab('advisories')}
              className={`flex-1 py-3 rounded-lg font-black text-xs uppercase transition-all flex items-center justify-center gap-2 ${caseTab === 'advisories' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'}`}
            >
              <Shield size={14} />
              Official Advisories
            </button>
            <button 
              onClick={() => setCaseTab('search')}
              className={`flex-1 py-3 rounded-lg font-black text-xs uppercase transition-all flex items-center justify-center gap-2 ${caseTab === 'search' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'}`}
            >
              <Newspaper size={14} />
              News Search
            </button>
          </div>

          <div className="space-y-4">
            {caseTab === 'advisories' ? (
              <>
                <div className="text-[10px] font-black uppercase tracking-widest text-emerald-500/80 mb-2">
                  What helped in verified cases
                </div>
                {OFFICIAL_ADVISORIES.map((story, idx) => (
                  <CaseStoryItem key={idx} story={story} />
                ))}
              </>
            ) : (
              <div className="flex flex-col items-center py-12 px-6 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-[2rem] animate-reveal">
                <div className="mb-6 p-5 bg-emerald-500/10 rounded-full">
                  <Newspaper size={48} className="text-emerald-500" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">Search Live News</h3>
                <p className="text-slate-500 dark:text-slate-400 font-medium text-center mb-8 max-w-sm leading-relaxed">
                  Find the latest reports and news coverage on {result?.scamType ? `"${result.scamType}"` : "this threat type"} across India.
                </p>
                <button 
                  onClick={handleNewsSearch}
                  className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-lg rounded-2xl shadow-xl shadow-emerald-900/30 transition-all flex items-center justify-center gap-3 active:scale-95 group"
                >
                  SEE RECENT REAL CASES (NEWS SEARCH)
                  <ExternalLink size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            )}
          </div>

          <p className="mt-8 text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest text-center">
            {caseTab === 'advisories' ? 'Links open in a new tab.' : 'Search results open in Google News.'}
          </p>
        </section>
      </main>

      {/* FOOTER NAV (MOBILE 1930) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 p-4 bg-white/80 dark:bg-slate-950/80 backdrop-blur-lg border-t border-slate-100 dark:border-slate-900 z-[60]">
        <a href="tel:1930" className="w-full flex items-center justify-center gap-3 bg-rose-600 py-4 rounded-2xl text-lg font-black text-white shadow-xl active:scale-[0.98] transition-all">
          <Phone size={20}/> CALL HELPLINE 1930
        </a>
      </div>

      {/* MODALS */}
      {emailModal && (
        <Modal title="Draft Email" onClose={() => setEmailModal(false)}>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-8">
            This will draft a formal freeze request for <strong>{selectedBank.name}</strong>. Choose how you want to proceed:
          </p>
          <div className="space-y-4">
            <button 
              onClick={openGmail}
              className="w-full py-5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-3 font-black transition-all shadow-lg"
            >
              <img src="https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg" className="w-6 h-6" alt="Gmail" />
              Open in Gmail
            </button>
            <a 
              href={`mailto:${selectedBank.email}?subject=Fraud Alert&body=...`}
              className="w-full py-5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-3 font-black transition-all shadow-lg"
            >
              <Mail size={24} className="text-emerald-500"/> Default Mail App
            </a>
            <div className="relative flex items-center py-4">
              <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
              <span className="flex-shrink mx-4 text-xs font-black text-slate-400 dark:text-slate-600 uppercase">Blocked?</span>
              <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
            </div>
            <button 
              onClick={downloadEML}
              className="w-full py-5 bg-emerald-600/10 hover:bg-emerald-600 text-emerald-500 hover:text-white border border-emerald-500/20 rounded-2xl flex items-center justify-center gap-3 font-black transition-all shadow-lg"
            >
              <Download size={24}/> Download .eml Draft
            </button>
          </div>
          <p className="mt-8 text-[10px] text-slate-400 dark:text-slate-600 font-bold uppercase tracking-widest text-center">
            Your browser blocked drafts? Use the Download option.
          </p>
        </Modal>
      )}

      {loading && !result && (
        <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-md">
          <div className="relative">
            <Shield size={80} className="text-emerald-600 animate-pulse drop-shadow-[0_0_30px_rgba(16,185,129,0.3)]" />
            <Loader2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white animate-spin" size={40} />
          </div>
          <h2 className="mt-8 text-2xl font-black uppercase tracking-tighter text-white animate-reveal">Analyzing Threat...</h2>
          <p className="mt-2 text-slate-500 font-bold uppercase tracking-[0.2em] text-xs">Checking Local Fraud Database</p>
        </div>
      )}

      {errorToast && <Toast message={errorToast} type="error" onClose={() => setErrorToast(null)} />}
    </div>
  );
};

export default App;