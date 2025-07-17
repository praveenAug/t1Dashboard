jest.mock('next/dynamic', () => {
  return (importFunc: () => any) => importFunc(); // Simply mock the import to always resolve immediately
});
import '@testing-library/jest-dom';