# events module

`soroban_testkit::events` captures contract-emitted events and provides typed topic and payload assertions for deterministic tests.

## Troubleshooting FAQ

**No events captured after calling a contract method.**
Events were inspected before the contract invocation ran, or the test environment reset between calls. Capture events immediately inside or right after the contract call using `EventLog::capture(&env, || { ... })` or `env.events().all()`.

**Topic assertion fails due to `Symbol` vs `String` mismatch.**
Soroban contract events distinguish between `Symbol` (such as `symbol_short!("transfer")`) and `String` values in topic tuples. Match the exact topic types published by `env.events().publish(...)` when building your expected topic matcher.

**Contract filter misses events emitted by a sub-contract.**
Filtering by the outer contract address excludes events emitted by downstream token or helper contracts. Pass the emitting contract's `Address` to `for_contract(&contract_id)`, or inspect the full captured log when asserting cross-contract flows.

**Event payload decoding fails with a type mismatch.**
The Rust type requested in the assertion does not match the tuple or `#[contracttype]` struct serialized by the contract. Verify the exact field order and integer width (for example `i128` vs `u64`) in the contract's `publish` call.
