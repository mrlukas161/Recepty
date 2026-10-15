import { describe, it, expect } from 'vitest';
import { RECEPTY } from '../src/data';
import { TYPY_ILUSTRACII, typIlustracie, emojiMaIlustraciu, KARTA_IKONY } from '../src/ui/ilustracia';
import { VEDOMOSTI } from '../src/data/vedomosti';
import { NAHRADY } from '../src/data/nahrady';

describe('ilustrácie', () => {
  it('každá kategória jedla má vlastnú ilustráciu', () => {
    for (const t of ['ranajky', 'obed', 'vecera', 'polievka', 'desiata', 'dezert']) expect(TYPY_ILUSTRACII, t).toContain(t);
  });
  it('každý recept má ilustráciu a každé emoji z dát je namapované', () => {
    for (const r of RECEPTY) {
      expect(TYPY_ILUSTRACII, r.id).toContain(typIlustracie(r));
      if (r.ilustracia && !['🟢', '🟤'].includes(r.ilustracia)) expect(emojiMaIlustraciu(r.ilustracia), `${r.id} ${r.ilustracia}`).toBe(true);
    }
  });
  it('navigácia a ruleta majú ilustrácie', () => {
    for (const t of ['nav-dnes', 'nav-recepty', 'nav-jedalnicek', 'nav-nakup', 'nav-viac', 'ruleta']) expect(TYPY_ILUSTRACII).toContain(t);
  });
  it('ikony v ponuke Viac, vedomostiach a náhradách majú ilustráciu (bez emoji)', () => {
    for (const e of [...VEDOMOSTI.map((v) => v.ikona), ...NAHRADY.map((n) => n.ikona), '🔁', '🥗', '📚', '📷', '🎰', '📲', '⚙️']) expect(KARTA_IKONY(e), e).toBeTruthy();
  });
});
