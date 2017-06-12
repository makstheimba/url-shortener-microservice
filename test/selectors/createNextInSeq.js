const { expect } = require('chai');

const createNextInSeq = require.main.require('selectors/createNextInSeq');

describe('sequence generator', () => {
  const seqEnd = 'abcd123';
  const newSeqEnd = createNextInSeq(seqEnd);

  it('should return a string', () => {
    expect(newSeqEnd).to.be.a('string');
  });
  it('should return next string in sequence', () => {
    expect(newSeqEnd).to.equal('abcd124');
  });
});
