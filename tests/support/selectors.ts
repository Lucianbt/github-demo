// tests/support/selectors.ts
export const Url = {
  base: 'https://ver3.academiatestarii.ro/',
  formPath: 'index.php/formular/',
  accountPath: 'index.php/my-account/',
};

export const Nav = {
  linkForm: `a[href*="${Url.formPath}"]`,
  logoutAny: 'header a[href*="action=logout"], header a[href*="customer-logout"]',
};

export const Register = {
  email: '#reg_email',
  password: '#reg_password',
  antiSpam: 'input[type="text"][name*="anti" i], input[placeholder*="Anti" i]',
  submit: 'button[name="register"], input[name="register"]',
};

export const Login = {
  username: '#username',
  password: '#password',
  submit: 'button[name="login"], input[name="login"]',
};

export const Form = {
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
  invalidField: '.error, .is-invalid, input:invalid, textarea:invalid, select:invalid',
};
