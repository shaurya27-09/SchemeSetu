import { Scheme, ChannelPartnerBranch } from '../types';

export const INITIAL_SCHEMES: Scheme[] = [
  // ==========================================
  // NSFDC (National Scheduled Castes Finance and Development Corporation)
  // ==========================================
  {
    id: "nsfdc-term-loan-01",
    code: "NSFDC-TL",
    name: "NSFDC Term Loan Scheme",
    nameHi: "एनएसएफडीसी मियादी ऋण योजना",
    corporation: "NSFDC",
    corporationFullName: "National Scheduled Castes Finance and Development Corporation",
    targetGroup: "Scheduled Caste Entrepreneurs & Beneficiaries",
    targetGroupHi: "अनुसूचित जाति उद्यमी और लाभार्थी",
    description: "Concessional credit assistance provided through State Channelising Agencies (SCAs) and banks for viable income-generating self-employment projects up to ₹50 Lakh.",
    descriptionHi: "व्यवहार्य आय-सृजन स्वरोजगार परियोजनाओं के लिए राज्य चैनलाइजिंग एजेंसियों (एससीए) और बैंकों के माध्यम से रियायती ऋण सहायता।",
    rules: {
      id: "rule-nsfdc-tl",
      schemeId: "nsfdc-term-loan-01",
      minAge: 18,
      maxAge: 55,
      maxAnnualIncome: 300000, // ₹3,00,000 p.a. family income ceiling
      minProjectCost: 50000,
      maxProjectCost: 5000000, // Up to ₹50.00 Lakh
      maxLoanAmount: 4500000, // NSFDC finances up to 90% of project cost
      personalContributionMinPercent: 5, // Minimum 5% to 10% promoter contribution
      eligibleCategories: ['SC'],
      eligibleGenders: ['male', 'female', 'other'],
      effectiveFrom: "2024-04-01",
      lastVerifiedAt: "2025-01-15",
      specialConditionsNotes: "Must be a member of the Scheduled Caste community with valid caste certificate issued by Competent Revenue Authority."
    },
    terms: {
      interestRateMin: 6.0,
      interestRateMax: 9.0,
      rebateForWomenPercent: 1.0,
      tenureYearsMax: 10,
      moratoriumMonths: 12,
      subsidyRatePercent: 0
    },
    documents: [
      {
        id: "doc-nsfdc-tl-1",
        schemeId: "nsfdc-term-loan-01",
        code: "CASTE_CERT",
        title: "SC Community Certificate",
        titleHi: "अनुसूचित जाति प्रमाण पत्र",
        description: "Permanent caste certificate issued by Tehsildar / Sub-Divisional Magistrate",
        descriptionHi: "तहसीलदार या एसडीएम द्वारा जारी जाति प्रमाण पत्र",
        requirementType: "required"
      },
      {
        id: "doc-nsfdc-tl-2",
        schemeId: "nsfdc-term-loan-01",
        code: "INCOME_CERT",
        title: "Family Income Certificate",
        titleHi: "पारिवारिक आय प्रमाण पत्र",
        description: "Official income certificate showing annual family income up to ₹3,00,000",
        descriptionHi: "₹3,00,000 तक पारिवारिक आय दर्शाने वाला आय प्रमाण पत्र",
        requirementType: "required"
      },
      {
        id: "doc-nsfdc-tl-3",
        schemeId: "nsfdc-term-loan-01",
        code: "AADHAAR_PAN",
        title: "Aadhaar Card & PAN Card",
        titleHi: "आधार कार्ड और पैन कार्ड",
        description: "Valid government photo identity and tax registration proof",
        descriptionHi: "वैध सरकारी पहचान और पैन प्रमाण",
        requirementType: "required"
      },
      {
        id: "doc-nsfdc-tl-4",
        schemeId: "nsfdc-term-loan-01",
        code: "PROJECT_REPORT",
        title: "Detailed Project Report (DPR)",
        titleHi: "विस्तृत परियोजना रिपोर्ट",
        description: "Business viability plan, expected cash flow, equipment quotations and market analysis",
        descriptionHi: "व्यवसाय व्यवहार्यता योजना, मशीनरी कोटेशन और नकद प्रवाह अनुमान",
        requirementType: "required"
      },
      {
        id: "doc-nsfdc-tl-5",
        schemeId: "nsfdc-term-loan-01",
        code: "SKILL_CERT",
        title: "Technical / EDP Training Certificate",
        titleHi: "कौशल / उद्यमिता प्रशिक्षण प्रमाण पत्र",
        description: "Prior EDP training or ITI/vocational certificate in the proposed field",
        descriptionHi: "प्रस्तावित क्षेत्र में कौशल प्रशिक्षण अथवा आईटीआई प्रमाण पत्र",
        requirementType: "conditional",
        conditionNote: "Mandatory for projects above ₹5 Lakh in technical or manufacturing trades"
      }
    ],
    specialBenefits: [
      "Low concessional interest rates between 6% to 9% p.a.",
      "1% special interest rebate for prompt repayment and women beneficiaries",
      "Coverage up to 90% of project cost without heavy collateral requirements",
      "Moratorium period of up to 12 months before principal repayment begins"
    ],
    specialBenefitsHi: [
      "6% से 9% प्रति वर्ष की बेहद रियायती ब्याज दरें",
      "महिला उद्यमियों व समय पर भुगतान पर 1% की अतिरिक्त छूट",
      "परियोजना लागत का 90% तक ऋण कवरेज",
      "मूलधन अदायगी शुरू होने से पहले 12 महीने तक की मोराटोरियम अवधि"
    ],
    applicationProcess: [
      "Step 1: Obtain scheme application form from State Scheduled Castes Development Corporation (SCA) or participating Public Sector Bank",
      "Step 2: Attach Caste Certificate, Income Certificate, and Detailed Project Report with machinery quotations",
      "Step 3: Screening by District Task Force Committee / SCA field officer",
      "Step 4: Sanction of concessional refinance by NSFDC and disbursement through lending bank"
    ],
    applicationProcessHi: [
      "चरण 1: राज्य अनुसूचित जाति विकास निगम (एससीए) या बैंक से आवेदन पत्र प्राप्त करें",
      "चरण 2: जाति, आय प्रमाण पत्र और विस्तृत परियोजना रिपोर्ट संलग्न करें",
      "चरण 3: जिला टास्क फोर्स समिति द्वारा आवेदन की संवीक्षा",
      "चरण 4: ऋण स्वीकृति व बैंक खाते में प्रत्यक्ष संवितरण"
    ],
    channelPartners: [
      "State Scheduled Castes Development Corporations (SCAs)",
      "Punjab National Bank",
      "Canara Bank",
      "Regional Rural Banks (RRBs)"
    ],
    sourceUrl: "https://nsfdc.nic.in/en/term-loan-scheme",
    sourceName: "Official NSFDC Portal (Ministry of Social Justice and Empowerment)",
    effectiveFrom: "2024-04-01",
    lastVerifiedAt: "2025-01-15",
    active: true,
    isDemoData: false
  },
  {
    id: "nsfdc-mahila-samriddhi-02",
    code: "NSFDC-MSY",
    name: "NSFDC Mahila Samriddhi Yojana (MSY)",
    nameHi: "एनएसएफडीसी महिला समृद्धि योजना",
    corporation: "NSFDC",
    corporationFullName: "National Scheduled Castes Finance and Development Corporation",
    targetGroup: "Scheduled Caste Women Entrepreneurs",
    targetGroupHi: "अनुसूचित जाति की महिला उद्यमी",
    description: "Exclusive micro-credit scheme for Scheduled Caste women to start tiny self-employment ventures, tailoring, artisan shops, animal husbandry, and petty trade with quick turnaround.",
    descriptionHi: "अनुसूचित जाति की महिला उद्यमियों के लिए सिलाई, हस्तशिल्प, डेयरी, और छोटे व्यापार शुरू करने हेतु विशेष माइक्रो-क्रेडिट योजना।",
    rules: {
      id: "rule-nsfdc-msy",
      schemeId: "nsfdc-mahila-samriddhi-02",
      minAge: 18,
      maxAge: 55,
      maxAnnualIncome: 300000,
      minProjectCost: 20000,
      maxProjectCost: 140000, // Up to ₹1.40 Lakh unit cost
      maxLoanAmount: 125000,
      personalContributionMinPercent: 0, // No promoter contribution required for tiny units
      eligibleCategories: ['SC'],
      eligibleGenders: ['female'], // Exclusively for women
      effectiveFrom: "2024-04-01",
      lastVerifiedAt: "2025-01-15",
      specialConditionsNotes: "Applicant must be a female belonging to the Scheduled Caste community."
    },
    terms: {
      interestRateMin: 4.0,
      interestRateMax: 4.0, // Fixed 4% p.a. to the ultimate beneficiary
      rebateForWomenPercent: 0,
      tenureYearsMax: 4,
      moratoriumMonths: 3,
      subsidyRatePercent: 0
    },
    documents: [
      {
        id: "doc-nsfdc-msy-1",
        schemeId: "nsfdc-mahila-samriddhi-02",
        code: "CASTE_CERT",
        title: "SC Caste Certificate of Applicant",
        titleHi: "आवेदिका का अनुसूचित जाति प्रमाण पत्र",
        description: "Valid certificate in the name of the female applicant",
        descriptionHi: "आवेदिका के नाम से जारी जाति प्रमाण पत्र",
        requirementType: "required"
      },
      {
        id: "doc-nsfdc-msy-2",
        schemeId: "nsfdc-mahila-samriddhi-02",
        code: "INCOME_AFFIDAVIT",
        title: "Income Certificate / Self Declaration",
        titleHi: "पारिवारिक आय प्रमाण पत्र / स्व-घोषणा",
        description: "Income certificate showing family income under ₹3,00,000",
        descriptionHi: "₹3 लाख से कम पारिवारिक आय का प्रमाण",
        requirementType: "required"
      },
      {
        id: "doc-nsfdc-msy-3",
        schemeId: "nsfdc-mahila-samriddhi-02",
        code: "BANK_PASSBOOK",
        title: "Bank Passbook / Aadhaar Linked Account",
        titleHi: "आधार लिंक बैंक खाता पासबुक",
        description: "Single or Joint bank account details with IFSC code",
        descriptionHi: "आईएफएससी कोड सहित बैंक खाता विवरण",
        requirementType: "required"
      }
    ],
    specialBenefits: [
      "Ultra-low interest rate of only 4% per annum",
      "Zero personal promoter contribution required",
      "Ideal for self-help groups (SHGs) and individual women micro-entrepreneurs",
      "Simple one-page document verification process through local SCAs"
    ],
    specialBenefitsHi: [
      "मात्र 4% प्रति वर्ष की बेहद सस्ती ब्याज दर",
      "शून्य व्यक्तिगत योगदान (0% मार्जिन मनी)",
      "स्वयं सहायता समूहों व व्यक्तिगत महिलाओं के लिए सुगम",
      "सरल दस्तावेजीकरण और त्वरित ऋण वितरण"
    ],
    applicationProcess: [
      "Step 1: Contact District Coordinator of State Channelising Agency or Self-Help Group federations",
      "Step 2: Submit simple bio-data with caste certificate and bank passbook",
      "Step 3: Verification by Village Level Worker / SCA field officer",
      "Step 4: Direct disbursement of funds into beneficiary bank account"
    ],
    applicationProcessHi: [
      "चरण 1: जिला एससीए समन्वयक अथवा स्वयं सहायता समूह से संपर्क करें",
      "चरण 2: जाति प्रमाण पत्र व बैंक पासबुक के साथ साधारण आवेदन प्रस्तुत करें",
      "चरण 3: स्थानीय क्षेत्रीय अधिकारी द्वारा त्वरित सत्यापन",
      "चरण 4: खाते में सीधे ऋण राशि का अंतरण"
    ],
    channelPartners: [
      "State Scheduled Castes Development Corporations",
      "Public Sector Banks",
      "National Rural Livelihoods Mission (NRLM) federations"
    ],
    sourceUrl: "https://nsfdc.nic.in/en/mahila-samriddhi-yojana",
    sourceName: "Official NSFDC Portal",
    effectiveFrom: "2024-04-01",
    lastVerifiedAt: "2025-01-15",
    active: true,
    isDemoData: false
  },
  {
    id: "nsfdc-micro-credit-03",
    code: "NSFDC-MCF",
    name: "NSFDC Micro Credit Finance Scheme (MCF)",
    nameHi: "एनएसएफडीसी माइक्रो क्रेडिट वित्त योजना",
    corporation: "NSFDC",
    corporationFullName: "National Scheduled Castes Finance and Development Corporation",
    targetGroup: "Small Vendors, Artisans & Rural SC Entrepreneurs",
    targetGroupHi: "छोटे विक्रेता, ग्रामीण कारीगर व अनुसूचित जाति उद्यमी",
    description: "Rapid micro-finance support up to ₹1,50,000 per beneficiary for setting up tiny manufacturing units, grocery, repair centers, and service counters.",
    descriptionHi: "छोटे विनिर्माण, किराना, रिपेयर सेंटर और सेवा प्रतिष्ठानों के लिए ₹1.5 लाख तक तीव्र माइक्रो-फाइनेंस सहायता।",
    rules: {
      id: "rule-nsfdc-mcf",
      schemeId: "nsfdc-micro-credit-03",
      minAge: 18,
      maxAge: 60,
      maxAnnualIncome: 300000,
      minProjectCost: 15000,
      maxProjectCost: 150000,
      maxLoanAmount: 140000,
      personalContributionMinPercent: 0,
      eligibleCategories: ['SC'],
      eligibleGenders: ['male', 'female', 'other'],
      effectiveFrom: "2024-04-01",
      lastVerifiedAt: "2025-01-15"
    },
    terms: {
      interestRateMin: 5.0,
      interestRateMax: 6.0,
      rebateForWomenPercent: 0.5,
      tenureYearsMax: 4,
      moratoriumMonths: 3,
      subsidyRatePercent: 0
    },
    documents: [
      {
        id: "doc-nsfdc-mcf-1",
        schemeId: "nsfdc-micro-credit-03",
        code: "CASTE_CERT",
        title: "Caste Certificate",
        titleHi: "जाति प्रमाण पत्र",
        description: "SC Caste Certificate",
        descriptionHi: "अनुसूचित जाति प्रमाण पत्र",
        requirementType: "required"
      },
      {
        id: "doc-nsfdc-mcf-2",
        schemeId: "nsfdc-micro-credit-03",
        code: "IDENTITY_PROOF",
        title: "Aadhaar Card",
        titleHi: "आधार कार्ड",
        description: "Proof of Identity and Address",
        descriptionHi: "पहचान और निवास प्रमाण",
        requirementType: "required"
      }
    ],
    specialBenefits: [
      "Minimal paper formalities",
      "Direct disbursement through Regional Rural Banks and SCAs",
      "No collateral needed for micro-advances"
    ],
    specialBenefitsHi: [
      "न्यूनतम कागजी औपचारिकताएं",
      "क्षेत्रीय ग्रामीण बैंकों व एससीए द्वारा त्वरित संवितरण",
      "बिना किसी गिरवी/जमानत के ऋण"
    ],
    applicationProcess: [
      "Submit application to local SCA branch or designated RRB branch"
    ],
    applicationProcessHi: [
      "निकटतम एससीए शाखा अथवा नामित ग्रामीण बैंक में आवेदन जमा करें"
    ],
    channelPartners: ["State SCAs", "Regional Rural Banks"],
    sourceUrl: "https://nsfdc.nic.in/en/micro-credit-finance",
    sourceName: "Official NSFDC Portal",
    effectiveFrom: "2024-04-01",
    lastVerifiedAt: "2025-01-15",
    active: true,
    isDemoData: false
  },

  // ==========================================
  // NBCFDC (National Backward Classes Finance and Development Corporation)
  // ==========================================
  {
    id: "nbcfdc-new-swarnima-04",
    code: "NBCFDC-SWARNIMA",
    name: "NBCFDC New Swarnima Special Scheme for Women",
    nameHi: "एनबीसीएफडीसी नई स्वर्णिमा महिला विशेष योजना",
    corporation: "NBCFDC",
    corporationFullName: "National Backward Classes Finance and Development Corporation",
    targetGroup: "Backward Classes (OBC) Women Entrepreneurs",
    targetGroupHi: "अन्य पिछड़ा वर्ग (ओबीसी) की महिला उद्यमी",
    description: "Special concessional scheme for women entrepreneurs belonging to Other Backward Classes (OBCs) to foster self-reliance and entrepreneurship in small businesses.",
    descriptionHi: "अन्य पिछड़ा वर्ग (ओबीसी) की महिलाओं को आर्थिक रूप से आत्मनिर्भर बनाने हेतु रियायती ऋण सहायता योजना।",
    rules: {
      id: "rule-nbcfdc-swarnima",
      schemeId: "nbcfdc-new-swarnima-04",
      minAge: 18,
      maxAge: 55,
      maxAnnualIncome: 300000, // Total annual family income should be less than ₹3.00 Lakh
      minProjectCost: 25000,
      maxProjectCost: 200000, // Up to ₹2.00 Lakh
      maxLoanAmount: 200000,
      personalContributionMinPercent: 0, // No promoter contribution required
      eligibleCategories: ['OBC', 'DNT_NT', 'EBC'],
      eligibleGenders: ['female'], // Exclusively for female beneficiaries
      effectiveFrom: "2024-04-01",
      lastVerifiedAt: "2025-01-15",
      specialConditionsNotes: "Beneficiary must belong to Backward Classes as notified by Central/State Govt with income below ₹3.00 Lakh."
    },
    terms: {
      interestRateMin: 5.0,
      interestRateMax: 5.0, // Fixed 5% p.a. to beneficiary
      rebateForWomenPercent: 0,
      tenureYearsMax: 8,
      moratoriumMonths: 6,
      subsidyRatePercent: 0
    },
    documents: [
      {
        id: "doc-nbcfdc-sw-1",
        schemeId: "nbcfdc-new-swarnima-04",
        code: "OBC_CERT",
        title: "OBC / Non-Creamy Layer Certificate",
        titleHi: "ओबीसी / गैर-क्रीमी लेयर प्रमाण पत्र",
        description: "Valid Backward Class certificate certifying Non-Creamy Layer status",
        descriptionHi: "सक्षम प्राधिकारी द्वारा जारी अन्य पिछड़ा वर्ग प्रमाण पत्र",
        requirementType: "required"
      },
      {
        id: "doc-nbcfdc-sw-2",
        schemeId: "nbcfdc-new-swarnima-04",
        code: "INCOME_CERT",
        title: "Family Income Certificate",
        titleHi: "पारिवारिक आय प्रमाण पत्र",
        description: "Annual family income certificate below ₹3.00 Lakh",
        descriptionHi: "वार्षिक पारिवारिक आय ₹3 लाख से कम दर्शाने वाला प्रमाण पत्र",
        requirementType: "required"
      },
      {
        id: "doc-nbcfdc-sw-3",
        schemeId: "nbcfdc-new-swarnima-04",
        code: "AADHAAR",
        title: "Aadhaar Card",
        titleHi: "आधार कार्ड",
        description: "Identity and Address proof",
        descriptionHi: "पहचान और निवास का प्रमाण",
        requirementType: "required"
      }
    ],
    specialBenefits: [
      "Subsidized 5% per annum fixed interest rate",
      "0% promoter contribution needed (100% project financing up to ₹2 Lakh)",
      "Extended repayment tenure up to 8 years (including moratorium)",
      "Accessible through all State Backward Classes Development Corporations"
    ],
    specialBenefitsHi: [
      "5% प्रति वर्ष की बेहद रियायती ब्याज दर",
      "शून्य मार्जिन मनी (₹2 लाख तक 100% वित्तपोषण)",
      "8 वर्ष तक की लंबी पुनर्भुगतान अवधि (मोराटोरियम सहित)",
      "राज्य पिछड़ा वर्ग विकास निगमों द्वारा सरल क्रियान्वयन"
    ],
    applicationProcess: [
      "Step 1: Apply through State Backward Classes Development Corporation (SCA) in your district",
      "Step 2: Submit OBC certificate, income certificate, and business quotation",
      "Step 3: SCA verification and recommendation",
      "Step 4: Funds credited to bank account"
    ],
    applicationProcessHi: [
      "चरण 1: अपने जिले के राज्य पिछड़ा वर्ग विकास निगम (एससीए) में आवेदन करें",
      "चरण 2: ओबीसी प्रमाण पत्र, आय प्रमाण और व्यवसाय योजना प्रस्तुत करें",
      "चरण 3: एससीए द्वारा सत्यापन",
      "चरण 4: बैंक खाते में राशि का भुगतान"
    ],
    channelPartners: [
      "State Backward Classes Development Corporations (SCAs)",
      "Public Sector Banks",
      "Regional Rural Banks"
    ],
    sourceUrl: "https://nbcfdc.gov.in/en/new-swarnima-scheme",
    sourceName: "Official NBCFDC Portal",
    effectiveFrom: "2024-04-01",
    lastVerifiedAt: "2025-01-15",
    active: true,
    isDemoData: false
  },
  {
    id: "nbcfdc-general-term-loan-05",
    code: "NBCFDC-TL",
    name: "NBCFDC General Term Loan Scheme",
    nameHi: "एनबीसीएफडीसी सामान्य मियादी ऋण योजना",
    corporation: "NBCFDC",
    corporationFullName: "National Backward Classes Finance and Development Corporation",
    targetGroup: "OBC Entrepreneurs (Men and Women)",
    targetGroupHi: "ओबीसी उद्यमी (पुरुष व महिला)",
    description: "Credit facility for establishing small & medium ventures in agriculture, transport, service sector, small manufacturing, and artisan crafts for OBC entrepreneurs.",
    descriptionHi: "ओबीसी उद्यमियों हेतु कृषि, परिवहन, विनिर्माण, खुदरा व्यापार और सेवा उद्योग में उद्यम स्थापित करने के लिए मियादी ऋण सहायता।",
    rules: {
      id: "rule-nbcfdc-tl",
      schemeId: "nbcfdc-general-term-loan-05",
      minAge: 18,
      maxAge: 58,
      maxAnnualIncome: 300000,
      minProjectCost: 50000,
      maxProjectCost: 1500000, // Up to ₹15.00 Lakh
      maxLoanAmount: 1275000, // NBCFDC loan up to 85% of project cost
      personalContributionMinPercent: 10,
      eligibleCategories: ['OBC', 'DNT_NT', 'EBC'],
      eligibleGenders: ['male', 'female', 'other'],
      effectiveFrom: "2024-04-01",
      lastVerifiedAt: "2025-01-15"
    },
    terms: {
      interestRateMin: 6.0,
      interestRateMax: 7.0,
      rebateForWomenPercent: 0.5,
      tenureYearsMax: 8,
      moratoriumMonths: 6,
      subsidyRatePercent: 0
    },
    documents: [
      {
        id: "doc-nbcfdc-tl-1",
        schemeId: "nbcfdc-general-term-loan-05",
        code: "OBC_CERT",
        title: "OBC Caste Certificate",
        titleHi: "ओबीसी जाति प्रमाण पत्र",
        description: "Issued by competent revenue authority",
        descriptionHi: "सक्षम प्राधिकारी द्वारा जारी प्रमाण पत्र",
        requirementType: "required"
      },
      {
        id: "doc-nbcfdc-tl-2",
        schemeId: "nbcfdc-general-term-loan-05",
        code: "INCOME_CERT",
        title: "Income Certificate",
        titleHi: "आय प्रमाण पत्र",
        description: "Annual family income below ₹3.00 Lakh",
        descriptionHi: "₹3 लाख से कम वार्षिक पारिवारिक आय",
        requirementType: "required"
      },
      {
        id: "doc-nbcfdc-tl-3",
        schemeId: "nbcfdc-general-term-loan-05",
        code: "PROJECT_PLAN",
        title: "Project Proposal & Quotation",
        titleHi: "परियोजना प्रस्ताव व मशीनरी कोटेशन",
        description: "Financial estimates, equipment cost invoices, space arrangement",
        descriptionHi: "वित्तीय अनुमान, मशीनरी बिल व स्थान का विवरण",
        requirementType: "required"
      }
    ],
    specialBenefits: [
      "Low interest rate between 6% to 7% per annum",
      "Available for diversified sectors including green technologies and agro-processing",
      "Refinanced directly through State SCAs and nominated banks"
    ],
    specialBenefitsHi: [
      "6% से 7% प्रति वर्ष की बेहद किफायती ब्याज दर",
      "विविध क्षेत्रों जैसे कृषि प्रसंस्करण, ग्रीन एनर्जी व सेवा क्षेत्र हेतु उपलब्ध",
      "राज्य निगमों व बैंकों द्वारा सीधा वित्तपोषण"
    ],
    applicationProcess: [
      "Apply through State Channelising Agency or participating Public Sector Bank with project dossier"
    ],
    applicationProcessHi: [
      "परियोजना प्रस्ताव के साथ जिला एससीए या सार्वजनिक क्षेत्र के बैंक में आवेदन जमा करें"
    ],
    channelPartners: ["State BC Development Corporations", "Canara Bank", "Union Bank of India"],
    sourceUrl: "https://nbcfdc.gov.in/en/term-loan",
    sourceName: "Official NBCFDC Portal",
    effectiveFrom: "2024-04-01",
    lastVerifiedAt: "2025-01-15",
    active: true,
    isDemoData: false
  },
  {
    id: "nbcfdc-micro-finance-06",
    code: "NBCFDC-MICRO",
    name: "NBCFDC Micro Finance Scheme",
    nameHi: "एनबीसीएफडीसी माइक्रो फाइनेंस योजना",
    corporation: "NBCFDC",
    corporationFullName: "National Backward Classes Finance and Development Corporation",
    targetGroup: "OBC Rural Poor & Petty Entrepreneurs",
    targetGroupHi: "ओबीसी ग्रामीण गरीब और लघु उद्यमी",
    description: "Micro-credit up to ₹1.25 Lakh per member through Self-Help Groups (SHGs) and SCAs for informal trade, vegetable vending, handicrafts, and cottage industries.",
    descriptionHi: "स्वयं सहायता समूहों और एससीए के माध्यम से प्रति लाभार्थी ₹1.25 लाख तक का माइक्रो-क्रेडिट ऋण।",
    rules: {
      id: "rule-nbcfdc-micro",
      schemeId: "nbcfdc-micro-finance-06",
      minAge: 18,
      maxAge: 60,
      maxAnnualIncome: 300000,
      minProjectCost: 10000,
      maxProjectCost: 125000,
      maxLoanAmount: 125000,
      personalContributionMinPercent: 0,
      eligibleCategories: ['OBC', 'DNT_NT', 'EBC'],
      eligibleGenders: ['male', 'female', 'other'],
      effectiveFrom: "2024-04-01",
      lastVerifiedAt: "2025-01-15"
    },
    terms: {
      interestRateMin: 5.0,
      interestRateMax: 6.0,
      rebateForWomenPercent: 0.5,
      tenureYearsMax: 4,
      moratoriumMonths: 2,
      subsidyRatePercent: 0
    },
    documents: [
      {
        id: "doc-nbcfdc-m-1",
        schemeId: "nbcfdc-micro-finance-06",
        code: "OBC_PROOF",
        title: "OBC Identity Proof",
        titleHi: "ओबीसी पहचान प्रमाण",
        description: "Caste proof and Aadhaar Card",
        descriptionHi: "जाति प्रमाण पत्र और आधार कार्ड",
        requirementType: "required"
      }
    ],
    specialBenefits: [
      "No security or collateral required",
      "Immediate operational turnaround",
      "Doorstep delivery through SHG network"
    ],
    specialBenefitsHi: [
      "किसी प्रकार की जमानत या संपत्ति गिरवी रखने की आवश्यकता नहीं",
      "त्वरित ऋण स्वीकृति",
      "स्वयं सहायता समूहों के माध्यम से आसान पहुंच"
    ],
    applicationProcess: [
      "Apply via registered SHG or District Backward Classes Corporation"
    ],
    applicationProcessHi: [
      "पंजीकृत स्वयं सहायता समूह अथवा जिला पिछड़ा वर्ग निगम के माध्यम से आवेदन करें"
    ],
    channelPartners: ["State SCAs", "NABARD-promoted SHGs", "Regional Rural Banks"],
    sourceUrl: "https://nbcfdc.gov.in/en/micro-finance",
    sourceName: "Official NBCFDC Portal",
    effectiveFrom: "2024-04-01",
    lastVerifiedAt: "2025-01-15",
    active: true,
    isDemoData: false
  },

  // ==========================================
  // NSKFDC (National Safai Karamcharis Finance and Development Corporation)
  // ==========================================
  {
    id: "nskfdc-general-term-loan-07",
    code: "NSKFDC-TL",
    name: "NSKFDC General Term Loan Scheme",
    nameHi: "एनएसकेएफडीसी सामान्य मियादी ऋण योजना",
    corporation: "NSKFDC",
    corporationFullName: "National Safai Karamcharis Finance and Development Corporation",
    targetGroup: "Safai Karamcharis, Manual Scavengers & Dependents",
    targetGroupHi: "सफाई कर्मचारी, हाथ से मैला उठाने वाले कर्मी व उनके आश्रित",
    description: "Credit assistance for dignified alternative livelihood projects including transport vehicles, commercial trade, mechanised sanitation, and small scale manufacturing up to ₹15 Lakh.",
    descriptionHi: "सफाई कर्मचारियों और उनके आश्रितों को सम्मानजनक वैकल्पिक आजीविका (वाहन, व्यापार, सेवा इकाई) हेतु ₹15 लाख तक ऋण सहायता।",
    rules: {
      id: "rule-nskfdc-tl",
      schemeId: "nskfdc-general-term-loan-07",
      minAge: 18,
      maxAge: 60,
      maxAnnualIncome: 0, // NO INCOME LIMIT! Sponsoring Ministry waived income ceiling for verified sanitation workers
      minProjectCost: 25000,
      maxProjectCost: 1500000, // Up to ₹15.00 Lakh
      maxLoanAmount: 1350000, // Up to 90% of project cost
      personalContributionMinPercent: 5,
      eligibleCategories: ['SafaiKaramchari'],
      eligibleGenders: ['male', 'female', 'other'],
      effectiveFrom: "2024-04-01",
      lastVerifiedAt: "2025-01-15",
      specialConditionsNotes: "No family income ceiling is prescribed for Safai Karamcharis and manual scavengers. Occupation certificate is required."
    },
    terms: {
      interestRateMin: 4.0,
      interestRateMax: 6.0,
      rebateForWomenPercent: 1.0,
      tenureYearsMax: 10,
      moratoriumMonths: 12,
      subsidyRatePercent: 0
    },
    documents: [
      {
        id: "doc-nskfdc-tl-1",
        schemeId: "nskfdc-general-term-loan-07",
        code: "OCCUPATION_CERT",
        title: "Safai Karamchari / Sanitation Worker Certificate",
        titleHi: "सफाई कर्मचारी / स्वच्छता कार्यकर्ता प्रमाण पत्र",
        description: "Issued by Municipal Corporation, Nagar Panchayat, Cantonment Board or authorized agency",
        descriptionHi: "नगर निगम, नगर पालिका, छावनी बोर्ड अथवा अधिकृत संस्था द्वारा जारी प्रमाण पत्र",
        requirementType: "required"
      },
      {
        id: "doc-nskfdc-tl-2",
        schemeId: "nskfdc-general-term-loan-07",
        code: "AADHAAR",
        title: "Aadhaar Card",
        titleHi: "आधार कार्ड",
        description: "Identity and Address verification",
        descriptionHi: "पहचान और निवास का प्रमाण",
        requirementType: "required"
      },
      {
        id: "doc-nskfdc-tl-3",
        schemeId: "nskfdc-general-term-loan-07",
        code: "PROJECT_ESTIMATE",
        title: "Project Estimate / Quotation",
        titleHi: "परियोजना अनुमान / कोटेशन",
        description: "Quotation for vehicle, tools or shop setup",
        descriptionHi: "वाहन, उपकरण या दुकान स्थापना हेतु प्राक्कलन",
        requirementType: "required"
      }
    ],
    specialBenefits: [
      "NO income ceiling limitation — open to all verified sanitation workers",
      "Very low interest rate of 4% to 6% per annum",
      "1% special interest rebate for women beneficiaries",
      "Up to 10 years repayment period with 1-year moratorium"
    ],
    specialBenefitsHi: [
      "कोई आय सीमा नहीं — सभी सत्यापित सफाई कर्मचारियों के लिए सुलभ",
      "4% से 6% प्रति वर्ष की न्यूनतम ब्याज दर",
      "महिला लाभार्थियों के लिए 1% की विशेष अतिरिक्त छूट",
      "10 वर्ष तक की आसान किश्तें व 1 वर्ष का मोराटोरियम"
    ],
    applicationProcess: [
      "Step 1: Obtain occupation certificate from local Urban Local Body (ULB) / Panchayat",
      "Step 2: Submit application to State Channelising Agency or Public Sector Bank branch",
      "Step 3: Verification and sanction by NSKFDC channel partner",
      "Step 4: Loan disbursement for chosen commercial project"
    ],
    applicationProcessHi: [
      "चरण 1: नगर निगम अथवा स्थानीय निकाय से सफाई कर्मचारी प्रमाण पत्र प्राप्त करें",
      "चरण 2: राज्य निगम (एससीए) अथवा बैंक शाखा में आवेदन प्रस्तुत करें",
      "चरण 3: सत्यापन एवं ऋण स्वीकृति",
      "चरण 4: चयनित व्यवसाय हेतु खाते में ऋण राशि का वितरण"
    ],
    channelPartners: [
      "State Channelising Agencies",
      "Public Sector Banks",
      "Regional Rural Banks"
    ],
    sourceUrl: "https://nskfdc.nic.in/en/term-loan",
    sourceName: "Official NSKFDC Portal (MoSJE)",
    effectiveFrom: "2024-04-01",
    lastVerifiedAt: "2025-01-15",
    active: true,
    isDemoData: false
  },
  {
    id: "nskfdc-mahila-adhikarita-08",
    code: "NSKFDC-MAY",
    name: "NSKFDC Mahila Adhikarita Yojana (MAY)",
    nameHi: "एनएसकेएफडीसी महिला अधिकारिता योजना",
    corporation: "NSKFDC",
    corporationFullName: "National Safai Karamcharis Finance and Development Corporation",
    targetGroup: "Female Safai Karamcharis & Sanitation Workers",
    targetGroupHi: "महिला सफाई कर्मचारी एवं स्वच्छता कार्यकर्ता",
    description: "Exclusive micro-credit scheme empowering women sanitation workers with quick capital for tiny self-employment projects up to ₹1.00 Lakh at just 4% interest rate.",
    descriptionHi: "महिला सफाई कर्मियों को छोटे स्वरोजगार स्थापित करने हेतु ₹1 लाख तक मात्र 4% ब्याज दर पर विशेष माइक्रो-क्रेडिट ऋण।",
    rules: {
      id: "rule-nskfdc-may",
      schemeId: "nskfdc-mahila-adhikarita-08",
      minAge: 18,
      maxAge: 55,
      maxAnnualIncome: 0, // No income limit
      minProjectCost: 15000,
      maxProjectCost: 100000, // Up to ₹1.00 Lakh
      maxLoanAmount: 100000,
      personalContributionMinPercent: 0, // 0% margin money
      eligibleCategories: ['SafaiKaramchari'],
      eligibleGenders: ['female'],
      effectiveFrom: "2024-04-01",
      lastVerifiedAt: "2025-01-15"
    },
    terms: {
      interestRateMin: 4.0,
      interestRateMax: 4.0,
      rebateForWomenPercent: 0,
      tenureYearsMax: 4,
      moratoriumMonths: 3,
      subsidyRatePercent: 0
    },
    documents: [
      {
        id: "doc-nskfdc-may-1",
        schemeId: "nskfdc-mahila-adhikarita-08",
        code: "OCCUPATION_CERT",
        title: "Sanitation Worker Proof",
        titleHi: "सफाई कर्मचारी पहचान पत्र",
        description: "Issued by Local Body or authorized sanitation contractor",
        descriptionHi: "स्थानीय निकाय या अधिकृत स्वच्छता एजेंसी द्वारा जारी पहचान पत्र",
        requirementType: "required"
      },
      {
        id: "doc-nskfdc-may-2",
        schemeId: "nskfdc-mahila-adhikarita-08",
        code: "AADHAAR_BANK",
        title: "Aadhaar Card & Bank Account",
        titleHi: "आधार कार्ड व बैंक पासबुक",
        description: "Linked active savings account",
        descriptionHi: "सक्रिय बैंक बचत खाता पासबुक",
        requirementType: "required"
      }
    ],
    specialBenefits: [
      "Ultra-low interest rate: 4% per annum",
      "Zero promoter contribution required",
      "Fast-track processing for women applicants"
    ],
    specialBenefitsHi: [
      "मात्र 4% प्रति वर्ष की रियायती ब्याज दर",
      "शून्य व्यक्तिगत योगदान (0% मार्जिन)",
      "महिला आवेदकों हेतु प्राथमिकता आधारित तीव्र वितरण"
    ],
    applicationProcess: [
      "Submit application to local SCA coordinator or Bank Branch"
    ],
    applicationProcessHi: [
      "स्थानीय एससीए समन्वयक अथवा बैंक शाखा में आवेदन प्रस्तुत करें"
    ],
    channelPartners: ["State SCAs", "Public Sector Banks", "RRBs"],
    sourceUrl: "https://nskfdc.nic.in/en/mahila-adhikarita-yojana",
    sourceName: "Official NSKFDC Portal",
    effectiveFrom: "2024-04-01",
    lastVerifiedAt: "2025-01-15",
    active: true,
    isDemoData: false
  },
  {
    id: "nskfdc-swachhta-udyami-09",
    code: "NSKFDC-SUY",
    name: "NSKFDC Swachhta Udyami Yojana (SUY)",
    nameHi: "एनएसकेएफडीसी स्वच्छता उद्यमी योजना",
    corporation: "NSKFDC",
    corporationFullName: "National Safai Karamcharis Finance and Development Corporation",
    targetGroup: "Sanitation Entrepreneurs, Manual Scavengers (SRMS)",
    targetGroupHi: "स्वच्छता उद्यमी, मैला ढोने वाले मुक्ति लाभार्थी",
    description: "Financing procurement of mechanized cleaning equipment, suction jetting machines, garbage compactor vehicles, and sanitation infrastructure up to ₹50 Lakh to eliminate manual hazardous cleaning.",
    descriptionHi: "मैन्युअल सीवर सफाई समाप्त करने हेतु मैकेनाइज्ड सफाई उपकरण, सक्शन-जेटिंग मशीन व स्वच्छता वाहनों की खरीद हेतु ₹50 लाख तक वित्तीय सहायता।",
    rules: {
      id: "rule-nskfdc-suy",
      schemeId: "nskfdc-swachhta-udyami-09",
      minAge: 18,
      maxAge: 60,
      maxAnnualIncome: 0, // No income limit
      minProjectCost: 500000,
      maxProjectCost: 5000000, // Up to ₹50.00 Lakh
      maxLoanAmount: 4500000,
      personalContributionMinPercent: 10,
      eligibleCategories: ['SafaiKaramchari'],
      eligibleGenders: ['male', 'female', 'other'],
      eligibleSectors: ['Sanitation', 'Waste Management', 'Transport', 'Services'],
      effectiveFrom: "2024-04-01",
      lastVerifiedAt: "2025-01-15",
      specialConditionsNotes: "Specifically promotes mechanization of sanitation operations and sewer cleaning."
    },
    terms: {
      interestRateMin: 4.0,
      interestRateMax: 5.0,
      rebateForWomenPercent: 1.0,
      tenureYearsMax: 10,
      moratoriumMonths: 12,
      subsidyRatePercent: 25 // Capital subsidy support under Ministry programs
    },
    documents: [
      {
        id: "doc-nskfdc-suy-1",
        schemeId: "nskfdc-swachhta-udyami-09",
        code: "SANITATION_CERT",
        title: "Sanitation Worker / Scavenger Identification",
        titleHi: "स्वच्छता कार्यकर्ता / सफाई कर्मी पहचान प्रमाण",
        description: "Certificate issued by Municipality or District Social Welfare Office",
        descriptionHi: "नगर पालिका अथवा जिला समाज कल्याण अधिकारी द्वारा जारी प्रमाण पत्र",
        requirementType: "required"
      },
      {
        id: "doc-nskfdc-suy-2",
        schemeId: "nskfdc-swachhta-udyami-09",
        code: "EQUIPMENT_QUOTATION",
        title: "Equipment Quotation from OEM Manufacturer",
        titleHi: "सक्शन-जेटिंग मशीन / उपकरण निर्माता कोटेशन",
        description: "Valid proforma invoice for mechanized cleaning vehicle or suction equipment",
        descriptionHi: "मैकेनाइज्ड उपकरण निर्माता से वैध प्रोफार्मा बिल",
        requirementType: "required"
      },
      {
        id: "doc-nskfdc-suy-3",
        schemeId: "nskfdc-swachhta-udyami-09",
        code: "DRIVING_LICENSE",
        title: "Commercial Driving License",
        titleHi: "कमर्शियल वाहन ड्राइविंग लाइसेंस",
        description: "Applicable if purchasing cleaning truck / vehicle",
        descriptionHi: "वाहन आधारित उपकरण हेतु चालक का वैध लाइसेंस",
        requirementType: "conditional",
        conditionNote: "Required when purchasing vehicle-mounted suction jetting machines"
      }
    ],
    specialBenefits: [
      "Capital subsidy support up to 25% or ₹5 Lakh under Government norms",
      "Very low interest rate: 4% to 5% p.a.",
      "Ensures dignified safety and commercial contracts with Municipal Corporations",
      "Moratorium period of 12 months"
    ],
    specialBenefitsHi: [
      "सरकारी नियमों के तहत ₹5 लाख तक की पूंजीगत सब्सिडी (कैपिटल सब्सिडी)",
      "4% से 5% की रियायती ब्याज दर",
      "नगर निगमों से सफाई अनुबंध प्राप्त करने में प्राथमिकता",
      "12 माह का मोराटोरियम"
    ],
    applicationProcess: [
      "Step 1: Obtain proforma quotation for mechanized cleaning equipment",
      "Step 2: Submit to District Social Welfare Officer / State Channelising Agency",
      "Step 3: Joint appraisal with Municipal Corporation and financing bank",
      "Step 4: Release of loan and capital subsidy directly to manufacturer"
    ],
    applicationProcessHi: [
      "चरण 1: अधिकृत निर्माता से मैकेनाइज्ड सफाई मशीन का कोटेशन प्राप्त करें",
      "चरण 2: जिला समाज कल्याण अधिकारी अथवा राज्य निगम में आवेदन जमा करें",
      "चरण 3: नगर निगम व बैंक द्वारा संयुक्त मूल्यांकन",
      "चरण 4: ऋण व सब्सिडी राशि का सीधे उपकरण निर्माता को भुगतान"
    ],
    channelPartners: [
      "Urban Local Bodies (ULBs)",
      "State Channelising Agencies",
      "Public Sector Banks"
    ],
    sourceUrl: "https://nskfdc.nic.in/en/swachhta-udyami-yojana",
    sourceName: "Official NSKFDC Portal",
    effectiveFrom: "2024-04-01",
    lastVerifiedAt: "2025-01-15",
    active: true,
    isDemoData: false
  }
];

