import { describe, expect, it } from 'vitest';
import { parseTariffList } from './tariffService';

describe('parseTariffList', () => {
  it('normalizes the Windows tariff list response used by the menu', () => {
    expect(parseTariffList({ Values: [{ Id: 7, Title: 'عمومی', IsActive: true, IsCurrent: false, IsMemberRegisterKindTariff: false }, { Id: 8, Title: 'کارکنان', IsActive: 'true', IsCurrent: 1, IsMemberRegisterKindTariff: 'true', PersistOn: '2026-09-14T10:30:00' }] })).toEqual([
      { id: 7, title: 'عمومی', isActive: true, isCurrent: false, isMemberTariff: false, persistedOn: null },
      { id: 8, title: 'کارکنان', isActive: true, isCurrent: true, isMemberTariff: true, persistedOn: '2026-09-14T10:30:00' },
    ]);
  });

  it('fails closed for a response that does not contain a list', () => {
    expect(parseTariffList({ Values: { Id: 1 } })).toEqual([]);
  });
});
