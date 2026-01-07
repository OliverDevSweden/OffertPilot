import { substituteTemplate } from '../template';

describe('substituteTemplate', () => {
  it('should substitute all placeholders', () => {
    const template = 'Hej {namn}, din förfrågan om {tjänst} är mottagen. {signatur}';
    const context = {
      namn: 'Anna',
      tjänst: 'kontorsstädning',
      signatur: 'Mvh, Team',
    };
    
    const result = substituteTemplate(template, context);
    
    expect(result).toBe('Hej Anna, din förfrågan om kontorsstädning är mottagen. Mvh, Team');
  });

  it('should replace "Hej {namn}," with "Hej!" when no name', () => {
    const template = 'Hej {namn}, hur mår du?';
    const context = {
      signatur: 'Mvh',
    };
    
    const result = substituteTemplate(template, context);
    
    expect(result).toBe('Hej! hur mår du?');
  });

  it('should use default service when no tjänst provided', () => {
    const template = 'Din förfrågan om {tjänst}';
    const context = {
      signatur: 'Mvh',
    };
    
    const result = substituteTemplate(template, context);
    
    expect(result).toBe('Din förfrågan om städtjänster');
  });

  it('should handle empty signature', () => {
    const template = 'Hej {namn}. {signatur}';
    const context = {
      namn: 'Anna',
      signatur: '',
    };
    
    const result = substituteTemplate(template, context);
    
    expect(result).toBe('Hej Anna.');
  });
});
