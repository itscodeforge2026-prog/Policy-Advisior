import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { Search, ShieldAlert, Award, Calendar, BadgeCheck, FileText, ArrowRight, UserCheck } from 'lucide-react';

interface Policy {
  code: string;
  name: string;
  planNumber?: string;
  provider: 'LIC of India' | 'Tata AIA Life' | 'Tata AIG General';
  advisor: string;
  category: 'Term Protection' | 'Health & Medicare' | 'Savings & Income' | 'Retirement & Pension' | 'Wealth / Market-Linked (ULIP)';
  launchDate: string;
  summary: string;
  highlights: string[];
  eligibility: {
    minAge: string;
    maxAge: string;
    sumAssured: string;
  };
  statusBadge: string;
}

const policyDataset: Policy[] = [
  {
    code: 'LIC_JEEVAN_SATHI_SINGLE',
    name: 'New Jeevan Sathi (Single Premium)',
    planNumber: 'Plan 888',
    provider: 'LIC of India',
    advisor: 'Bharat Shah',
    category: 'Savings & Income',
    launchDate: 'June 2026',
    summary: 'Joint-life endowment policy designed for married couples to build mutual long-term savings under a single premium investment.',
    highlights: [
      'Joint life coverage under a single program',
      'Single premium payment mode (one-time)',
      'Guaranteed additions during policy term',
      'Waiver of premium rider built-in'
    ],
    eligibility: {
      minAge: '18 Years',
      maxAge: '55 Years',
      sumAssured: '₹2,00,000 Minimum'
    },
    statusBadge: 'Newly Launched (2026)'
  },
  {
    code: 'LIC_JEEVAN_SATHI_LIMIT',
    name: 'New Jeevan Sathi (Limited Premium)',
    planNumber: 'Plan 889',
    provider: 'LIC of India',
    advisor: 'Bharat Shah',
    category: 'Savings & Income',
    launchDate: 'June 2026',
    summary: 'Joint-life savings and protection program for couples with short-term limited premium paying terms (5, 8, or 10 years).',
    highlights: [
      'Waiver of future premiums on first partner death',
      'Flexible limited premium payment terms',
      'Guaranteed additions accrued annually',
      'Tax benefits under Section 80C old regime'
    ],
    eligibility: {
      minAge: '18 Years',
      maxAge: '55 Years',
      sumAssured: '₹2,00,000 Minimum'
    },
    statusBadge: 'Newly Launched (2026)'
  },
  {
    code: 'LIC_JEEVAN_UTSAV_883',
    name: 'Jeevan Utsav (Whole Life Savings)',
    planNumber: 'Plan 883',
    provider: 'LIC of India',
    advisor: 'Bharat Shah',
    category: 'Savings & Income',
    launchDate: 'January 2026',
    summary: 'Non-linked whole life savings plan offering guaranteed additions and lifelong payouts of 10% of sum assured annually.',
    highlights: [
      'Guaranteed additions of ₹40 per thousand sum assured',
      'Lifelong risk cover and guaranteed survivals',
      'Deferred Regular Income or Flexi Income options',
      'Flexi payouts accumulate at 5.5% interest compounded'
    ],
    eligibility: {
      minAge: '90 Days',
      maxAge: '65 Years',
      sumAssured: '₹5,00,000 Minimum'
    },
    statusBadge: 'Guaranteed Income'
  },
  {
    code: 'LIC_BIMA_KAVACH',
    name: 'Bima Kavach',
    planNumber: 'Plan 887',
    provider: 'LIC of India',
    advisor: 'Bharat Shah',
    category: 'Term Protection',
    launchDate: 'Late 2025',
    summary: 'Pure risk term protection plan designed to deliver high cover financial security to family members at entry-level premiums.',
    highlights: [
      'Pure term insurance benefits',
      'Level or Increasing Sum Assured coverage options',
      'Accidental Death benefit riders available',
      'Multiple choice premium payment modes'
    ],
    eligibility: {
      minAge: '18 Years',
      maxAge: '65 Years',
      sumAssured: '₹50,00,000 Minimum'
    },
    statusBadge: 'Pure Protection'
  },
  {
    code: 'LIC_PROTECTION_PLUS',
    name: 'Protection Plus',
    planNumber: 'Plan 886',
    provider: 'LIC of India',
    advisor: 'Bharat Shah',
    category: 'Savings & Income',
    launchDate: 'Late 2025',
    summary: 'Flexible savings-cum-protection package ensuring regular cash accumulation alongside safety riders.',
    highlights: [
      'Guaranteed maturity additions and bonuses',
      'Policy loan options after 2 active premium years',
      'Flexible tenures stretching up to 25 years',
      'Accident & disability benefit riders'
    ],
    eligibility: {
      minAge: '18 Years',
      maxAge: '60 Years',
      sumAssured: '₹5,00,000 Minimum'
    },
    statusBadge: 'Savings & Cover'
  },
  {
    code: 'LIC_INDEX_PLUS_873',
    name: 'Index Plus ULIP',
    planNumber: 'Plan 873',
    provider: 'LIC of India',
    advisor: 'Bharat Shah',
    category: 'Wealth / Market-Linked (ULIP)',
    launchDate: 'Early 2024',
    summary: 'Unit-linked insurance plan investing in leading stock indices to build inflation-beating capital appreciation.',
    highlights: [
      'Direct investment in Nifty 50 or Nifty Flexicap indexes',
      'Guaranteed additions added dynamically based on tenure',
      'Partial withdrawal allowed after 5-year lock-in',
      'Inherent life cover protection'
    ],
    eligibility: {
      minAge: '90 Days',
      maxAge: '60 Years',
      sumAssured: '10x Annualized Premium'
    },
    statusBadge: 'Market Growth'
  },
  {
    code: 'TATA_AIA_SHUBH_FAMILY_PROTECT',
    name: 'Shubh Family Protect Term Plan',
    provider: 'Tata AIA Life',
    advisor: 'Dimple Shah',
    category: 'Term Protection',
    launchDate: 'October 2025',
    summary: 'Flexible term insurance plan combining lump sum payouts with monthly income support for dependents.',
    highlights: [
      'Combines lump sum death benefit and monthly incomes',
      'Waiver of premium on Terminal Illness built-in',
      'Special discounted premium rates for female profiles',
      'Riders covering accidental death and critical illness'
    ],
    eligibility: {
      minAge: '18 Years',
      maxAge: '65 Years',
      sumAssured: '₹50,00,000 Minimum'
    },
    statusBadge: 'Highly Flexible Term'
  },
  {
    code: 'TATA_AIA_DIVIDEND_PENSION',
    name: 'Dividend Leaders Pension Fund',
    provider: 'Tata AIA Life',
    advisor: 'Dimple Shah',
    category: 'Retirement & Pension',
    launchDate: 'May 2026',
    summary: 'Retirement-focused ULIP pension fund targeting companies with consistent dividend payouts for long-term compound security.',
    highlights: [
      'Targets high dividend-paying market equities',
      'Guaranteed pension annuity setup options on vesting',
      'Tax-free fund switches allowed inside the policy',
      'Guaranteed death benefits during accumulation'
    ],
    eligibility: {
      minAge: '30 Years',
      maxAge: '65 Years',
      sumAssured: 'Minimum ₹30,000/Yr Premium'
    },
    statusBadge: 'Retirement NFO'
  },
  {
    code: 'TATA_AIA_INNOVATION_FUND',
    name: 'Large & Mid Cap Innovation Fund',
    provider: 'Tata AIA Life',
    advisor: 'Dimple Shah',
    category: 'Wealth / Market-Linked (ULIP)',
    launchDate: 'March 2026',
    summary: 'High-growth market-linked fund capturing innovations in tech, AI, and healthcare sectors.',
    highlights: [
      'Focused exposure to large & mid cap innovative firms',
      'Capital gains tied directly to market performance',
      'Optional premium waiver riders on disability',
      'Dynamic portfolio switching options'
    ],
    eligibility: {
      minAge: '18 Years',
      maxAge: '60 Years',
      sumAssured: 'Minimum ₹24,00,000 Target'
    },
    statusBadge: 'Innovation ULIP'
  },
  {
    code: 'TATA_AIG_MEDICARE_SELECT',
    name: 'Medicare Select Health Insurance',
    provider: 'Tata AIG General',
    advisor: 'Dimple Shah',
    category: 'Health & Medicare',
    launchDate: 'April 2025',
    summary: 'Flagship family floater health policy designed with unlimited restoration of sum insured and maternity cover.',
    highlights: [
      'Unlimited sum insured restoration for related/unrelated issues',
      'Zero co-pay on medical claims',
      'In-patient consumables costs fully covered',
      'Optional maternity and newborn booster riders'
    ],
    eligibility: {
      minAge: '91 Days',
      maxAge: '65 Years',
      sumAssured: '₹5 Lakhs to ₹1 Crore'
    },
    statusBadge: 'Unlimited Restore'
  },
  {
    code: 'TATA_AIG_MEDI_PLUS',
    name: 'Namliy MediPlus Top-Up',
    provider: 'Tata AIG General',
    advisor: 'Dimple Shah',
    category: 'Health & Medicare',
    launchDate: '2025',
    summary: 'High-benefit super top-up health coverage to enhance security limits beyond corporate or base covers.',
    highlights: [
      'Super top-up coverage up to ₹1 Crore',
      'Wide choice of deductible thresholds',
      'Pre & post hospitalization expenses included',
      'Direct cashless settlement networks'
    ],
    eligibility: {
      minAge: '18 Years',
      maxAge: '65 Years',
      sumAssured: 'Deductibles from ₹3 Lakhs'
    },
    statusBadge: 'Top-Up Protection'
  },
  {
    code: 'TATA_AIG_MEDI_SENIOR',
    name: 'MediSenior (Senior Citizens)',
    provider: 'Tata AIG General',
    advisor: 'Dimple Shah',
    category: 'Health & Medicare',
    launchDate: '2025',
    summary: 'Specialized health protection scheme curated specifically to meet the healthcare needs of elderly parents.',
    highlights: [
      'Pre-existing disease coverage starts after 2 years',
      'Organ donor transplant procedures fully covered',
      'Domiciliary hospitalization cash benefits',
      'No loading charges on claims history'
    ],
    eligibility: {
      minAge: '61 Years',
      maxAge: '80 Years',
      sumAssured: '₹2 Lakhs to ₹10 Lakhs'
    },
    statusBadge: 'Senior Citizen Care'
  },
  {
    code: 'TATA_AIG_MEDI_RAKSHA',
    name: 'MediRaksha Health Cover',
    provider: 'Tata AIG General',
    advisor: 'Dimple Shah',
    category: 'Health & Medicare',
    launchDate: '2025',
    summary: 'Highly economical health insurance package bringing basic cashless protection to semi-urban populations.',
    highlights: [
      'Budget-friendly and highly economical premium rates',
      'Over 140+ daycare procedures fully covered',
      'AYUSH alternative hospital treatments covered',
      'No medical tests required up to 45 years of age'
    ],
    eligibility: {
      minAge: '91 Days',
      maxAge: '65 Years',
      sumAssured: '₹2 Lakhs to ₹5 Lakhs'
    },
    statusBadge: 'Budget Health'
  }
];

