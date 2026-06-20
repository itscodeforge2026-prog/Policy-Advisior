import db from './db';

// System instructions aligning the AI as Policy Advisor' virtual assistant
const SYSTEM_INSTRUCTION = `
You are the AI assistant for Policy Advisor, a premium independent insurance advisory platform.
Your advisors are Dimple Shah (Life & General advisor working with TATA AIA Life, TATA AIG General) and Bharat Shah (Life & General advisor working with LIC, New India Assurance).

YOUR CORE DIRECTIVES:
1. You represent an INDEPENDENT ADVISOR, NOT an insurance company.
2. DO NOT sell policies yourself. You guide, educate, and help users compare.
3. Always encourage users to "Book a Consultation" or "Schedule a Meeting" with Dimple or Bharat Shah for official applications.
4. Answer insurance terminology queries, tax deductions (80C, 80D limits), and claims guidance accurately.
5. Keep your tone highly professional, empathetic, clear, and reassuring.
6. Real contact details: Mobile: 9825429228, Email: bharatshah_1969@yahoo.in, Address: B-301, Pinkal Appartment, Near Deep chambers, Manjalpur, Vadodara.
`;

const getApiKey = () => process.env.GEMINI_API_KEY || '';

// HTTP call helper to execute Gemini generation without native SDK compile issues
async function generateWithGemini(prompt: string, systemInstruction?: string): Promise<string> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const body = {
    contents: [
      {
        parts: [{ text: prompt }]
      }
    ],
    systemInstruction: systemInstruction ? {
      parts: [{ text: systemInstruction }]
    } : undefined
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Gemini API Error: ${response.statusText} - ${JSON.stringify(errorData)}`);
  }

  const result = (await response.json()) as any;
  const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('Invalid response structure from Gemini API');
  }

  return text;
}

export const chatWithGemini = async (conversationId: string, userId: string | null, userMessage: string): Promise<string> => {
  // 1. Fetch chat history from DB
  const history = await db.aIChatHistory.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'asc' },
    take: 15
  });

  // 2. Format history into single prompt
  let context = '';
  for (const h of history) {
    context += `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.message}\n`;
  }
  context += `User: ${userMessage}\nAssistant:`;

  // Save user message to DB
  await db.aIChatHistory.create({
    data: {
      userId,
      conversationId,
      role: 'user',
      message: userMessage
    }
  });

  let responseText = '';
  if (!getApiKey()) {
    // High-quality mock responses if API key is missing
    responseText = getMockChatResponse(userMessage);
  } else {
    try {
      responseText = await generateWithGemini(context, SYSTEM_INSTRUCTION);
    } catch (err) {
      console.error('Gemini error, using mock:', err);
      responseText = getMockChatResponse(userMessage) + '\n\n*(Note: This is a backup response due to an AI service error)*';
    }
  }

  // Save assistant message to DB
  await db.aIChatHistory.create({
    data: {
      userId,
      conversationId,
      role: 'model',
      message: responseText
    }
  });

  return responseText;
};

export const generateNeedsAnalysisReport = async (answers: any): Promise<any> => {
  const prompt = `
  Generate a professional personal Needs Analysis Report based on the following client response data:
  Age: ${answers.age}
  Marital Status: ${answers.maritalStatus}
  Children count: ${answers.children}
  Occupation: ${answers.occupation}
  Annual Income: INR ${answers.income}
  Existing Insurance: ${answers.existingInsurance || 'None'}
  Outstanding Loans: INR ${answers.loans}
  Financial Goals: ${answers.financialGoals?.join(', ')}
  Risk Appetite: ${answers.riskAppetite}
  Emergency Savings: INR ${answers.emergencySavings}
  Future Plans: ${answers.futurePlans || 'Not specified'}

  Generate a JSON report with exactly these properties:
  {
    "summary": "Short paragraph summarizing their current financial security status.",
    "riskScore": "low | medium | high",
    "requiredLifeCover": 10000000, // Calculated recommended life insurance cover in INR
    "requiredHealthCover": 500000, // Recommended health insurance cover in INR
    "recommendations": [
       "Bullet point recommendations specific to their life stages and goals"
    ],
    "retirementPlanningTips": [
       "Annuity or retirement planning suggestions based on income/age"
    ],
    "savingsStrategies": [
       "Strategies to improve emergency savings and tax exemptions"
    ]
  }
  Provide ONLY valid JSON as output, no markdown tags.
  `;

  if (!getApiKey()) {
    return generateMockReport(answers);
  }

  try {
    const rawResult = await generateWithGemini(prompt, "You are a financial planning engine. Output valid JSON only.");
    // Strip code block formatting if returned
    const cleanJson = rawResult.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error('Error generating needs analysis, using mock:', error);
    return generateMockReport(answers);
  }
};

export const generateAdvisorTools = async (action: 'meeting_notes' | 'whatsapp_followup' | 'email_followup', data: any): Promise<string> => {
  const prompt = `
  Action requested: Generate a ${action.replace('_', ' ')} based on the following details:
  Client Name: ${data.name}
  Meeting Purpose: ${data.purpose || 'General Consultation'}
  Date/Time: ${data.date || 'Today'}
  Notes/Interactions: ${data.notes || 'Discussed term and health cover requirements'}

  Provide the exact drafted text. Be professional, welcoming, and highlight booking schedules.
  `;

  if (!getApiKey()) {
    return getMockAdvisorDraft(action, data);
  }

  try {
    return await generateWithGemini(prompt, "You are a helpful office assistant for Dimple Shah and Bharat Shah.");
  } catch (error) {
    return getMockAdvisorDraft(action, data);
  }
};

// ================= MOCK HELPERS =================

function getMockChatResponse(message: string): string {
  const msg = message.toLowerCase();
  if (msg.includes('tax') || msg.includes('80c') || msg.includes('80d')) {
    return `Under current tax rules in India (Old Regime), premiums paid for Life/Term insurance are deductible under Section 80C up to ₹1.5 Lakhs. Health insurance premiums for yourself, spouse, and children are deductible under Section 80D up to ₹25,000 (increases to ₹50,000 if you buy for senior citizen parents). I recommend booking a consultation with Bharat Shah to review these parameters in detail!`;
  }
  if (msg.includes('claim') || msg.includes('settle')) {
    return `Claim settlement procedures depend on the category. For health insurance, network hospitals support cashless treatments. For term insurance, nominees must file a death claim with the death certificate, KYC documents, and policy documents. We offer complete paperwork guidance. Please let us know if you'd like to book a quick phone consultation.`;
  }
  if (msg.includes('term') || msg.includes('life')) {
    return `Term insurance is the purest cover which replaces your income for dependents, while life insurance includes child plans and investment options. For LIC options (Whole Life, Child Education), Bharat Shah specializes in these. For TATA AIA Protection solutions, Dimple Shah is available. Would you like to schedule a quick call?`;
  }
  return `Thank you for reaching out to Policy Advisor! I can explain different insurance categories (Life, Health, Term, Child Education, Retirement, Motor, and Travel plans), calculate basic coverage estimations, or help you outline claims processes. Would you like me to connect you with Dimple Shah or Bharat Shah for a professional consultation?`;
}

