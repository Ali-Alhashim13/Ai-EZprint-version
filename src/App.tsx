import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Printer as PrinterIcon, 
  Users as UsersIcon, 
  History, 
  Settings, 
  FileUp, 
  LogOut, 
  Bell, 
  Search,
  CreditCard,
  ShieldCheck,
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock,
  FileText,
  BarChart3,
  Sun,
  Moon,
  X,
  Menu,
  MoreHorizontal
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Printer, PrintJob, SystemLog } from './types';
import { cn, formatCurrency, formatFileSize } from './lib/utils';

// --- Components ---

const Logo = ({ isDarkMode, className }: { isDarkMode: boolean, className?: string }) => (
  <div className={cn("flex items-center gap-3 group cursor-pointer", className)}>
    <div className="relative">
      <div className="w-12 h-12 rounded-2xl bg-kfupm flex items-center justify-center text-white shadow-lg shadow-kfupm/30 transform group-hover:rotate-12 transition-transform duration-300">
        <PrinterIcon size={24} />
      </div>
      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white dark:bg-zinc-900 rounded-lg border-2 border-kfupm flex items-center justify-center">
        <div className="w-1.5 h-1.5 bg-kfupm rounded-full animate-pulse"></div>
      </div>
    </div>
    <div className="flex flex-col">
      <span className={cn("text-2xl font-black leading-none tracking-tighter", isDarkMode ? "text-white" : "text-zinc-900")}>
        EZ<span className="text-kfupm">Print</span>
      </span>
      <span className="text-[10px] text-zinc-400 uppercase tracking-[0.2em] font-black">KFUPM Edition</span>
    </div>
  </div>
);

const SidebarItem = ({ icon: Icon, label, active, onClick, badge, isDark }: { icon: any, label: string, active?: boolean, onClick: () => void, badge?: number, isDark?: boolean }) => (
  <button
    onClick={onClick}
    className={cn(
      "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
      active 
        ? "bg-kfupm text-white shadow-lg shadow-kfupm/20" 
        : isDark 
          ? "text-zinc-400 hover:bg-zinc-800 hover:text-white" 
          : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
    )}
  >
    <Icon size={20} className={cn("transition-transform group-hover:scale-110", active ? "text-white" : "text-zinc-400")} />
    <span className="font-bold text-sm tracking-tight">{label}</span>
    {badge !== undefined && badge > 0 && (
      <span className="ml-auto bg-kfupm text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">
        {badge}
      </span>
    )}
  </button>
);

