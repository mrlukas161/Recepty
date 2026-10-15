import { describe, it, expect } from 'vitest';
import { najdiCasy, popisCasu, odpocet } from '../src/engine/casovac';

const c = (t: string) => najdiCasy(t).map((x) => [x.odS, x.doS]);

describe('časovač – parser', () => {
  it('jedna hodnota', () => {
    expect(c('Varte 3 minúty.')).toEqual([[180, 180]]);
    expect(c('po 2 minútach')).toEqual([[120, 120]]);
    expect(c('Opekaj 30 sekúnd')).toEqual([[30, 30]]);
    expect(c('1 minútu')).toEqual([[60, 60]]);
  });
  it('rozsahy', () => {
    expect(c('Peč 45 – 60 minút')).toEqual([[2700, 3600]]);
    expect(c('3–4 minúty')).toEqual([[180, 240]]);
    expect(c('2–3 hodiny')).toEqual([[7200, 10800]]);
  });
  it('desatinné a slovné', () => {
    expect(c('Duste 1,5 hodiny')).toEqual([[5400, 5400]]);
    expect(c('Varte pol hodiny')).toEqual([[1800, 1800]]);
    expect(c('Varte 1 a pol hodiny')).toEqual([[5400, 5400]]);
    expect(c('Varte hodinu')).toEqual([[3600, 3600]]);
    expect(c('aspoň 4 hodiny')).toEqual([[14400, 14400]]);
  });
  it('nerozpoznáva neurčité ani cudzie údaje', () => {
    expect(c('Nechaj cez noc v chladničke.')).toEqual([]);
    expect(c('Rúru predhrej na 180 °C a nakrájaj 5 cm kocky.')).toEqual([]);
    expect(c('Rozdeľ na 3 porcie')).toEqual([]);
  });
  it('viac časov v kroku bez duplicít', () => {
    expect(c('Smaž 4 minúty, potom ešte 4 minúty a 10 minút nechaj.')).toEqual([[240, 240], [600, 600]]);
  });
  it('formátovanie', () => {
    expect(popisCasu(45)).toBe('45 s');
    expect(popisCasu(180)).toBe('3 min');
    expect(popisCasu(5400)).toBe('1 h 30 min');
    expect(odpocet(65000)).toBe('01:05');
    expect(odpocet(3661000)).toBe('1:01:01');
    expect(odpocet(-5)).toBe('00:00');
  });
});
