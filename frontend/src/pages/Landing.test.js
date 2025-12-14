import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Landing from './Landing';

describe('Landing page smoke test', () => {
  beforeAll(() => {
    if (!navigator.clipboard) {
      Object.assign(navigator, {
        clipboard: {
          writeText: jest.fn().mockResolvedValue(undefined),
        },
      });
    }
  });

  it('renders the hero headline and description', () => {
    render(
      <MemoryRouter>
        <Landing />
      </MemoryRouter>
    );

    expect(screen.getAllByRole('heading', { name: /AssetNest/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Complete Financial Management Solution/i).length).toBeGreaterThan(0);
  });
});

