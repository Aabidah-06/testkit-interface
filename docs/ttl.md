# ttl module

`soroban_testkit::ttl` reads storage TTLs and simulates expiry, so missing TTL bumps show up as failing tests.

## Quick start

1. Add the crate: `cargo add --dev soroban-testkit`.
2. Register your contract and write an entry:

   ```rust
   use soroban_sdk::symbol_short;
   use soroban_testkit::core::TestEnv;
   use soroban_testkit::ttl::StorageKind;

   let env = TestEnv::new();
   let id = env.env().register(Store, ());
   let client = StoreClient::new(env.env(), &id);
   client.set(&symbol_short!("k"), &1);
   ```

3. Read the TTL: `env.ttl_of(&id, StorageKind::Persistent, symbol_short!("k"))`.
4. Assert that a call extends it:

   ```rust
   env.assert_bumps_ttl(&id, StorageKind::Persistent, symbol_short!("k"), || {
       client.touch(&symbol_short!("k"));
   });
   ```

5. Assert that the contract copes with expired data:

   ```rust
   env.assert_survives_expiry(StorageKind::Temporary, || {
       client.read_or_default();
   });
   ```

## Troubleshooting FAQ

**`ttl_of` panics.**
The entry does not exist or has already expired. Write it first, and read the TTL before calling `expire` or advancing the ledger too far.

**`expected the call to extend the Persistent TTL beyond X, but it was Y afterward`.**
The call did not run `extend_ttl`, or the entry's TTL was already above the threshold you passed to `extend_ttl`, so nothing changed.

**`expire` ignores the storage kind.**
It advances past the network's `max_entry_ttl`, which expires every entry of every kind. The kind argument only documents intent.

**`expected the contract to survive ... expiry gracefully, but it panicked`.**
The contract read an expired entry with `get(...).unwrap()`. Handle the missing value, for example with `unwrap_or` or `has`.

**The key is ignored for `StorageKind::Instance`.**
Instance storage has one TTL per contract, so any key gives the same result.