export const INITIAL_BRANCHES: ChannelPartnerBranch[] = [
  // Delhi
  {
    id: "branch-delhi-sca-01",
    name: "Delhi Scheduled Castes Financial & Development Corporation (DSFDC)",
    nameHi: "दिल्ली अनुसूचित जाति वित्त एवं विकास निगम",
    corporation: "NSFDC",
    agencyType: "SCA",
    state: "Delhi",
    district: "Central Delhi",
    address: "Ambedkar Bhawan, Sector-16, Rohini, New Delhi",
    pincode: "110085",
    lat: 28.7165,
    lng: 77.1132,
    phone: "011-27854321",
    email: "dsfdc-delhi@gov.in",
    operatingHours: "Monday – Friday: 9:30 AM – 5:30 PM",
    website: "https://dsfdc.delhi.gov.in",
    isDemoData: true
  },
  {
    id: "branch-delhi-nbcfdc-02",
    name: "Delhi Other Backward Classes Development Corporation (DOCD)",
    nameHi: "दिल्ली अन्य पिछड़ा वर्ग विकास निगम",
    corporation: "NBCFDC",
    agencyType: "SCA",
    state: "Delhi",
    district: "New Delhi",
    address: "Vikas Bhawan, IP Estate, New Delhi",
    pincode: "110002",
    lat: 28.6289,
    lng: 77.2415,
    phone: "011-23378901",
    operatingHours: "Monday – Friday: 9:30 AM – 6:00 PM",
    isDemoData: true
  },
  {
    id: "branch-delhi-pnb-03",
    name: "Punjab National Bank - Social Banking Cell, Connaught Place",
    nameHi: "पंजाब नेशनल बैंक - सामाजिक बैंकिंग प्रकोष्ठ, कनाट प्लेस",
    corporation: "ALL",
    agencyType: "PSB",
    state: "Delhi",
    district: "Central Delhi",
    address: "7, Bhikaji Cama Place & E-Block Connaught Place, New Delhi",
    pincode: "110001",
    lat: 28.6328,
    lng: 77.2197,
    phone: "011-23415678",
    operatingHours: "Monday – Saturday: 10:00 AM – 4:00 PM",
    website: "https://pnbindia.in",
    isDemoData: true
  },

  // Maharashtra
  {
    id: "branch-mumbai-mpbc-04",
    name: "Mahatma Phule Backward Class Development Corporation (MPBCDC)",
    nameHi: "महात्मा फुले मागासवर्ग विकास महामंडळ",
    corporation: "NSFDC",
    agencyType: "SCA",
    state: "Maharashtra",
    district: "Mumbai City",
    address: "Supreme Shopping Centre, Gulmohar Cross Rd No. 9, Juhu, Mumbai",
    pincode: "400049",
    lat: 19.1075,
    lng: 72.8263,
    phone: "022-26201245",
    email: "mpbcdc.mumbai@maharashtra.gov.in",
    operatingHours: "Monday – Friday: 10:00 AM – 5:30 PM",
    website: "https://mpbcdc.maharashtra.gov.in",
    isDemoData: true
  },
  {
    id: "branch-pune-obc-05",
    name: "Maharashtra State Other Backward Class Finance and Development Corp",
    nameHi: "महाराष्ट्र राज्य इतर मागासवर्गीय वित्त आणि विकास महामंडळ",
    corporation: "NBCFDC",
    agencyType: "SCA",
    state: "Maharashtra",
    district: "Pune",
    address: "Social Welfare Complex, Vishrantwadi, Pune",
    pincode: "411015",
    lat: 18.5714,
    lng: 73.8794,
    phone: "020-27178940",
    operatingHours: "Monday – Friday: 10:00 AM – 5:00 PM",
    isDemoData: true
  },
  {
    id: "branch-nagpur-rrb-06",
    name: "Maharashtra Gramin Bank - Regional Office, Nagpur",
    nameHi: "महाराष्ट्र ग्रामीण बैंक - क्षेत्रीय कार्यालय, नागपुर",
    corporation: "ALL",
    agencyType: "RRB",
    state: "Maharashtra",
    district: "Nagpur",
    address: "Civil Lines, Near High Court, Nagpur",
    pincode: "440001",
    lat: 21.1539,
    lng: 79.0831,
    phone: "0712-2567812",
    operatingHours: "Monday – Saturday: 10:00 AM – 4:30 PM",
    isDemoData: true
  },

  // Uttar Pradesh
  {
    id: "branch-lucknow-upscdc-07",
    name: "UP Scheduled Castes Finance & Development Corporation (UPSCDC)",
    nameHi: "उ.प्र. अनुसूचित जाति वित्त एवं विकास निगम (लखनऊ)",
    corporation: "NSFDC",
    agencyType: "SCA",
    state: "Uttar Pradesh",
    district: "Lucknow",
    address: "B-2, Picup Bhawan, Vibhuti Khand, Gomti Nagar, Lucknow",
    pincode: "226010",
    lat: 26.8656,
    lng: 81.0028,
    phone: "0522-2720814",
    email: "upscdc-lko@nic.in",
    operatingHours: "Monday – Friday: 9:30 AM – 6:00 PM",
    isDemoData: true
  },
  {
    id: "branch-varanasi-canara-08",
    name: "Canara Bank - Lead District Office & MoSJE Desk, Varanasi",
    nameHi: "केनरा बैंक - लीड डिस्ट्रिक्ट ऑफिस, वाराणसी",
    corporation: "ALL",
    agencyType: "PSB",
    state: "Uttar Pradesh",
    district: "Varanasi",
    address: "Kuber Complex, Rathyatra Crossing, Varanasi",
    pincode: "221010",
    lat: 25.3176,
    lng: 82.9739,
    phone: "0542-2391045",
    operatingHours: "Monday – Saturday: 10:00 AM – 4:00 PM",
    isDemoData: true
  },

  // Karnataka
  {
    id: "branch-bengaluru-dr-ambedkar-09",
    name: "Dr. B.R. Ambedkar Development Corporation Ltd.",
    nameHi: "ಡಾ. ಬಿ.ಆರ್. ಅಂಬೇಡ್ಕರ್ ಅಭಿವೃದ್ಧಿ ನಿಗಮ (ಬೆಂಗಳೂರು)",
    corporation: "NSFDC",
    agencyType: "SCA",
    state: "Karnataka",
    district: "Bengaluru Urban",
    address: "9th Floor, Vishveshwaraiah Mini Tower, Dr. Ambedkar Veedhi, Bengaluru",
    pincode: "560001",
    lat: 12.9791,
    lng: 77.5913,
    phone: "080-22864380",
    email: "ambedkar.corp@karnataka.gov.in",
    operatingHours: "Monday – Friday: 10:00 AM – 5:30 PM",
    isDemoData: true
  },
  {
    id: "branch-bengaluru-devaraj-urs-10",
    name: "D. Devaraj Urs Backward Classes Development Corporation",
    nameHi: "ಡಿ. ದೇವರಾಜ ಅರಸು ಹಿಂದುಳಿದ ವರ್ಗಗಳ ಅಭಿವೃದ್ಧಿ ನಿಗಮ",
    corporation: "NBCFDC",
    agencyType: "SCA",
    state: "Karnataka",
    district: "Bengaluru Urban",
    address: "No. 16/D, 4th Floor, Devaraj Urs Bhavan, Millers Tank Bund Road, Vasanth Nagar, Bengaluru",
    pincode: "560052",
    lat: 12.9915,
    lng: 77.5934,
    phone: "080-22374824",
    operatingHours: "Monday – Friday: 10:00 AM – 5:30 PM",
    isDemoData: true
  },

  // Tamil Nadu
  {
    id: "branch-chennai-tahdco-11",
    name: "Tamil Nadu Adi Dravidar Housing & Development Corp (TAHDCO)",
    nameHi: "தாட்கோ (TAHDCO) - சென்னை",
    corporation: "NSFDC",
    agencyType: "SCA",
    state: "Tamil Nadu",
    district: "Chennai",
    address: "No. 31, Cenotaph Road, Teynampet, Chennai",
    pincode: "600018",
    lat: 13.0335,
    lng: 80.2458,
    phone: "044-24344142",
    email: "tahdcoho@gmail.com",
    operatingHours: "Monday – Friday: 10:00 AM – 5:45 PM",
    website: "https://tahdco.tn.gov.in",
    isDemoData: true
  },

  // Bihar
  {
    id: "branch-patna-scdc-12",
    name: "Bihar State Scheduled Castes Co-operative Development Corp",
    nameHi: "बिहार राज्य अनुसूचित जाति सहकारिता विकास निगम",
    corporation: "NSFDC",
    agencyType: "SCA",
    state: "Bihar",
    district: "Patna",
    address: "Vikas Bhawan, Bailey Road, Patna",
    pincode: "800015",
    lat: 25.6093,
    lng: 85.1235,
    phone: "0612-2215689",
    operatingHours: "Monday – Friday: 10:00 AM – 5:00 PM",
    isDemoData: true
  }
];
