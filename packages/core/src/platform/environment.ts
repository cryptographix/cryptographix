const env = {
  isNode: typeof process !== "undefined"
};

export namespace Environment {
  export function isNode(): boolean {
    return env.isNode;
  }
}
