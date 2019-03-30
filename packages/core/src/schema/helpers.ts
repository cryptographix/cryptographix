export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export type IConstructable<T extends Object = {}> = {
  new (...args: unknown[]): T;
};

export function constructorToClass<T>(func: Function) {
  return func as IConstructable<T>;
}
