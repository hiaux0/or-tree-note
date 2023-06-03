import { bootstrap } from 'aurelia-bootstrapper';
import { PLATFORM } from 'aurelia-pal';
import { ComponentTester, StageComponent } from 'aurelia-testing';

describe('Stage App Component', () => {
  let component: ComponentTester;

  beforeEach(() => {
    component = StageComponent.withResources(PLATFORM.moduleName('app')).inView(
      '<app></app>'
    );
  });

  afterEach(() => component.dispose());

  it('should render message', (done) => {
    component
      .create(bootstrap)
      .then(() => {
        const view = component.element;
        expect(view.textContent?.trim()).toBeTruthy();
        done();
      })
      .catch((e) => {
        fail(e);
        done();
      });
  });
});
