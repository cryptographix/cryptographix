export const Environment = {
  isNode(): boolean {
    return typeof process !== "undefined";
  }
};
