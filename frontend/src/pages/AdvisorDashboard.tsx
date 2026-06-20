import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Users, Calendar, Bot, ListFilter, ClipboardCheck, ArrowUpRight, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export const AdvisorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'crm' | 'meetings' | 'copywriter'>('crm');

  const [leads, setLeads] = useState<any[]>([]);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Copywriter Drafting Form state
  const [draftForm, setDraftForm] = useState({ name: '', purpose: '', date: '', notes: '' });
  const [draftResult, setDraftResult] = useState('');
  const [draftLoading, setDraftLoading] = useState(false);

  const fetchAdvisorData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'crm') {
        const res = await api.get('/crm/leads');
        setLeads(res.data);
      } else if (activeTab === 'meetings') {
        const res = await api.get('/appointments');
        setMeetings(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvisorData();
  }, [activeTab]);

  const handleUpdateLeadStatus = async (id: string, status: string) => {
    try {
      await api.put(`/crm/leads/${id}`, { status });
      fetchAdvisorData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateMeetingStatus = async (id: string, status: string) => {
    try {
      await api.put(`/appointments/${id}`, { status });
      fetchAdvisorData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerateDraft = async (action: 'email_followup' | 'whatsapp_followup' | 'meeting_notes') => {
    if (!draftForm.name) {
      alert('Please fill out the client name first.');
      return;
    }
    setDraftLoading(true);
    setDraftResult('');
    try {
      const res = await api.post('/ai/advisor-tools', {
        action,
        data: draftForm
      });
      setDraftResult(res.data.draft);
    } catch (err) {
      console.error(err);
      setDraftResult('AI Draft generation failed.');
    } finally {
      setDraftLoading(false);
    }
  };

  // Recharts Chart mock data
  const chartData = [
    { name: 'Interested', count: leads.filter(l => l.status === 'INTERESTED').length || 4 },
    { name: 'Follow Up', count: leads.filter(l => l.status === 'FOLLOW_UP').length || 6 },
    { name: 'Negotiation', count: leads.filter(l => l.status === 'NEGOTIATION').length || 3 },
    { name: 'Closed', count: leads.filter(l => l.status === 'CLOSED').length || 2 },
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8 font-sans">
        
        {/* WELCOME BAR */}
        <section className="flex justify-between items-center bg-slate-900 border border-white/5 rounded-2xl p-6 text-white">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold font-outfit">Welcome back, {user?.name}</h1>
            <span className="text-[10px] bg-accent/20 text-accent font-bold px-2 py-0.5 rounded uppercase">Advisor CRM Portal</span>
          </div>
          <div className="text-right text-xs text-slate-400">
            <div>Office: Manjalpur, Vadodara</div>
            <div>Hotline: +91 9825429228</div>
          </div>
        </section>

        {/* OVERVIEW STATS */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-5 rounded-2xl glass space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Active CRM Leads</span>
            <div className="text-3xl font-extrabold font-outfit text-primary">{leads.length || 15}</div>
            <span className="text-[9px] text-green-400 flex items-center gap-1 font-medium"><TrendingUp className="w-3 h-3" /> +12% this month</span>
          </div>
          <div className="p-5 rounded-2xl glass space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Pending Consultations</span>
            <div className="text-3xl font-extrabold font-outfit text-accent">{meetings.filter(m => m.status === 'PENDING').length || 3}</div>
            <span className="text-[9px] text-slate-400">Requires scheduling confirmation</span>
          </div>
          <div className="p-5 rounded-2xl glass space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Lead Conversion Rate</span>
            <div className="text-3xl font-extrabold font-outfit text-primary">28.4%</div>
            <span className="text-[9px] text-slate-400">Average closing time: 8 days</span>
          </div>
          <div className="p-5 rounded-2xl glass space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Estimated Pipeline Value</span>
            <div className="text-3xl font-extrabold font-outfit text-accent">₹1.8L</div>
            <span className="text-[9px] text-slate-400">Projected commission potentials</span>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* SIDEBAR TABS */}
          <div className="lg:col-span-3 rounded-2xl glass overflow-hidden flex flex-col">
            {[
              { id: 'crm', label: 'CRM Leads', icon: Users },
              { id: 'meetings', label: 'Consultations', icon: Calendar },
              { id: 'copywriter', label: 'AI Copywriter', icon: Bot }
            ].map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id as any)}
                  className={`flex items-center gap-3 px-5 py-4 border-l-4 text-xs font-semibold uppercase tracking-wider text-left transition-colors ${
                    activeTab === t.id
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-transparent text-slate-400 hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4.5 h-4.5" />
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* MAIN CRM LAYOUT CONTAINER */}
          <div className="lg:col-span-9 rounded-2xl glass p-6 min-h-[450px]">
            {loading ? (
              <div className="text-center py-12 text-slate-400 text-sm">Synchronizing profiles...</div>
            ) : (
              <>
                {/* CRM LEADS PANEL */}
                {activeTab === 'crm' && (
                  <div className="space-y-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <h3 className="text-lg font-bold font-outfit">Lead Portfolio Pipeline</h3>
                      <div className="h-[120px] w-full max-w-xs print:hidden">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={chartData}>
                            <XAxis dataKey="name" stroke="#94a3b8" fontSize={8} tickLine={false} />
                            <Tooltip contentStyle={{ background: '#0f172a', borderRadius: 4, border: 'none', color: '#fff', fontSize: 10 }} />
                            <Bar dataKey="count" fill="#a855f7" radius={[2, 2, 0, 0]} barSize={25} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-slate-200 dark:border-white/10 text-slate-400">
                            <th className="py-3 px-2">Client Details</th>
                            <th className="py-3 px-2">Target Class</th>
                            <th className="py-3 px-2">Contact Time</th>
                            <th className="py-3 px-2 text-right">Lead Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {leads.map((l) => (
                            <tr key={l.id} className="border-b border-slate-100 dark:border-white/5 text-slate-600 dark:text-slate-300">
                              <td className="py-3 px-2">
                                <span className="font-bold block text-slate-800 dark:text-slate-200">{l.name}</span>
                                <span className="text-[10px] text-slate-400">{l.email} &bull; {l.phone}</span>
                              </td>
                              <td className="py-3 px-2 uppercase font-medium text-[10px] text-primary">{l.insuranceType}</td>
                              <td className="py-3 px-2">{l.preferredContactTime || 'Anytime'}</td>
                              <td className="py-3 px-2 text-right">
                                <select
                                  className="bg-slate-900 border border-white/10 rounded px-2 py-1 text-[10px] focus:outline-none focus:border-primary text-slate-300"
                                  value={l.status}
                                  onChange={(e) => handleUpdateLeadStatus(l.id, e.target.value)}
                                >
                                  <option value="INTERESTED">Interested</option>
                                  <option value="FOLLOW_UP">Follow Up</option>
                                  <option value="NEGOTIATION">Negotiation</option>
                                  <option value="CLOSED">Closed (Won)</option>
                                  <option value="LOST">Lost</option>
                                </select>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {leads.length === 0 && (
                        <div className="text-center py-12 text-slate-400 text-xs">No active CRM leads registered in pipeline.</div>
                      )}
                    </div>
                  </div>
                )}

                {/* CONSULTATIONS PANEL */}
                {activeTab === 'meetings' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-bold font-outfit">Consultations Management</h3>
                    <div className="space-y-4">
                      {meetings.map((m) => (
                        <div key={m.id} className="p-4 rounded-xl border border-slate-200 dark:border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/5 text-xs">
                          <div className="space-y-1">
                            <span className="text-[9px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded uppercase">{m.type}</span>
                            <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">{m.purpose}</h4>
                            <p className="text-slate-400">
                              Client: <span className="font-bold text-slate-300">{m.name}</span> &bull; {m.phone}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              Scheduled: {new Date(m.date).toLocaleDateString()} &bull; Slot: {m.timeSlot}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                              m.status === 'APPROVED' ? 'bg-green-500/20 text-green-400' :
                              m.status === 'CANCELLED' ? 'bg-red-500/20 text-red-400' :
                              m.status === 'COMPLETED' ? 'bg-primary/20 text-primary' : 'bg-yellow-500/20 text-yellow-400'
                            }`}>
                              {m.status}
                            </span>
                            {m.status === 'PENDING' && (
                              <div className="flex gap-1.5">
                                <button
                                  onClick={() => handleUpdateMeetingStatus(m.id, 'APPROVED')}
                                  className="px-3 py-1 bg-green-500 hover:bg-green-600 rounded text-[9px] font-semibold text-white"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleUpdateMeetingStatus(m.id, 'CANCELLED')}
                                  className="px-3 py-1 border border-red-500/30 text-red-400 rounded text-[9px] font-semibold hover:bg-red-500/5"
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                            {m.status === 'APPROVED' && (
                              <button
                                onClick={() => handleUpdateMeetingStatus(m.id, 'COMPLETED')}
                                className="px-3 py-1 bg-primary hover:bg-primary-600 rounded text-[9px] font-semibold text-white"
                              >
                                Mark Completed
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                      {meetings.length === 0 && (
                        <div className="text-center py-12 text-slate-400 text-xs">No customer meetings scheduled.</div>
                      )}
                    </div>
                  </div>
                )}

                {/* AI COPYWRITER TAB */}
                {activeTab === 'copywriter' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-bold font-outfit">AI Copywriter Assistant</h3>
                    <p className="text-xs text-slate-400">Draft professional meeting briefs, WhatsApp updates, or client follow-ups instantly using Gemini models.</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Form */}
                      <div className="space-y-4 p-4 rounded-xl border border-slate-200 dark:border-white/5 bg-white/5">
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 font-medium">Client Name</label>
                          <input
                            type="text"
                            placeholder="e.g. Ramesh Patel"
                            className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary text-white"
                            value={draftForm.name}
                            onChange={(e) => setDraftForm({ ...draftForm, name: e.target.value })}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 font-medium">Meeting Purpose</label>
                          <input
                            type="text"
                            placeholder="e.g. TATA AIA Fortune Income comparison"
                            className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary text-white"
                            value={draftForm.purpose}
                            onChange={(e) => setDraftForm({ ...draftForm, purpose: e.target.value })}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 font-medium">Meeting Summary Notes</label>
                          <textarea
                            rows={3}
                            placeholder="Discussed ₹1 Crore cover. Need salary payslips to verify underwriting eligibility."
                            className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary text-white resize-none"
                            value={draftForm.notes}
                            onChange={(e) => setDraftForm({ ...draftForm, notes: e.target.value })}
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            onClick={() => handleGenerateDraft('email_followup')}
                            disabled={draftLoading}
                            className="py-2 bg-primary hover:bg-primary-600 rounded text-[9px] font-semibold text-white transition-colors"
                          >
                            Draft Email
                          </button>
                          <button
                            onClick={() => handleGenerateDraft('whatsapp_followup')}
                            disabled={draftLoading}
                            className="py-2 bg-green-500 hover:bg-green-600 rounded text-[9px] font-semibold text-white transition-colors"
                          >
                            Draft WhatsApp
                          </button>
                          <button
                            onClick={() => handleGenerateDraft('meeting_notes')}
                            disabled={draftLoading}
                            className="py-2 bg-accent hover:bg-accent-600 rounded text-[9px] font-semibold text-white transition-colors"
                          >
                            Draft Summary
                          </button>
                        </div>
                      </div>

                      {/* Result */}
                      <div className="space-y-2">
                        <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">AI Drafted Output</label>
                        <div className="w-full h-[230px] overflow-y-auto bg-slate-950 border border-white/10 rounded-xl p-4 text-[11px] font-mono leading-relaxed text-slate-300 whitespace-pre-wrap">
                          {draftLoading ? 'Generating AI copy illustration...' : draftResult || 'Select draft action to run generator...'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

      </div>
    </Layout>
  );
};
export default AdvisorDashboard;
