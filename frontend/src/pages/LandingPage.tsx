import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Users, HelpCircle, BookOpen, Calculator, Bot, Award, FileText, ArrowRight, MessageSquare, X, Send, Phone, MapPin, Mail, ChevronDown } from 'lucide-react';
import api from '../services/api';
import Layout from '../components/Layout';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  // FAQ Accordion State
  const [activeFaq, setActiveFaq] = useState<number | null>(null);



  // Contact Form State
  const [contactForm, setContactForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [contactSuccess, setContactSuccess] = useState(false);
  const [contactLoading, setContactLoading] = useState(false);

  // Category and FAQ lists (fetched from DB, fallback to defaults)
  const [categories, setCategories] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);

  useEffect(() => {
    // Fetch categories and FAQs on mount
    const loadData = async () => {
      try {
        const catRes = await api.get('/categories');
        setCategories(catRes.data);
        const faqRes = await api.get('/support/faqs');
        setFaqs(faqRes.data);
      } catch (err) {
        console.error('Error fetching landing page data', err);
      }
    };
    loadData();
  }, []);



  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactLoading(true);
    try {
      await api.post('/support/contact', contactForm);
      setContactSuccess(true);
      setContactForm({ name: '', email: '', phone: '', message: '' });
      alert("Reservation Confirmed!");
    } catch (err: any) {
      console.error(err);
      alert("Failed to connect to backend: " + (err.response?.data?.message || err.message));
    } finally {
      setContactLoading(false);
    }
  };

  // Mock categories if DB hasn't resolved
  const displayCategories = categories.length > 0 ? categories : [
    { name: 'Life Insurance', slug: 'life-insurance', overview: 'Secure your family\'s financial goals.' },
    { name: 'Health Insurance', slug: 'health-insurance', overview: 'Cashless medical protection illustrations.' },
    { name: 'Term Insurance', slug: 'term-insurance', overview: 'Pure protection at highly affordable rates.' },
    { name: 'Child Education Plans', slug: 'child-education-plans', overview: 'Guarantee funds for child education.' }
  ];

  const displayFaqs = faqs.length > 0 ? faqs : [
    { question: 'What is Policy Advisor?', answer: 'We are independent insurance advisors representing Dimple Shah and Bharat Shah. We help you choose suitable plans from LIC, TATA AIA/AIG, and other insurers. Policy purchases are completed directly through official insurer processes.' },
    { question: 'Do you charge a fee for advice?', answer: 'No, our educational advisory and portfolio assessments are free of cost. We help match you with suitable coverages.' }
  ];

  return (
    <Layout>
      <div className="font-sans overflow-x-hidden">
        {/* HERO SECTION */}
        <section className="relative min-h-[90vh] flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white overflow-hidden py-20 px-4 border-b border-slate-200 dark:border-white/5">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(14,160,235,0.08),transparent_50%)] dark:bg-[radial-gradient(ellipse_at_top_right,rgba(14,160,235,0.15),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(168,85,247,0.05),transparent_50%)] dark:bg-[radial-gradient(ellipse_at_bottom_left,rgba(168,85,247,0.1),transparent_50%)]" />
          
          <div className="max-w-5xl mx-auto text-center z-10 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-4"
            >
              <span className="px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-slate-200/50 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-primary">
                Expert Insurance Guidance
              </span>
              <h1 className="text-5xl md:text-7xl font-bold font-outfit tracking-tight leading-[1.1] max-w-4xl mx-auto text-slate-900 dark:text-white">
                Secure Your Family's Future With{' '}
                <span className="bg-gradient-to-r from-primary via-blue-400 to-accent-500 bg-clip-text text-transparent animate-gradient">
                  Bharat & Dimple Shah
                </span>
              </h1>
              <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
                Policy Advisor connects you with trusted planners to compare LIC, TATA AIA, and leading portfolios. Build your health and wealth security nets today.
              </p>
            </motion.div>
          </div>
        </section>

        {/* STATISTICS SECTION */}
        <section className="bg-slate-100 dark:bg-slate-900 border-y border-slate-200 dark:border-white/5 py-12 px-4">
          <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-slate-800 dark:text-white">
            <div>
              <div className="text-4xl md:text-5xl font-extrabold font-outfit text-primary">50+</div>
              <div className="text-xs md:text-sm text-slate-400 uppercase tracking-widest mt-2">Happy Customers</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-extrabold font-outfit text-accent">1,000+</div>
              <div className="text-xs md:text-sm text-slate-400 uppercase tracking-widest mt-2">Consultations Completed</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-extrabold font-outfit text-primary">10+ Years</div>
              <div className="text-xs md:text-sm text-slate-400 uppercase tracking-widest mt-2">Advisor Experience</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-extrabold font-outfit text-accent">98.7%</div>
              <div className="text-xs md:text-sm text-slate-400 uppercase tracking-widest mt-2">Claims Assisted</div>
            </div>
          </div>
        </section>

        {/* INSURANCE CATEGORIES GRID */}
        <section className="py-24 px-4 bg-slate-50 dark:bg-slate-900/50">
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-5xl font-bold font-outfit tracking-tight">Insurance Portfolios We Advise On</h2>
              <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
                Explore original educational deep-dives on insurance products to identify coverage options suitable for you.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {displayCategories.slice(0, 8).map((cat, idx) => (
                <Link
                  key={cat.slug}
                  to={`/categories/${cat.slug}`}
                  className="p-6 rounded-2xl glass hover:border-primary/30 hover:shadow-lg transition-all group flex flex-col justify-between h-[200px]"
                >
                  <div>
                    <h3 className="text-lg font-bold font-outfit text-slate-800 dark:text-slate-200 group-hover:text-primary transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-3">
                      {cat.overview}
                    </p>
                  </div>
                  <span className="text-xs text-primary font-semibold flex items-center gap-1 mt-4">
                    Learn More <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ADVISOR FOCUS SECTION */}
        <section className="py-24 px-4 bg-white dark:bg-slate-950 text-slate-900 dark:text-white relative border-b border-slate-200 dark:border-white/5">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-xs font-semibold text-accent uppercase tracking-wider bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-3 py-1.5 rounded-full">
                Certified Professionals
              </span>
              <h2 className="text-4xl md:text-5xl font-bold font-outfit tracking-tight">Meet Your Advisory Team</h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Bharat Shah and Dimple Shah are independent advisors serving Vadodara and global clients. With partnerships spanning TATA AIA, TATA AIG, LIC, and New India Assurance, we structure health and wealth options tailored specifically to client goals.
              </p>
              <div className="border-l-2 border-primary pl-4 space-y-2">
                <p className="text-sm italic text-slate-700 dark:text-slate-300">
                  "We believe that correct financial planning begins with proper protection. We create your wealth and protect your health."
                </p>
                <cite className="text-xs font-medium text-slate-500 block">— Dimple & Bharat Shah</cite>
              </div>
              <Link
                to="/about"
                className="inline-flex items-center gap-2 text-primary font-medium hover:text-primary-400 text-sm group"
              >
                Read Certification Details <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Dimple Shah Card */}
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-4">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-bold text-lg">DS</div>
                <div>
                  <h3 className="text-lg font-bold font-outfit text-slate-800 dark:text-white">Dimple Shah</h3>
                  <p className="text-xs text-slate-400">Life & General Insurance Specialist</p>
                </div>
                <div className="text-xs text-slate-500 space-y-1">
                  <div>&bull; TATA AIA Life Protection Solutions</div>
                  <div>&bull; TATA AIG General Insurances</div>
                </div>
              </div>

              {/* Bharat Shah Card */}
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-4">
                <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center text-accent font-bold text-lg">BS</div>
                <div>
                  <h3 className="text-lg font-bold font-outfit text-slate-800 dark:text-white">Bharat Shah</h3>
                  <p className="text-xs text-slate-400">Life & Health Advisor</p>
                </div>
                <div className="text-xs text-slate-500 space-y-1">
                  <div>&bull; LIC of India Pension & Goals</div>
                  <div>&bull; New India Assurance Schemes</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PROCESS / ADVISOR WORKFLOW */}
        <section className="py-24 px-4 bg-slate-50 dark:bg-slate-900/50">
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-5xl font-bold font-outfit tracking-tight">Our Advisory Process</h2>
              <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
                Four simple steps to outline your safety net and select suitable coverage.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { step: '01', title: 'Expert Consultation', desc: 'Schedule a free phone, video, or home meeting with Bharat or Dimple Shah.' },
                { step: '02', title: 'Compare Portfolios', desc: 'Compare illustrations from TATA AIA, LIC, and other providers side-by-side.' },
                { step: '03', title: 'Official Registration', desc: 'Complete policy registration securely through official insurer channels.' }
              ].map((p, idx) => (
                <div key={p.step} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 space-y-4 relative">
                  <div className="text-3xl font-extrabold font-outfit text-primary/30">{p.step}</div>
                  <h3 className="text-lg font-bold font-outfit text-slate-800 dark:text-slate-200">{p.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ ACCORDION */}
        <section className="py-24 px-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-white/5">
          <div className="max-w-4xl mx-auto space-y-12">
            <h2 className="text-3xl md:text-5xl font-bold font-outfit tracking-tight text-center">Frequently Asked Questions</h2>

            <div className="space-y-4">
              {displayFaqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900 overflow-hidden"
                >
                  <button
                    onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left font-medium font-outfit text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${activeFaq === idx ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence initial={false}>
                    {activeFaq === idx && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="px-6 pb-5 text-sm text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-white/5 pt-4 leading-relaxed">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CONTACT SECTION */}
        <section className="py-24 px-4 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-t border-slate-200 dark:border-white/5" id="contact-section">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-5xl font-bold font-outfit tracking-tight text-slate-900 dark:text-white">Need Consultation? Get In Touch</h2>
              <p className="text-slate-600 dark:text-slate-400">
                Submit your inquiry or message, and we will get back to you within 24 hours with custom recommendations.
              </p>
              <div className="space-y-4 pt-4 text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-primary" />
                  <span>+91 9825429228</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-primary" />
                  <span>bharatshah_1969@yahoo.in</span>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary shrink-0 mt-1" />
                  <span>B-301, Pinkal Appartment, Near Deep chambers, Manjalpur, Vadodara.</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 p-8 rounded-2xl">
              {contactSuccess ? (
                <div className="text-center py-12 space-y-4">
                  <div className="w-12 h-12 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center mx-auto text-xl font-bold">✓</div>
                  <h3 className="text-lg font-bold font-outfit text-slate-800 dark:text-white">Message Sent Successfully!</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Thank you. An advisor will contact you shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-5">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-500 dark:text-slate-400 font-medium">Your Name</label>
                    <input
                      type="text"
                      className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary text-slate-800 dark:text-white"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs text-slate-500 dark:text-slate-400 font-medium">Email Address</label>
                      <input
                        type="email"
                        className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary text-slate-800 dark:text-white"
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-slate-500 dark:text-slate-400 font-medium">Mobile Number</label>
                      <input
                        type="tel"
                        className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary text-slate-800 dark:text-white"
                        value={contactForm.phone}
                        onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-500 dark:text-slate-400 font-medium">Message / Inquiry Details</label>
                    <textarea
                      rows={4}
                      className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary text-slate-800 dark:text-white resize-none"
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={contactLoading}
                    className="w-full py-3 bg-primary hover:bg-primary-600 rounded-lg font-medium text-sm transition-colors text-white"
                  >
                    {contactLoading ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>


      </div>
    </Layout>
  );
};
export default LandingPage;
