import React from 'react';
import { render, screen } from '@testing-library/react';
import MapInterface from './MapInterface';

test('renders learn react link', () => {
  render(<MapInterface />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
