import languages from './languages';

it('includes English as a language', () => {
  expect.anything(languages.find(({ long }) => long === 'English'));
});

it('contains `short` for every language', () => {
  expect(languages.every(lang => 'short' in lang)).toBe(true);
});
