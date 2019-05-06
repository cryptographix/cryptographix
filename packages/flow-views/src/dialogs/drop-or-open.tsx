import { View } from "@cryptographix/core";

export class DropOrOpenDialog extends View {
  protected isVisible = true;

  onReadData: (data: ArrayBuffer) => void;

  constructor(props: { onReadData: (data: ArrayBuffer) => void }) {
    super();

    this.onReadData = props.onReadData;
    //
  }

  close() {
    this.isVisible = false;
    this.refresh();
  }

  render() {
    let modal = this;

    function onKeyDown(evt: KeyboardEvent) {
      if (evt.which == 13) {
        evt.preventDefault();
      } else if (evt.which == 27) {
        evt.preventDefault();

        modal.isVisible = false;
        modal.refresh();
      }
    }

    return (
      this.isVisible && (
        <div
          class="modal is-active"
          style="z-index: 2000"
          onDrop={(evt: Event) => {
            evt.preventDefault();
            (evt.currentTarget as HTMLElement)
              .getElementsByClassName("view-object-drop-zone")[0]
              .classList.remove("drop");

            readFiles((evt as DragEvent).dataTransfer.files).then(data =>
              modal.onReadData(data)
            );

            return false;
          }}
          onDragOver={(evt: DragEvent) => {
            (evt.currentTarget as HTMLElement)
              .getElementsByClassName("view-object-drop-zone")[0]
              .classList.add("drop");
            return false;
          }}
          onDragLeave={(evt: DragEvent) => {
            (evt.currentTarget as HTMLElement)
              .getElementsByClassName("view-object-drop-zone")[0]
              .classList.remove("drop");
            return false;
          }}
        >
          <div class="modal-background has-background-grey" />
          <div
            class="modal-content view-object-drop-zone"
            onKeyDown={onKeyDown}
            onKeyPress={onKeyDown}
            style="color:#666;"
          >
            <div class="level" style="height: 75px">
              <div
                class="level-item"
                style="justify-content: center; cursor: alias;"
              >
                <label class="label is-size-3" style="cursor: alias;">
                  DROP A FILE
                </label>
              </div>
              <div
                class="level-right"
                style="position: relative; height: 60px; background-color: #91917d; border-radius: 0px 3px 3px 0px; padding-left: 1rem; margin-right: 1rem"
              >
                <label class="level-item">
                  <span class="icon is-large">
                    <i class="fas fa-upload fa-2x" />
                  </span>
                  <input
                    class="file-input"
                    type="file"
                    name="resume"
                    onChange={(evt: Event) => {
                      readFiles(
                        (evt.currentTarget as HTMLInputElement).files
                      ).then(data => modal.onReadData(data));
                    }}
                  />
                </label>
                <label class="level-item is-size-3">OR CLICK HERE…</label>
              </div>
            </div>
          </div>

          <button
            class="modal-close is-large"
            aria-label="close"
            onClick={() => {
              modal.isVisible = false;
              modal.refresh();
            }}
          />
        </div>
      )
    );
  }
}

function readFiles(files: FileList): Promise<ArrayBuffer> {
  const file = files[0];
  const reader = new FileReader();

  let resolve: (res: ArrayBuffer) => any;
  let reject: (reason: any) => any;

  reader.onload = (event: ProgressEvent) => {
    resolve((event.target as any).result as ArrayBuffer);
  };

  reader.onerror = event => {
    reader.abort();

    reject(event);
  };

  //alert(file.name);
  reader.readAsArrayBuffer(file);
  return new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
}
