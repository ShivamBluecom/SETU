export type FieldType = 'text' | 'number' | 'date' | 'select' | 'multiselect' | 'textarea'

export interface FieldDef {
  key: string
  label: string
  type: FieldType
  options?: string[]
  oemManaged?: true     // fetch options from /api/oem-configs?buType=...
  required: boolean
  placeholder?: string
  hint?: string
}

export type TotalValueFormula = 'QTY_X_UNIT' | 'LICENCE_X_PRICE' | 'MONTHLY_X_TERM'

export interface BUConfig {
  showQtyUnitPrice: boolean
  totalValueFormula: TotalValueFormula
  fields: FieldDef[]
}

export const ISG_SUBCATEGORIES = [
  'Laptops', 'Desktops', 'All-in-One', 'Workstations', 'Thin Clients', 'Mini PCs',
  'Servers (Rack)', 'Servers (Tower)', 'Servers (Blade)', 'Servers (HPC)',
  'NAS', 'SAN', 'Storage Accessories', 'Monitors', 'Printers', 'Scanners',
  'UPS', 'Docking Stations', 'Keyboards & Mice', 'Webcams', 'Headsets',
  'KVM Switches', 'Other Peripherals',
]

export const NETWORKING_SUBCATEGORIES = [
  'Routers', 'Switches (Managed)', 'Switches (Unmanaged)', 'Firewalls',
  'Wireless / Access Points', 'Structured Cabling & Passive Components',
  'Load Balancers', 'SD-WAN', 'Network Management Software',
  'Interactive Flat Panels', 'Projectors & Screens', 'Video Conferencing Hardware',
  'Unified Communications Hardware', 'Digital Signage', 'Control Systems',
  'AV Passive Components & Cabling', 'CCTV / IP Surveillance', 'Access Control Systems',
]

export const ISS_SUBCATEGORIES = [
  'Endpoint Protection (AV/EDR)', 'DLP', 'Device Control', 'Firewall', 'IDS/IPS',
  'NAC', 'Secure Web Gateway', 'Email Security', 'IAM', 'PAM', 'MFA',
  'CASB', 'CSPM', 'Zero Trust', 'SIEM Platforms', 'SOAR',
  'Threat Intelligence', 'GRC Platforms', 'Vulnerability Management',
]

export const BC_MICROSOFT_SUBCATEGORIES = [
  'M365 Business Basic', 'M365 Business Standard', 'M365 Business Premium',
  'M365 Enterprise E3', 'M365 Enterprise E5', 'M365 Frontline F1', 'M365 Frontline F3',
  'Windows Server', 'SQL Server', 'Exchange Server', 'SharePoint Server', 'CALs',
  'Dynamics 365 Sales', 'Dynamics 365 Customer Service', 'Dynamics 365 Finance & Operations',
  'Defender for Endpoint', 'Defender for Identity', 'Sentinel', 'Purview',
  'Intune', 'Power BI', 'Power Apps', 'Power Automate',
  'Adobe', 'Autodesk', 'Zoom', 'Slack', 'Other',
]

export const CLOUD_OPPORTUNITY_TYPES = [
  'New Workload', 'Migration On-Prem to Cloud', 'Migration Cloud to Cloud',
  'Renewal', 'Direct to Indirect', 'Managed Services', 'Professional Services',
  'Cloud Consulting',
]

export const OPPORTUNITY_TYPES = ['Renewal', 'Green Field', 'Platform Change']

export const WARRANTY_PERIODS = ['1 Year', '2 Year', '3 Year', '4 Year', '5 Year']
export const SUBSCRIPTION_TERMS = ['1 Year', '2 Year', '3 Year']
export const LICENCE_TYPES = ['1 Year', '3 Year', 'Perpetual']
export const DEPLOYMENT_TYPES = ['Cloud', 'On-Premise', 'Hybrid']
export const CLOUD_PLATFORMS = ['AWS', 'Azure', 'Yotta', 'CTRLS', 'NxtGen', 'Other']
export const COMMITMENT_TERMS = ['Monthly', '1 Year', '2 Year', '3 Year']
export const BILLING_MODELS = ['PAYG', 'Reserved', 'Committed', 'Credits']

