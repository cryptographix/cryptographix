import { View } from "./view";

export interface IViewModel<TView extends View<any> = any> {
  //
  _view?: TView;

  //
}
