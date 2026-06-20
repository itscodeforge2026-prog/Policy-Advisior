import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../services/api';
import { ShieldCheck, FileCheck, HelpCircle, RefreshCw, AlertTriangle, ArrowRight, BookOpen } from 'lucide-react';

export const CategoryDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [category, setCategory] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategory = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/categories/${slug}`);
        setCategory(response.data);
      } catch (err) {
        console.error('Error fetching category details:', err);
      } finally {
        setLoading(false);
      }
    };
    loadCategory();
  }, [slug]);

  if (loading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-32 text-center space-y-4">
          <RefreshCw className="w-8 h-8 text-primary animate-spin mx-auto" />
          <p className="text-sm text-slate-400">Loading educational guide...</p>
        </div>
      </Layout>
    );
  }

  if (!category) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-32 text-center space-y-4">
          <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto" />
          <h2 className="text-xl font-bold font-outfit">Guide Not Found</h2>
          <p className="text-sm text-slate-500">The requested category outline could not be retrieved.</p>
          <Link to="/" className="text-primary hover:underline text-xs font-semibold">Return Home</Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-16 space-y-16 font-sans">
        
        {/* HERO TITLE & OVERVIEW */}
        <section className="space-y-6">
          <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-wider">
            Insurance Portfolios
          </span>
          <h1 className="text-4xl md:text-5xl font-bold font-outfit tracking-tight">{category.name}</h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            {category.overview}
          </p>
        </section>

        {/* BENEFITS GRID & WHO SHOULD BUY */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Benefits */}
          <div className="p-6 rounded-2xl glass space-y-4">
            <h2 className="text-lg font-bold font-outfit text-primary uppercase tracking-wider">Core Benefits</h2>
            <ul className="space-y-3 text-xs">
              {category.benefits.map((b: string, idx: number) => (
                <li key={idx} className="flex gap-2 items-start text-slate-700 dark:text-slate-300">
                  <ShieldCheck className="w-4.5 h-4.5 text-green-400 shrink-0" />
                  <span className="leading-relaxed">{b}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Who Should Buy & Eligibility */}
          <div className="p-6 rounded-2xl glass space-y-6">
            <div className="space-y-2">
              <h2 className="text-lg font-bold font-outfit text-primary uppercase tracking-wider">Target Audience</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{category.whoShouldBuy}</p>
            </div>
            
            {category.eligibility && (
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-white/5">
                <h3 className="text-xs font-semibold uppercase text-slate-400">Standard Eligibility Guidelines</h3>
                <div className="grid grid-cols-3 gap-2 text-center text-[10px] text-slate-600 dark:text-slate-300 font-medium">
                  <div className="p-2 rounded bg-white/5">
                    <span className="block text-slate-400 text-[9px] uppercase">Min Age</span>
                    <span>{category.eligibility.minAge || '18'} Yrs</span>
                  </div>
                  <div className="p-2 rounded bg-white/5">
                    <span className="block text-slate-400 text-[9px] uppercase">Max Age</span>
                    <span>{category.eligibility.maxAge || '65'} Yrs</span>
                  </div>
                  <div className="p-2 rounded bg-white/5">
                    <span className="block text-slate-400 text-[9px] uppercase">Policy Tenure</span>
                    <span>{category.eligibility.tenure || 'Flexible'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* MYTH VS REALITY */}
        {category.myths && category.myths.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xl font-bold font-outfit uppercase tracking-wider text-slate-800 dark:text-slate-200">Myth Busters</h2>
            <div className="grid grid-cols-1 gap-4">
              {category.myths.map((m: any, idx: number) => (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-xl border border-slate-200 dark:border-white/5 overflow-hidden">
                  <div className="p-5 bg-red-500/5 dark:bg-red-500/10 border-r border-slate-100 dark:border-white/5 text-xs">
                    <span className="font-bold text-red-400 block mb-1 uppercase tracking-wider text-[10px]">Common Myth</span>
                    <span className="text-slate-700 dark:text-slate-300 italic">"{m.myth}"</span>
                  </div>
                  <div className="p-5 bg-green-500/5 dark:bg-green-500/10 text-xs">
                    <span className="font-bold text-green-400 block mb-1 uppercase tracking-wider text-[10px]">The Reality</span>
                    <span className="text-slate-700 dark:text-slate-300">{m.reality}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CLAIM PROCESS & DOCUMENTS REQUIRED */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Claim process */}
          <div className="md:col-span-7 space-y-4 p-6 rounded-2xl glass">
            <h2 className="text-lg font-bold font-outfit text-primary uppercase tracking-wider">Claim Process Overview</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed whitespace-pre-line">
              {category.claimProcess}
            </p>
          </div>

          {/* Required documents */}
          <div className="md:col-span-5 space-y-4 p-6 rounded-2xl glass">
            <h2 className="text-lg font-bold font-outfit text-primary uppercase tracking-wider">Required Checklist</h2>
            <ul className="space-y-3 text-xs">
              {category.documentsRequired.map((doc: string, idx: number) => (
                <li key={idx} className="flex gap-2 items-center text-slate-700 dark:text-slate-300">
                  <FileCheck className="w-4.5 h-4.5 text-primary shrink-0" />
                  <span>{doc}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* THINGS TO CONSIDER */}
        {category.thingsToConsider && category.thingsToConsider.length > 0 && (
          <section className="p-6 rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-900 text-white space-y-4">
            <h2 className="text-lg font-bold font-outfit text-primary uppercase tracking-wider">Important Variables to Consider</h2>
            <ul className="space-y-2 text-xs text-slate-300 list-disc pl-4 leading-relaxed">
              {category.thingsToConsider.map((item: string, idx: number) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </section>
        )}

        {/* BOOK CONSULTATION CTA */}
        <section className="p-8 rounded-3xl bg-slate-900 border border-white/5 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center md:text-left">
            <h2 className="text-2xl font-bold font-outfit">Ready to draft your policy comparison?</h2>
            <p className="text-xs text-slate-400 max-w-lg leading-relaxed">
              Our advisors will help you evaluate custom premium charts and benefit definitions from TATA AIA and LIC.
            </p>
          </div>
          <Link
            to="/about"
            className="px-6 py-3 rounded-xl bg-primary hover:bg-primary-600 text-sm font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap text-white"
          >
            Book Free Consultation <ArrowRight className="w-4 h-4" />
          </Link>
        </section>

      </div>
    </Layout>
  );
};
export default CategoryDetailPage;
