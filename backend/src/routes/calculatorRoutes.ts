import { Router, Response } from 'express';
import db from '../services/db';
import { AuthRequest, authenticateJWT } from '../middleware/authMiddleware';
import { premiumCalculateSchema } from 'shared';

const router = Router();

// Middleware helper to make auth optional
const optionalAuth = (req: AuthRequest, res: Response, next: any) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  const cookieToken = req.cookies?.access_token;
  const tokenToVerify = token || cookieToken;

  if (tokenToVerify) {
    authenticateJWT(req, res, next);
  } else {
    next();
  }
};

// POST /api/calculator/calculate
router.post('/calculate', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const parsed = premiumCalculateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: 'Validation failed', errors: parsed.error.errors });
    }

    const { policyName, age, gender, smoker, occupation, income, coverage, policyDuration, dependents } = parsed.data;

    // Actuarial premium base rate mapping by policy choice
    let baseRate = 0.0012; // default generic rate
    let policyDisplayLabel = 'Generic Coverage';

    switch (policyName) {
      case 'TATA_AIA_TERM':
        baseRate = 0.0008;
        policyDisplayLabel = 'TATA AIA Life - Term Plan';
        break;
      case 'TATA_AIA_FORTUNE':
        baseRate = 0.0032;
        policyDisplayLabel = 'TATA AIA Life - Fortune Guarantee Plus Plan';
        break;
      case 'TATA_AIA_VALUE':
        baseRate = 0.0040;
        policyDisplayLabel = 'TATA AIA Life - Value Income Plan';
        break;
      case 'TATA_AIA_RETURN':
        baseRate = 0.0035;
        policyDisplayLabel = 'TATA AIA Life - Guaranteed Return Income Plan';
        break;
      case 'TATA_AIA_SHUBH_FAMILY_PROTECT':
        baseRate = 0.00075;
        policyDisplayLabel = 'TATA AIA Life - Shubh Family Protect Term Plan';
        break;
      case 'TATA_AIA_DIVIDEND_PENSION':
        baseRate = 0.0042;
        policyDisplayLabel = 'TATA AIA Life - Dividend Leaders Pension Fund';
        break;
      case 'TATA_AIA_INNOVATION_FUND':
        baseRate = 0.0038;
        policyDisplayLabel = 'TATA AIA Life - Large & Mid Cap Innovation Fund';
        break;
      case 'LIC_CHILD':
        baseRate = 0.0028;
        policyDisplayLabel = 'LIC - Child Education & Marriage Plan';
        break;
      case 'LIC_WHOLE':
        baseRate = 0.0030;
        policyDisplayLabel = 'LIC - Whole Life Plan';
        break;
      case 'LIC_PENSION':
        baseRate = 0.0045;
        policyDisplayLabel = 'LIC - Retirement/Pension Plan';
        break;
      case 'LIC_MONEYBACK':
        baseRate = 0.0042;
        policyDisplayLabel = 'LIC - Money Back Plan';
        break;
      case 'LIC_TERM':
        baseRate = 0.0009;
        policyDisplayLabel = 'LIC - Term Plan';
        break;
      case 'LIC_JEEVAN_SATHI_SINGLE':
        baseRate = 0.0036;
        policyDisplayLabel = 'LIC - New Jeevan Sathi (Single Premium - Plan 888)';
        break;
      case 'LIC_JEEVAN_SATHI_LIMIT':
        baseRate = 0.0039;
        policyDisplayLabel = 'LIC - New Jeevan Sathi (Limited Premium - Plan 889)';
        break;
      case 'LIC_BIMA_KAVACH':
        baseRate = 0.0010;
        policyDisplayLabel = 'LIC - Bima Kavach (Plan 887)';
        break;
      case 'LIC_PROTECTION_PLUS':
        baseRate = 0.0011;
        policyDisplayLabel = 'LIC - Protection Plus (Plan 886)';
        break;
      case 'LIC_JEEVAN_UTSAV_883':
        baseRate = 0.0035;
        policyDisplayLabel = 'LIC - Jeevan Utsav (Plan 883)';
        break;
      case 'LIC_INDEX_PLUS_873':
        baseRate = 0.0022;
        policyDisplayLabel = 'LIC - Index Plus ULIP (Plan 873)';
        break;
      case 'TATA_AIG_MEDICLAIM':
        baseRate = 0.0075;
        policyDisplayLabel = 'TATA AIG - Mediclaim Policy (Floater)';
        break;
      case 'TATA_AIG_ACCIDENT':
        baseRate = 0.0048;
        policyDisplayLabel = 'TATA AIG - Personal Accident Policy';
        break;
      case 'TATA_AIG_MEDICARE_SELECT':
        baseRate = 0.0085;
        policyDisplayLabel = 'TATA AIG - Medicare Select';
        break;
      case 'TATA_AIG_MEDI_PLUS':
        baseRate = 0.0078;
        policyDisplayLabel = 'TATA AIG - Namliy MediPlus';
        break;
      case 'TATA_AIG_MEDI_SENIOR':
        baseRate = 0.0090;
        policyDisplayLabel = 'TATA AIG - MediSenior (Senior Citizens)';
        break;
      case 'TATA_AIG_MEDI_RAKSHA':
        baseRate = 0.0068;
        policyDisplayLabel = 'TATA AIG - MediRaksha';
        break;
      case 'NIA_MEDICLAIM':
        baseRate = 0.0072;
        policyDisplayLabel = 'New India Assurance - Mediclaim Policy (Floater)';
        break;
      case 'NIA_CORONA':
        baseRate = 0.0040;
        policyDisplayLabel = 'New India Assurance - Corona Kavach Policy';
        break;
      default:
        baseRate = 0.0015;
        policyDisplayLabel = 'Custom Selected Protection Plan';
        break;
    }

    // Age adjustments: base is 25. Add 3.5% per year above 25. Subtract 1% per year below 25 down to 18
    const ageDiff = age - 25;
    const ageMultiplier = ageDiff > 0 ? 1 + (ageDiff * 0.035) : 1 + (ageDiff * 0.01);
    
    // Gender adjustment: Female mortality rates are statistically lower
    const genderMultiplier = gender === 'FEMALE' ? 0.90 : 1.0;
    
    // Smoker adjustment: Substantial risk load
    const smokerMultiplier = smoker ? 1.60 : 1.0;
    
    // Occupation risk level
    const occLower = occupation.toLowerCase();
    let occupationMultiplier = 1.0;
    if (occLower.includes('pilot') || occLower.includes('military') || occLower.includes('police') || occLower.includes('mining') || occLower.includes('driver') || occLower.includes('construction')) {
      occupationMultiplier = 1.25; // High-risk occupation
    } else if (occLower.includes('software') || occLower.includes('doctor') || occLower.includes('teacher') || occLower.includes('office') || occLower.includes('manager') || occLower.includes('analyst')) {
      occupationMultiplier = 0.95; // Low-risk occupation
    }

    // Dependent loading: 4% extra cover load per dependent for waiver riders
    const dependentsMultiplier = 1 + (dependents * 0.04);

    // Calculate premium
    const annualPremium = Math.round((coverage * baseRate) * ageMultiplier * genderMultiplier * smokerMultiplier * occupationMultiplier * dependentsMultiplier / (policyDuration / 10));
    
    // Monthly installment estimation
    const monthlyPremium = Math.round((annualPremium / 12) * 1.05); // Standard modal loading factor

    // 2. Risk Score calculation (1 to 100)
    let riskScore = 15;
    if (smoker) riskScore += 30;
    if (age > 45) riskScore += 20;
    else if (age > 30) riskScore += 10;
    if (occupationMultiplier > 1.0) riskScore += 15;
    if (dependents > 3) riskScore += 10;
    riskScore = Math.min(riskScore, 100);

    // 3. Financial Health Score (1 to 100)
    let financialHealthScore = 80;
    if (income > 0) {
      const premiumToIncomeRatio = (annualPremium / income) * 100;
      if (premiumToIncomeRatio > 15) financialHealthScore -= 20;
      else if (premiumToIncomeRatio > 5) financialHealthScore -= 5;

      const coverageToIncomeRatio = coverage / income;
      if (coverageToIncomeRatio < 5) financialHealthScore -= 15; // Underinsured
      else if (coverageToIncomeRatio >= 10) financialHealthScore += 10; // Well-protected
    } else {
      financialHealthScore = 40; // No active income
    }
    
    if (dependents > 2 && income < 500000) financialHealthScore -= 15;
    financialHealthScore = Math.max(Math.min(financialHealthScore, 100), 10);

    // 4. Generate recommendations
    const recommendations = [
      `Policy Selected: ${policyDisplayLabel}.`,
    ];

    if (policyName.includes('TERM') || policyName.includes('KAVACH') || policyName.includes('PROTECTION_PLUS') || policyName.includes('SHUBH_FAMILY')) {
      recommendations.push("Term and Kavach plans are pure risk protection. We recommend combining this with a Critical Illness rider to safeguard against major medical diagnoses.");
    }
    if (policyName.includes('CHILD')) {
      recommendations.push("Ensure that the Waiver of Premium Benefit is active so the policy remains active for your child if you pass away.");
    }
    if (policyName.includes('MEDICLAIM') || policyName.includes('MEDI_')) {
      recommendations.push("Examine network hospital cash-limit capping clauses before finalizing underwriting options.");
    }
    if (policyName.includes('JEEVAN_SATHI')) {
      recommendations.push("LIC New Jeevan Sathi is a joint-life program designed for couples. Plan 889 offers an automatic premium waiver benefit on the first death during the premium paying term.");
    }
    if (policyName.includes('MEDICARE_SELECT')) {
      recommendations.push("TATA AIG Medicare Select offers Unlimited Sum Insured Restoration for both related and unrelated illnesses. Ideal for family floater setups.");
    }
    if (policyName.includes('MEDI_SENIOR')) {
      recommendations.push("Senior health covers require careful checks of co-payment details and waiting periods for pre-existing conditions.");
    }
    if (policyName === 'LIC_JEEVAN_UTSAV_883') {
      recommendations.push("LIC Jeevan Utsav Plan 883 offers lifelong guaranteed income. Choosing the Deferred Flexi Income option allows your payouts to accumulate and compound at a guaranteed 5.5% rate.");
    }
    if (policyName === 'LIC_INDEX_PLUS_873') {
      recommendations.push("LIC Index Plus Plan 873 is a market-linked ULIP. Ensure that you evaluate the split between Nifty 50 Index Fund and Nifty Flexicap Fund according to your risk tolerance.");
    }
    if (policyName === 'TATA_AIA_SHUBH_FAMILY_PROTECT') {
      recommendations.push("Tata AIA Shubh Family Protect offers a mix of lump sum and monthly income. We recommend adding the Waiver of Premium on Terminal Illness rider to ensure absolute protection.");
    }
    if (policyName === 'TATA_AIA_DIVIDEND_PENSION' || policyName === 'TATA_AIA_INNOVATION_FUND') {
      recommendations.push("High-equity innovation funds and dividend index strategies are designed for a 10-15 year horizon. Consider setting up a system to transfer gains to debt funds 3 years prior to target retirement.");
    }

    recommendations.push(`Maintain a total life coverage equivalent to 10-15 times your annual income (Target: INR ${(income * 12).toLocaleString('en-IN')}).`);

    if (smoker) {
      recommendations.push("Enrolling in smoking cessation courses can significantly reduce your life risk profile and drop premiums by up to 40% on renewal.");
    }
    if (financialHealthScore < 60) {
      recommendations.push("Your coverage is low compared to dependents and income. Consider building emergency reserves before investing in high-risk mutual funds.");
    }
    if (ageMultiplier > 1.5) {
      recommendations.push("Locking in term policies now is highly recommended, as premiums increase exponentially by 6-8% each year you delay.");
    }

    const results = {
      policyDisplayLabel,
      annualPremium,
      monthlyPremium,
      riskScore,
      financialHealthScore,
      recommendations,
      coverageAnalysis: coverage < income * 10 ? 'UNDER_INSURED' : 'WELL_INSURED'
    };

    // If user is authenticated, save in database
    let customerProfileId = null;
    if (req.user) {
      const profile = await db.customerProfile.findUnique({
        where: { userId: req.user.id }
      });
      if (profile) {
        customerProfileId = profile.id;
      }
    }

    const savedCalc = await db.premiumCalculation.create({
      data: {
        customerId: customerProfileId,
        inputs: JSON.stringify(parsed.data),
        results: JSON.stringify(results)
      }
    });

    return res.status(201).json({
      id: savedCalc.id,
      inputs: parsed.data,
      results,
      createdAt: savedCalc.createdAt
    });
  } catch (error) {
    console.error('Calculation error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/calculator/history (Current customer history)
router.get('/history', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const profile = await db.customerProfile.findUnique({
      where: { userId: req.user.id }
    });

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    const list = await db.premiumCalculation.findMany({
      where: { customerId: profile.id },
      orderBy: { createdAt: 'desc' }
    });

    const parsedHistory = list.map(item => ({
      id: item.id,
      inputs: JSON.parse(item.inputs),
      results: JSON.parse(item.results),
      createdAt: item.createdAt
    }));

    return res.json(parsedHistory);
  } catch (error) {
    console.error('Error fetching premium calculations history:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
