import { bindable } from 'aurelia-framework';
import './uilib-welcome.scss';

export class UilibWelcome {
  @bindable value = 'UilibWelcome';
  viewModelName: string;
  viewModel: string;

  activate(params) {
    if (params.viewModelName) {
      const { viewModelName } = params;
      console.log(
        'TCL: UilibWelcome -> activate -> viewModelName',
        viewModelName
      );
      this.viewModelName = viewModelName as string;
      this.viewModel = `../${viewModelName}/${viewModelName}`;
    }
  }
}
