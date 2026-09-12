export interface AppConfig {
  name: string;
  tagline: string;
  taglineHi: string;
  ministry: string;
  ministryHi: string;
  problemStatement: string;
  theme: string;
  supportEmail: string;
  tollFreeHelpline: string;
  version: string;
  corporations: {
    code: string;
    name: string;
    fullName: string;
    website: string;
    description: string;
  }[];
}

export const APP_CONFIG: AppConfig = {
  name: "SchemeSetu",
  tagline: "Right Scheme. Right Opportunity.",
  taglineHi: "सही योजना। सही अवसर।",
  ministry: "Ministry of Social Justice and Empowerment, Government of India",
  ministryHi: "सामाजिक न्याय और अधिकारिता मंत्रालय, भारत सरकार",
  problemStatement: "SIH26092 — AI-Driven Scheme Matching Platform for Entrepreneurs",
  theme: "Software | Smart Automation",
  supportEmail: "support@schemesetu.gov.in",
  tollFreeHelpline: "1800-180-1551",
  version: "1.0.0-hackathon",
  corporations: [
    {
      code: "NSFDC",
      name: "NSFDC",
      fullName: "National Scheduled Castes Finance and Development Corporation",
      website: "https://nsfdc.nic.in",
      description: "Dedicated to socio-economic development and credit facilitation for Scheduled Caste entrepreneurs."
    },
    {
      code: "NBCFDC",
      name: "NBCFDC",
      fullName: "National Backward Classes Finance and Development Corporation",
      website: "https://nbcfdc.gov.in",
      description: "Promotes economic empowerment and self-employment among Other Backward Classes (OBCs) and EBCs."
    },
    {
      code: "NSKFDC",
      name: "NSKFDC",
      fullName: "National Safai Karamcharis Finance and Development Corporation",
      website: "https://nskfdc.nic.in",
      description: "Empowering Safai Karamcharis, manual scavengers, sanitation workers, and their dependents through concessional finance."
    }
  ]
};
