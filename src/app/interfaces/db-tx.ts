export class DBTxActions {
  static readonly LOCATIONS_ALL = 'locations:all';
  static readonly LOCATIONS_GET = 'locations:get';
  static readonly LOCATIONS_FIND = 'locations:find';
  static readonly LOCATIONS_STORE = 'locations:store';
  static readonly LOCATIONS_INIT = 'locations:init';

  static readonly CASES_ALL = 'cases:all';
  static readonly CASES_GET = 'cases:get';
  static readonly CASES_FIND = 'cases:find';
  static readonly CASES_STORE = 'cases:store';
  static readonly CASES_INIT = 'cases:init';
}

export interface DBTxRequestMessage {
  txid: string;
  action: string;
  args: DBTxRequestArgs;
}

export interface DBTxReplyMessage {
  type: string;
  txid: string;
  action: string;
  payload: any;
  error: any;
}

export type DBTxCallback = (msg: DBTxReplyMessage) => void;

export interface DBTxRequestArgs {
  [name: string]: any;
}
