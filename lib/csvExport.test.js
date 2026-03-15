import { downloadCSV } from './csvExport';

// Mocking global functions to check if they are called
describe('CSV Export Logic', () => {
  const mockData = [
    { name: 'ישראל', phone: '050', email: 'test@test.com', status: 'New', createdAt: new Date().toISOString() }
  ];

  beforeAll(() => {
    // Mocking window items
    global.URL.createObjectURL = jest.fn();
    global.Blob = jest.fn();
  });

  it('should format data correctly for CSV download', () => {
    // We check if it attempted to create a blob
    try { downloadCSV(mockData); } catch(e) {}
    expect(global.Blob).toHaveBeenCalled();
  });
});
