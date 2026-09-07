export const MEDICATIONS = [
  {
    id: 'jardiance-duo',
    name: '자디앙듀오',
    timing: ['아침 식후', '저녁 식후'],
    times: ['08:00', '20:00'],
    category: '당뇨'
  },
  {
    id: 'crestor',
    name: '크레스토',
    timing: ['아침 식전'],
    times: ['07:00'],
    category: '고지혈증'
  },
  {
    id: 'diamicron',
    name: '디아미크롱서방정',
    timing: ['아침 식전'],
    times: ['07:30'],
    category: '당뇨'
  },
  {
    id: 'lipidil-supra',
    name: '리피딜슈프라',
    timing: ['저녁 식후'],
    times: ['20:30'],
    category: '고지혈증'
  },
  {
    id: 'synthroid',
    name: '씬지로이드',
    timing: ['아침 식전'],
    times: ['06:30'],
    category: '갑상선'
  },
  {
    id: 'tetron',
    name: '테트로닌',
    timing: ['아침 식전'],
    times: ['06:45'],
    category: '갑상선'
  },
  {
    id: 'uhlex',
    name: '유힐릭스',
    timing: ['매일'],
    times: ['09:00'],
    category: '탈모'
  }
];

export const BLOOD_TEST_ITEMS = [
  { id: 'hba1c', name: 'HbA1c', unit: '%', normal_range: '< 5.7%' },
  { id: 'fasting_glucose', name: '공복 혈당', unit: 'mg/dL', normal_range: '70-100' },
  { id: 'alt', name: 'ALT (간효소)', unit: 'U/L', normal_range: '7-56' },
  { id: 'ast', name: 'AST (간효소)', unit: 'U/L', normal_range: '10-40' },
  { id: 'hdl', name: 'HDL 콜레스테롤', unit: 'mg/dL', normal_range: '> 40' },
  { id: 'ldl', name: 'LDL 콜레스테롤', unit: 'mg/dL', normal_range: '< 100' },
  { id: 'triglycerides', name: '중성지방', unit: 'mg/dL', normal_range: '< 150' },
  { id: 'tsh', name: 'TSH (갑상선)', unit: 'mIU/L', normal_range: '0.4-4.0' },
  { id: 'free_t4', name: 'Free T4', unit: 'ng/dL', normal_range: '0.8-1.8' }
];

export const INSURANCE_DEADLINES = [
  {
    id: 'diabetes',
    disease: '당뇨병',
    deadline: new Date(2027, 1, 11), // 2027-02-11
    category: '실손보험'
  },
  {
    id: 'thyroid',
    disease: '갑상선질환',
    deadline: new Date(2027, 1, 12), // 2027-02-12
    category: '실손보험'
  }
];

export const EXEMPT_PERIODS = [
  {
    id: 'diabetes-exempt',
    disease: '당뇨병',
    insuranceStartDate: new Date(2024, 0, 1), // 2024-01-01
    exemptDays: 90, // 90일 면책기간
    category: '실손보험'
  },
  {
    id: 'thyroid-exempt',
    disease: '갑상선질환',
    insuranceStartDate: new Date(2024, 0, 15), // 2024-01-15
    exemptDays: 90,
    category: '실손보험'
  }
];
