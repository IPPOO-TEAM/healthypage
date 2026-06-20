import { describe, it, expect } from 'vitest';
import {
  validateEmail,
  validatePhoneE164,
  validateLoginIdentifier,
  validatePassword,
  validateName,
  validateDob,
  sanitizeText,
  escapeHtml,
  normalizeIdentifier,
} from './validators';

describe('validateEmail', () => {
  it.each([
    'a@b.co',
    'patient.demo+test@healthypage.bj',
    'aïcha@cotonou.bj',
  ])('accepte %s', (v) => expect(validateEmail(v).ok).toBe(true));

  it.each([
    '',
    'no-at-sign',
    'a@b',
    'a@.co',
    'a b@c.co',
  ])('rejette %s', (v) => expect(validateEmail(v).ok).toBe(false));

  it('rejette les emails > 254 caractères', () => {
    const long = 'a'.repeat(250) + '@b.co';
    expect(validateEmail(long).ok).toBe(false);
  });
});

describe('validatePhoneE164', () => {
  it('accepte un format E.164 valide', () => {
    expect(validatePhoneE164('+22901971234').ok).toBe(true);
    expect(validatePhoneE164('+229 01 97 12 34').ok).toBe(true); // espaces tolérés
  });
  it('rejette les formats locaux ou trop courts', () => {
    expect(validatePhoneE164('0197123456').ok).toBe(false);
    expect(validatePhoneE164('+229').ok).toBe(false);
    expect(validatePhoneE164('').ok).toBe(false);
  });
});

describe('validateLoginIdentifier', () => {
  it('route vers email si présence du @', () => {
    expect(validateLoginIdentifier('user@bar.co').ok).toBe(true);
    expect(validateLoginIdentifier('user@bad').ok).toBe(false);
  });
  it('route vers téléphone sinon', () => {
    expect(validateLoginIdentifier('+22901971234').ok).toBe(true);
    expect(validateLoginIdentifier('abc').ok).toBe(false);
  });
});

describe('validatePassword', () => {
  it('accepte un mot de passe conforme', () => {
    expect(validatePassword('Healthy2026').ok).toBe(true);
  });
  it('rejette trop court', () => {
    expect(validatePassword('Aa1').ok).toBe(false);
  });
  it('exige une lettre', () => {
    expect(validatePassword('12345678').ok).toBe(false);
  });
  it('exige un chiffre', () => {
    expect(validatePassword('abcdefgh').ok).toBe(false);
  });
  it('rejette la répétition triviale', () => {
    expect(validatePassword('aaaaaaaaaa').ok).toBe(false);
  });
});

describe('validateName', () => {
  it('accepte les noms unicode et composés', () => {
    expect(validateName('Aïcha').ok).toBe(true);
    expect(validateName("N'Diaye").ok).toBe(true);
    expect(validateName('Marie-Claire').ok).toBe(true);
  });
  it('rejette les noms trop courts ou caractères invalides', () => {
    expect(validateName('A').ok).toBe(false);
    expect(validateName('John123').ok).toBe(false);
    expect(validateName('<script>').ok).toBe(false);
  });
});

describe('validateDob', () => {
  it('accepte une date ISO réaliste', () => {
    expect(validateDob('1992-04-15').ok).toBe(true);
  });
  it('rejette format non ISO', () => {
    expect(validateDob('15/04/1992').ok).toBe(false);
  });
  it('rejette futur ou < 1900', () => {
    expect(validateDob('1850-01-01').ok).toBe(false);
    expect(validateDob('3000-01-01').ok).toBe(false);
  });
});

describe('sanitizeText', () => {
  it('retire les caractères de contrôle ASCII', () => {
    const dirty = 'hello\x00world\x1F!';
    expect(sanitizeText(dirty)).toBe('helloworld!');
  });
  it('tronque à maxLen', () => {
    expect(sanitizeText('a'.repeat(1000), 10)).toBe('aaaaaaaaaa');
  });
});

describe('escapeHtml', () => {
  it('échappe les caractères HTML dangereux', () => {
    expect(escapeHtml('<script>alert(1)</script>'))
      .toBe('&lt;script&gt;alert(1)&lt;/script&gt;');
    expect(escapeHtml(`"o'reilly" & co`))
      .toBe('&quot;o&#39;reilly&quot; &amp; co');
  });
});

describe('normalizeIdentifier', () => {
  it('lowercase + retire les espaces', () => {
    expect(normalizeIdentifier('  UseR @ Foo.CO  ')).toBe('user@foo.co');
  });
});
