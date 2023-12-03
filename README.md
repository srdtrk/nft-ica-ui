# Injective NFT-ICA Frontend

## Overview

This is a frontend for the Injective [NFT-ICA application](https://github.com/srdtrk/cw-nft-ica). It is built based on the next/react [Injective Counter Contract Example](https://github.com/InjectiveLabs/injective-simple-sc-counter-ui).

## Setup

For this application to run correctly, a relayer must be running with the NFT-ICA application. It must relay all packets between the following connections:

```rust
SUCCESS Connection {
    delay_period: 0ns,
    a_side: ConnectionSide {
        chain: BaseChainHandle {
            chain_id: ChainId {
                id: "injective-888",
                version: 888,
            },
            runtime_sender: Sender { .. },
        },
        client_id: ClientId(
            "07-tendermint-193",
        ),
        connection_id: Some(
            ConnectionId(
                "connection-183",
            ),
        ),
    },
    b_side: ConnectionSide {
        chain: BaseChainHandle {
            chain_id: ChainId {
                id: "theta-testnet-001",
                version: 0,
            },
            runtime_sender: Sender { .. },
        },
        client_id: ClientId(
            "07-tendermint-2593",
        ),
        connection_id: Some(
            ConnectionId(
                "connection-2951",
            ),
        ),
    },
}
```

```json
{
  "ica_controller_code_id": 4459,
  "cw721_ica_extension_code_id": 4457,
  "default_chan_init_options": {
    "connection_id": "test-0",
    "counterparty_connection_id": "test-1"
  }
}
```
