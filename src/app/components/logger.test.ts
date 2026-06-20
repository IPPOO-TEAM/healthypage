import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { log, setLogSink, type LogSink } from './logger';

describe('logger – redaction PII', () => {
  let warn: ReturnType<typeof vi.spyOn>;
  let error: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    error = vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => {
    warn.mockRestore();
    error.mockRestore();
    setLogSink(null);
  });

  it('redige les clés PII dans la meta', () => {
    log.error('boom', {
      email: 'a@b.co', phone: '+22901', password: 'secret', token: 'jwt',
      patientId: 'p1', backendId: 'b1', allergies: ['x'], statusCode: 500,
    });
    const [, meta] = error.mock.calls[0];
    expect(meta).toMatchObject({
      email: '[redacted]', phone: '[redacted]', password: '[redacted]',
      token: '[redacted]', patientId: '[redacted]', backendId: '[redacted]',
      allergies: '[redacted]', statusCode: 500,
    });
  });

  it('warn passe par console.warn avec préfixe [hp]', () => {
    log.warn('soft fail');
    expect(warn).toHaveBeenCalledWith('[hp] soft fail');
  });

  it('appelle le sink avec la meta déjà redigée', () => {
    const sink = vi.fn<Parameters<LogSink>, void>();
    setLogSink(sink);
    log.error('boom', { email: 'a@b.co', count: 3 });
    expect(sink).toHaveBeenCalledWith('error', 'boom',
      expect.objectContaining({ email: '[redacted]', count: 3 }));
  });

  it('un sink qui throw ne casse pas le log', () => {
    setLogSink(() => { throw new Error('sink down'); });
    expect(() => log.error('still works')).not.toThrow();
    expect(error).toHaveBeenCalled();
  });

  it('debug/info préfixent par [hp] quand actifs', () => {
    const debug = vi.spyOn(console, 'debug').mockImplementation(() => {});
    const info  = vi.spyOn(console, 'info').mockImplementation(() => {});
    log.debug('x');
    log.info('y');
    // Selon import.meta.env.DEV, debug/info peuvent être silenceux ou pas.
    // On vérifie juste que, s'ils sont appelés, c'est avec le bon préfixe.
    if (debug.mock.calls.length) expect(debug).toHaveBeenCalledWith('[hp] x');
    if (info.mock.calls.length)  expect(info).toHaveBeenCalledWith('[hp] y');
    debug.mockRestore();
    info.mockRestore();
  });
});
