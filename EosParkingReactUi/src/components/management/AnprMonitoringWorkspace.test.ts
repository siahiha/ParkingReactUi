import { describe, expect, it } from 'vitest';
import { selectAnprRowAfterRefresh } from './anprSelection';

const row = (id: number) => ({ Id: id });

describe('selectAnprRowAfterRefresh', () => {
  it('selects the new first row when the previous first row was selected', () => {
    const previousRows = [row(10), row(9)];
    const nextRows = [row(11), row(10), row(9)];

    expect(selectAnprRowAfterRefresh(previousRows, nextRows, '10', false, (item) => String(item.Id))).toEqual(row(11));
  });

  it('keeps the selected record when a later row was selected', () => {
    const previousRows = [row(10), row(9), row(8)];
    const nextRows = [row(11), row(10), row(9), row(8)];

    expect(selectAnprRowAfterRefresh(previousRows, nextRows, '9', false, (item) => String(item.Id))).toEqual(row(9));
  });
});
