import { bindable } from 'aurelia-framework';
// import './apps-welcome.scss';

export class AppsWelcome {
  @bindable value = 'AppsWelcome';
  viewModelName: string;
  viewModel: string;

  activate(params: { viewModelName: string }) {
    if (params.viewModelName) {
      const { viewModelName } = params;
      // console.log(
      //   'TCL: UilibWelcome -> activate -> viewModelName',
      //   viewModelName
      // );
      this.viewModelName = viewModelName;
      this.viewModel = `../${viewModelName}/${viewModelName}`;
    }
  }
}
