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
