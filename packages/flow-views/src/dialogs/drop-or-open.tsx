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
        <div class="modal is-active" style="z-index: 2000">
          <div class="modal-background has-background-grey" />
          <div
            class="modal-content"
            onKeyDown={onKeyDown}
            onKeyPress={onKeyDown}
          >
            {
              <div
                class="view-object-drop-zone"
                style="color:#666; display: block"
                onDrop={(evt: Event) => {
                  evt.preventDefault();
                  (evt.currentTarget as HTMLElement).classList.remove("drop");

                  readFiles((evt as DragEvent).dataTransfer.files).then(data =>
                    modal.onReadData(data)
                  );

                  return false;
                }}
                onDragOver={(evt: DragEvent) => {
                  (evt.currentTarget as HTMLElement).classList.add("drop");
                  return false;
                }}
                onDragLeave={(evt: DragEvent) => {
                  (evt.currentTarget as HTMLElement).classList.remove("drop");
                  return false;
                }}
              >
                <span style="line-height: 200px; text-align: center;">
                  Drag and drop file here
                </span>
              </div>
            }
            <div
              id="type-zone"
              class="view-object-drop-zone"
              style="display: none;"
            >
              <textarea
                id="type-in"
                style="overflow: hidden; color: #222; width: 100%; height: 100%; valign: none;"
              />
            </div>

            <div
              class="file is-fullwidth"
              style="border: 1px solid #ccc; padding: 2px;"
            >
              <label class="file-label">
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
                <span class="file-cta">
                  <span class="file-icon">
                    <i class="fas fa-upload" />
                  </span>
                  <span class="file-label">Choose a file…</span>
                </span>
              </label>
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
