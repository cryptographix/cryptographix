import { ByteArray } from "@cryptographix/core";
import { CommandAPDU } from "./command-apdu";
import { ResponseAPDU } from "./response-apdu";

export interface Slot {
  isPresent: boolean;
  isPowered: boolean;

  powerOn(): Promise<ByteArray>;
  powerOff(): Promise<ByteArray>;
  reset(): Promise<ByteArray>;

  executeAPDU(commandAPDU: CommandAPDU): Promise<ResponseAPDU>;
}
