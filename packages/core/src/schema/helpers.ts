export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export type Writable<T> = { -readonly [P in keyof T]: T[P] };

export function Writable<T>(obj: T): Writable<T> {
  return obj;
}

export type IConstructable<T extends Object = {}> = {
  new (...args: unknown[]): T;
};

export function constructorToClass<T>(func: Function) {
  return func as IConstructable<T>;
}
