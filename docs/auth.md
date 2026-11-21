# auth module

`soroban_testkit::auth` checks that privileged entry points reject callers who are not allowed to call them.

## API overview

- `AuthMatrix::new(&env)` — creates a privilege matrix bound to `TestEnv` to verify allowed and disallowed callers across entry points.
- `.entry_point(name, allowed, invoke)` — registers an entry point with its slice of authorized addresses and a closure that returns `Ok(())` on success or `Err(...)` on rejection.
- `.assert_enforced()` — runs every registered entry point against both its allowed callers and all other known addresses, panicking with the full matrix on any mismatch.
- `env.assert_requires_auth(|| { ... })` — asserts that a single contract call fails when invoked without authorization.

## Runnable example

Put this in a test file of your contract crate (for example `tests/auth.rs`), with `soroban-testkit` as a dev-dependency, then run `cargo test`:

```rust
use soroban_testkit::auth::AuthMatrix;
use soroban_testkit::core::TestEnv;

#[test]
fn only_owner_can_withdraw() {
    let env = TestEnv::new();
    let owner = env.address();
    let other = env.address();

    AuthMatrix::new(&env)
        // `deposit` is open to both, which makes `other` a known caller.
        .entry_point("deposit", &[owner.clone(), other.clone()], |_caller| Ok(()))
        // `withdraw` must accept `owner` only.
        .entry_point("withdraw", &[owner.clone()], |caller| {
            if *caller == owner {
                Ok(())
            } else {
                Err(soroban_sdk::Error::from_contract_error(1))
            }
        })
        .assert_enforced();
}
```

In a real test, each closure calls your contract's generated `try_*` client method with `mock_auths` set to `caller`, and returns `Ok(())` when the call succeeded.

For a single call, use `env.assert_requires_auth(|| { /* call without auth */ })`.

## Common failure modes

- **`auth matrix violated ... expected to be rejected but succeeded`**: the entry point does not call `require_auth` on the right address. The message names the entry point and the caller, followed by the full grid.
- **`expected to succeed but was rejected`**: an allowed caller was rejected. The closure is usually mocking auth for the wrong function name or arguments.
- **A gap nobody notices**: the matrix only cross-checks addresses listed as `allowed` on some entry point. An attacker address that appears nowhere is never tried, so add it to an open entry point (as `other` above) or the test passes without checking it.
- **`expected the call to fail without authorization, but it succeeded`**: from `assert_requires_auth`. The closure returned normally, so the call did not require auth.
- **Closure always returns `Ok`**: mapping every result to `Ok(())` hides rejections. Return `Err` whenever the `try_*` call fails.
