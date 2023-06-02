const memory = require('../../src/model/data/memory/index');

describe('memory', () => {
  test('writeFragment() returns nothing', async () => {
    let fragment = {
      ownerId: 'a',
      id: 'b',
    };
    const result = await memory.writeFragment(fragment);
    expect(result).toBe(undefined);
  });

  test('writeFragmentData() returns nothing', async () => {
    const result = await memory.writeFragmentData('a', 'b', Buffer.from([1, 2, 3]));
    expect(result).toBe(undefined);
  });

  test('readFragment() returns correct value', async () => {
    let fragment = {
      ownerId: 'a',
      id: 'b',
    };
    await memory.writeFragment(fragment);
    const result = await memory.readFragment('a', 'b');
    expect(result).toEqual(fragment);
  });

  test('readFragmentData() returns correct value', async () => {
    await memory.writeFragmentData('a', 'b', Buffer.from([1, 2, 3]));
    const result = await memory.readFragmentData('a', 'b');
    expect(result).toEqual(Buffer.from([1, 2, 3]));
  });
});
