import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  Card,
  Badge,
  Button,
  Tabs,
  Callout,
  Checkbox,
  Accordion,
} from '../src/ui/components';
import { FloatingButton } from '../src/ui/FloatingButton';

describe('UI Component Library', () => {
  it('renders Card with content and variant', () => {
    const { getByText } = render(<Card variant="interactive">Hello Card</Card>);
    expect(getByText('Hello Card')).toBeDefined();
  });

  it('renders Badge with difficulty styles', () => {
    const { getByText } = render(<Badge variant="easy">Easy Problem</Badge>);
    const el = getByText('Easy Problem');
    expect(el).toBeDefined();
  });

  it('handles Button clicks and disabled state', () => {
    const handleClick = vi.fn();
    const { getByText } = render(
      <Button variant="primary" onClick={handleClick}>
        Analyze
      </Button>
    );

    const btn = getByText('Analyze');
    fireEvent.click(btn);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('handles Tabs item clicks and triggers onChange', () => {
    const handleTabChange = vi.fn();
    const tabs = [
      { id: 'tab1', label: 'Tab 1' },
      { id: 'tab2', label: 'Tab 2' },
    ];

    const { getByText } = render(
      <Tabs tabs={tabs} activeId="tab1" onChange={handleTabChange} />
    );

    const tab2 = getByText('Tab 2');
    fireEvent.click(tab2);
    expect(handleTabChange).toHaveBeenCalledWith('tab2');
  });

  it('renders Callout with title and children', () => {
    const { getByText } = render(
      <Callout variant="warn" title="TLE Alert">
        Be careful with O(n^2) loops.
      </Callout>
    );

    expect(getByText('TLE Alert')).toBeDefined();
    expect(getByText('Be careful with O(n^2) loops.')).toBeDefined();
  });

  it('handles Checkbox toggle', () => {
    const handleChange = vi.fn();
    const { getByLabelText } = render(
      <Checkbox
        id="test-cb"
        checked={false}
        onChange={handleChange}
        label="Step 1 Completed"
      />
    );

    const cb = getByLabelText('Step 1 Completed');
    fireEvent.click(cb);
    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it('toggles Accordion open/close', () => {
    const { getByText, queryByText } = render(
      <Accordion title="Step 1: Observe" defaultOpen={false}>
        Hidden inner content
      </Accordion>
    );

    expect(queryByText('Hidden inner content')).toBeNull();
    const btn = getByText('Step 1: Observe');
    fireEvent.click(btn);
    expect(getByText('Hidden inner content')).toBeDefined();
  });

  it('renders FloatingButton with progress ring', () => {
    const handleClick = vi.fn();
    const { getByLabelText } = render(
      <FloatingButton isOpen={false} onClick={handleClick} progressStep={3} totalSteps={8} />
    );

    const btn = getByLabelText(/Open DsaKode/i);
    fireEvent.click(btn);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
