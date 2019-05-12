import {
  View,
  Transformer,
  IActionHandler,
  //  AnySchemaProperty,
  ByteArray
} from "@cryptographix/core";
import { PropertyView, DropOrOpenDialog } from "@cryptographix/flow-views";

import { DropdownIcon } from "./drop-down-icon";

export function InputBytesView(
  handler: IActionHandler,
  transformer: Transformer,
  key: string
) {
  const view = (
    <PropertyView
      handler={handler}
      propRef={{
        target: transformer,
        key: key,
        propertyType: transformer.helper.getSchemaProp(key)
      }}
    >
      <a
        class="icon has-text-white is-unselectable"
        title="Copy to Clipboard"
        onClick={() => {
          let $el = view.element.getElementsByTagName("textarea")[0];
          $el.select();
          document.execCommand("copy");
        }}
      >
        <i class="fas fa-copy" />
      </a>
      <a
        class="icon has-text-white is-unselectable"
        title="Upload as File"
        onClick={() => {
          let dropOrOpenView: DropOrOpenDialog;

          View.appendChild(
            view.element.parentNode,
            (dropOrOpenView = (
              <DropOrOpenDialog
                onReadData={data => {
                  dropOrOpenView.close();
                  //view.removeChildView(dropOrOpenView);

                  transformer[key] = new ByteArray(data);

                  view.refresh();
                }}
              />
            ))
          );
        }}
      >
        <i class="fas fa-upload" />
      </a>
      <DropdownIcon
        onChange={option => {
          view.options["format"] = option;
          view.refresh();
        }}
        options={["HEX", "BASE64", "UTF8"]}
      />
      <a
        class="icon has-text-white is-unselectable"
        title="Clear"
        onClick={() => {
          transformer[key] = new ByteArray();
          view.refresh();
        }}
      >
        <i class="fas fa-trash-alt" />
      </a>
    </PropertyView>
  );

  return view;
}
