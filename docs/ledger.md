# ledger module

`soroban_testkit::ledger` provides deterministic time, sequence, and clock control over an in-memory Soroban ledger state.

## Version and compatibility

- **Current version**: Soroban SDK 27.0.x and later.
- **Minimum Rust version**: Rust 1.84 or later with `wasm32v1-none` target.
- **Stellar network support**: Compatible with Testnet and Mainnet ledger sequence and timestamp semantics.
- **Clock & sequence control**: Uses in-memory mock ledger state via `env.ledger()` with deterministic timestamp and sequence warping.

## Known considerations

- **Monotonic progression**: Advance ledger sequences and timestamps forward; warping backward can invalidate TTL or time-lock assumptions.
- **Offline deterministic state**: All ledger time and sequence changes run in-memory with zero network RPC calls.
- **TTL interaction**: Advancing the ledger sequence also ages persistent and temporary storage entries—pair with `ttl` checks when testing expiration.
