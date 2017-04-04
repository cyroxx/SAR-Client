export interface Subscription  {
  channel(): string;
  callback(): SubscriptionCallback;
}

export type SubscriptionCallback = (event: any, arg: any) => void;

type PositionCallback = (pos: Position) => void;

export class PositionSubscription implements Subscription {
  readonly cb: PositionCallback;

  constructor(callback: PositionCallback) {
    this.cb = callback;
  }

  channel(): string {
    return 'positions';
  }

  callback(): SubscriptionCallback {
    // Make callback accessible in returned function
    const cb = this.cb;
    return (event: any, arg: any) => {
      cb(new Position(arg.lat, arg.lon));
    };
  }
}

export class Position {
  lat: number;
  lon: number;

  constructor(lat: number, lon: number) {
    this.lat = lat;
    this.lon = lon;
  }
}
