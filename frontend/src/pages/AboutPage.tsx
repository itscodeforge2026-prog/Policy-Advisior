import React, { useState } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { Calendar, Clock, User, Phone, MapPin, Mail, Sparkles, BookOpen, ShieldCheck, Award } from 'lucide-react';

export const AboutPage: React.FC = () => {
  // Appointment Form state
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    type: 'PHONE',
    date: '',
    timeSlot: '10:00 AM - 11:00 AM',
    purpose: 'General Life Insurance Review',
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const timeSlots = [
    '09:00 AM - 10:00 AM',
    '10:00 AM - 11:00 AM',
    '11:00 AM - 12:00 PM',
    '02:00 PM - 03:00 PM',
    '03:00 PM - 04:00 PM',
    '04:00 PM - 05:00 PM',
  ];

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/appointments/book', form);
      setSuccess(true);
      alert("Reservation Confirmed!");
    } catch (err: any) {
      setError(err || 'Failed to book slot. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20 font-sans">
        
        {/* HERO HEADER */}
        <section className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold uppercase tracking-wider">
            Your Advisory Team
          </span>
          <h1 className="text-4xl md:text-6xl font-bold font-outfit tracking-tight">
             Dimple Shah & Bharat Shah
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed">
            Independent insurance consultants helping families and businesses across Vadodara and globally structure complete, robust protection strategies.
          </p>
        </section>

        {/* ADV-CARDS */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Dimple Shah profile */}
          <div className="rounded-2xl glass p-8 space-y-6 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl" />
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/20 text-primary flex items-center justify-center font-bold text-2xl font-outfit">
                DS
              </div>
              <div>
                <h2 className="text-2xl font-bold font-outfit">Dimple Shah</h2>
                <p className="text-sm text-slate-400">Life, Health & General Insurance Advisor</p>
              </div>
            </div>

            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Dimple Shah focuses on structuring customized capital security and protection strategies. Representing TATA AIA Life and TATA AIG General, she helps clients design inflation-adjusted savings, term protection plans, and own-damage motor coverage.
            </p>

            <div className="space-y-4">
              <h3 className="text-xs uppercase tracking-widest text-primary font-bold">Key Focus Areas</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span>TATA AIA Term Protection Plans</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span>Fortune Guarantee Plus Plans</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span>Guaranteed Return Income Plans</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span>Mediclaim & Accident Policies</span>
                </div>
              </div>
            </div>
            
            <div className="text-xs text-slate-500 italic border-t border-slate-100 dark:border-white/5 pt-4">
              "We create your WEALTH" — Customizing capital growth and life cover benchmarks.
            </div>
          </div>

          {/* Bharat Shah profile */}
          <div className="rounded-2xl glass p-8 space-y-6 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-24 h-24 bg-accent/5 rounded-full blur-2xl" />
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-accent/20 text-accent flex items-center justify-center font-bold text-2xl font-outfit">
                BS
              </div>
              <div>
                <h2 className="text-2xl font-bold font-outfit">Bharat Shah</h2>
                <p className="text-sm text-slate-400">Life, Health & General Insurance Advisor</p>
              </div>
            </div>

            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Bharat Shah specializes in retirement planning and child education corpus configurations. Backed by LIC of India and The New India Assurance, he helps clients identify safe wealth accumulation vehicles to cover long-term life events.
            </p>

            <div className="space-y-4">
              <h3 className="text-xs uppercase tracking-widest text-accent font-bold">Key Focus Areas</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-accent" />
                  <span>LIC Child Education & Marriage Plans</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-accent" />
                  <span>LIC Retirement & Pension Plans</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-accent" />
                  <span>Whole Life & Money Back Plans</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-accent" />
                  <span>New India Assurance Fire & Marine</span>
                </div>
              </div>
            </div>
            
            <div className="text-xs text-slate-500 italic border-t border-slate-100 dark:border-white/5 pt-4">
              "We protect your HEALTH" — Minimizing asset exposure during medical crises.
            </div>
          </div>
        </section>

        {/* BOOK CONSULTATION FORM */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-12 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white rounded-3xl p-8 lg:p-12 relative overflow-hidden border border-slate-200 dark:border-white/5 shadow-2xl" id="booking-section">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
          
          <div className="lg:col-span-1 space-y-6 z-10">
            <span className="text-xs bg-slate-200/50 dark:bg-white/10 px-3 py-1.5 rounded-full uppercase font-semibold text-primary">
              Book A Free Session
            </span>
            <h2 className="text-3xl md:text-4xl font-bold font-outfit tracking-tight">Schedule Consultation</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Book a free session at your preferred slot. We support Phone call consultations, Video meetings, Office visits, or home visits for clients around Vadodara.
            </p>
            <div className="space-y-4 pt-4 text-xs text-slate-700 dark:text-slate-400">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-primary shrink-0" />
                <span>B-301, Pinkal Appartment, Vadodara.</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <span>+91 9825429228</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <span>bharatshah_1969@yahoo.in</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 z-10">
            {success ? (
              <div className="bg-white/5 border border-green-500/30 p-8 rounded-2xl text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center mx-auto text-xl font-bold">✓</div>
                <h3 className="text-xl font-bold font-outfit text-slate-800 dark:text-white">Consultation Booked Successfully!</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">A confirmation email has been dispatched. An advisor will get in touch with you shortly.</p>
                <button
                  onClick={() => setSuccess(false)}
                  className="px-6 py-2 bg-primary hover:bg-primary-600 text-white rounded-lg text-xs font-semibold"
                >
                  Book Another Slot
                </button>
              </div>
            ) : (
              <form onSubmit={handleBook} className="space-y-5">
                {error && <div className="p-3 bg-red-500/20 border border-red-500/30 text-red-300 text-xs rounded-lg">{error}</div>}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-500 dark:text-slate-400 font-medium">Your Name</label>
                    <input
                      type="text"
                      className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary text-slate-800 dark:text-white"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-xs text-slate-500 dark:text-slate-400 font-medium">Phone</label>
                      <input
                        type="tel"
                        className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary text-slate-800 dark:text-white"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-slate-500 dark:text-slate-400 font-medium">Email</label>
                      <input
                        type="email"
                        className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary text-slate-800 dark:text-white"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-500 dark:text-slate-400 font-medium">Meeting Mode</label>
                    <select
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary text-slate-800 dark:text-slate-300"
                      value={form.type}
                      onChange={(e) => setForm({ ...form, type: e.target.value })}
                    >
                      <option value="PHONE">Phone Call</option>
                      <option value="VIDEO">Video Meeting</option>
                      <option value="OFFICE">Office Visit</option>
                      <option value="HOME">Home Visit</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-500 dark:text-slate-400 font-medium">Date</label>
                    <input
                      type="date"
                      className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary text-slate-800 dark:text-white"
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-500 dark:text-slate-400 font-medium">Time Slot</label>
                    <select
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary text-slate-800 dark:text-slate-300"
                      value={form.timeSlot}
                      onChange={(e) => setForm({ ...form, timeSlot: e.target.value })}
                    >
                      {timeSlots.map((ts) => (
                        <option key={ts} value={ts}>{ts}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-500 dark:text-slate-400 font-medium">Purpose of Discussion</label>
                  <input
                    type="text"
                    className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary text-slate-800 dark:text-white"
                    placeholder="e.g. Compare TATA AIA vs LIC child plans, Medical cover, Retirement"
                    value={form.purpose}
                    onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-500 dark:text-slate-400 font-medium">Additional Notes (Optional)</label>
                  <textarea
                    rows={3}
                    className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary text-slate-800 dark:text-white resize-none"
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-primary hover:bg-primary-600 rounded-lg text-sm font-semibold transition-colors text-white"
                >
                  {loading ? 'Booking Slot...' : 'Confirm Appointment Slot'}
                </button>
              </form>
            )}
          </div>
        </section>

        {/* REGULATORY DISCLAIMER */}
        <section className="p-6 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/5 text-center text-xs text-slate-500 leading-relaxed max-w-4xl mx-auto">
          <h3 className="font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">Important Advisory Notice</h3>
          "We help clients understand and choose insurance solutions from leading insurers, including LIC, Tata AIA, and other providers. Policy purchases are completed through the respective insurer's official process."
        </section>

      </div>
    </Layout>
  );
};
export default AboutPage;
