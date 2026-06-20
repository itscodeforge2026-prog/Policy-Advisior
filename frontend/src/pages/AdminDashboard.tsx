import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Settings, Shield, HelpCircle, Star, FileText, PlusCircle, Trash, Check, X } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'testimonials' | 'faqs' | 'settings'>('testimonials');

  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // FAQ Form State
  const [faqForm, setFaqForm] = useState({ category: 'General', question: '', answer: '', order: 0 });
  const [faqSuccess, setFaqSuccess] = useState(false);

  // Settings State
  const [siteSettings, setSiteSettings] = useState<Record<string, string>>({});
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'testimonials') {
        const res = await api.get('/support/testimonials/all');
        setTestimonials(res.data);
      } else if (activeTab === 'faqs') {
        const res = await api.get('/support/faqs');
        setFaqs(res.data);
      } else if (activeTab === 'settings') {
        const res = await api.get('/support/settings');
        setSiteSettings(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [activeTab]);

  const handleUpdateTestimonial = async (id: string, status: string) => {
    try {
      await api.put(`/support/testimonials/${id}/status`, { status });
      fetchAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    setFaqSuccess(false);
    try {
      await api.post('/support/faqs', faqForm);
      setFaqSuccess(true);
      setFaqForm({ category: 'General', question: '', answer: '', order: 0 });
      fetchAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteFaq = async (id: string) => {
    try {
      await api.delete(`/support/faqs/${id}`);
      fetchAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsSuccess(false);
    try {
      await api.put('/support/settings', { settings: siteSettings });
      setSettingsSuccess(true);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8 font-sans">
        
        {/* HEADER BAR */}
        <section className="flex justify-between items-center bg-slate-900 border border-white/5 rounded-2xl p-6 text-white">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold font-outfit">System Operations Console</h1>
            <span className="text-[10px] bg-red-500/20 text-red-400 font-bold px-2 py-0.5 rounded uppercase flex items-center gap-1 w-max">
              <Shield className="w-3.5 h-3.5" /> Root Admin access
            </span>
          </div>
          <div className="text-right text-xs text-slate-400">
            <div>User: {user?.name}</div>
            <div>Role: {user?.role}</div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* NAVIGATION */}
          <div className="lg:col-span-3 rounded-2xl glass overflow-hidden flex flex-col">
            {[
              { id: 'testimonials', label: 'Approve Reviews', icon: Star },
              { id: 'faqs', label: 'FAQ Manager', icon: HelpCircle },
              { id: 'settings', label: 'Site Settings', icon: Settings }
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

          {/* MAIN FORM/LIST AREA */}
          <div className="lg:col-span-9 rounded-2xl glass p-6 min-h-[450px]">
            {loading ? (
              <div className="text-center py-12 text-slate-400 text-sm">Fetching system records...</div>
            ) : (
              <>
                {/* TESTIMONIALS MODERATION */}
                {activeTab === 'testimonials' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-bold font-outfit">Approve Customer Reviews</h3>
                    <div className="space-y-4">
                      {testimonials.map((t) => (
                        <div key={t.id} className="p-4 rounded-xl border border-slate-200 dark:border-white/5 bg-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-yellow-400 font-bold">
                              {'★'.repeat(t.rating)}
                            </div>
                            <p className="text-slate-200 italic">"{t.review}"</p>
                            <span className="text-[10px] text-slate-400 block">— {t.name} ({t.role || 'Client'})</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                              t.status === 'APPROVED' ? 'bg-green-500/20 text-green-400' :
                              t.status === 'REJECTED' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                            }`}>
                              {t.status}
                            </span>
                            {t.status === 'PENDING' && (
                              <div className="flex gap-1.5">
                                <button
                                  onClick={() => handleUpdateTestimonial(t.id, 'APPROVED')}
                                  className="p-1 bg-green-500 hover:bg-green-600 rounded text-white"
                                  title="Approve"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleUpdateTestimonial(t.id, 'REJECTED')}
                                  className="p-1 bg-red-500 hover:bg-red-600 rounded text-white"
                                  title="Reject"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      {testimonials.length === 0 && (
                        <div className="text-center py-12 text-slate-400 text-xs">No pending client testimonials found.</div>
                      )}
                    </div>
                  </div>
                )}

                {/* FAQ MANAGER */}
                {activeTab === 'faqs' && (
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                    {/* Add Form */}
                    <form onSubmit={handleAddFaq} className="md:col-span-5 p-5 rounded-xl border border-slate-200 dark:border-white/5 bg-white/5 space-y-4 text-xs">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                        <PlusCircle className="w-4 h-4" /> Add FAQ Row
                      </h4>
                      {faqSuccess && <div className="p-2 bg-green-500/20 text-green-300 rounded">FAQ added successfully.</div>}

                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 font-medium">Category</label>
                        <select
                          className="w-full bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-slate-300"
                          value={faqForm.category}
                          onChange={(e) => setFaqForm({ ...faqForm, category: e.target.value })}
                        >
                          <option value="General">General</option>
                          <option value="AI Tools">AI Tools</option>
                          <option value="Claims">Claims</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 font-medium">Question</label>
                        <input
                          type="text"
                          className="w-full bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:border-primary text-white"
                          value={faqForm.question}
                          onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })}
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 font-medium">Answer</label>
                        <textarea
                          rows={4}
                          className="w-full bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:border-primary text-white resize-none"
                          value={faqForm.answer}
                          onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })}
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2 bg-primary hover:bg-primary-600 rounded text-xs font-semibold text-white"
                      >
                        Add FAQ
                      </button>
                    </form>

                    {/* FAQ List */}
                    <div className="md:col-span-7 space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Manage Active FAQs</h4>
                      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                        {faqs.map((faq) => (
                          <div key={faq.id} className="p-3 rounded-lg border border-slate-100 dark:border-white/5 flex justify-between items-start gap-4 text-xs bg-white/5">
                            <div className="space-y-1">
                              <span className="text-[9px] bg-white/10 px-2 py-0.5 rounded font-medium text-slate-400 uppercase">{faq.category}</span>
                              <h5 className="font-bold">{faq.question}</h5>
                            </div>
                            <button
                              onClick={() => handleDeleteFaq(faq.id)}
                              className="p-1 hover:bg-red-500/10 text-red-400 rounded shrink-0"
                              title="Delete FAQ"
                            >
                              <Trash className="w-4.5 h-4.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* SYSTEM SETTINGS */}
                {activeTab === 'settings' && (
                  <form onSubmit={handleSaveSettings} className="space-y-6 text-xs">
                    <h3 className="text-lg font-bold font-outfit">Update Business Configurations</h3>
                    {settingsSuccess && <div className="p-2.5 bg-green-500/20 text-green-300 rounded font-semibold">Settings updated successfully.</div>}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 font-medium">Advisor Phone</label>
                        <input
                          type="text"
                          className="w-full bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-white"
                          value={siteSettings.advisor_contact_phone || ''}
                          onChange={(e) => setSiteSettings({ ...siteSettings, advisor_contact_phone: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 font-medium">Advisor Email</label>
                        <input
                          type="email"
                          className="w-full bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-white"
                          value={siteSettings.advisor_contact_email || ''}
                          onChange={(e) => setSiteSettings({ ...siteSettings, advisor_contact_email: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 font-medium">Office Address</label>
                      <input
                        type="text"
                        className="w-full bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-white"
                        value={siteSettings.advisor_contact_address || ''}
                        onChange={(e) => setSiteSettings({ ...siteSettings, advisor_contact_address: e.target.value })}
                      />
                    </div>

                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-primary hover:bg-primary-600 rounded-lg font-semibold text-white transition-colors"
                    >
                      Save Configuration Details
                    </button>
                  </form>
                )}
              </>
            )}
          </div>
        </div>

      </div>
    </Layout>
  );
};
export default AdminDashboard;
