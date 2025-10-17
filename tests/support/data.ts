// tests/support/data.ts
export const Creds = {
  password: 'example',
  makeEmail: (seed: string = Date.now().toString()) => `e2e.${seed}@example.com`,
};

export const NameData = {
  validNume: ['Popescu', 'Ionescu', 'Marin'],
  validPrenume: ['Ana', 'Mihai', 'Elena'],
  tooShort: [''],
  tooLong: ['A'.repeat(31)],
  withDigits: ['Popescu2'],
  withSymbols: ['Popescu-Ion', 'Ștefan'],
};

export const PasswordData = {
  valid: ['Parola1', 'Qa2025#', 'A1aaaa!'],
  tooShort: ['A1a!5'],
  tooLong: ['A1' + 'a'.repeat(39) + '!'],
  noDigit: ['Parola!'],
  noLetter: ['123456!'],
  illegalChars: ['Abc1_'],
  confirmMismatch: { pass: 'Qa2025#', confirm: 'Qa2024#' },
};

export const ProfesieData = {
  valid: ['QA Engineer', 'Student'],
  tooShort: [''],
  tooLong: ['X'.repeat(101)],
};

export const TelefonData = {
  valid: ['0712345678'],
  invalid: {
    notTen: ['071234567', '07123456789'],
    notStart07: ['0612345678', '7912345678', '+40712345678'],
    withSpaces: ['07 1234 5678'],
    withLetters: ['07abc45678'],
  },
};

export const DobData = {
  adultISO: (() => {
    const d = new Date(); d.setFullYear(d.getFullYear() - 18);
    return d.toISOString().slice(0, 10);
  })(),
  minorISO: (() => {
    const d = new Date(); d.setFullYear(d.getFullYear() - 17);
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  })(),
  futureISO: (() => {
    const d = new Date(); d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  })(),
};

export const EducatieData = {
  valid: ['Facultatea X, 2019–2023'],
  tooLong: ['Y'.repeat(257)],
};

export const SkillsData = {
  engleza: { defaultsTo: 'Mediu', allowedToRegister: ['Mediu', 'Avansat'] },
  office: ['Incepator', 'Mediu', 'Avansat'],
  web: ['Incepator', 'Mediu', 'Avansat'],
};

export const ModuleData = {
  modules: [
    { label: 'Initiere in Software Testing', value: 'mod1', price: 900 },
    { label: 'Introducere in Test Automation', value: 'mod2', price: 1500 },
    { label: 'Initiere in REST API testing', value: 'mod3', price: 1500 },
  ],
  maxSlots: 15,
};

export const PaymentData = {
  metoda: { online: 'Online', transfer: 'Transfer Bancar' },
  tip: { integral: 'Integral', rate: 'In doua rate' },
};
