import { MatDropzoneComponent } from 'material';

describe('Material Library', () => {
  it('mounts', () => {
    cy.mount(MatDropzoneComponent);
    cy.contains('hello');
  });
});
