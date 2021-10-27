import React from 'react';
import { render, screen } from '@testing-library/react';
import MapComponent from './MapComponent';

test('renders learn react link', () => {
  render(<MapComponent />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
