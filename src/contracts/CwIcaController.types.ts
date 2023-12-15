/**
* This file was automatically generated by @cosmwasm/ts-codegen@0.35.3.
* DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
* and run the @cosmwasm/ts-codegen generate command to regenerate this file.
*/

export type TxEncoding = "proto3" | "proto3json";
export interface InstantiateMsg {
  channel_open_init_options?: ChannelOpenInitOptions | null;
  owner?: string | null;
  send_callbacks_to?: string | null;
}
export interface ChannelOpenInitOptions {
  connection_id: string;
  counterparty_connection_id: string;
  counterparty_port_id?: string | null;
  tx_encoding?: TxEncoding | null;
}
export type ExecuteMsg = {
  create_channel: {
    channel_open_init_options?: ChannelOpenInitOptions | null;
  };
} | {
  send_custom_ica_messages: {
    messages: Binary;
    packet_memo?: string | null;
    timeout_seconds?: number | null;
  };
} | {
  send_cosmos_msgs: {
    messages: CosmosMsgForEmpty[];
    packet_memo?: string | null;
    timeout_seconds?: number | null;
  };
} | {
  update_callback_address: {
    callback_address?: string | null;
  };
} | {
  update_ownership: Action;
};
export type Binary = string;
export type CosmosMsgForEmpty = {
  bank: BankMsg;
} | {
  custom: Empty;
} | {
  staking: StakingMsg;
} | {
  distribution: DistributionMsg;
} | {
  stargate: {
    type_url: string;
    value: Binary;
    [k: string]: unknown;
  };
} | {
  ibc: IbcMsg;
} | {
  wasm: WasmMsg;
} | {
  gov: GovMsg;
};
export type BankMsg = {
  send: {
    amount: Coin[];
    to_address: string;
    [k: string]: unknown;
  };
} | {
  burn: {
    amount: Coin[];
    [k: string]: unknown;
  };
};
export type Uint128 = string;
export type StakingMsg = {
  delegate: {
    amount: Coin;
    validator: string;
    [k: string]: unknown;
  };
} | {
  undelegate: {
    amount: Coin;
    validator: string;
    [k: string]: unknown;
  };
} | {
  redelegate: {
    amount: Coin;
    dst_validator: string;
    src_validator: string;
    [k: string]: unknown;
  };
};
export type DistributionMsg = {
  set_withdraw_address: {
    address: string;
    [k: string]: unknown;
  };
} | {
  withdraw_delegator_reward: {
    validator: string;
    [k: string]: unknown;
  };
};
export type IbcMsg = {
  transfer: {
    amount: Coin;
    channel_id: string;
    timeout: IbcTimeout;
    to_address: string;
    [k: string]: unknown;
  };
} | {
  send_packet: {
    channel_id: string;
    data: Binary;
    timeout: IbcTimeout;
    [k: string]: unknown;
  };
} | {
  close_channel: {
    channel_id: string;
    [k: string]: unknown;
  };
};
export type Timestamp = Uint64;
export type Uint64 = string;
export type WasmMsg = {
  execute: {
    contract_addr: string;
    funds: Coin[];
    msg: Binary;
    [k: string]: unknown;
  };
} | {
  instantiate: {
    admin?: string | null;
    code_id: number;
    funds: Coin[];
    label: string;
    msg: Binary;
    [k: string]: unknown;
  };
} | {
  instantiate2: {
    admin?: string | null;
    code_id: number;
    funds: Coin[];
    label: string;
    msg: Binary;
    salt: Binary;
    [k: string]: unknown;
  };
} | {
  migrate: {
    contract_addr: string;
    msg: Binary;
    new_code_id: number;
    [k: string]: unknown;
  };
} | {
  update_admin: {
    admin: string;
    contract_addr: string;
    [k: string]: unknown;
  };
} | {
  clear_admin: {
    contract_addr: string;
    [k: string]: unknown;
  };
};
export type GovMsg = {
  vote: {
    proposal_id: number;
    vote: VoteOption;
    [k: string]: unknown;
  };
} | {
  vote_weighted: {
    options: WeightedVoteOption[];
    proposal_id: number;
    [k: string]: unknown;
  };
};
export type VoteOption = "yes" | "no" | "abstain" | "no_with_veto";
export type Decimal = string;
export type Action = {
  transfer_ownership: {
    expiry?: Expiration | null;
    new_owner: string;
  };
} | "accept_ownership" | "renounce_ownership";
export type Expiration = {
  at_height: number;
} | {
  at_time: Timestamp;
} | {
  never: {};
};
export interface Coin {
  amount: Uint128;
  denom: string;
  [k: string]: unknown;
}
export interface Empty {
  [k: string]: unknown;
}
export interface IbcTimeout {
  block?: IbcTimeoutBlock | null;
  timestamp?: Timestamp | null;
  [k: string]: unknown;
}
export interface IbcTimeoutBlock {
  height: number;
  revision: number;
  [k: string]: unknown;
}
export interface WeightedVoteOption {
  option: VoteOption;
  weight: Decimal;
  [k: string]: unknown;
}
export type QueryMsg = {
  get_channel: {};
} | {
  get_contract_state: {};
} | {
  get_callback_counter: {};
} | {
  ownership: {};
};
export interface CallbackCounter {
  error: number;
  success: number;
  timeout: number;
}
export type IbcOrder = "ORDER_UNORDERED" | "ORDER_ORDERED";
export type Status = "STATE_UNINITIALIZED_UNSPECIFIED" | "STATE_INIT" | "STATE_TRYOPEN" | "STATE_OPEN" | "STATE_CLOSED";
export interface State {
  allow_channel_open_init?: boolean;
  callback_address?: Addr | null;
  ica_info?: IcaInfo | null;
  [k: string]: unknown;
}
export interface ChannelState {
  channel: IbcChannel;
  channel_status: Status;
  [k: string]: unknown;
}
export interface IbcChannel {
  connection_id: string;
  counterparty_endpoint: IbcEndpoint;
  endpoint: IbcEndpoint;
  order: IbcOrder;
  version: string;
  [k: string]: unknown;
}
export interface IbcEndpoint {
  channel_id: string;
  port_id: string;
  [k: string]: unknown;
}
export type Addr = string;
export interface IcaInfo {
  channel_id: string;
  encoding: TxEncoding;
  ica_address: string;
}
export interface OwnershipForString {
  owner?: string | null;
  pending_expiry?: Expiration | null;
  pending_owner?: string | null;
}
