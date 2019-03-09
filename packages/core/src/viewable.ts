export interface IViewable {
  _view?: IView;

  bindView?( view: IView ): () => void;
  unbindView?(): void;
}

export interface IView<VE = any> {
  _model: IViewable;

//  new<T extends IView>( model?: IViewable ): T;

  update(): void;

  render(): VE;
}
