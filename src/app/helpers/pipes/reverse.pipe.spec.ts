import { ReversePipe } from './reverse.pipe';

describe('Isolated test for this pipe', () => {
  it('Should reverse words', () => {
    let reversePipe = new ReversePipe();
    expect(reversePipe.transform('test')).toEqual('tset');
  });
});