export const BU_FIELD_CONFIG: Record<string, BUConfig> = {
  ISG: {
    showQtyUnitPrice: true,
    totalValueFormula: 'QTY_X_UNIT',
    fields: [
      { key: 'subcategory', label: 'Subcategory', type: 'select', options: ISG_SUBCATEGORIES, required: true },
      { key: 'oem', label: 'OEM', type: 'select', oemManaged: true, required: true },
      { key: 'mtmPartNumber', label: 'MTM / Part Number', type: 'text', required: true, placeholder: 'e.g. 20XW0044IN' },
      { key: 'productDescription', label: 'Product Description', type: 'text', required: true },
      { key: 'oemDrNumber', label: 'OEM DR Number', type: 'text', required: false, placeholder: 'e.g. DR-2024-00123', hint: 'Deal Registration number from OEM portal (optional)' },
    ],
  },

  NETWORKING_AV: {
    showQtyUnitPrice: true,
    totalValueFormula: 'QTY_X_UNIT',
    fields: [
      { key: 'subcategory', label: 'Subcategory', type: 'select', options: NETWORKING_SUBCATEGORIES, required: true },
      { key: 'oem', label: 'OEM', type: 'select', oemManaged: true, required: true },
      { key: 'mtmPartNumber', label: 'MTM / Part Number', type: 'text', required: true, placeholder: 'e.g. C9200L-24T-4G-E' },
      { key: 'productDescription', label: 'Product Description', type: 'text', required: true },
      { key: 'warrantySupportTier', label: 'Warranty / Support Tier', type: 'text', required: true, placeholder: 'e.g. SmartNet 8×5×NBD' },
      { key: 'warrantyPeriod', label: 'Warranty Period', type: 'select', options: WARRANTY_PERIODS, required: true },
      { key: 'oemDrNumber', label: 'OEM DR Number', type: 'text', required: false, placeholder: 'e.g. DR-2024-00123' },
    ],
  },

  ISS: {
    showQtyUnitPrice: true,
    totalValueFormula: 'QTY_X_UNIT',
    fields: [
      { key: 'subcategory', label: 'Subcategory', type: 'select', options: ISS_SUBCATEGORIES, required: true },
      { key: 'oem', label: 'OEM', type: 'select', oemManaged: true, required: true },
      { key: 'mtmPartNumber', label: 'MTM / Part Number', type: 'text', required: true },
      { key: 'productDescription', label: 'Product Description', type: 'text', required: true },
      { key: 'licenceCount', label: 'Licence Count', type: 'number', required: true, placeholder: 'e.g. 100' },
      { key: 'subscriptionTerm', label: 'Subscription Term', type: 'select', options: SUBSCRIPTION_TERMS, required: true },
      { key: 'renewalDate', label: 'Renewal Date', type: 'date', required: true, hint: 'Date format: DD/MM/YYYY' },
      { key: 'deploymentType', label: 'Deployment Type', type: 'select', options: DEPLOYMENT_TYPES, required: true },
      { key: 'opportunityType', label: 'Opportunity Type', type: 'select', options: OPPORTUNITY_TYPES, required: true },
      { key: 'oemDrNumber', label: 'OEM DR Number', type: 'text', required: false },
    ],
  },

  BC_MICROSOFT: {
    showQtyUnitPrice: false,
    totalValueFormula: 'LICENCE_X_PRICE',
    fields: [
      { key: 'subcategory', label: 'Subcategory', type: 'select', options: BC_MICROSOFT_SUBCATEGORIES, required: true },
      { key: 'oem', label: 'OEM', type: 'select', oemManaged: true, required: true },
      { key: 'skuId', label: 'SKU ID', type: 'text', required: true, placeholder: 'e.g. CFQ7TTC0LH18:0001', hint: 'Microsoft SKU / part number from price list' },
      { key: 'productDescription', label: 'Product Description', type: 'text', required: true },
      { key: 'licenceType', label: 'Licence Type', type: 'select', options: LICENCE_TYPES, required: true },
      { key: 'licenceCount', label: 'Licence Count', type: 'number', required: true, placeholder: 'Number of licences' },
      { key: 'renewalDate', label: 'Renewal Date', type: 'date', required: true, hint: 'Date format: DD/MM/YYYY' },
      { key: 'opportunityType', label: 'Opportunity Type', type: 'select', options: OPPORTUNITY_TYPES, required: true },
      { key: 'oemDrNumber', label: 'OEM DR Number', type: 'text', required: false },
    ],
  },

  CLOUD: {
    showQtyUnitPrice: false,
    totalValueFormula: 'MONTHLY_X_TERM',
    fields: [
      { key: 'opportunityType', label: 'Opportunity Type', type: 'select', options: CLOUD_OPPORTUNITY_TYPES, required: true },
      { key: 'cloudPlatform', label: 'Cloud Platform', type: 'select', options: CLOUD_PLATFORMS, required: true },
      { key: 'projectOverview', label: 'Project Overview', type: 'textarea', required: true },
      { key: 'customerProblem', label: 'Customer Problem', type: 'textarea', required: true },
      { key: 'commitmentTerm', label: 'Commitment Term', type: 'select', options: COMMITMENT_TERMS, required: true },
      { key: 'billingModel', label: 'Billing Model', type: 'select', options: BILLING_MODELS, required: true },
      { key: 'monthlyCommitValue', label: 'Monthly Commit Value ₹', type: 'number', required: true, placeholder: '0' },
      { key: 'pricingCalculatorLink', label: 'Pricing Calculator Link', type: 'text', required: false, placeholder: 'https://...' },
      { key: 'applicablePrograms', label: 'Applicable Programs', type: 'multiselect', oemManaged: true, required: false },
      { key: 'oemDrNumber', label: 'OEM DR Number', type: 'text', required: false },
    ],
  },
}

// Maps commitment term label to number of months for MONTHLY_X_TERM formula
export function commitmentTermToMonths(term: string): number {
  switch (term) {
    case 'Monthly': return 1
    case '1 Year': return 12
    case '2 Year': return 24
    case '3 Year': return 36
    default: return 1
  }
}
