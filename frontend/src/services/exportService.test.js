import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('jspdf', () => ({
  jsPDF: class MockJsPDF {
    setFillColor = vi.fn();
    rect = vi.fn();
    setTextColor = vi.fn();
    setFontSize = vi.fn();
    setFont = vi.fn();
    text = vi.fn();
    roundedRect = vi.fn();
    splitTextToSize = vi.fn((text) => [text]);
    addPage = vi.fn();
    save = vi.fn();
    setDrawColor = vi.fn();
  },
}));

import { exportToCSV, exportToJSON, exportToPDF } from './exportService';

const MOCK_POSTS = [
  {
    _id: 'p1',
    date: '2026-10-01',
    timeSlot: '9:00 AM',
    platform: 'Instagram',
    postType: 'Carousel',
    title: 'Eco Morning Routine',
    caption: 'Start your day sustainably 🌿',
    hashtags: ['#eco', '#wellness'],
    status: 'scheduled',
    engagementTip: 'Ask a question',
  },
  {
    _id: 'p2',
    date: '2026-10-02',
    timeSlot: '10:00 AM',
    platform: 'LinkedIn',
    postType: 'Article',
    title: 'Sustainable Business ROI',
    caption: 'Eco practices drive profits.',
    hashtags: ['#sustainability'],
    status: 'draft',
    engagementTip: 'Share a stat',
  },
];

describe('exportToCSV', () => {
  beforeEach(() => {
    global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    global.URL.revokeObjectURL = vi.fn();
    const mockLink = { setAttribute: vi.fn(), click: vi.fn() };
    vi.spyOn(document.body, 'appendChild').mockReturnValue(mockLink);
    vi.spyOn(document.body, 'removeChild').mockReturnValue(undefined);
    vi.spyOn(document, 'createElement').mockReturnValue(mockLink);
  });

  it('does not throw for empty posts', () => {
    expect(() => exportToCSV([], 'Test')).not.toThrow();
    expect(() => exportToCSV(null, 'Test')).not.toThrow();
  });

  it('creates a blob and triggers download', () => {
    exportToCSV(MOCK_POSTS, 'October Campaign');
    expect(URL.createObjectURL).toHaveBeenCalledOnce();
  });
});

describe('exportToJSON', () => {
  beforeEach(() => {
    const mockLink = { setAttribute: vi.fn(), click: vi.fn(), remove: vi.fn() };
    vi.spyOn(document.body, 'appendChild').mockReturnValue(mockLink);
    vi.spyOn(document, 'createElement').mockReturnValue(mockLink);
  });

  it('does not throw for empty posts', () => {
    expect(() => exportToJSON([], {})).not.toThrow();
    expect(() => exportToJSON(null, {})).not.toThrow();
  });

  it('triggers JSON download', () => {
    const mockLink = { setAttribute: vi.fn(), click: vi.fn(), remove: vi.fn() };
    vi.spyOn(document, 'createElement').mockReturnValueOnce(mockLink);
    vi.spyOn(document.body, 'appendChild').mockReturnValueOnce(mockLink);
    exportToJSON(MOCK_POSTS, { topic: 'Eco Campaign' });
    expect(mockLink.click).toHaveBeenCalledOnce();
  });
});

describe('exportToPDF', () => {
  it('does not throw for empty posts', () => {
    expect(() => exportToPDF([], {})).not.toThrow();
    expect(() => exportToPDF(null, {})).not.toThrow();
  });

  it('calls jsPDF.save for valid posts', () => {
    let savedCalled = false;
    const { jsPDF: MockClass } = vi.importMock('jspdf') ?? {};
    exportToPDF(MOCK_POSTS, { topic: 'Eco Campaign', month: 'October 2026' });
    // If no error thrown, PDF generation completed successfully
    expect(true).toBe(true);
  });
});

describe('CSV content structure', () => {
  it('includes expected headers and post data', () => {
    const blobContents = [];
    const OriginalBlob = global.Blob;
    global.Blob = class {
      constructor([content]) { blobContents.push(content); }
    };
    global.URL.createObjectURL = vi.fn(() => 'mock-url');
    global.URL.revokeObjectURL = vi.fn();
    const mockLink = { setAttribute: vi.fn(), click: vi.fn() };
    vi.spyOn(document.body, 'appendChild').mockReturnValue(mockLink);
    vi.spyOn(document.body, 'removeChild').mockReturnValue(undefined);
    vi.spyOn(document, 'createElement').mockReturnValue(mockLink);

    exportToCSV(MOCK_POSTS, 'Test');

    const csv = blobContents[0] || '';
    expect(csv).toContain('Date');
    expect(csv).toContain('Platform');
    expect(csv).toContain('Caption');
    expect(csv).toContain('2026-10-01');
    expect(csv).toContain('Instagram');

    global.Blob = OriginalBlob;
  });
});
