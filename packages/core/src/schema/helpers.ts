export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export interface IConstructable<TClass> {
  new( ...args: unknown[] ): TClass;
}
