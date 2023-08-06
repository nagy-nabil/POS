export type FnReturn<T> = T extends (...arg: any[]) => infer A ? A : never;
