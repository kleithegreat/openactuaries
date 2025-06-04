import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Button', () => {
  it('applies primary variant classes', () => {
    render(<Button variant="primary">Click</Button>);
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('bg-primary');
  });

  it('applies outline variant classes', () => {
    render(<Button variant="outline">Click</Button>);
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('border');
  });
});
