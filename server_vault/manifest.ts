// D9Assist Server Vault Metadata Manifest
// Generated for secure zero-disk streaming distribution.
export const VAULT_MANIFEST = {
  version: '2.0.4',
  modules: [
    {
      id: 'd9-escape-from-tarkov',
      file: 'tarkov_x64.bin',
      target: 'EscapeFromTarkov.exe (Unity 2022.3)',
      entryPoint: 'd9a_module_entry',
      sizeBytes: 1048576, // 1MB simulated cdylib artifact
      hashSha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    },
    {
      id: 'd9-tarkov-arena',
      file: 'arena_x64.bin',
      target: 'EscapeFromTarkov.exe (Arena Matchmaking)',
      entryPoint: 'd9a_module_entry',
      sizeBytes: 819200,
      hashSha256: 'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb',
    },
    {
      id: 'd9-sdk-harness',
      file: 'sdk_harness.bin',
      target: 'CustomTarget.exe',
      entryPoint: 'd9a_sdk_entry',
      sizeBytes: 524288,
      hashSha256: '4e07408562bedb8b60ce05c1decfe3ad16b72230967de01f640b7e4729b49fce',
    },
  ],
};
