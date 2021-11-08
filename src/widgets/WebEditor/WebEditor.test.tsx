import React from 'react';
import { render, screen } from '@testing-library/react';
import WebEditor from './WebEditor';

test('renders learn react link', () => {
  render(<WebEditor />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
