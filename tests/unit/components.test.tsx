import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { IpCard } from '../../src/components/IpCard';
import { NodeGrid } from '../../src/components/NodeGrid';

describe('IpCard', () => {
  it('should show description when result is null', () => {
    render(<IpCard title="从国内测试" description="这是您访问国内网站所使用的IP" result={null} />);
    expect(screen.getByText('这是您访问国内网站所使用的IP')).toBeDefined();
  });

  it('should show description when status is fail', () => {
    render(<IpCard title="从国内测试" description="这是您访问国内网站所使用的IP" result={{ status: 'fail', query: 'error' } as any} />);
    expect(screen.getAllByText('这是您访问国内网站所使用的IP').length).toBeGreaterThan(0);
  });

  it('should show IP info when result is success', () => {
    const result = {
      status: 'success',
      country: 'China',
      countryCode: 'CN',
      regionName: 'Beijing',
      city: 'Beijing',
      isp: 'China Telecom',
      org: '',
      as: 'AS23724',
      query: '1.2.3.4',
      latency: 50,
    };
    render(<IpCard title="从国内测试" description="这是您访问国内网站所使用的IP" result={result} />);
    expect(screen.getByText('1.2.3.4')).toBeDefined();
    expect(screen.getByText('CN Beijing Beijing')).toBeDefined();
  });
});

describe('NodeGrid', () => {
  it('should render title and 4 cards', () => {
    const results = [
      { node: '北京', location: 'BJ', result: null },
      { node: '上海', location: 'SH', result: null },
      { node: '广州', location: 'GZ', result: null },
      { node: '深圳', location: 'SZ', result: null },
    ];
    const { container } = render(<NodeGrid title="国内节点" results={results} />);
    expect(screen.getByText('国内节点')).toBeDefined();
    const grid = container.querySelector('.grid');
    const cards = grid?.querySelectorAll('.bg-gray-100') || [];
    expect(cards.length).toBe(4);
  });
});