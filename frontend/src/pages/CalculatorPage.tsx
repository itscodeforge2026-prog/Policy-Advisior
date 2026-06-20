import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Calculator, ArrowRight, ShieldCheck, Heart, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export const CalculatorPage: React.FC = () => {
  const { user } = useAuth();
  
  // Input form state
  const [inputs, setInputs] = useState({
    policyName: 'TATA_AIA_TERM',
    age: 30,
    gender: 'MALE',
    smoker: false,
    occupation: 'Software Engineer',
    income: 800000,
    coverage: 5000000,
    policyDuration: 20,
    dependents: 2,
  });

  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  // Trigger calculation
  const handleCalculate = async () => {
    setLoading(true);
    try {
      const res = await api.post('/calculator/calculate', inputs);
      setResults(res.data.results);
      if (user) {
        // Reload calculation log history
        loadHistory();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
      const res = await api.get('/calculator/history');
      setHistory(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const policyParam = params.get('policy');
    let activePolicy = inputs.policyName;
    if (policyParam) {
      activePolicy = policyParam;
      setInputs((prev) => ({ ...prev, policyName: policyParam }));
    }

    const runInitialCalc = async () => {
      setLoading(true);
      try {
        const res = await api.post('/calculator/calculate', { ...inputs, policyName: activePolicy });
        setResults(res.data.results);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    runInitialCalc();

    if (user) {
      loadHistory();
    }
  }, [user]);

  // Form helpers
  const handleSliderChange = (key: string, val: number) => {
    setInputs((prev) => ({ ...prev, [key]: val }));
  };

  // Recharts chart data comparing premium across smoking status
  const getChartData = () => {
    if (!results) return [];
    return [
      {
        name: 'Non-Smoker (Est.)',
        premium: Math.round(results.annualPremium / (inputs.smoker ? 1.60 : 1.0)),
      },
      {
        name: 'Current Premium',
        premium: results.annualPremium,
      },
      {
        name: 'Smoker Loading (Est.)',
        premium: Math.round(results.annualPremium * (inputs.smoker ? 1.0 : 1.60)),
      },
    ];
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12 font-sans">
        
        <section className="text-center space-y-3 max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold font-outfit tracking-tight">Actuarial Premium Calculator</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Estimate potential premium loads and calculate risk exposure scores based on health variables and coverage goals.
          </p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* INPUT FORM PANEL */}
          <div className="lg:col-span-5 rounded-2xl glass p-6 space-y-6">
            <h2 className="text-lg font-bold font-outfit border-b border-slate-100 dark:border-white/5 pb-3">Configure Risk Profile</h2>

            {/* Policy Selection */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-400">Select Advisor Policy Portfolio</label>
              <select
                className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary text-slate-700 dark:text-slate-300 font-medium"
                value={inputs.policyName}
                onChange={(e) => setInputs({ ...inputs, policyName: e.target.value })}
              >
                <optgroup label="TATA AIA Life Portfolios (Dimple Shah)">
                  <option value="TATA_AIA_TERM">TATA AIA Life - Term Plan</option>
                  <option value="TATA_AIA_FORTUNE">TATA AIA Life - Fortune Guarantee Plus Plan</option>
                  <option value="TATA_AIA_VALUE">TATA AIA Life - Value Income Plan</option>
                  <option value="TATA_AIA_RETURN">TATA AIA Life - Guaranteed Return Income Plan</option>
                  <option value="TATA_AIA_SHUBH_FAMILY_PROTECT">TATA AIA Life - Shubh Family Protect Term [NEW]</option>
                  <option value="TATA_AIA_DIVIDEND_PENSION">TATA AIA Life - Dividend Leaders Pension Fund [NEW]</option>
                  <option value="TATA_AIA_INNOVATION_FUND">TATA AIA Life - Large & Mid Cap Innovation Fund [NEW]</option>
                </optgroup>
                <optgroup label="LIC of India Portfolios (Bharat Shah)">
                  <option value="LIC_TERM">LIC - Term Plan</option>
                  <option value="LIC_CHILD">LIC - Child Education & Marriage Plan</option>
                  <option value="LIC_WHOLE">LIC - Whole Life Plan</option>
                  <option value="LIC_PENSION">LIC - Retirement/Pension Plan</option>
                  <option value="LIC_MONEYBACK">LIC - Money Back Plan</option>
                  <option value="LIC_JEEVAN_SATHI_SINGLE">LIC - New Jeevan Sathi (Single Premium - Plan 888) [NEW]</option>
                  <option value="LIC_JEEVAN_SATHI_LIMIT">LIC - New Jeevan Sathi (Limited Premium - Plan 889) [NEW]</option>
                  <option value="LIC_BIMA_KAVACH">LIC - Bima Kavach (Plan 887) [NEW]</option>
                  <option value="LIC_PROTECTION_PLUS">LIC - Protection Plus (Plan 886) [NEW]</option>
                  <option value="LIC_JEEVAN_UTSAV_883">LIC - Jeevan Utsav (Plan 883) [NEW]</option>
                  <option value="LIC_INDEX_PLUS_873">LIC - Index Plus ULIP (Plan 873) [NEW]</option>
                </optgroup>
                <optgroup label="General Medical Portfolios">
                  <option value="TATA_AIG_MEDICLAIM">TATA AIG - Mediclaim Policy (Floater)</option>
                  <option value="TATA_AIG_ACCIDENT">TATA AIG - Personal Accident Policy</option>
                  <option value="TATA_AIG_MEDICARE_SELECT">TATA AIG - Medicare Select [NEW]</option>
                  <option value="TATA_AIG_MEDI_PLUS">TATA AIG - Namliy MediPlus [NEW]</option>
                  <option value="TATA_AIG_MEDI_SENIOR">TATA AIG - MediSenior (Senior Citizens) [NEW]</option>
                  <option value="TATA_AIG_MEDI_RAKSHA">TATA AIG - MediRaksha [NEW]</option>
                  <option value="NIA_MEDICLAIM">New India Assurance - Mediclaim Policy (Floater)</option>
                  <option value="NIA_CORONA">New India Assurance - Corona Kavach Policy</option>
                </optgroup>
              </select>
            </div>

            {/* Income Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-slate-400">Annual Income (INR)</span>
                <span className="font-bold text-primary">₹{inputs.income.toLocaleString('en-IN')}</span>
              </div>
              <input
                type="range"
                min={200000}
                max={5000000}
                step={50000}
                value={inputs.income}
                onChange={(e) => handleSliderChange('income', Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

            {/* Coverage Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-slate-400">Sum Assured Target (INR)</span>
                <span className="font-bold text-primary">₹{inputs.coverage.toLocaleString('en-IN')}</span>
              </div>
              <input
                type="range"
                min={1000000}
                max={30000000}
                step={500000}
                value={inputs.coverage}
                onChange={(e) => handleSliderChange('coverage', Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Age */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-400">Age</label>
                <input
                  type="number"
                  min={18}
                  max={90}
                  className="w-full bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                  value={inputs.age}
                  onChange={(e) => handleSliderChange('age', Number(e.target.value))}
                />
              </div>

              {/* Policy Duration */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-400">Policy Term (Years)</label>
                <input
                  type="number"
                  min={5}
                  max={50}
                  className="w-full bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                  value={inputs.policyDuration}
                  onChange={(e) => handleSliderChange('policyDuration', Number(e.target.value))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Gender */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-400">Gender</label>
                <select
                  className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary text-slate-400"
                  value={inputs.gender}
                  onChange={(e) => setInputs({ ...inputs, gender: e.target.value })}
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              {/* Dependents */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-400">Dependents</label>
                <input
                  type="number"
                  min={0}
                  max={10}
                  className="w-full bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                  value={inputs.dependents}
                  onChange={(e) => handleSliderChange('dependents', Number(e.target.value))}
                />
              </div>
            </div>

            {/* Occupation */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-400">Occupation</label>
              <input
                type="text"
                className="w-full bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                value={inputs.occupation}
                onChange={(e) => setInputs({ ...inputs, occupation: e.target.value })}
              />
            </div>

            {/* Smoker Toggle */}
            <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-white/10 bg-white/5">
              <div>
                <span className="text-xs font-semibold block">Nicotine Consumption</span>
                <span className="text-[10px] text-slate-400">Have you used tobacco in the last 12 months?</span>
              </div>
              <input
                type="checkbox"
                checked={inputs.smoker}
                onChange={(e) => setInputs({ ...inputs, smoker: e.target.checked })}
                className="w-5 h-5 rounded text-primary focus:ring-primary accent-primary cursor-pointer"
              />
            </div>

            <button
              onClick={handleCalculate}
              disabled={loading}
              className="w-full py-3 bg-primary hover:bg-primary-600 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 text-white"
            >
              {loading ? 'Re-calculating...' : 'Generate Quote Illustration'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* RESULTS DISPLAY PANEL */}
          <div className="lg:col-span-7 space-y-6">
            {results && (
              <div className="rounded-2xl glass p-6 space-y-8">
                {/* Premium display cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 rounded-xl bg-primary/10 border border-primary/20 space-y-1">
                    <span className="text-xs text-slate-400 font-medium">Estimated Annual Premium</span>
                    <div className="text-3xl font-extrabold font-outfit text-primary">
                      ₹{results.annualPremium.toLocaleString('en-IN')}
                    </div>
                    <span className="text-[10px] text-slate-400 block">Excluding local taxes and riders</span>
                  </div>

                  <div className="p-5 rounded-xl bg-accent/10 border border-accent/20 space-y-1">
                    <span className="text-xs text-slate-400 font-medium">Estimated Monthly Premium</span>
                    <div className="text-3xl font-extrabold font-outfit text-accent">
                      ₹{results.monthlyPremium.toLocaleString('en-IN')}
                    </div>
                    <span className="text-[10px] text-slate-400 block">Includes modal installments load</span>
                  </div>
                </div>

                {/* Score Indicators */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Risk Score */}
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-white/5 space-y-2">
                    <div className="flex justify-between text-xs items-center">
                      <span className="font-medium text-slate-400">Risk Exposure Index</span>
                      <span className={`font-bold ${results.riskScore > 50 ? 'text-red-400' : 'text-green-400'}`}>
                        {results.riskScore}/100
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${results.riskScore > 50 ? 'bg-red-400' : 'bg-green-400'}`}
                        style={{ width: `${results.riskScore}%` }}
                      />
                    </div>
                  </div>

                  {/* Financial Health Score */}
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-white/5 space-y-2">
                    <div className="flex justify-between text-xs items-center">
                      <span className="font-medium text-slate-400">Financial Safety Score</span>
                      <span className="font-bold text-primary">
                        {results.financialHealthScore}/100
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${results.financialHealthScore}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Chart comparison */}
                <div className="space-y-2">
                  <h3 className="text-xs uppercase tracking-widest text-slate-400 font-bold">Premium Range Comparison</h3>
                  <div className="h-[180px] w-full pt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={getChartData()}>
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                        <Tooltip contentStyle={{ background: '#0f172a', borderRadius: 8, border: 'none', color: '#fff', fontSize: 12 }} />
                        <Bar dataKey="premium" fill="#0ea0eb" radius={[4, 4, 0, 0]} barSize={40} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Advice details */}
                <div className="space-y-3">
                  <h3 className="text-xs uppercase tracking-widest text-slate-400 font-bold">Advisor Safety Recommendations</h3>
                  <ul className="space-y-2 text-xs">
                    {results.recommendations.map((rec: string, index: number) => (
                      <li key={index} className="flex gap-2 items-start text-slate-600 dark:text-slate-300">
                        <ShieldCheck className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CALCULATION LOG HISTORY TABLE */}
        {user && history.length > 0 && (
          <section className="rounded-2xl glass p-6 space-y-4">
            <h2 className="text-lg font-bold font-outfit">Your Calculation Log History</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-white/10 text-slate-400">
                    <th className="py-3 px-2">Date</th>
                    <th className="py-3 px-2">Coverage (SA)</th>
                    <th className="py-3 px-2">Duration</th>
                    <th className="py-3 px-2">Age / Smoker</th>
                    <th className="py-3 px-2 text-right">Est. Premium</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((item) => (
                    <tr key={item.id} className="border-b border-slate-100 dark:border-white/5 text-slate-600 dark:text-slate-300">
                      <td className="py-3 px-2">{new Date(item.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 px-2">₹{item.inputs.coverage.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-2">{item.inputs.policyDuration} Yrs</td>
                      <td className="py-3 px-2">
                        {item.inputs.age} / {item.inputs.smoker ? 'Smoker' : 'Non-Smoker'}
                      </td>
                      <td className="py-3 px-2 text-right font-bold text-primary">
                        ₹{item.results.annualPremium.toLocaleString('en-IN')}/Yr
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

      </div>
    </Layout>
  );
};
export default CalculatorPage;
