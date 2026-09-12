import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini AI client
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

// 1. Health check
app.get("/api/health", (_req, res) => {
  const hasGemini = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY");
  res.json({
    status: "ok",
    app: "SchemeSetu",
    geminiConfigured: hasGemini,
    timestamp: new Date().toISOString()
  });
});

// 2. Scheme Mitra Bilingual Conversational Assistant
app.post(["/api/chat", "/api/gemini/advisor"], async (req, res) => {
  try {
    const { messages, userProfile, currentSchemeId, language = "en", prompt, context } = req.body;
    const ai = getGenAI();

    const queryText = prompt || messages?.[messages.length - 1]?.content || "";
    const effectiveProfile = userProfile || (context ? {
      category: context.applicantCategory,
      projectCost: context.projectCost,
      requestedLoanAmount: context.requestedLoanAmount,
      state: context.state
    } : null);

    if (!ai) {
      // High quality rule-based fallback response if API key is not configured in preview
      const lastMessage = queryText.toLowerCase();
      let fallbackReply = "";

      if (lastMessage.includes("hindi") || lastMessage.includes("नमस्ते") || lastMessage.includes("योजना") || language === "hi") {
        fallbackReply = `नमस्ते! मैं सामाजिक न्याय और अधिकारिता मंत्रालय (MoSJE) का AI सलाहकार 'स्कीम मित्र' हूँ। 

हमारे निगमों के तहत उपलब्ध मुख्य रियायती योजनाएँ:
• **NSFDC (अनुसूचित जाति)**: टर्म लोन (5 लाख तक 6% ब्याज, 5-10 लाख तक 7%), महिला समृद्धि योजना (4% ब्याज, 1.40 लाख तक)।
• **NBCFDC (अन्य पिछड़ा वर्ग)**: नई स्वर्णिमा योजना (महिला उद्यमियों हेतु 5% ब्याज दर), सामान्य ऋण योजना।
• **NSKFDC (सफाई कर्मचारी)**: सफाई कर्मचारियों व उनके आश्रितों हेतु रियायती ऋण (कोई पारिवारिक आय सीमा नहीं)।

💡 महिला उद्यमियों हेतु वार्षिक ब्याज दर में **1% की विशेष छूट** लागू होती है।`;
      } else {
        fallbackReply = `Hello! I am Scheme Mitra, your virtual guidance advisor from the Ministry of Social Justice and Empowerment (MoSJE).

Key concessional loan schemes available for affirmative action entrepreneurs:
• **NSFDC (Scheduled Castes)**: Term Loan (up to ₹50 Lakhs at 6%–8% p.a.), Mahila Samriddhi Yojana (up to ₹1.40 Lakh at 4% p.a.).
• **NBCFDC (OBCs)**: New Swarnima Scheme for Women (up to ₹2.00 Lakhs at 5% fixed interest), General Term Loan.
• **NSKFDC (Sanitation Workers)**: Credit up to ₹15 Lakhs at 4%–6% p.a. with NO family income ceiling.

💡 Women entrepreneurs receive an additional **1% interest rebate** on all standard terms.`;
      }

      return res.json({
        reply: fallbackReply,
        extractedFields: null
      });
    }

    const systemInstruction = `You are 'Scheme Mitra' (स्कीम मित्र), an empathetic, courteous, and highly knowledgeable bilingual advisor for SchemeSetu — the AI-driven scheme matching platform under the Ministry of Social Justice and Empowerment (MoSJE), Government of India (SIH26092).

Key Responsibilities:
1. Guide entrepreneurs about concessional credit schemes from NSFDC (Scheduled Castes), NBCFDC (Backward Classes), and NSKFDC (Safai Karamcharis/sanitation workers).
2. Maintain strict factual fidelity with official Government of India lending norms. Do NOT promise guaranteed sanctions; explain that schemes are routed through State Channelising Agencies (SCAs) and Public Sector Banks (PSBs).
3. If the user writes in Hindi or requests Hindi, reply in clear, respectful, easy-to-understand Hindi. If English, reply in English.
4. If the user mentions personal details in conversation (e.g. "I am a 28 year old SC woman with 2 lakh budget for a tailoring shop in Lucknow"), gently inform them that they can pre-fill the eligibility wizard with these attributes, and return structured extraction JSON at the very end of your response inside a <FORM_DATA>{"age": 28, "gender": "female", "category": "SC", "projectCost": 200000, "sector": "Tailoring"}</FORM_DATA> tag if applicable.
Keep answers concise, direct, helpful, and scannable with bullet points.`;

    let formattedContents: any[] = [];
    if (messages && Array.isArray(messages)) {
      formattedContents = messages.map((m: any) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      }));
    } else if (queryText) {
      formattedContents = [{
        role: 'user',
        parts: [{ text: queryText }]
      }];
    }

    // If context profile exists, prepend user context
    if (effectiveProfile && formattedContents.length > 0) {
      formattedContents[0].parts[0].text = `[Applicant Profile Context: Category=${effectiveProfile.category || 'Not specified'}, Age=${effectiveProfile.age || 'Not specified'}, Gender=${effectiveProfile.gender || 'Not specified'}, Income=₹${effectiveProfile.annualFamilyIncome || 0}, ProjectCost=₹${effectiveProfile.projectCost || 0}]\n\n` + formattedContents[0].parts[0].text;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: formattedContents,
      config: {
        systemInstruction,
        temperature: 0.3,
      }
    });

    const fullText = response.text || "";
    let reply = fullText;
    let extractedFields = null;

    // Check for structured form data tag
    const formMatch = fullText.match(/<FORM_DATA>([\s\S]*?)<\/FORM_DATA>/);
    if (formMatch) {
      try {
        extractedFields = JSON.parse(formMatch[1]);
        reply = fullText.replace(/<FORM_DATA>[\s\S]*?<\/FORM_DATA>/, '').trim();
      } catch (e) {
        console.warn("Could not parse extracted form data:", e);
      }
    }

    res.json({ reply, extractedFields });
  } catch (error: any) {
    console.error("Gemini API error:", error);
    res.status(500).json({
      reply: "I am temporarily having trouble reaching the advisory network. Please check your internet connection or use our deterministic Smart Eligibility Form directly.",
      error: error.message
    });
  }
});

// 3. Explainability Simplifier API (Rewrites deterministic rules into colloquial guidance)
app.post("/api/explain-scheme", async (req, res) => {
  try {
    const { schemeName, reasonsEligible, reasonsNotEligible, language = "en" } = req.body;
    const ai = getGenAI();

    if (!ai) {
      return res.json({
        simplifiedExplanation: language === "hi"
          ? `यह योजना आपके द्वारा प्रदान किए गए विवरणों (जाति, आयु, और आय सीमा) के अनुकूल है। आधिकारिक विवरण नीचे देखें।`
          : `This scheme is recommended based on strict deterministic compliance with your category, income ceiling, and requested loan amount.`
      });
    }

    const prompt = `Rewrite the following deterministic rule engine output into 2-3 friendly, encouraging sentences for an Indian grassroots entrepreneur:
Scheme: ${schemeName}
Eligible Points: ${JSON.stringify(reasonsEligible)}
Non-Eligible Points: ${JSON.stringify(reasonsNotEligible)}
Language: ${language === 'hi' ? 'Hindi (देवनागरी)' : 'English'}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        temperature: 0.2
      }
    });

    res.json({
      simplifiedExplanation: response.text?.trim()
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`SchemeSetu server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