const Card = ({ children, className, title, subtitle, action, isDark }: { children: React.ReactNode, className?: string, title?: string, subtitle?: string, action?: React.ReactNode, isDark?: boolean, key?: React.Key }) => (
  <div className={cn(
    "rounded-2xl overflow-hidden shadow-sm transition-colors duration-300 border",
    isDark ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200",
    className
  )}>
    {(title || subtitle || action) && (
      <div className={cn("px-6 py-4 border-b flex items-center justify-between", isDark ? "border-zinc-800" : "border-zinc-100")}>
        <div>
          {title && <h3 className={cn("font-bold tracking-tight", isDark ? "text-white" : "text-zinc-900")}>{title}</h3>}
          {subtitle && <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
    )}
    <div className="p-6">{children}</div>
  </div>
);

const StatCard = ({ icon: Icon, label, value, trend, color, isDark }: { icon: any, label: string, value: string | number, trend?: string, color: string, isDark?: boolean }) => (
  <Card className="p-0" isDark={isDark}>
    <div className="p-6 flex items-start justify-between">
      <div>
        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{label}</p>
        <h4 className={cn("text-2xl font-black mt-1", isDark ? "text-white" : "text-zinc-900")}>{value}</h4>
        {trend && <p className="text-[10px] text-emerald-500 font-bold mt-1 uppercase tracking-wider">{trend}</p>}
      </div>
      <div className={cn("p-3 rounded-xl shadow-lg", color)}>
        <Icon size={20} className="text-white" />
      </div>
    </div>
  </Card>
);

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [jobs, setJobs] = useState<PrintJob[]>([]);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [loginUsername, setLoginUsername] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchData();
      const interval = setInterval(fetchData, 5000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const [pRes, jRes, lRes, uRes] = await Promise.all([
        fetch('/api/printers'),
        fetch('/api/jobs'),
        fetch('/api/logs'),
        fetch('/api/users')
      ]);
      setPrinters(await pRes.json());
      setJobs(await jRes.json());
      setLogs(await lRes.json());
      setUsers(await uRes.json());
    } catch (e) {
      console.error("Fetch error", e);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: loginUsername })
    });
    if (res.ok) {
      setUser(await res.json());
    } else {
      alert("Invalid user");
    }
  };

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setIsUploading(true);
    
    // Simulate file processing
    await new Promise(r => setTimeout(r, 1500));

    const newJob = {
      userId: user.id,
      userName: user.fullName,
      fileName: file.name,
      fileSize: file.size,
      pageCount: Math.floor(Math.random() * 20) + 1,
      attributes: { color: false, duplex: true },
      cost: 0.50 // Mock cost
    };

    await fetch('/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newJob)
    });

    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    fetchData();
    setActiveTab('pending');
  };

  const [selectedPrinter, setSelectedPrinter] = useState<string | null>(null);
  const [isReleasing, setIsReleasing] = useState(false);

  const handleReleaseJob = async (jobId: string, printerId: string) => {
    setIsReleasing(true);
    try {
      const res = await fetch(`/api/jobs/${jobId}/release`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ printerId })
      });
      if (res.ok) {
        fetchData();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to release job");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsReleasing(false);
    }
  };

  if (!user) {
    return (
      <div className={cn("min-h-screen flex items-center justify-center p-4 transition-colors duration-300", isDarkMode ? "bg-zinc-950" : "bg-white")}>
        <div className="absolute top-6 right-6">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={cn(
              "p-3 rounded-full shadow-lg border transition-all hover:scale-110",
              isDarkMode ? "bg-zinc-900 border-zinc-800 text-yellow-400" : "bg-white border-zinc-200 text-zinc-600"
            )}
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className={cn("shadow-2xl rounded-sm overflow-hidden border transition-colors duration-300", isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-100")}>
            <div className="p-10 text-center">
              {/* KFUPM Logo Simulation */}
              <div className="flex justify-center mb-6">
                <div className="w-16 h-20 border-4 border-kfupm relative flex items-center justify-center">
                  <div className={cn("absolute top-0 left-0 right-0 h-1/2 z-10", isDarkMode ? "bg-zinc-900" : "bg-white")}></div>
                  <div className="w-10 h-14 bg-kfupm rounded-t-full relative z-0"></div>
                </div>
              </div>
              
              <h1 className="text-xl font-medium text-kfupm mb-1 tracking-tight">KFUPM <span className={isDarkMode ? "text-zinc-300" : "text-zinc-700"}>Central Authentication Service</span></h1>
              <p className={cn("text-sm mb-8", isDarkMode ? "text-zinc-500" : "text-zinc-600")}>Sign in with your KFUPM account</p>

              <form onSubmit={handleLogin} className="space-y-6">
                <div className="relative">
                  <input 
                    type="text" 
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    placeholder="Username"
                    className={cn(
                      "w-full px-4 py-3 border rounded-sm focus:outline-none focus:ring-1 focus:ring-kfupm focus:border-kfupm transition-all text-right",
                      isDarkMode ? "bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500" : "bg-white border-zinc-300 text-zinc-900"
                    )}
                    required
                  />
                </div>
                <div className="relative">
                  <input 
                    type="password" 
                    placeholder="كلمة المرور"
                    className={cn(
                      "w-full px-4 py-3 border-2 rounded-sm focus:outline-none focus:ring-1 focus:ring-kfupm focus:border-kfupm transition-all text-right",
                      isDarkMode ? "bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500" : "bg-white border-zinc-900"
                    )}
                    required
                  />
                </div>
                <div className="flex justify-center pt-4">
                  <button 
                    type="submit"
                    className="px-10 py-2 bg-kfupm text-white font-medium rounded-sm hover:bg-emerald-800 transition-colors shadow-md"
                  >
                    تسجيل الدخول
                  </button>
                </div>
              </form>
            </div>
            <div className="bg-zinc-700 dark:bg-zinc-800 p-6 flex justify-end">
              <button className="text-kfupm text-sm hover:underline font-medium">?Need Help</button>
            </div>
          </div>
          <div className="mt-8 text-center">
            <p className="text-xs text-zinc-400">Demo accounts: admin, subadmin, student1</p>
          </div>
        </motion.div>
      </div>
    );
  }

  const userJobs = jobs.filter(j => j.userId === user.id);
  const pendingJobs = userJobs.filter(j => j.status === 'PENDING');

  return (
    <div className={cn("min-h-screen flex transition-colors duration-300", isDarkMode ? "bg-zinc-950 text-zinc-100" : "bg-zinc-50 text-zinc-900")}>
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 border-r transition-all duration-300 lg:translate-x-0 lg:static lg:h-screen flex flex-col p-6",
        isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200",
        isSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between mb-10 px-2">
          <Logo isDarkMode={isDarkMode} />
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 space-y-1">
          <SidebarItem 
            icon={LayoutDashboard} 
            label="Dashboard" 
            active={activeTab === 'dashboard'} 
            onClick={() => {
              setActiveTab('dashboard');
              setIsSidebarOpen(false);
            }} 
            isDark={isDarkMode}
          />
          <SidebarItem 
            icon={FileUp} 
            label="Web Print" 
            active={activeTab === 'upload'} 
            onClick={() => {
              setActiveTab('upload');
              setIsSidebarOpen(false);
            }} 
            isDark={isDarkMode}
          />
          <SidebarItem 
            icon={Clock} 
            label="Pending Jobs" 
            active={activeTab === 'pending'} 
            onClick={() => {
              setActiveTab('pending');
              setIsSidebarOpen(false);
            }} 
            badge={pendingJobs.length}
            isDark={isDarkMode}
          />
          <SidebarItem 
            icon={History} 
            label="Print History" 
            active={activeTab === 'history'} 
            onClick={() => {
              setActiveTab('history');
              setIsSidebarOpen(false);
            }} 
            isDark={isDarkMode}
          />
          
          {(user.role === 'ADMIN' || user.role === 'SUB_ADMIN') && (
            <div className={cn("pt-6 mt-6 border-t", isDarkMode ? "border-zinc-800" : "border-zinc-100")}>
              <p className="px-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4">Administration</p>
              {user.role === 'ADMIN' && (
                <>
                  <SidebarItem 
                    icon={UsersIcon} 
                    label="User Management" 
                    active={activeTab === 'admin-users'} 
                    onClick={() => {
                      setActiveTab('admin-users');
                      setIsSidebarOpen(false);
                    }} 
                    isDark={isDarkMode}
                  />
                  <SidebarItem 
                    icon={PrinterIcon} 
                    label="Printers" 
                    active={activeTab === 'admin-printers'} 
                    onClick={() => {
                      setActiveTab('admin-printers');
                      setIsSidebarOpen(false);
                    }} 
                    isDark={isDarkMode}
                  />
                </>
              )}
              <SidebarItem 
                icon={BarChart3} 
                label="Reports" 
                active={activeTab === 'admin-reports'} 
                onClick={() => {
                  setActiveTab('admin-reports');
                  setIsSidebarOpen(false);
                }} 
                isDark={isDarkMode}
              />
              <SidebarItem 
                icon={Activity} 
                label="System Logs" 
                active={activeTab === 'admin-logs'} 
                onClick={() => {
                  setActiveTab('admin-logs');
                  setIsSidebarOpen(false);
                }} 
                isDark={isDarkMode}
              />
            </div>
          )}
          
          <div className={cn("pt-6 mt-6 border-t", isDarkMode ? "border-zinc-800" : "border-zinc-100")}>
            <p className="px-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4">Device Simulation</p>
            <SidebarItem 
              icon={PrinterIcon} 
              label="Printer Console" 
              active={activeTab === 'printer-sim'} 
              onClick={() => {
                setActiveTab('printer-sim');
                setIsSidebarOpen(false);
              }} 
              isDark={isDarkMode}
            />
          </div>
        </nav>

        <div className="mt-auto pt-6 border-t border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-3 px-2 mb-4">
            <div className={cn("w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm", isDarkMode ? "bg-zinc-800 text-zinc-300" : "bg-zinc-100 text-zinc-500")}>
              {user.username[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className={cn("text-sm font-bold truncate", isDarkMode ? "text-white" : "text-zinc-900")}>{user.fullName}</p>
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">{user.role}</p>
            </div>
          </div>
          <button 
            onClick={() => setUser(null)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group",
              isDarkMode ? "text-zinc-400 hover:text-red-400 hover:bg-red-400/10" : "text-zinc-500 hover:text-red-600 hover:bg-red-50"
            )}
          >
            <LogOut size={18} className="group-hover:translate-x-1 transition-transform" />
            <span className="text-sm font-bold">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Header */}
        <header className={cn(
          "h-20 border-b flex items-center justify-between px-6 lg:px-10 sticky top-0 z-30 transition-colors duration-300",
          isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200"
        )}>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              <Menu size={24} />
            </button>
            <div>
              <h1 className={cn("text-xl font-black capitalize", isDarkMode ? "text-white" : "text-zinc-900")}>{activeTab.replace('-', ' ')}</h1>
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest hidden sm:block">Welcome back, {user.fullName.split(' ')[0]}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-6">
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={cn(
                "p-2.5 rounded-xl border transition-all",
                isDarkMode ? "bg-zinc-800 border-zinc-700 text-yellow-400" : "bg-zinc-50 border-zinc-100 text-zinc-500"
              )}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div className={cn("hidden sm:flex items-center gap-3 px-4 py-2 rounded-xl border transition-colors", isDarkMode ? "bg-zinc-800 border-zinc-700" : "bg-zinc-50 border-zinc-100")}>
              <CreditCard size={18} className="text-kfupm" />
              <div className="text-left">
                <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest leading-none">Balance</p>
                <p className={cn("text-sm font-black mt-0.5", isDarkMode ? "text-white" : "text-zinc-900")}>{formatCurrency(user.balance)}</p>
              </div>
            </div>
            <div className="h-8 w-px bg-zinc-200 dark:bg-zinc-800 hidden md:block"></div>
            <button className={cn("p-2.5 rounded-xl border transition-all relative hidden md:block", isDarkMode ? "bg-zinc-800 border-zinc-700 text-zinc-400" : "bg-zinc-50 border-zinc-100 text-zinc-500")}>
              <Bell size={20} />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-zinc-800"></span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 lg:p-10 custom-scrollbar">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'dashboard' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard 
                    icon={PrinterIcon} 
                    label="Pages Printed" 
                    value={user.totalPagesPrinted} 
                    trend="+12% from last month"
                    color="bg-kfupm"
                    isDark={isDarkMode}
                  />
                  <StatCard 
                    icon={FileText} 
                    label="Total Jobs" 
                    value={user.totalJobsSubmitted} 
                    color="bg-zinc-800"
                    isDark={isDarkMode}
                  />
                  <StatCard 
                    icon={ShieldCheck} 
                    label="Account Status" 
                    value={user.restricted ? "Restricted" : "Active"} 
                    color={user.restricted ? "bg-red-500" : "bg-kfupm"}
                    isDark={isDarkMode}
                  />
                  <StatCard 
                    icon={Clock} 
                    label="Pending Jobs" 
                    value={pendingJobs.length} 
                    color="bg-kfupm"
                    isDark={isDarkMode}
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <Card className="lg:col-span-2" title="Recent Activity" subtitle="Your last 5 print transactions" isDark={isDarkMode}>
                    <div className="space-y-4">
                      {userJobs.slice(0, 5).map(job => (
                        <div key={job.id} className={cn(
                          "flex items-center justify-between p-4 rounded-xl border transition-colors",
                          isDarkMode ? "bg-zinc-800/50 border-zinc-700" : "bg-zinc-50 border-zinc-100"
                        )}>
                          <div className="flex items-center gap-4">
                            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center border transition-colors", isDarkMode ? "bg-zinc-700 border-zinc-600 text-zinc-400" : "bg-white border-zinc-200 text-zinc-400")}>
                              <FileText size={20} />
                            </div>
                            <div>
                              <p className={cn("text-sm font-bold", isDarkMode ? "text-white" : "text-zinc-900")}>{job.fileName}</p>
                              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">{new Date(job.submittedAt).toLocaleDateString()} • {job.pageCount} pages</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={cn("text-sm font-black", isDarkMode ? "text-white" : "text-zinc-900")}>-{formatCurrency(job.cost)}</p>
                            <span className={cn(
                              "text-[10px] font-black uppercase px-2 py-0.5 rounded-full tracking-widest",
                              job.status === 'PRINTED' ? "bg-kfupm/10 text-kfupm" : "bg-kfupm/10 text-kfupm"
                            )}>
                              {job.status}
                            </span>
                          </div>
                        </div>
                      ))}
                      {userJobs.length === 0 && (
                        <div className="text-center py-12">
                          <History size={48} className="mx-auto text-zinc-200 mb-4" />
                          <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs">No recent activity found.</p>
                        </div>
                      )}
                    </div>
                  </Card>

                  <Card title="Printer Status" subtitle="Available printers in CCM" isDark={isDarkMode}>
                    <div className="space-y-4">
                      {printers.map(printer => (
                        <div key={printer.id} className={cn(
                          "flex items-center justify-between p-3 rounded-xl border transition-colors",
                          isDarkMode ? "bg-zinc-800/30 border-zinc-800" : "bg-zinc-50/50 border-zinc-100"
                        )}>
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-2 h-2 rounded-full shadow-sm",
                              printer.status === 'ACTIVE' ? "bg-kfupm" : "bg-red-500"
                            )}></div>
                            <div>
                              <p className={cn("text-sm font-bold", isDarkMode ? "text-white" : "text-zinc-900")}>{printer.name}</p>
                              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">{printer.location}</p>
                            </div>
                          </div>
                          <span className={cn("text-[10px] font-black uppercase tracking-widest", printer.status === 'ACTIVE' ? "text-kfupm" : "text-red-500")}>{printer.status}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === 'upload' && (
              <div className="max-w-2xl mx-auto">
                <Card title="Submit New Print Job" subtitle="Upload your document to the secure CCM queue" isDark={isDarkMode}>
                  <div className="space-y-8">
                    <label className="block">
                      <input 
                        type="file" 
                        ref={fileInputRef}
                        className="hidden" 
                        onChange={handleUpload}
                        accept=".pdf,.docx,.png,.jpg"
                      />
                      <div className={cn(
                        "border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer group",
                        isDarkMode ? "border-zinc-800 hover:border-kfupm bg-zinc-800/20" : "border-zinc-200 hover:border-kfupm bg-zinc-50/50"
                      )}>
                        <div className={cn(
                          "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-kfupm group-hover:text-white transition-all",
                          isDarkMode ? "bg-zinc-800 text-zinc-500" : "bg-zinc-50 text-zinc-400"
                        )}>
                          <FileUp size={32} />
                        </div>
                        <h4 className={cn("font-black tracking-tight", isDarkMode ? "text-white" : "text-zinc-900")}>Click to upload or drag and drop</h4>
                        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-2">PDF, DOCX, or PNG (Max. 20MB)</p>
                      </div>
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Color Mode</label>
                        <select className={cn(
                          "w-full p-3 border rounded-xl focus:outline-none focus:border-kfupm font-bold text-sm transition-colors",
                          isDarkMode ? "bg-zinc-800 border-zinc-700 text-white" : "bg-zinc-50 border-zinc-200 text-zinc-900"
                        )}>
                          <option>Black & White</option>
                          <option>Full Color</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Duplex</label>
                        <select className={cn(
                          "w-full p-3 border rounded-xl focus:outline-none focus:border-kfupm font-bold text-sm transition-colors",
                          isDarkMode ? "bg-zinc-800 border-zinc-700 text-white" : "bg-zinc-50 border-zinc-200 text-zinc-900"
                        )}>
                          <option>Two-Sided (Long Edge)</option>
                          <option>Single-Sided</option>
                        </select>
                      </div>
                    </div>

                    <div className={cn("rounded-xl p-4 flex items-start gap-3", isDarkMode ? "bg-zinc-800/50" : "bg-zinc-50")}>
                      <AlertCircle className="text-kfupm shrink-0" size={18} />
                      <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest leading-relaxed">
                        Jobs are held for 24 hours. You must authenticate at a physical printer device to release and print your document.
                      </p>
                    </div>

                    <button 
                      type="button"
                      disabled={isUploading}
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-4 bg-kfupm text-white font-black uppercase tracking-widest text-sm rounded-xl hover:bg-emerald-800 transition-all shadow-xl shadow-kfupm/20 flex items-center justify-center gap-2"
                    >
                      {isUploading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <FileUp size={20} />
                          Select File to Print
                        </>
                      )}
                    </button>
                  </div>
                </Card>
              </div>
            )}

            {activeTab === 'pending' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">You have <span className={cn("font-black", isDarkMode ? "text-white" : "text-zinc-900")}>{pendingJobs.length}</span> jobs waiting to be released.</p>
                  <button className={cn("text-[10px] font-black uppercase tracking-widest hover:underline", isDarkMode ? "text-white" : "text-zinc-900")}>Release All</button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {pendingJobs.map(job => (
                    <Card key={job.id} className="group hover:border-kfupm transition-all" isDark={isDarkMode}>
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center transition-all",
                            isDarkMode ? "bg-zinc-800 text-zinc-500 group-hover:bg-kfupm group-hover:text-white" : "bg-zinc-100 text-zinc-400 group-hover:bg-kfupm group-hover:text-white"
                          )}>
                            <FileText size={24} />
                          </div>
                          <div>
                            <h4 className={cn("font-black tracking-tight", isDarkMode ? "text-white" : "text-zinc-900")}>{job.fileName}</h4>
                            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-1">{formatFileSize(job.fileSize)} • {job.pageCount} pages</p>
                          </div>
                        </div>
                        <button className={cn("p-2 rounded-lg transition-colors", isDarkMode ? "text-zinc-500 hover:text-red-400 hover:bg-red-400/10" : "text-zinc-400 hover:text-red-600 hover:bg-red-50")}>
                          <X size={18} />
                        </button>
                      </div>
                      
                      <div className={cn("flex items-center gap-4 pt-4 border-t", isDarkMode ? "border-zinc-800" : "border-zinc-100")}>
                        <div className="flex-1">
                          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Estimated Cost</p>
                          <p className={cn("text-sm font-black mt-0.5", isDarkMode ? "text-white" : "text-zinc-900")}>{formatCurrency(job.cost)}</p>
                        </div>
                        <div className="flex gap-2">
                          <button className={cn(
                            "px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all",
                            isDarkMode ? "bg-zinc-800 text-white hover:bg-zinc-700" : "bg-zinc-100 text-zinc-900 hover:bg-zinc-200"
                          )}>
                            Settings
                          </button>
                          <button className="px-4 py-2 bg-kfupm text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-800 transition-all shadow-lg shadow-kfupm/20">
                            Release
                          </button>
                        </div>
                      </div>
                    </Card>
                  ))}
                  {pendingJobs.length === 0 && (
                    <div className="col-span-full py-20 text-center">
                      <div className={cn("w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4", isDarkMode ? "bg-zinc-800 text-zinc-700" : "bg-zinc-100 text-zinc-300")}>
                        <Clock size={32} />
                      </div>
                      <h3 className={cn("font-black tracking-tight", isDarkMode ? "text-white" : "text-zinc-900")}>No pending jobs</h3>
                      <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-2">Upload a document to see it here.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-6">
                <Card title="Print History" subtitle="Your past print transactions" isDark={isDarkMode}>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className={cn("border-b", isDarkMode ? "border-zinc-800" : "border-zinc-100")}>
                          <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Document</th>
                          <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Date</th>
                          <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Pages</th>
                          <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Cost</th>
                          <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Status</th>
                        </tr>
                      </thead>
                      <tbody className={cn("divide-y", isDarkMode ? "divide-zinc-800/50" : "divide-zinc-50")}>
                        {userJobs.filter(j => j.status === 'PRINTED').map(job => (
                          <tr key={job.id} className={cn("group transition-colors", isDarkMode ? "hover:bg-zinc-800/50" : "hover:bg-zinc-50")}>
                            <td className="py-4">
                              <div className="flex items-center gap-3">
                                <FileText size={16} className="text-kfupm" />
                                <span className={cn("text-sm font-bold", isDarkMode ? "text-white" : "text-zinc-900")}>{job.fileName}</span>
                              </div>
                            </td>
                            <td className="py-4 text-xs text-zinc-500">{new Date(job.submittedAt).toLocaleDateString()}</td>
                            <td className="py-4 text-xs text-zinc-500">{job.pageCount}</td>
                            <td className={cn("py-4 text-sm font-black", isDarkMode ? "text-white" : "text-zinc-900")}>{formatCurrency(job.cost)}</td>
                            <td className="py-4">
                              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-kfupm/10 text-kfupm uppercase tracking-widest">
                                {job.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {userJobs.filter(j => j.status === 'PRINTED').length === 0 && (
                      <div className="text-center py-20">
                        <History size={48} className="mx-auto text-zinc-200 mb-4" />
                        <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs">No print history found.</p>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            )}

            {activeTab === 'admin-users' && (
              <div className="space-y-6">
                <Card title="User Management" subtitle="Manage student and staff accounts" isDark={isDarkMode}>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className={cn("border-b", isDarkMode ? "border-zinc-800" : "border-zinc-100")}>
                          <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">User</th>
                          <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Role</th>
                          <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Balance</th>
                          <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Status</th>
                          <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className={cn("divide-y", isDarkMode ? "divide-zinc-800/50" : "divide-zinc-50")}>
                        {users.map(u => (
                          <tr key={u.id} className={cn("group transition-colors", isDarkMode ? "hover:bg-zinc-800/50" : "hover:bg-zinc-50")}>
                            <td className="py-4">
                              <div className="flex items-center gap-3">
                                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black", isDarkMode ? "bg-zinc-800 text-zinc-400" : "bg-zinc-100 text-zinc-500")}>
                                  {u.fullName.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div>
                                  <p className={cn("text-sm font-bold", isDarkMode ? "text-white" : "text-zinc-900")}>{u.fullName}</p>
                                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{u.id}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4">
                              <span className={cn(
                                "text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest",
                                u.role === 'ADMIN' ? "bg-purple-100 text-purple-700" : 
                                u.role === 'SUB_ADMIN' ? "bg-blue-100 text-blue-700" : "bg-zinc-100 text-zinc-700"
                              )}>
                                {u.role}
                              </span>
                            </td>
                            <td className={cn("py-4 text-sm font-black", isDarkMode ? "text-white" : "text-zinc-900")}>{formatCurrency(u.balance)}</td>
                            <td className="py-4">
                              <span className={cn(
                                "w-2 h-2 rounded-full inline-block",
                                u.restricted ? "bg-red-500" : "bg-kfupm"
                              )}></span>
                            </td>
                            <td className="py-4 text-right">
                              <button className={cn("p-2 rounded-lg transition-colors", isDarkMode ? "text-zinc-500 hover:text-white hover:bg-zinc-800" : "text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100")}>
                                <MoreHorizontal size={18} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            )}

            {activeTab === 'admin-printers' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {printers.map(printer => (
                    <Card key={printer.id} title={printer.name} subtitle={printer.location} isDark={isDarkMode}>
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Status</span>
                          <span className={cn(
                            "text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest",
                            printer.status === 'ACTIVE' ? "bg-kfupm/10 text-kfupm" : "bg-red-100 text-red-700"
                          )}>
                            {printer.status}
                          </span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                            <span className="text-zinc-400">Toner Level</span>
                            <span className={isDarkMode ? "text-white" : "text-zinc-900"}>{printer.tonerLevel}%</span>
                          </div>
                          <div className={cn("h-1.5 rounded-full overflow-hidden", isDarkMode ? "bg-zinc-800" : "bg-zinc-100")}>
                            <div 
                              className={cn("h-full transition-all duration-500", printer.tonerLevel < 20 ? "bg-red-500" : "bg-kfupm")} 
                              style={{ width: `${printer.tonerLevel}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                            <span className="text-zinc-400">Paper Level</span>
                            <span className={isDarkMode ? "text-white" : "text-zinc-900"}>{printer.paperLevel}%</span>
                          </div>
                          <div className={cn("h-1.5 rounded-full overflow-hidden", isDarkMode ? "bg-zinc-800" : "bg-zinc-100")}>
                            <div 
                              className="h-full bg-kfupm transition-all duration-500" 
                              style={{ width: `${printer.paperLevel}%` }}
                            ></div>
                          </div>
                        </div>
                        <button className={cn(
                          "w-full py-2.5 rounded-xl border font-black uppercase tracking-widest text-[10px] transition-all",
                          isDarkMode ? "bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700" : "bg-zinc-50 border-zinc-100 text-zinc-900 hover:bg-zinc-100"
                        )}>
                          Manage Printer
                        </button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'admin-reports' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <StatCard 
                    icon={BarChart3} 
                    label="Total Revenue" 
                    value={formatCurrency(12450)} 
                    trend="+8% this week"
                    color="bg-kfupm"
                    isDark={isDarkMode}
                  />
                  <StatCard 
                    icon={PrinterIcon} 
                    label="Total Pages" 
                    value="45,230" 
                    trend="+15% this week"
                    color="bg-kfupm"
                    isDark={isDarkMode}
                  />
                  <StatCard 
                    icon={UsersIcon} 
                    label="Active Users" 
                    value="1,240" 
                    trend="+2% this week"
                    color="bg-zinc-800"
                    isDark={isDarkMode}
                  />
                </div>
                
                <Card title="Usage Trends" subtitle="Daily print volume across campus" isDark={isDarkMode}>
                  <div className="h-64 flex items-end justify-between gap-2 px-4">
                    {[45, 67, 89, 54, 78, 92, 65].map((h, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2">
                        <div 
                          className="w-full bg-kfupm/20 rounded-t-lg hover:bg-kfupm transition-all cursor-pointer relative group"
                          style={{ height: `${h}%` }}
                        >
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-zinc-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                            {h * 100}
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Day {i + 1}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {activeTab === 'admin-logs' && (
              <Card title="System Activity Logs" subtitle="Real-time monitoring of all system events" isDark={isDarkMode}>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className={cn("border-b", isDarkMode ? "border-zinc-800" : "border-zinc-100")}>
                        <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Timestamp</th>
                        <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Level</th>
                        <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Source</th>
                        <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Message</th>
                      </tr>
                    </thead>
                    <tbody className={cn("divide-y", isDarkMode ? "divide-zinc-800/50" : "divide-zinc-50")}>
                      {logs.map(log => (
                        <tr key={log.id} className={cn("group transition-colors", isDarkMode ? "hover:bg-zinc-800/50" : "hover:bg-zinc-50")}>
                          <td className="py-4 text-xs text-zinc-500 font-mono">{new Date(log.timestamp).toLocaleString()}</td>
                          <td className="py-4">
                            <span className={cn(
                              "text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest",
                              log.level === 'INFO' ? "bg-blue-100 text-blue-700" : 
                              log.level === 'WARNING' ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                            )}>
                              {log.level}
                            </span>
                          </td>
                          <td className={cn("py-4 text-xs font-bold", isDarkMode ? "text-white" : "text-zinc-900")}>{log.source}</td>
                          <td className={cn("py-4 text-xs", isDarkMode ? "text-zinc-400" : "text-zinc-600")}>{log.message}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            {activeTab === 'printer-sim' && (
              <div className="max-w-4xl mx-auto">
                <div className={cn(
                  "rounded-3xl p-8 shadow-2xl border-8 transition-all duration-500",
                  isDarkMode ? "bg-zinc-900 border-zinc-800 text-white" : "bg-zinc-800 border-zinc-700 text-white"
                )}>
                  <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                        <PrinterIcon size={24} />
                      </div>
                      <div>
                        <h2 className="text-xl font-black tracking-tight">Printer Console</h2>
                        <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">CCM-Lobby-01 • Building 22</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">System Status</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-black text-emerald-500">READY</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-1 space-y-6">
                      <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-4">Identify User</p>
                        <div className="space-y-4">
                          <div className="flex items-center gap-3 p-3 bg-white/10 rounded-xl border border-white/10">
                            <CreditCard size={18} className="text-white/60" />
                            <span className="text-sm font-bold">Tap ID Card</span>
                          </div>
                          <p className="text-[10px] text-center text-white/20 uppercase font-black">OR</p>
                          <div className="text-center p-4 border border-dashed border-white/20 rounded-xl">
                            <p className="text-[10px] text-white/60 font-bold uppercase tracking-widest">Logged in as</p>
                            <p className="text-sm font-black mt-1 text-kfupm">{user.fullName}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Credits Available</p>
                        <p className="text-2xl font-black text-white">{formatCurrency(user.balance)}</p>
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-4">Your Pending Jobs</p>
                      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {pendingJobs.map(job => (
                          <div key={job.id} className="p-4 bg-white/10 rounded-2xl border border-white/10 flex items-center justify-between group hover:bg-white/20 transition-all">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white/40">
                                <FileText size={20} />
                              </div>
                              <div>
                                <p className="text-sm font-bold">{job.fileName}</p>
                                <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mt-1">{job.pageCount} Pages • {formatCurrency(job.cost)}</p>
                              </div>
                            </div>
                            <button 
                              onClick={() => handleReleaseJob(job.id, 'p1')}
                              disabled={isReleasing || user.balance < job.cost}
                              className={cn(
                                "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                user.balance < job.cost 
                                  ? "bg-red-500/20 text-red-400 cursor-not-allowed" 
                                  : "bg-kfupm text-white hover:bg-emerald-800 shadow-lg shadow-kfupm/20"
                              )}
                            >
                              {isReleasing ? "Printing..." : user.balance < job.cost ? "Low Credits" : "Print Now"}
                            </button>
                          </div>
                        ))}
                        {pendingJobs.length === 0 && (
                          <div className="text-center py-20 bg-white/5 rounded-2xl border border-dashed border-white/10">
                            <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">No jobs found in your queue.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className={cn(
                  "mt-8 flex items-center gap-4 p-4 rounded-2xl border transition-colors",
                  isDarkMode ? "bg-amber-900/20 border-amber-900/30 text-amber-200" : "bg-amber-50 border-amber-100 text-amber-700"
                )}>
                  <AlertCircle className="text-amber-500" size={20} />
                  <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                    <strong>Simulation Mode:</strong> This view represents the physical interface on a printer device. In a real deployment, this would be locked to the specific hardware.
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
