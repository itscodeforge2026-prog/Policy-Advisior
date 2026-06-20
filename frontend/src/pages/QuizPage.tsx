import React, { useState } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { FileText, ArrowLeft, ArrowRight, ShieldCheck, Heart, AlertCircle, RefreshCw, Printer } from 'lucide-react';

export const QuizPage: React.FC = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('Evaluating data parameters...');
  const [report, setReport] = useState<any>(null);

  // Form states
  const [answers, setAnswers] = useState({
    age: 30,
    maritalStatus: 'SINGLE',
    children: 0,
    occupation: 'Software Developer',
    income: 800000,
    existingInsurance: 'None',
    loans: 0,
    financialGoals: [] as string[],
    riskAppetite: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH',
    futurePlans: '',
    emergencySavings: 50000,
  });

  const goalsOptions = [
    'Family Security (Term Plan)',
    'Children Education Fund',
    'Child Marriage Corpus',
    'Retirement/Pension Planning',
    'Capital Growth (ULIPs)',
    'Tax Savings'
  ];

  const handleGoalToggle = (goal: string) => {
    setAnswers((prev) => {
      const exists = prev.financialGoals.includes(goal);
      if (exists) {
        return { ...prev, financialGoals: prev.financialGoals.filter((g) => g !== goal) };
      } else {
        return { ...prev, financialGoals: [...prev.financialGoals, goal] };
      }
    });
  };

  const handleNext = () => setStep((s) => s + 1);
  const handlePrev = () => setStep((s) => s - 1);

  const handleSubmit = async () => {
    setLoading(true);
    setLoadingMsg('Initializing Policy Advisor AI analysis...');
    
    // Simulate thinking steps for high-fidelity feel
    setTimeout(() => {
      setLoadingMsg('Evaluating household debt-to-income limits...');
      setTimeout(() => {
        setLoadingMsg('Formulating tax-saving optimization tips...');
      }, 1000);
    }, 1000);

    try {
      const response = await api.post('/ai/quiz-report', answers);
      setReport(response.data.reportData);
      setStep(5); // Final step
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-16 space-y-8 font-sans print:bg-white print:text-black print:p-0">
        
        {/* HEADER */}
        <section className="text-center space-y-3 print:hidden">
          <h1 className="text-4xl md:text-5xl font-bold font-outfit tracking-tight">AI Needs Analysis</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Provide details of your household and financial goals. Our AI will analyze your profiles to benchmark required coverage ranges.
          </p>
        </section>

        {/* LOADING STATE */}
        {loading ? (
          <div className="rounded-2xl glass p-12 text-center space-y-6 print:hidden">
            <RefreshCw className="w-12 h-12 text-primary animate-spin mx-auto" />
            <h3 className="text-lg font-bold font-outfit text-slate-800 dark:text-slate-200">Generating Report</h3>
            <p className="text-sm text-slate-400 animate-pulse">{loadingMsg}</p>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* STEP 1: PERSONAL BASE */}
            {step === 1 && (
              <div className="rounded-2xl glass p-8 space-y-6 print:hidden">
                <h2 className="text-xl font-bold font-outfit text-slate-800 dark:text-slate-200">Step 1: Household Profile</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-medium">Age</label>
                    <input
                      type="number"
                      className="w-full bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
                      value={answers.age}
                      onChange={(e) => setAnswers({ ...answers, age: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-medium">Marital Status</label>
                    <select
                      className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary text-slate-400"
                      value={answers.maritalStatus}
                      onChange={(e) => setAnswers({ ...answers, maritalStatus: e.target.value })}
                    >
                      <option value="SINGLE">Single</option>
                      <option value="MARRIED">Married</option>
                      <option value="DIVORCED">Divorced / Widowed</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-medium">Children Count</label>
                    <input
                      type="number"
                      className="w-full bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
                      value={answers.children}
                      onChange={(e) => setAnswers({ ...answers, children: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={handleNext}
                    className="px-6 py-2.5 bg-primary hover:bg-primary-600 rounded-lg text-sm font-semibold flex items-center gap-2 text-white"
                  >
                    Next Step <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: FINANCES */}
            {step === 2 && (
              <div className="rounded-2xl glass p-8 space-y-6 print:hidden">
                <h2 className="text-xl font-bold font-outfit text-slate-800 dark:text-slate-200">Step 2: Financial Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-medium">Occupation</label>
                    <input
                      type="text"
                      className="w-full bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
                      value={answers.occupation}
                      onChange={(e) => setAnswers({ ...answers, occupation: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-medium">Annual Income (INR)</label>
                    <input
                      type="number"
                      className="w-full bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
                      value={answers.income}
                      onChange={(e) => setAnswers({ ...answers, income: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-medium">Outstanding Liabilities / Loans (INR)</label>
                    <input
                      type="number"
                      className="w-full bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
                      value={answers.loans}
                      onChange={(e) => setAnswers({ ...answers, loans: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-medium">Emergency Savings Corpus (INR)</label>
                    <input
                      type="number"
                      className="w-full bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
                      value={answers.emergencySavings}
                      onChange={(e) => setAnswers({ ...answers, emergencySavings: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    onClick={handlePrev}
                    className="px-6 py-2.5 border border-white/10 rounded-lg text-sm font-semibold flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <button
                    onClick={handleNext}
                    className="px-6 py-2.5 bg-primary hover:bg-primary-600 rounded-lg text-sm font-semibold flex items-center gap-2 text-white"
                  >
                    Next Step <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: GOALS & RISK */}
            {step === 3 && (
              <div className="rounded-2xl glass p-8 space-y-6 print:hidden">
                <h2 className="text-xl font-bold font-outfit text-slate-800 dark:text-slate-200">Step 3: Goals & Risk Tolerance</h2>
                
                <div className="space-y-2">
                  <label className="text-xs text-slate-400 font-medium">Financial Milestones to Secure</label>
                  <div className="grid grid-cols-2 gap-3">
                    {goalsOptions.map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => handleGoalToggle(g)}
                        className={`p-3 rounded-lg text-xs font-medium border text-left transition-colors ${
                          answers.financialGoals.includes(g)
                            ? 'bg-primary/20 border-primary text-primary'
                            : 'border-slate-200 dark:border-white/5 hover:bg-white/5'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-slate-400 font-medium">Risk Appetite</label>
                  <div className="grid grid-cols-3 gap-3">
                    {['LOW', 'MEDIUM', 'HIGH'].map((risk) => (
                      <button
                        key={risk}
                        type="button"
                        onClick={() => setAnswers({ ...answers, riskAppetite: risk as any })}
                        className={`p-3 rounded-lg text-xs font-semibold border text-center transition-colors ${
                          answers.riskAppetite === risk
                            ? 'bg-primary/20 border-primary text-primary'
                            : 'border-slate-200 dark:border-white/5 hover:bg-white/5'
                        }`}
                      >
                        {risk}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    onClick={handlePrev}
                    className="px-6 py-2.5 border border-white/10 rounded-lg text-sm font-semibold flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <button
                    onClick={handleNext}
                    className="px-6 py-2.5 bg-primary hover:bg-primary-600 rounded-lg text-sm font-semibold flex items-center gap-2 text-white"
                  >
                    Next Step <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: ADDITIONAL & SUBMIT */}
            {step === 4 && (
              <div className="rounded-2xl glass p-8 space-y-6 print:hidden">
                <h2 className="text-xl font-bold font-outfit text-slate-800 dark:text-slate-200">Step 4: Existing Policies</h2>
                
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-medium">Existing Coverage Policies (Riders / Corporate Group Policies)</label>
                  <input
                    type="text"
                    className="w-full bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
                    placeholder="e.g. Corporate medical cover ₹3 Lakhs, LIC Endowment policy ₹5 Lakhs"
                    value={answers.existingInsurance}
                    onChange={(e) => setAnswers({ ...answers, existingInsurance: e.target.value })}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-medium">Short Term / Future Plans (e.g. buying home, marriage etc.)</label>
                  <textarea
                    rows={3}
                    className="w-full bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary resize-none"
                    value={answers.futurePlans}
                    onChange={(e) => setAnswers({ ...answers, futurePlans: e.target.value })}
                  />
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    onClick={handlePrev}
                    className="px-6 py-2.5 border border-white/10 rounded-lg text-sm font-semibold flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="px-6 py-2.5 bg-primary hover:bg-primary-600 rounded-lg text-sm font-semibold flex items-center gap-2 text-white"
                  >
                    Submit & Generate Analysis <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 5: RESULTS REPORT (PRINT FRIENDLY) */}
            {step === 5 && report && (
              <div className="space-y-6">
                
                {/* Print Control bar */}
                <div className="flex justify-between items-center bg-slate-900 border border-white/5 rounded-xl p-4 text-white print:hidden">
                  <span className="text-xs font-semibold">Policy Advisor AI Needs Report Ready</span>
                  <div className="flex gap-2">
                    <button
                      onClick={handleDownloadPDF}
                      className="px-4 py-2 bg-primary hover:bg-primary-600 rounded-lg text-xs font-semibold flex items-center gap-1.5"
                    >
                      <Printer className="w-4 h-4" /> Download PDF Report
                    </button>
                    <button
                      onClick={() => setStep(1)}
                      className="px-4 py-2 border border-white/10 hover:bg-white/5 rounded-lg text-xs font-semibold"
                    >
                      Retake Quiz
                    </button>
                  </div>
                </div>

                {/* The Report Body */}
                <div className="rounded-3xl glass p-8 lg:p-12 space-y-8 print:border-none print:shadow-none print:bg-white print:text-black">
                  {/* Report Header */}
                  <div className="flex justify-between items-start border-b border-slate-200 dark:border-white/10 pb-6">
                    <div>
                      <h2 className="text-2xl lg:text-3xl font-extrabold font-outfit text-primary">Needs Analysis Report</h2>
                      <span className="text-xs text-slate-400">Generated dynamically by Policy Advisor AI</span>
                    </div>
                    <div className="text-right text-xs text-slate-500">
                      <div>Date: {new Date().toLocaleDateString()}</div>
                      <div>Risk Profile: <span className="font-bold text-primary uppercase">{report.riskScore}</span></div>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="space-y-2">
                    <h3 className="text-xs uppercase tracking-widest text-slate-400 font-extrabold">Executive Summary</h3>
                    <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                      {report.summary}
                    </p>
                  </div>

                  {/* Cover Guidelines */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 space-y-1">
                      <span className="text-xs text-slate-400 font-medium">Recommended Life Cover (Pure Term)</span>
                      <div className="text-3xl font-extrabold font-outfit text-primary">
                        ₹{report.requiredLifeCover.toLocaleString('en-IN')}
                      </div>
                      <span className="text-[10px] text-slate-400 block">Covers outstanding debt + family support benchmarks</span>
                    </div>

                    <div className="p-6 rounded-2xl bg-accent/5 border border-accent/10 space-y-1">
                      <span className="text-xs text-slate-400 font-medium">Recommended Health Cover (Floater)</span>
                      <div className="text-3xl font-extrabold font-outfit text-accent">
                        ₹{report.requiredHealthCover.toLocaleString('en-IN')}
                      </div>
                      <span className="text-[10px] text-slate-400 block">Excludes corporate employer group policies</span>
                    </div>
                  </div>

                  <hr className="border-slate-200 dark:border-white/10" />

                  {/* Bullet tips */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Recommendations */}
                    <div className="space-y-3">
                      <h4 className="text-xs uppercase tracking-widest text-slate-400 font-bold">Action Recommendations</h4>
                      <ul className="space-y-2 text-xs">
                        {report.recommendations?.map((item: string, idx: number) => (
                          <li key={idx} className="flex gap-2 items-start text-slate-700 dark:text-slate-300">
                            <ShieldCheck className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Retirement planning */}
                    <div className="space-y-3">
                      <h4 className="text-xs uppercase tracking-widest text-slate-400 font-bold">Retirement planning tips</h4>
                      <ul className="space-y-2 text-xs">
                        {report.retirementPlanningTips?.map((item: string, idx: number) => (
                          <li key={idx} className="flex gap-2 items-start text-slate-700 dark:text-slate-300">
                            <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Savings Strategies */}
                  <div className="p-5 rounded-2xl border border-slate-200 dark:border-white/5 space-y-3 bg-white/5">
                    <h4 className="text-xs uppercase tracking-widest text-slate-400 font-bold">Tax & Savings optimization</h4>
                    <ul className="space-y-2 text-xs">
                      {report.savingsStrategies?.map((item: string, idx: number) => (
                        <li key={idx} className="flex gap-2 items-start text-slate-700 dark:text-slate-300">
                          <ShieldCheck className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Advisory Notice */}
                  <div className="text-[10px] text-slate-500 text-center leading-relaxed pt-8 border-t border-slate-200 dark:border-white/10">
                    <strong className="text-slate-400">Independent Advisory:</strong> This report is for educational purposes. We recommend setting up a consultation call with Bharat Shah (+91 9825429228) or Dimple Shah (+91 9825429228) at Policy Advisor to proceed with official underwriting benchmarks.
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </Layout>
  );
};
export default QuizPage;
