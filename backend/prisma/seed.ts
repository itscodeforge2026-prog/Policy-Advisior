import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Hash passwords
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('password123', salt);

  // 1. Seed Users (Admin & Advisors)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@PolicyAdvisor.com' },
    update: {},
    create: {
      email: 'admin@PolicyAdvisor.com',
      passwordHash,
      name: 'System Admin',
      role: 'ADMIN',
    },
  });

  const dimple = await prisma.user.upsert({
    where: { email: 'dimple_shah@yahoo.in' },
    update: {},
    create: {
      email: 'dimple_shah@yahoo.in',
      passwordHash,
      name: 'Dimple Shah',
      role: 'ADVISOR',
      customer: {
        create: {
          phone: '9825429228',
          city: 'Vadodara',
          occupation: 'Insurance Advisor',
          annualIncome: 1200000,
          gender: 'FEMALE',
          maritalStatus: 'MARRIED',
        },
      },
    },
  });

  const bharat = await prisma.user.upsert({
    where: { email: 'bharatshah_1969@yahoo.in' },
    update: {},
    create: {
      email: 'bharatshah_1969@yahoo.in',
      passwordHash,
      name: 'Bharat Shah',
      role: 'ADVISOR',
      customer: {
        create: {
          phone: '9825429228',
          city: 'Vadodara',
          occupation: 'Insurance Advisor',
          annualIncome: 1500000,
          gender: 'MALE',
          maritalStatus: 'MARRIED',
        },
      },
    },
  });

  console.log('Seeded Users: Admin and Advisors.');

  // 2. Seed Settings
  const settings = [
    { key: 'advisor_contact_phone', value: '9825429228', description: 'Primary Contact Mobile' },
    { key: 'advisor_contact_email', value: 'bharatshah_1969@yahoo.in', description: 'Primary Email' },
    { key: 'advisor_contact_address', value: 'B-301, Pinkal Appartment, Near Deep chambers, Manjalpur, Vadodara.', description: 'Office Address' },
    { key: 'slogan_wealth', value: "We create your 'WEALTH'", description: 'Dimple Shah Slogan' },
    { key: 'slogan_health', value: "We protect your 'HEALTH'", description: 'Bharat Shah Slogan' },
  ];

  for (const s of settings) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    });
  }
  console.log('Seeded settings.');

  // 3. Seed Insurance Categories
  const categories = [
    {
      slug: 'life-insurance',
      name: 'Life Insurance',
      overview: 'Life insurance provides financial security to your family in case of your untimely demise, helping them cover living expenses, debt, and long-term goals.',
      benefits: JSON.stringify(['High sum assured relative to premium', 'Income replacement for dependents', 'Goal security for children\'s education', 'Tax benefits under Section 80C']),
      whoShouldBuy: JSON.stringify('Income earners with financial dependents, individuals with loans or liabilities, and anyone looking for long-term wealth security.'),
      eligibility: JSON.stringify({ minAge: 18, maxAge: 65, tenure: '5 to 40 years' }),
      myths: JSON.stringify([
        { myth: 'Life insurance is only for older people.', reality: 'Buying young offers substantially lower premium rates that remain locked for life.' },
        { myth: 'Group cover from work is sufficient.', reality: 'Company policies terminate immediately when you leave or change your job.' }
      ]),
      faqs: JSON.stringify([
        { question: 'What is a nominee?', answer: 'A nominee is the designated individual who receives the claim payout in the event of the policyholder\'s death.' }
      ]),
      documentsRequired: JSON.stringify(['Aadhaar Card', 'PAN Card', 'Income Proof (3-month salary slips/ITR)', 'Passport Photograph']),
      claimProcess: '1. Notify the insurance company immediately. 2. Submit Claim Form along with the Death Certificate. 3. Provide original policy document and KYC of nominee. 4. Settlement is processed within 15-30 days of complete document submission.',
      thingsToConsider: JSON.stringify(['Evaluate the human life value (HLV) to determine the right sum assured.', 'Declare all pre-existing health conditions honestly to prevent claim rejection.']),
    },
    {
      slug: 'health-insurance',
      name: 'Health Insurance',
      overview: 'Health insurance covers medical and surgical expenses incurred by the insured. It offers protection against rising hospitalization costs and critical illness expenses.',
      benefits: JSON.stringify(['Cashless treatment at network hospitals', 'Coverage for pre and post-hospitalization', 'No Claim Bonus (NCB) benefits', 'Tax deductions under Section 80D']),
      whoShouldBuy: JSON.stringify('Individuals, spouses, growing families, and elderly parents who want protection against unexpected medical emergencies.'),
      eligibility: JSON.stringify({ minAge: 91, maxAge: 65, tenure: '1 to 3 years' }),
      myths: JSON.stringify([
        { myth: 'I am young and fit, I do not need health insurance.', reality: 'Unexpected accidents or vector-borne ailments can strike anyone and wipe out savings.' },
        { myth: '24-hour hospitalization is always mandatory.', reality: 'Modern policies cover daycare procedures like cataracts or chemotherapy which take less than 24 hours.' }
      ]),
      faqs: JSON.stringify([
        { question: 'What is cashless hospitalization?', answer: 'It is a facility where the insurer pays the hospital directly, so the patient does not have to pay out of pocket.' }
      ]),
      documentsRequired: JSON.stringify(['Aadhaar Card', 'PAN Card', 'Recent medical reports (if pre-existing conditions exist)', 'Cancel Cheque for claim processing']),
      claimProcess: '1. For planned treatment, seek pre-authorization 48 hours prior. For emergencies, notify within 24 hours. 2. Present TPA card at network hospital. 3. The insurer validates and settles the bill directly with the hospital.',
      thingsToConsider: JSON.stringify(['Check for room rent capping and co-payment clauses.', 'Examine waiting periods for specific diseases and pre-existing conditions.']),
    },
    {
      slug: 'term-insurance',
      name: 'Term Insurance',
      overview: 'Term Insurance is the purest form of life insurance. It offers high life coverage at extremely affordable premiums for a specified tenure, without any savings or maturity components.',
      benefits: JSON.stringify(['Most affordable way to get large cover', 'Optional riders like critical illness or accidental death cover', 'Full financial cushion for outstanding home loans']),
      whoShouldBuy: JSON.stringify('Young professionals, parents, loan borrowers, and sole breadwinners.'),
      eligibility: JSON.stringify({ minAge: 18, maxAge: 65, tenure: '10 to 40 years' }),
      myths: JSON.stringify([
        { myth: 'I get no money back, so it is a waste.', reality: 'Term plan protects against absolute financial catastrophe for a minimal cost. Return-of-premium plans are available if maturity payout is desired.' }
      ]),
      faqs: JSON.stringify([
        { question: 'What is human life value?', answer: 'It is the financial worth of a person\'s future earnings, which determines the target amount of term cover required (typically 10-15x annual income).' }
      ]),
      documentsRequired: JSON.stringify(['Aadhaar Card', 'PAN Card', '6-month bank statements', 'Latest 3 years ITR or form 16']),
      claimProcess: '1. Nominee submits claim notification. 2. Send death certificate, medical attendant report, and identity proofs. 3. Payout is processed to the nominee\'s verified bank account.',
      thingsToConsider: JSON.stringify(['Choose a coverage duration that spans your active working years.', 'Keep your family fully informed of where the policy document is stored.']),
    },
    {
      slug: 'motor-insurance',
      name: 'Motor Insurance',
      overview: 'Motor Insurance covers loss or damage to vehicles (cars, two-wheelers) against accidents, natural disasters, theft, and third-party liabilities.',
      benefits: JSON.stringify(['Mandatory third-party coverage protection', 'Own-damage repair reimbursement', 'Zero-depreciation and roadside assistance add-ons']),
      whoShouldBuy: JSON.stringify('All vehicle owners (third-party liability cover is legally mandatory in India).'),
      eligibility: JSON.stringify({ minAge: 18, maxAge: 100, tenure: '1 to 5 years' }),
      myths: JSON.stringify([
        { myth: 'No Claim Bonus is tied to the vehicle.', reality: 'NCB belongs to the driver/owner and can be transferred to a new car you purchase.' }
      ]),
      faqs: JSON.stringify([
        { question: 'What is IDV?', answer: 'Insured Declared Value (IDV) is the maximum sum assured fixed by the insurer, representing the current market value of your vehicle.' }
      ]),
      documentsRequired: JSON.stringify(['Registration Certificate (RC) of vehicle', 'Previous year policy document', 'Driving License', 'Claim form if raising claim']),
      claimProcess: '1. In case of accident, take photos and file an FIR if theft or third-party injury is involved. 2. Move vehicle to network garage. 3. Surveyor inspects damages. 4. Cashless repair or reimbursement is settled.',
      thingsToConsider: JSON.stringify(['Evaluate deductibles (compulsory vs. voluntary) which influence premium costs.', 'Never let your policy expire; expired policies require physical inspection.'])
    },
    {
      slug: 'travel-insurance',
      name: 'Travel Insurance',
      overview: 'Travel Insurance provides financial cover for medical emergencies, trip cancellations, lost luggage, flight delays, and other losses incurred while traveling domestically or internationally.',
      benefits: JSON.stringify(['Emergency medical treatment and evacuation cover', 'Loss of passport and checked-in baggage assistance', 'Trip cancellation reimbursement']),
      whoShouldBuy: JSON.stringify('Students studying abroad, business travelers, tourists, and families going on vacation.'),
      eligibility: JSON.stringify({ minAge: 1, maxAge: 85, tenure: 'Duration of travel (up to 180 days extendable)' }),
      myths: JSON.stringify([
        { myth: 'My health card covers me abroad.', reality: 'Most domestic health policies do not cover medical expenses incurred outside national boundaries.' }
      ]),
      faqs: JSON.stringify([
        { question: 'Does travel insurance cover pre-existing diseases?', answer: 'Generally, standard travel insurance excludes pre-existing diseases unless bought under specialized plans for life-threatening emergencies.' }
      ]),
      documentsRequired: JSON.stringify(['Passport copy', 'Flight tickets & travel itinerary', 'Visa details (where applicable)']),
      claimProcess: '1. Contact the international assistance helper number instantly. 2. Submit medical bills, boarding pass, or baggage loss report. 3. Reimbursement is cleared upon check-in validation.',
      thingsToConsider: JSON.stringify(['Check if your destination country has mandatory minimum travel insurance guidelines.', 'Examine cover caps on adventure sports or high-risk activities.'])
    },
    {
      slug: 'child-education-plans',
      name: 'Child Education Plans',
      overview: 'Child Education plans are investment-cum-insurance products that secure your child\'s future education milestones even in the parent\'s absence.',
      benefits: JSON.stringify(['Premium waiver benefit if parent passes away', 'Structured payouts matching university admission years', 'Tax benefit on investments and maturity payouts']),
      whoShouldBuy: JSON.stringify('Parents looking to build a dedicated education corpus for their minor children.'),
      eligibility: JSON.stringify({ minAge: 18, maxAge: 50, tenure: '10 to 25 years' }),
      myths: JSON.stringify([
        { myth: 'I have savings, so I do not need a specific child plan.', reality: 'Savings can be spent on other emergencies. Child plans guarantee the payout is locked specifically for the child\'s milestones.' }
      ]),
      faqs: JSON.stringify([
        { question: 'What is a Premium Waiver Rider?', answer: 'If the policyholder (parent) dies, the insurer waives all future premiums, pays them on the parent\'s behalf, and pays out the maturity corpus as planned.' }
      ]),
      documentsRequired: JSON.stringify(['Parent\'s KYC documents', 'Child\'s Birth Certificate', 'Income proof of paying parent']),
      claimProcess: '1. Notify in case of policyholder\'s death or maturity date. 2. Provide documents. 3. Corpus is released to the guardian or child as specified in maturity timeline.',
      thingsToConsider: JSON.stringify(['Account for education inflation which is currently rising at 8-10% annually.', 'Start early to leverage compounding growth.'])
    },
    {
      slug: 'retirement-planning',
      name: 'Retirement Planning',
      overview: 'Retirement planning products help you build a financial cushion to generate regular monthly pension and income streams when you stop working.',
      benefits: JSON.stringify(['Guaranteed lifetime pension source', 'Inflation-adjusted annuity selections', 'Tax saving during investment phase']),
      whoShouldBuy: JSON.stringify('Working individuals in their 20s to 50s aiming for financial independence post-retirement.'),
      eligibility: JSON.stringify({ minAge: 18, maxAge: 60, tenure: '10 to 40 years' }),
      myths: JSON.stringify([
        { myth: 'EPF/PPF is enough for retirement.', reality: 'With rising healthcare costs and life expectancy, EPF alone rarely covers 15-20 years of post-retirement living.' }
      ]),
      faqs: JSON.stringify([
        { question: 'What is deferred annuity?', answer: 'It is a scheme where you invest for a set period, and pension payouts begin at a future deferred date selected by you.' }
      ]),
      documentsRequired: JSON.stringify(['KYC documentation', 'Age proof (Birth cert / Matriculation sheet)', 'Bank accounts for annuity transfers']),
      claimProcess: '1. At vesting age, submit the retirement selection form. 2. Choose annuity option. 3. Monthly/yearly pension starts automatically.',
      thingsToConsider: JSON.stringify(['Evaluate tax liability of the annuity payout as it is considered taxable income.', 'Diversify across equity-linked annuities and guaranteed returns.'])
    },
    {
      slug: 'investment-linked-plans',
      name: 'Investment Linked Plans',
      overview: 'Unit Linked Insurance Plans (ULIPs) offer a combination of life cover and equity/debt market investment opportunities under a single policy.',
      benefits: JSON.stringify(['Freedom to switch funds based on market performance', 'Wealth accumulation combined with life protection', 'Tax-free maturity benefits (under Section 10(10D) limits)']),
      whoShouldBuy: JSON.stringify('Disciplined investors willing to take moderate to high risk for inflation-beating returns.'),
      eligibility: JSON.stringify({ minAge: 5, maxAge: 60, tenure: '5 to 25 years' }),
      myths: JSON.stringify([
        { myth: 'ULIPs are very expensive with hidden charges.', reality: 'IRDAI has capped ULIP charges, making them highly transparent and comparable to mutual funds.' }
      ]),
      faqs: JSON.stringify([
        { question: 'What is a fund switch?', answer: 'It is moving your existing investment from equity to debt or vice-versa, allowing you to secure returns during market highs.' }
      ]),
      documentsRequired: JSON.stringify(['Aadhaar', 'PAN', 'Income documentation', 'Risk questionnaire profile']),
      claimProcess: '1. On maturity, sign the payout discharge voucher. 2. On death, beneficiary receives higher of Sum Assured or Fund Value.',
      thingsToConsider: JSON.stringify(['ULIPs have a mandatory 5-year lock-in period before which withdrawals are not permitted.', 'Review fund performance metrics regularly against benchmarks.'])
    },
    {
      slug: 'business-insurance',
      name: 'Business Insurance',
      overview: 'Business Insurance protects organizations from financial losses arising from property damage, liabilities, employee hazards, and key employee loss.',
      benefits: JSON.stringify(['Covers employee hospitalization (group schemes)', 'Protects against liability lawsuits and property fires', 'Secures business continuity during major interruptions']),
      whoShouldBuy: JSON.stringify('SMEs, startup founders, retail shop owners, and corporate businesses.'),
      eligibility: JSON.stringify({ minAge: 18, maxAge: 100, tenure: '1 year renewable' }),
      myths: JSON.stringify([
        { myth: 'Small businesses do not need liability protection.', reality: 'Even small product defects or slip-and-fall cases can trigger massive liability lawsuits.' }
      ]),
      faqs: JSON.stringify([
        { question: 'What is Keyman Insurance?', answer: 'It is a policy taken by a business on the life of an essential employee whose death would cause significant financial strain.' }
      ]),
      documentsRequired: JSON.stringify(['Business registration proof / GST Certificate', 'Partnership deed / Articles of Association', 'Financial balance sheets (previous 2-3 years)']),
      claimProcess: '1. Report property damage or liability claim instantly. 2. Internal/external surveyors assess damages. 3. Loss report submitted and commercial settlement released.',
      thingsToConsider: JSON.stringify(['Evaluate the specific risks related to your industry (e.g. cyber hazards, cargo transit risks).', 'Ensure correct property valuation to prevent under-insurance penalties.'])
    },
    {
      slug: 'tax-saving',
      name: 'Tax Saving',
      overview: 'Tax Saving planning maps out insurance choices that help you optimize your annual income tax liability under applicable provisions like Section 80C and 80D.',
      benefits: JSON.stringify(['Reduce taxable income up to INR 1.5 Lakhs under 80C', 'Reduce additional income up to INR 75,000 under 80D', 'Tax-free payouts upon claim settlement or maturity']),
      whoShouldBuy: JSON.stringify('All salaried and self-employed taxpayers looking to reduce their annual tax bills.'),
      eligibility: JSON.stringify({ minAge: 18, maxAge: 65, tenure: '5 to 40 years' }),
      myths: JSON.stringify([
        { myth: 'Tax saving is the only reason to buy insurance.', reality: 'Tax benefits are a secondary perk. The primary goal should always be securing protection and goals.' }
      ]),
      faqs: JSON.stringify([
        { question: 'Does New Tax Regime support Section 80C deductions?', answer: 'No, the new tax regime does not support deductions under Section 80C or 80D. It is available under the Old Tax Regime.' }
      ]),
      documentsRequired: JSON.stringify(['KYC verification', 'PAN card mandatory', 'Bank account details']),
      claimProcess: 'Standard claim process applies based on the underlying category (Life, Health, Term).',
      thingsToConsider: JSON.stringify(['Do not compromise on coverage amount just to meet the exact tax-saving bracket limit.', 'Be mindful of the locking periods which vary by product.'])
    }
  ];

  for (const c of categories) {
    await prisma.insuranceCategory.upsert({
      where: { slug: c.slug },
      update: c,
      create: c,
    });
  }
  console.log('Seeded Insurance Categories.');

  // 4. Seed FAQs
  await prisma.fAQ.deleteMany({});
  const faqs = [
    { category: 'General', question: 'What is the role of Policy Advisor?', answer: 'We are independent insurance advisors. We assist clients in understanding their insurance requirements, assessing risks, and selecting suitable solutions from leading providers like LIC, TATA AIA/AIG, and other insurers. Policy purchases are completed directly through official channels.', order: 1 },
    { category: 'General', question: 'Are there any extra fees for booking consultations?', answer: 'No, booking phone, video, office, or home consultations through Policy Advisor is free of cost. Our goal is to provide accessible educational advice and support.', order: 2 },
    { category: 'AI Tools', question: 'How accurate is the AI Needs Analysis Report?', answer: 'The AI Report uses advanced models (Gemini) to evaluate factors like age, dependents, income, and goals. It generates educational benchmarks and recommended ranges. It should be used as a guideline alongside expert consultation.', order: 3 },
    { category: 'Claims', question: 'Will you help me during the claim settlement process?', answer: 'Yes! While the claim is settled by the respective insurance company, we provide full support in reviewing required documents, filling out claim forms, and explaining procedures to ensure a hassle-free process.', order: 4 },
  ];

  for (const f of faqs) {
    await prisma.fAQ.create({
      data: f,
    });
  }
  console.log('Seeded FAQs.');

  // 5. Seed Knowledge Articles
  const articles = [
    {
      slug: 'insurance-basics-for-beginners',
      category: 'Insurance Basics',
      title: 'Insurance Basics: A Beginner\'s Guide',
      summary: 'Learn the primary principles of insurance, including sum assured, deductibles, premiums, and policies.',
      content: 'Insurance is a risk management tool where you transfer the risk of financial loss to an insurer in exchange for a premium. Key concepts include: \n1. **Sum Assured**: The maximum payout in case of a claim.\n2. **Premium**: The periodic payment to keep the policy active.\n3. **Deductible**: The amount you pay before the insurer covers costs.\nAlways choose coverage based on your dependencies and goals rather than premium alone.',
      keywords: JSON.stringify(['basics', 'premiums', 'beginner', 'guide']),
    },
    {
      slug: 'how-tax-saving-insurance-works',
      category: 'Tax Benefits',
      title: 'How Tax Saving Insurance Works in India',
      summary: 'Understand the deductions available under Section 80C and 80D for insurance premium payments.',
      content: 'Insurance policies offer valuable tax deductions under the Old Income Tax Regime. Section 80C allows deductions up to ₹1.5 Lakhs for Life and Term Insurance premium payments. Section 80D offers deductions up to ₹25,000 for self/family health premiums, and an additional ₹50,000 for senior citizen parents. Make sure to invest before March 31st to claim benefits in the current financial year.',
      keywords: JSON.stringify(['tax', '80C', '80D', 'saving']),
    }
  ];

  for (const a of articles) {
    await prisma.knowledgeArticle.upsert({
      where: { slug: a.slug },
      update: a,
      create: a,
    });
  }

  // 6. Seed a sample blog
  await prisma.blog.upsert({
    where: { slug: 'securing-family-future-term-insurance' },
    update: {},
    create: {
      slug: 'securing-family-future-term-insurance',
      title: 'Why Term Insurance is the Foundation of Financial Planning',
      summary: 'Discover why buying a pure term plan early is the single most critical decision for your family\'s protection.',
      content: 'Term insurance is often overlooked because it does not offer any survival benefits on maturity. However, it is the most crucial financial product. It offers a massive cover for a tiny premium, securing outstanding loans and children\'s education. For instance, a 25-year-old can secure a ₹1 Crore cover for less than ₹1,000 per month. Buy term plans early to lock in low rates.',
      category: 'INSURANCE',
      status: 'PUBLISHED',
      authorId: dimple.id,
      seoTitle: 'Why Term Insurance is Vital',
      seoDescription: 'Learn why buying a pure term plan early is essential for financial planning and securing your family\'s future.',
      seoKeywords: 'term insurance, finance planning, protection',
      publishedAt: new Date(),
    }
  });

  console.log('Seeded Blog.');
  console.log('Database Seeding Completed Successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
