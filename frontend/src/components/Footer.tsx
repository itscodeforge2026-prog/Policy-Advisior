import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import api from '../services/api';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      // Create a mock route or handle in CRM/Support.
      // To keep it simple, we check contact form CRM lead or log it.
      await api.post('/support/contact', {
        name: 'Newsletter Subscriber',
        email,
        phone: '0000000000',
        message: 'Newsletter subscription request.'
      });
      setSubscribed(true);
      setEmail('');
      alert("Reservation Confirmed!");
    } catch (err: any) {
      console.error('Subscription failed', err);
      alert("Failed to subscribe: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 border-t border-white/5 text-slate-400 font-sans mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="space-y-4">
            <h3 className="text-white font-outfit text-lg font-bold tracking-tight">Policy Advisor</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Helping families and businesses make informed insurance decisions through expert guidance and personalized consultation.
            </p>
            <div className="text-xs font-semibold text-slate-500 uppercase">
              "We create your WEALTH &bull; We protect your HEALTH"
            </div>
          </div>

          {/* Quick Links Column */}
          <div>
            <h4 className="text-white font-outfit font-semibold text-sm uppercase tracking-wider mb-4">Quick Links</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/about" className="hover:text-primary transition-colors">About Advisors</Link></li>
              <li><Link to="/calculator" className="hover:text-primary transition-colors">Premium Calculator</Link></li>
              <li><Link to="/knowledge-center" className="hover:text-primary transition-colors">Knowledge Center</Link></li>
            </ul>
          </div>

          {/* Contact Details Column */}
          <div>
            <h4 className="text-white font-outfit font-semibold text-sm uppercase tracking-wider mb-4">Contact Details</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span>B-301, Pinkal Appartment, Near Deep chambers, Manjalpur, Vadodara.</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <a href="tel:9825429228" className="hover:text-primary transition-colors">9825429228</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <a href="mailto:bharatshah_1969@yahoo.in" className="hover:text-primary transition-colors">bharatshah_1969@yahoo.in</a>
              </li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div>
            <h4 className="text-white font-outfit font-semibold text-sm uppercase tracking-wider mb-4">Newsletter</h4>
            <p className="text-xs text-slate-400 mb-3">Subscribe to get monthly financial planning tips.</p>
            {subscribed ? (
              <p className="text-xs text-green-400 font-medium">Thank you for subscribing!</p>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  placeholder="Your Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs w-full text-slate-200 focus:outline-none focus:border-primary"
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-primary hover:bg-primary-600 text-white rounded-lg p-2 flex items-center justify-center shrink-0 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Disclaimer Area */}
        <div className="border-t border-white/5 mt-10 pt-8 text-xs text-slate-500 leading-relaxed text-center max-w-4xl mx-auto space-y-4">
          <p>
            <strong className="text-slate-400">Independent Advisory Disclaimer:</strong> We help clients understand and choose insurance solutions from leading insurers, including LIC, Tata AIA, and other providers. Policy purchases are completed through the respective insurer's official process. We do not sell policies directly, and we do not issue coverage terms ourselves.
          </p>
          <p>
            &copy; {currentYear} Policy Advisor. All rights reserved. Designed for professional insurance advisory.
          </p>
        </div>
      </div>
    </footer>
  );
};
