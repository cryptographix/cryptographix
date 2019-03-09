export interface ISerializer<T=any> {
  toJSON?( name: string ): {};
  fromJSON?( name: string, obj?: {} ): T;
}
