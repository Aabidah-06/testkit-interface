# events module

`soroban_testkit::events` captures contract-emitted events during a test invocation and provides typed assertions so state-change notifications are verified alongside return values.

## Runnable example

Put this in a test file of your contract crate (for example `tests/events.rs`), with `soroban-testkit` as a dev-dependency, then run `cargo test`:

```rust
use soroban_sdk::{symbol_short, Address};
use soroban_testkit::core::TestEnv;
use soroban_testkit::events::EventLog;

#[test]
fn deposit_emits_typed_transfer_event() {
    let env = TestEnv::new();
    let contract_id = env.env().register(Vault, ());
    let client = VaultClient::new(env.env(), &contract_id);
    let sender: Address = env.address();

    let log = EventLog::capture(&env, || {
        client.deposit(&sender, &250);
    });

    log.assert_count(1);
    log.assert_topic(&contract_id, (symbol_short!("deposit"), sender.clone()));
    log.assert_data::<i128>(&contract_id, 250);
}
```

In a real contract test, wrap the single contract call you want to inspect inside `EventLog::capture` so unrelated setup calls do not pollute the captured event list.

## Common failure modes

- **`expected N events, found M`**: setup calls (such as `token.mint` or initialization) ran inside `EventLog::capture`, or a cross-contract call emitted an extra event. Move setup before `EventLog::capture`, or filter by `contract_id`.
- **`topic mismatch at index ...`**: Soroban encodes `Symbol` topics differently from `String` values. Use `symbol_short!` (or `Symbol::new`) to match the exact topic type emitted by the contract.
- **`failed to decode event data as T`**: the Rust type passed to `assert_data::<T>` does not match the XDR type emitted by `env.events().publish(...)` (for example `u128` vs `i128`, or a tuple vs a struct).
- **`no events captured for contract`**: the contract invocation panicked before publishing, or `EventLog::capture` was called on a different `TestEnv` instance than the contract client.
