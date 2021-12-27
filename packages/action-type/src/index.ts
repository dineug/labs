type Action<K extends keyof T, T> = {
  type: K;
  payload: T[K];
};

interface HelloPayloadMap {
  foo: { bar: string };
  bar: { foo: boolean };
}

type HelloActionType = keyof HelloPayloadMap;

type HelloChannel = Action<HelloActionType, HelloPayloadMap>;

interface WorldPayloadMap {
  foo2: { bar2: string };
  bar2: { foo2: boolean };
}

type WorldActionType = keyof WorldPayloadMap;

type WorldChannel = Action<WorldActionType, WorldPayloadMap>;

interface ChannelMap {
  hello: HelloChannel;
  world: WorldChannel;
}

type ChannelName = keyof ChannelMap;

type GetAction<
  K extends ChannelName,
  A extends ChannelMap[K]['type']
> = A extends HelloActionType
  ? Action<A, HelloPayloadMap>
  : A extends WorldActionType
  ? Action<A, WorldPayloadMap>
  : never;

function formChannel<K extends ChannelName, A extends ChannelMap[K]['type']>(
  channelName: K,
  actionType: A
): GetAction<K, A> {
  return {} as any;
}

function postChannelMessage<
  K extends ChannelName,
  A extends ChannelMap[K]['type']
>(channelName: K, actionType: A, payload: GetAction<K, A>['payload']) {}

const a = formChannel('hello', 'bar');

postChannelMessage('world', 'bar2', { foo2: false });
