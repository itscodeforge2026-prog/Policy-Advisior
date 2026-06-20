import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Calendar, FileText, Upload, Bell, ShieldCheck, HelpCircle } from 'lucide-react';

export const CustomerDashboard: React.FC = () => {
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'meetings' | 'reports' | 'history' | 'documents' | 'notifications'>('meetings');
  
  const [appointments, setAppointments] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);

  // Document Upload Form
  const [docForm, setDocForm] = useState({ name: '', type: 'PAN' });
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);

  const fetchDashboardData = async () => {
    try {
      if (activeTab === 'meetings') {
        const res = await api.get('/appointments');
        setAppointments(res.data);
      } else if (activeTab === 'reports') {
        // Fetch Needs analysis reports history.
        // We can get history from calculator log or customize.
        // To be safe, we query needs reports or fallbacks.
        const res = await api.get('/calculator/history'); // Using calculator logs as reports list or customize
        setReports(res.data);
      } else if (activeTab === 'history') {
        const res = await api.get('/calculator/history');
        setHistory(res.data);
      } else if (activeTab === 'documents') {
        const res = await api.get('/documents');
        setDocuments(res.data);
      } else if (activeTab === 'notifications') {
        // Mock notifications lists since no heavy notifier exists yet
        setNotifications([
          { id: '1', type: 'WELCOME', message: 'Welcome to Policy Advisor! Begin by taking our Needs Analysis Quiz.', isRead: false },
          { id: '2', type: 'INFO', message: 'Read our latest blog: Why Term Insurance is the Foundation of Financial Planning.', isRead: true }
        ]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [activeTab]);

  const handleCancelMeeting = async (id: string) => {
    try {
      await api.put(`/appointments/${id}`, { status: 'CANCELLED' });
      fetchDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUploadDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadLoading(true);
    setUploadSuccess(false);
    try {
      await api.post('/documents/upload', docForm);
      setUploadSuccess(true);
      setDocForm({ name: '', type: 'PAN' });
      fetchDashboardData();
    } catch (err) {
      console.error(err);
    } finally {
      setUploadLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 font-sans">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* SIDEBAR NAVIGATION */}
          <div className="lg:col-span-1 space-y-6">
            <div className="p-6 rounded-2xl glass space-y-4">
              <div className="space-y-1">
                <h2 className="text-xl font-bold font-outfit text-slate-800 dark:text-slate-200">{user?.name}</h2>
                <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded uppercase">Customer Portal</span>
              </div>
              <p className="text-xs text-slate-400">Manage documents, appointments, and report illustrations.</p>
            </div>

            <div className="rounded-2xl glass overflow-hidden flex flex-col">
              {[
                { id: 'meetings', label: 'Consultations', icon: Calendar },
                { id: 'history', label: 'Premium History', icon: FileText },
                { id: 'documents', label: 'KYC Document Safe', icon: Upload },
                { id: 'notifications', label: 'Notifications', icon: Bell }
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className={`flex items-center gap-3 px-5 py-4 border-l-4 text-xs font-semibold uppercase tracking-wider text-left transition-colors ${
                      activeTab === item.id
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-transparent text-slate-400 hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-4.5 h-4.5" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* MAIN CONTENT DISPLAY */}
          <div className="lg:col-span-3 rounded-2xl glass p-8 min-h-[500px]">
            
            {/* MEETINGS TAB */}
            {activeTab === 'meetings' && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold font-outfit">Consultations & Meetings</h3>
                <div className="space-y-4">
                  {appointments.map((a) => (
                    <div key={a.id} className="p-4 rounded-xl border border-slate-200 dark:border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/5">
                      <div className="space-y-1">
                        <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded font-medium text-slate-400 uppercase">{a.type}</span>
                        <h4 className="text-sm font-bold font-outfit">{a.purpose}</h4>
                        <p className="text-xs text-slate-400">
                          Date: {new Date(a.date).toLocaleDateString()} &bull; Slot: {a.timeSlot}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                          a.status === 'APPROVED' ? 'bg-green-500/20 text-green-400' :
                          a.status === 'CANCELLED' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {a.status}
                        </span>
                        {a.status === 'PENDING' && (
                          <button
                            onClick={() => handleCancelMeeting(a.id)}
                            className="px-3 py-1 border border-red-500/30 text-red-400 rounded text-[10px] font-semibold hover:bg-red-500/10 transition-colors"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {appointments.length === 0 && (
                    <div className="text-center py-12 text-slate-400 text-xs">No booked consultation sessions found.</div>
                  )}
                </div>
              </div>
            )}

            {/* PREMIUM HISTORY TAB */}
            {activeTab === 'history' && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold font-outfit">Saved Premium Calculations</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-white/10 text-slate-400">
                        <th className="py-3 px-2">Date</th>
                        <th className="py-3 px-2">Coverage (Sum Assured)</th>
                        <th className="py-3 px-2">Term</th>
                        <th className="py-3 px-2">Smoker status</th>
                        <th className="py-3 px-2 text-right">Est. Premium</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((item) => (
                        <tr key={item.id} className="border-b border-slate-100 dark:border-white/5 text-slate-600 dark:text-slate-300">
                          <td className="py-3 px-2">{new Date(item.createdAt).toLocaleDateString()}</td>
                          <td className="py-3 px-2">₹{item.inputs.coverage?.toLocaleString('en-IN') || item.inputs.coverage}</td>
                          <td className="py-3 px-2">{item.inputs.policyDuration} Yrs</td>
                          <td className="py-3 px-2">{item.inputs.smoker ? 'Yes' : 'No'}</td>
                          <td className="py-3 px-2 text-right font-bold text-primary">
                            ₹{item.results.annualPremium?.toLocaleString('en-IN') || item.results.annualPremium}/Yr
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {history.length === 0 && (
                    <div className="text-center py-12 text-slate-400 text-xs">No previous calculation illustrations logged.</div>
                  )}
                </div>
              </div>
            )}

            {/* DOCUMENTS TAB */}
            {activeTab === 'documents' && (
              <div className="space-y-8">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold font-outfit">KYC Document Safe</h3>
                  <span className="text-[10px] text-slate-400">Files stored securely in sandbox</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                  {/* Upload Form */}
                  <form onSubmit={handleUploadDoc} className="p-5 rounded-xl border border-slate-200 dark:border-white/5 space-y-4 bg-white/5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Upload New File</h4>
                    {uploadSuccess && <div className="p-2.5 bg-green-500/20 text-green-300 text-[10px] rounded">File uploaded successfully.</div>}
                    
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 font-medium">Document Description</label>
                      <input
                        type="text"
                        placeholder="e.g. Pancard Front, Aadhaar PDF"
                        className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary text-slate-800 dark:text-white"
                        value={docForm.name}
                        onChange={(e) => setDocForm({ ...docForm, name: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 font-medium">Document Type</label>
                      <select
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary text-slate-800 dark:text-slate-300"
                        value={docForm.type}
                        onChange={(e) => setDocForm({ ...docForm, type: e.target.value })}
                      >
                        <option value="PAN">PAN Card</option>
                        <option value="AADHAAR">Aadhaar Card</option>
                        <option value="MEDICAL">Medical Report</option>
                        <option value="INCOME">Income Proof</option>
                        <option value="IDENTITY">Identity Proof</option>
                        <option value="ADDRESS">Address Proof</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      disabled={uploadLoading}
                      className="w-full py-2 bg-primary hover:bg-primary-600 rounded text-xs font-semibold transition-colors text-white"
                    >
                      {uploadLoading ? 'Uploading...' : 'Confirm Upload'}
                    </button>
                  </form>

                  {/* Documents list */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Uploaded Documents</h4>
                    {documents.map((d) => (
                      <div key={d.id} className="p-3 rounded-lg border border-slate-100 dark:border-white/5 flex justify-between items-center text-xs">
                        <div>
                          <span className="font-semibold block">{d.name}</span>
                          <span className="text-[10px] text-slate-400 uppercase">{d.type}</span>
                        </div>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                          d.status === 'VERIFIED' ? 'bg-green-500/20 text-green-400' :
                          d.status === 'REJECTED' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {d.status}
                        </span>
                      </div>
                    ))}
                    {documents.length === 0 && (
                      <div className="text-center py-6 text-slate-400 text-[10px]">No uploaded documents found.</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* NOTIFICATIONS TAB */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold font-outfit">Notifications</h3>
                <div className="space-y-3">
                  {notifications.map((n) => (
                    <div key={n.id} className={`p-4 rounded-xl border flex items-start gap-3 ${
                      n.isRead ? 'border-slate-200 dark:border-white/5 bg-white/5 text-slate-400' : 'border-primary/20 bg-primary/5 text-slate-200'
                    }`}>
                      <Bell className="w-5 h-5 shrink-0 mt-0.5 text-primary" />
                      <div className="space-y-1">
                        <p className="text-xs leading-relaxed">{n.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>
      </div>
    </Layout>
  );
};
export default CustomerDashboard;