export const PoliciesPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<'ALL' | 'LIC' | 'TATA'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Filter Categories
  const categories = [
    'ALL',
    'Term Protection',
    'Health & Medicare',
    'Savings & Income',
    'Retirement & Pension',
    'Wealth / Market-Linked (ULIP)'
  ];

  // Filtering Logic
  const filteredPolicies = policyDataset.filter((policy) => {
    // 1. Search Query
    const matchesSearch =
      policy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (policy.planNumber && policy.planNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      policy.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      policy.highlights.some((h) => h.toLowerCase().includes(searchTerm.toLowerCase()));

    // 2. Provider Filter
    let matchesProvider = true;
    if (selectedProvider === 'LIC') {
      matchesProvider = policy.provider === 'LIC of India';
    } else if (selectedProvider === 'TATA') {
      matchesProvider = policy.provider.startsWith('Tata');
    }

    // 3. Category Filter
    const matchesCategory = selectedCategory === 'ALL' || policy.category === selectedCategory;

    return matchesSearch && matchesProvider && matchesCategory;
  });

  const handleCalculateRedirect = (code: string) => {
    navigate(`/calculator?policy=${code}`);
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12 font-sans">
        
        {/* HERO TITLE */}
        <section className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-wider">
            Premium Policy Catalog
          </span>
          <h1 className="text-4xl md:text-6xl font-bold font-outfit tracking-tight">
            Newly Introduced Portfolios
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Browse recently launched products from LIC and Tata AIA/AIG. We educate and help you evaluate these options side-by-side. 
          </p>
        </section>

        {/* REGULATORY DISCLAIMER WARNING */}
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex gap-3 text-amber-600 dark:text-amber-300 text-xs max-w-4xl mx-auto leading-relaxed">
          <ShieldAlert className="w-5 h-5 shrink-0 text-amber-500 mt-0.5" />
          <div>
            <strong>Independent Advisory Notice:</strong> Policy Advisor is an independent planner. We are not an insurance provider. Payout calculations, premium figures, and plans are for educational comparisons. Final policy registration is conducted securely through official insurance channels.
          </div>
        </div>

        {/* SEARCH AND FILTERS TOOLBAR */}
        <div className="space-y-6 max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search Input */}
            <div className="relative w-full md:flex-1">
              <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by policy name, plan code, or feature..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:border-primary"
              />
            </div>

            {/* Provider Filter Tabs */}
            <div className="flex bg-slate-100 dark:bg-slate-950 p-1.5 rounded-xl border border-slate-200 dark:border-white/5 shrink-0">
              <button
                onClick={() => setSelectedProvider('ALL')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
                  selectedProvider === 'ALL'
                    ? 'bg-primary text-white'
                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                All Brands
              </button>
              <button
                onClick={() => setSelectedProvider('LIC')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
                  selectedProvider === 'LIC'
                    ? 'bg-primary text-white'
                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                LIC (Bharat Shah)
              </button>
              <button
                onClick={() => setSelectedProvider('TATA')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
                  selectedProvider === 'TATA'
                    ? 'bg-primary text-white'
                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                Tata AIA/AIG (Dimple)
              </button>
            </div>
          </div>

          {/* Category Pill Filters */}
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  selectedCategory === cat
                    ? 'bg-slate-800 dark:bg-white border-slate-800 dark:border-white text-white dark:text-slate-900'
                    : 'border-slate-200 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400'
                }`}
              >
                {cat === 'ALL' ? 'All Portfolios' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* RESULTS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {filteredPolicies.map((policy) => (
            <div
              key={policy.code}
              className="rounded-2xl glass p-6 border border-slate-200 dark:border-white/5 flex flex-col justify-between space-y-6 shadow-md hover:shadow-lg hover:border-primary/20 transition-all group"
            >
              <div className="space-y-4">
                {/* Header info */}
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      {policy.provider}
                    </span>
                    <h3 className="text-lg font-bold font-outfit text-slate-800 dark:text-slate-200 group-hover:text-primary transition-colors flex items-center gap-1.5">
                      {policy.name}
                      {policy.planNumber && (
                        <span className="text-xs text-slate-400 font-normal">({policy.planNumber})</span>
                      )}
                    </h3>
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 shrink-0">
                    {policy.statusBadge}
                  </span>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {policy.summary}
                </p>

                {/* Highlight Checklists */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Key Features</h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {policy.highlights.map((hl, idx) => (
                      <li key={idx} className="flex gap-1.5 items-start text-slate-700 dark:text-slate-300">
                        <BadgeCheck className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                        <span className="leading-tight">{hl}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Eligibility Specs */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 grid grid-cols-3 gap-2 text-center text-[10px] text-slate-600 dark:text-slate-300">
                  <div>
                    <span className="block text-[8px] text-slate-400 uppercase tracking-widest">Min Entry</span>
                    <span className="font-semibold">{policy.eligibility.minAge}</span>
                  </div>
                  <div>
                    <span className="block text-[8px] text-slate-400 uppercase tracking-widest">Max Entry</span>
                    <span className="font-semibold">{policy.eligibility.maxAge}</span>
                  </div>
                  <div>
                    <span className="block text-[8px] text-slate-400 uppercase tracking-widest">Target Sum</span>
                    <span className="font-semibold truncate block px-1" title={policy.eligibility.sumAssured}>
                      {policy.eligibility.sumAssured}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-white/5 text-xs">
                <button
                  onClick={() => handleCalculateRedirect(policy.code)}
                  className="flex-1 py-2.5 bg-primary hover:bg-primary-600 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-primary-500/10"
                >
                  <FileText className="w-4 h-4" /> Calculate Premium
                </button>
                <a
                  href="/about#booking-section"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/about');
                    setTimeout(() => {
                      const el = document.getElementById('booking-section');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }, 300);
                  }}
                  className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 rounded-xl font-bold flex items-center gap-1.5 transition-colors shrink-0"
                >
                  <UserCheck className="w-4 h-4 text-primary" /> Consult
                </a>
              </div>
            </div>
          ))}

          {filteredPolicies.length === 0 && (
            <div className="text-center py-20 text-slate-400 text-sm col-span-2 space-y-2">
              <p>No portfolios match your selected parameters.</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedProvider('ALL');
                  setSelectedCategory('ALL');
                }}
                className="text-primary hover:underline text-xs font-semibold"
              >
                Reset Search Filters
              </button>
            </div>
          )}
        </div>

      </div>
    </Layout>
  );
};

export default PoliciesPage;
