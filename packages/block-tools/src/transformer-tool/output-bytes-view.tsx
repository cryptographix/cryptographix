import {
  View,
  Transformer,
  IActionHandler,
  AnySchemaProperty,
  ByteArray
} from "@cryptographix/core";
import { PropertyView, DropOrOpenDialog } from "@cryptographix/flow-views";

import { DropdownIcon } from "./drop-down-icon";

export function OutputBytesView(
  handler: IActionHandler,
  transformer: Transformer,
  key: string
) {
  const view = (
    <PropertyView
      handler={handler}
      readOnly
      propRef={{
        target: transformer,
        key: key,
        propertyType: transformer.helper.getPropSchema(key)
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
        title="Download as File"
        onClick={() => {
          const blob = new Blob(
            [ByteArray.toString(transformer[key], view.byteFormat)],
            {
              type: "text/plain;charset=utf-8"
            }
          );

          var downloadUrl = window.URL.createObjectURL(blob);

          var a = document.createElement("a");
          a.style.display = "none";

          if (typeof a.download === "undefined") {
            let loc = new Location();
            loc.assign(downloadUrl);
            window.location = loc;
          } else {
            a.href = downloadUrl;
            a.download = "data.txt";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          }
          //
        }}
      >
        <i class="fas fa-download" />
      </a>
      <DropdownIcon
        onChange={option => {
          view.options["format"] = option;
          view.refresh();
        }}
        options={["HEX", "BASE64", "UTF8"]}
      />
      <a class="icon has-text-white" title="Fullscreen">
        <i class="fas fa-arrows-alt"> </i>
      </a>
    </PropertyView>
  );

  return view;
}
