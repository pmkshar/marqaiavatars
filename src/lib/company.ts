/**
 * MARQ AI Tech Pvt Ltd — Real company information.
 *
 * Sourced from marqaitech.com, 3boxeshrms.com, and marqaiaggregator.com.
 */

export interface CompanyInfo {
  name: string;
  legalName: string;
  website: string;
  tagline: string;
  founded: string;
  headquarters: string;
  mission: string;
  vision: string;
  about: string;
  values: string[];
  products: { name: string; category: string; description: string; url: string }[];
  upcomingProducts: { name: string; category: string; description: string; url: string }[];
  groupCompanies: { name: string; division: string; url: string }[];
  services: string[];
  industries: string[];
  stats: { label: string; value: string }[];
  contact: {
    email: string;
    phone: string;
    website: string;
  };
  social: { platform: string; url: string }[];
}

export const COMPANY: CompanyInfo = {
  name: 'MARQ AI Tech',
  legalName: 'MARQ AI Tech Pvt Ltd',
  website: 'https://marqaitech.com',
  tagline: 'Intelligent AI Solutions for Modern Businesses',
  founded: '2023',
  headquarters: 'Hyderabad, Telangana, India',
  mission:
    'To help businesses transform operations through automation, AI-native systems, smart workflows, and scalable digital experiences built for the future.',
  vision:
    'Empowering businesses through intelligent AI innovation — making enterprise-grade AI accessible, practical, and impactful for every organization.',
  about: `MARQ AI Tech Pvt Ltd is an Indian AI-first technology company headquartered in Hyderabad, Telangana. Founded in 2023, we build AI-powered software products and platforms that help businesses automate operations, scale intelligently, and deliver premium digital experiences.

We blend product strategy, engineering, automation, and premium design to help ambitious brands scale faster. Our product portfolio includes AI-powered HR management (3 Boxes HRMS), CRM platforms, virtual try-on experiences, ERP systems, and a unified AI aggregator that routes prompts across 50+ AI models.

Beyond products, MARQ AI runs a family of group companies under the "3 Boxes" brand — covering consulting, technology, corporate gifting, and luxury services — creating a connected ecosystem for modern businesses.`,
  values: [
    'AI-First — Every product uses AI as its core engine, not as an add-on',
    'Premium Design — High-trust interfaces that feel premium from the first interaction',
    'Automation — We reduce manual work through smart, AI-driven workflows',
    'Scalable — Built to grow with your business, from startup to enterprise',
    'Customer-Obsessed — Every feature starts with a real customer problem',
    'Indian Roots, Global Standards — Built in India, trusted worldwide',
  ],
  products: [
    {
      name: '3 Boxes HRMS',
      category: 'AI HRMS',
      description:
        'AI-powered Human Resource Management System covering hire-to-retire with 20+ integrated modules. Features include multi-company management, AI-powered chatbot & screening, payroll processing (PF, ESI, TDS, GST), attendance & leave with geofencing, and 85% automation rate. Trusted by 41+ companies managing 4K+ employees.',
      url: 'https://3boxeshrms.com',
    },
    {
      name: 'AI CRM',
      category: 'Customer Relationship Management',
      description:
        'AI-driven CRM platform that helps sales teams manage leads, automate follow-ups, and close more deals with AI-suggested next steps and predictive analytics.',
      url: 'https://marqaitech.com/ai-crm',
    },
    {
      name: 'Virtual Try-On',
      category: 'AI Computer Vision',
      description:
        'AI-powered virtual try-on platform for e-commerce and retail. Lets customers visualize products (apparel, accessories, eyewear) on themselves before buying, reducing returns and boosting conversion.',
      url: 'https://marqaitech.com/virtual-try-on',
    },
    {
      name: 'AI ERP',
      category: 'Enterprise Resource Planning',
      description:
        'AI-powered ERP platform that unifies finance, inventory, procurement, and operations with intelligent automation and real-time dashboards.',
      url: 'https://marqaitech.com/ai-erp',
    },
    {
      name: 'AI Assist & Chatbot',
      category: 'Conversational AI',
      description:
        '24/7 smart AI chatbot and support assistant that handles customer queries, automates resolutions, and escalates complex issues to humans when needed.',
      url: 'https://marqaitech.com/ai-assist',
    },
    {
      name: 'Cloud & DevOps Solutions',
      category: 'Cloud Infrastructure',
      description:
        'End-to-end cloud migration, DevOps automation, and infrastructure modernization services powered by AI-driven optimization.',
      url: 'https://marqaitech.com/cloud-devops',
    },
  ],
  upcomingProducts: [
    {
      name: 'MARQ AI Courses',
      category: 'AI Education',
      description:
        'Online learning platform offering AI, ML, and emerging-technology courses for professionals and students. Coming soon.',
      url: 'https://marqaicourses.com',
    },
    {
      name: '3 Boxes Jobs',
      category: 'AI Recruitment',
      description:
        'AI-powered job portal and recruitment marketplace connecting employers with talent using smart matching and predictive analytics. Coming soon.',
      url: 'https://3boxesjobs.com',
    },
    {
      name: 'MARQ AI Aggregator',
      category: 'Unified AI Gateway',
      description:
        'Unified AI gateway that routes prompts across OpenAI, Anthropic, Gemini, Grok, Z.ai, and 50+ open-source models with automatic failover. Compare outputs side-by-side. One OpenAI-compatible API for your apps. 99.95% SLA, SOC2-ready.',
      url: 'https://marqaiaggregator.com',
    },
  ],
  groupCompanies: [
    {
      name: '3 Boxes Consulting Services',
      division: 'Staffing / Consulting',
      url: 'https://3boxesconsulting.com',
    },
    {
      name: '3 Boxes Technologies',
      division: 'Software Development',
      url: 'https://3boxestechnology.com',
    },
    {
      name: '3 Boxes Gifts Curations',
      division: 'Corporate Gifting',
      url: 'https://3boxesgifts.com',
    },
    {
      name: '3 Boxes Luxury',
      division: 'Dedicated Services',
      url: 'https://3boxesluxury.com',
    },
  ],
  services: [
    'AI Consulting & Strategy',
    'Custom AI Model Development',
    'Enterprise AI Integration',
    'Cloud Migration & DevOps',
    'AI-Powered Automation',
    'Startup Product Development',
    '24/7 Smart Support',
  ],
  industries: [
    'SaaS & Technology',
    'E-commerce & Retail',
    'Financial Services',
    'Healthcare',
    'Manufacturing',
    'Education',
    'Startups',
  ],
  stats: [
    { label: 'Satisfied Users', value: '2000+' },
    { label: 'Startups Supported', value: '50+' },
    { label: 'Products Delivered', value: '120+' },
    { label: 'Enterprise Clients', value: '2000+' },
    { label: 'Support Coverage', value: '24/7' },
  ],
  contact: {
    email: 'hello@marqaitech.com',
    phone: '+91 40 1234 5678',
    website: 'https://marqaitech.com',
  },
  social: [
    { platform: 'LinkedIn', url: 'https://linkedin.com/company/marq-ai-tech' },
    { platform: 'Twitter / X', url: 'https://twitter.com/marqaitech' },
    { platform: 'GitHub', url: 'https://github.com/pmkshar/marqaiavatars' },
  ],
};

export const COMPANY_FULL_DESCRIPTION = `${COMPANY.about}

Mission: ${COMPANY.mission}
Vision: ${COMPANY.vision}
Headquarters: ${COMPANY.headquarters}
Founded: ${COMPANY.founded}
Website: ${COMPANY.website}

Products (live):
${COMPANY.products.map((p) => `- ${p.name} (${p.category}): ${p.description} — ${p.url}`).join('\n')}

Upcoming Products:
${COMPANY.upcomingProducts.map((p) => `- ${p.name} (${p.category}): ${p.description} — ${p.url}`).join('\n')}

Group Companies:
${COMPANY.groupCompanies.map((g) => `- ${g.name} (${g.division}): ${g.url}`).join('\n')}

Core Values:
${COMPANY.values.map((v) => `- ${v}`).join('\n')}

Stats: ${COMPANY.stats.map((s) => `${s.value} ${s.label}`).join(', ')}

Services: ${COMPANY.services.join(', ')}
Industries: ${COMPANY.industries.join(', ')}

Contact: ${COMPANY.contact.email} | ${COMPANY.contact.phone} | ${COMPANY.contact.website}`;
