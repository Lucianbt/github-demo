// tests/support/selectors.ts
export const Url = {
  base: 'https://ver3.academiatestarii.ro/',
  formPath: 'index.php/formular/',
  accountPath: 'index.php/my-account/',
};

export const Nav = {
  // Link to the Formular page (header and cards both point here)
  linkForm: `a[href*="${Url.formPath}"]`,
  // WordPress/Woo logout in header; multiple variants may exist (icon/text)
  logoutAny: 'header a[href*="action=logout"], header a[href*="customer-logout"]',
};

export const Register = {
  // WooCommerce register block on /formular/
  email: '#reg_email',
  password: '#reg_password',
  antiSpam: 'input[type="text"][name*="anti" i], input[placeholder*="Anti" i]',
  submit: 'button[name="register"], input[name="register"]',
};

export const Login = {
  // WooCommerce login block (reused on /my-account/)
  username: '#username',
  password: '#password',
  submit: 'button[name="login"], input[name="login"]',
};

export const Form = {
  // Main long registration form (Romanian site). These are *best-effort*
  // CSS hooks—adjust once you confirm exact attributes in DOM.
  // Prefer id / name / data-* when available.
  nume: 'input#nume, input[name="nume"], input[name*="nume" i]',
  prenume: 'input#prenume, input[name="prenume"], input[name*="prenume" i]',
  parola: 'input#parola, input[name="parola"], input[name*="parola" i]',
  confirmaParola: 'input#confirmare_parola, input[name*="confirm" i]',
  profesie: 'input#profesie, input[name*="profesie" i]',
  telefon: 'input#telefon, input[type="tel"], input[name*="telefon" i]',
  dataNastere: 'input#data_nastere, input[type="date"], input[name*="nastere" i]',
  modulDorit: 'select#modul, select[name*="modul" i]',
  perioadaDorita: 'select#perioada, select[name*="perioada" i]',
  educatie: 'textarea#educatie, textarea[name*="educatie" i]',
  educatieSkip: 'input[type="checkbox"][name*="nu_doresc" i], input[type="checkbox"][id*="nu_doresc" i]',
  engleza: 'select#engleza, select[name*="engleza" i]',
  office: 'select#office, select[name*="office" i]',
  web: 'select#web, select[name*="web" i]',
  metodaPlata: 'input[type="radio"][name*="metoda" i], select[name*="metoda" i]',
  tipPlata: 'input[type="radio"][name*="tip" i], select[name*="tip" i]',
  terms: 'input[type="checkbox"][name*="termen" i]',
  conditiiMinime: 'input[type="checkbox"][name*="conditii" i]',
  submit: 'form button[type="submit"], form input[type="submit"]',
  // Visual validation (red outline). Fine-tune once you inspect the actual CSS class:
  invalidField: '.error, .is-invalid, input:invalid, textarea:invalid, select:invalid',
};