function generateMockReport(answers: any): any {
  const recommendedLifeCover = Math.max(answers.income * 12, 5000000);
  const recommendedHealthCover = answers.children > 0 ? 1000000 : 500000;
  return {
    summary: `Client is a ${answers.age}-year-old ${answers.occupation} who is ${answers.maritalStatus} with ${answers.children} children. Annual income is INR ${answers.income} with outstanding liabilities of INR ${answers.loans}. The client displays a ${answers.riskAppetite} risk appetite.`,
    riskScore: answers.loans > answers.income ? 'high' : answers.loans > 0 ? 'medium' : 'low',
    requiredLifeCover: recommendedLifeCover,
    requiredHealthCover: recommendedHealthCover,
    recommendations: [
      `Secure a Term Life Insurance of at least INR ${recommendedLifeCover.toLocaleString('en-IN')} to cover income replacement and outstanding liabilities.`,
      `Obtain a Family Floater Health policy of INR ${recommendedHealthCover.toLocaleString('en-IN')} to protect family against hospitalization risks.`
    ],
    retirementPlanningTips: [
      answers.age > 40
        ? "With age above 40, prioritize immediate annuity programs or guaranteed pension schemes to build a secondary income stream."
        : "You have a long runway ahead. Start a deferred annuity plan to build wealth and benefit from compounding interest."
    ],
    savingsStrategies: [
      `Utilize Section 80C to claim deductions on term insurance premiums up to ₹1.5 Lakhs.`,
      `Build emergency cash equivalent to 6 months of living expenses (₹${(answers.income / 12 * 6).toLocaleString('en-IN')}) in highly liquid accounts.`
    ]
  };
}

function getMockAdvisorDraft(action: string, data: any): string {
  if (action === 'email_followup') {
    return `Subject: Follow-up on our consultation - Policy Advisor\n\nDear ${data.name},\n\nThank you for taking the time to consult with us. We discussed your insurance goals, specifically focusing on ${data.purpose || 'securing your financial protection'}.\n\nAs agreed, we are preparing custom benefit illustrations from TATA AIA/LIC. If you have any additional questions, please schedule a follow-up or contact us directly at 9825429228.\n\nWarm regards,\nDimple Shah & Bharat Shah\nPolicy Advisor`;
  }
  if (action === 'whatsapp_followup') {
    return `Hi ${data.name}, thank you for discussing your insurance protection needs today. We are designing a tailored plan illustration based on our meeting. You can review advisor notes on your dashboard or book our next slot at: PolicyAdvisor.com/dashboard. - Policy Advisor`;
  }
  return `Meeting Notes - Client: ${data.name}\nDate: ${data.date}\nPurpose: ${data.purpose}\n\nSummary:\n- Client is exploring suitable insurance options.\n- Follow up scheduled. Custom brochures and premium comparisons to be shared.`;
}
