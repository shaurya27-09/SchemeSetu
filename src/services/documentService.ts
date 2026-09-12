import { ApplicantProfile, Scheme, SchemeDocument } from '../types';

export interface GeneratedChecklistItem {
  code: string;
  title: string;
  titleHi: string;
  description: string;
  descriptionHi: string;
  category: 'identity' | 'eligibility' | 'business' | 'financial' | 'skills';
  requirementType: 'required' | 'conditional' | 'optional';
  conditionNote?: string;
  issuingAuthority: string;
  sampleTip: string;
  isCompleted: boolean;
}

export function generatePersonalizedChecklist(
  scheme: Scheme,
  profile?: ApplicantProfile | null,
  completedCodes: string[] = []
): GeneratedChecklistItem[] {
  const items: GeneratedChecklistItem[] = [];

  // 1. Core Identity & Address (Universal for all Indian lending schemes)
  items.push({
    code: "DOC_AADHAAR",
    title: "Aadhaar Card (Linked with Mobile & Bank)",
    titleHi: "आधार कार्ड (मोबाइल और बैंक से लिंक)",
    description: "Primary proof of identity and citizenship. UIDAI number must be linked with active bank account.",
    descriptionHi: "पहचान और नागरिकता का प्राथमिक प्रमाण। सक्रिय बैंक खाते से लिंक होना आवश्यक।",
    category: "identity",
    requirementType: "required",
    issuingAuthority: "UIDAI, Government of India",
    sampleTip: "Keep both original card and self-attested photocopy ready.",
    isCompleted: completedCodes.includes("DOC_AADHAAR")
  });

  items.push({
    code: "DOC_PAN",
    title: "PAN Card / Form 60",
    titleHi: "पैन कार्ड / फॉर्म 60",
    description: "Permanent Account Number required by financial institutions for credit appraisal.",
    descriptionHi: "ऋण मूल्यांकन हेतु आयकर विभाग द्वारा जारी पैन कार्ड।",
    category: "identity",
    requirementType: "required",
    issuingAuthority: "Income Tax Department, Government of India",
    sampleTip: "Ensure the name matches Aadhaar exactly.",
    isCompleted: completedCodes.includes("DOC_PAN")
  });

  // 2. Affirmative Caste / Community / Occupation Proof
  if (scheme.rules.eligibleCategories.includes('SC')) {
    items.push({
      code: "DOC_SC_CASTE",
      title: "Scheduled Caste (SC) Community Certificate",
      titleHi: "अनुसूचित जाति (SC) प्रमाण पत्र",
      description: "Mandatory official certificate proving Scheduled Caste status under MoSJE guidelines.",
      descriptionHi: "सक्षम राजस्व प्राधिकारी (तहसीलदार/एसडीएम) द्वारा जारी जाति प्रमाण पत्र।",
      category: "eligibility",
      requirementType: "required",
      issuingAuthority: "Tehsildar / Sub-Divisional Magistrate (Revenue Dept)",
      sampleTip: "Digital e-District certificate with Barcode/QR code is highly preferred.",
      isCompleted: completedCodes.includes("DOC_SC_CASTE")
    });
  }

  if (scheme.rules.eligibleCategories.includes('OBC') || scheme.rules.eligibleCategories.includes('EBC')) {
    items.push({
      code: "DOC_OBC_NCL",
      title: "OBC Non-Creamy Layer (NCL) Certificate",
      titleHi: "ओबीसी गैर-क्रीमी लेयर प्रमाण पत्र",
      description: "Valid certificate issued within the current or preceding financial year.",
      descriptionHi: "चालू अथवा पूर्व वित्तीय वर्ष का गैर-क्रीमी लेयर प्रमाण पत्र।",
      category: "eligibility",
      requirementType: "required",
      issuingAuthority: "Revenue Authority / Tehsildar / District Magistrate",
      sampleTip: "Must specify that the applicant does not belong to the Creamy Layer.",
      isCompleted: completedCodes.includes("DOC_OBC_NCL")
    });
  }

  if (scheme.rules.eligibleCategories.includes('SafaiKaramchari')) {
    items.push({
      code: "DOC_SAN_WORKER",
      title: "Safai Karamchari / Sanitation Worker Proof",
      titleHi: "सफाई कर्मचारी / स्वच्छता कार्यकर्ता पहचान पत्र या प्रमाण पत्र",
      description: "Certificate or dependent endorsement certifying employment or engagement in sanitation / waste management.",
      descriptionHi: "नगर निगम, नगर पालिका या अधिकृत स्वच्छता ठेकेदार द्वारा जारी पहचान अथवा प्रमाण पत्र।",
      category: "eligibility",
      requirementType: "required",
      issuingAuthority: "Municipal Corporation / Nagar Palika / Cantonment Board",
      sampleTip: "Can be an employee identity card or certificate from Sanitary Inspector.",
      isCompleted: completedCodes.includes("DOC_SAN_WORKER")
    });
  }

  // 3. Income Certificate
  if (scheme.rules.maxAnnualIncome > 0) {
    items.push({
      code: "DOC_INCOME",
      title: `Family Income Certificate (Ceiling: ₹${(scheme.rules.maxAnnualIncome / 100000).toFixed(1)} Lakh)`,
      titleHi: `पारिवारिक आय प्रमाण पत्र (अधिकतम सीमा: ₹${(scheme.rules.maxAnnualIncome / 100000).toFixed(1)} लाख)`,
      description: "Valid income certificate proving annual household earnings are below the scheme cap.",
      descriptionHi: "परिवार की कुल वार्षिक आय योजना सीमा के भीतर होने का प्रमाण।",
      category: "eligibility",
      requirementType: "required",
      issuingAuthority: "Tehsildar / Revenue Officer / District Collectorate",
      sampleTip: "Should not be older than 12 months from application date.",
      isCompleted: completedCodes.includes("DOC_INCOME")
    });
  }

  // 4. Business & Project Quotation
  const effectiveCost = profile ? profile.projectCost : scheme.rules.minProjectCost;
  const isLargeProject = effectiveCost > 200000;

  items.push({
    code: "DOC_PROJECT_REPORT",
    title: isLargeProject ? "Detailed Project Report (DPR)" : "Basic Project Proposal & Cost Estimation",
    titleHi: isLargeProject ? "विस्तृत परियोजना रिपोर्ट (DPR)" : "परियोजना प्रस्ताव व लागत प्राक्कलन",
    description: isLargeProject
      ? "Comprehensive dossier containing machinery requirements, raw material cost, working capital, cash flow forecast, and break-even analysis."
      : "Simple itemized list of items to be purchased with total expected cost and expected monthly earnings.",
    descriptionHi: isLargeProject
      ? "मशीनरी, कच्चा माल, कार्यशील पूंजी और नकद प्रवाह अनुमान सहित विस्तृत व्यापार योजना।"
      : "खरीदी जाने वाली सामग्री की सूची और अनुमानित मासिक आय का विवरण।",
    category: "business",
    requirementType: "required",
    issuingAuthority: "Prepared by Applicant / Chartered Accountant / DIC Consultant",
    sampleTip: "District Industries Centre (DIC) or local SCA can help formulate simple templates.",
    isCompleted: completedCodes.includes("DOC_PROJECT_REPORT")
  });

  items.push({
    code: "DOC_QUOTATION",
    title: "Supplier Machinery / Equipment Quotation",
    titleHi: "मशीनरी अथवा उपकरण का अधिकृत कोटेशन",
    description: "Original proforma invoice or quotation from registered GST dealers for plant, equipment or vehicles.",
    descriptionHi: "मशीनरी, उपकरण अथवा वाहन हेतु अधिकृत जीएसटी डीलर से प्रोफार्मा इनवॉयस।",
    category: "business",
    requirementType: "required",
    issuingAuthority: "Authorized Dealer / Manufacturer with valid GSTIN",
    sampleTip: "Quote must explicitly state machine model, price, tax breakup, and warranty.",
    isCompleted: completedCodes.includes("DOC_QUOTATION")
  });

  // 5. Financial & Banking Documents
  items.push({
    code: "DOC_BANK_STATEMENT",
    title: "Bank Passbook / 6-Month Bank Statement",
    titleHi: "बैंक पासबुक / 6 माह का खाता विवरण",
    description: "Updated passbook photocopy or bank statement demonstrating financial discipline.",
    descriptionHi: "सक्रिय बैंक खाते की पासबुक या पिछले 6 महीनों का बैंक स्टेटमेंट।",
    category: "financial",
    requirementType: "required",
    issuingAuthority: "Public Sector Bank / Regional Rural Bank / Scheduled Bank",
    sampleTip: "Ensure IFSC code and account number are clearly legible.",
    isCompleted: completedCodes.includes("DOC_BANK_STATEMENT")
  });

  // 6. Skill & Training (Conditional)
  items.push({
    code: "DOC_SKILL_TRAINING",
    title: "Skill Certificate / EDP Training Certificate",
    titleHi: "कौशल प्रमाण पत्र / उद्यमिता विकास (EDP) प्रशिक्षण प्रमाण पत्र",
    description: "Certificate from PMKVY, ITI, RSETI, MSME-DI, or other government-recognized skill institute.",
    descriptionHi: "पीएमकेवीवाई, आईटीआई, आरसेटी अथवा सरकारी मान्यता प्राप्त संस्थान से कौशल प्रमाण पत्र।",
    category: "skills",
    requirementType: (profile?.technicalTraining || profile?.vocationalCertification) ? "optional" : "conditional",
    conditionNote: "Mandatory for high-value technical projects; highly advantageous for speedier loan sanction.",
    issuingAuthority: "NSDC / RSETI / MSME / State Skill Development Mission",
    sampleTip: "Candidates without prior certification can request free SCA-sponsored EDP training.",
    isCompleted: completedCodes.includes("DOC_SKILL_TRAINING")
  });

  return items;
}

export function generateDocumentChecklist(scheme: Scheme, profile?: ApplicantProfile | null) {
  const items = generatePersonalizedChecklist(scheme, profile);
  return {
    mandatory: items.filter(i => i.requirementType === 'required').map(i => ({
      id: i.code,
      title: i.title,
      description: i.description,
      issuingAuthority: i.issuingAuthority,
      formats: ['Original', 'Self-attested Copy'],
      validity: 'Current & Valid'
    })),
    conditional: items.filter(i => i.requirementType === 'conditional').map(i => ({
      id: i.code,
      title: i.title,
      description: i.description,
      issuingAuthority: i.issuingAuthority,
      condition: i.conditionNote || 'Applicable for specific project scopes',
      formats: ['Certified Copy'],
      validity: 'Valid'
    })),
    optional: items.filter(i => i.requirementType === 'optional').map(i => ({
      id: i.code,
      title: i.title,
      description: i.description,
      issuingAuthority: i.issuingAuthority,
      benefit: 'Helps expedite credit appraisal'
    }))
  };
}

