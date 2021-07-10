/**
 * * IterableProtocol
 * ? 2012-07-24
 */

interface IterableProtocol {
  [Symbol.iterator]: () => IIterator;
}

interface IIterator {
  next(): ReturnValue;
}

interface ReturnValue {
  value: any;
  done?: boolean;
}

/**
 * * RxJS ObservableProtocol
 * ? 2010-03-17
 */

interface ObservableProtocol {
  new (source: Source): this;
  subscribe(observer: Observer | Subscriber): Subscription;
  pipe(...operators: Operator[]): ObservableProtocol;
}

interface Subscriber {
  next(value: any): void;
  error(value: any): void;
  complete(): void;
}

interface Subscription {
  unsubscribe(): void;
}

type Source = (subscriber: Subscriber) => Subscription | Callback | undefined;
type Callback = () => void;
type Observer = (value: any) => void;
type Operator = (source$: ObservableProtocol) => ObservableProtocol;

/**
 * * PromiseProtocol
 * ? 2012-12-06
 */

interface PromiseProtocol {
  new (executor: Executor): this;
  then(onFulfilled: Fulfilled): PromiseProtocol;
  catch(onRejected: Rejected): PromiseProtocol;
  finally(onFinally: Finally): PromiseProtocol;
}

type Executor = (resolve: Resolve, reject: Reject) => void;
type Resolve = (value: any) => void;
type Reject = (reason: any) => void;
type Fulfilled = (value: any) => any;
type Rejected = (reason: any) => any;
type Finally = () => void;
