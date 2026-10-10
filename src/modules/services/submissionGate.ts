// Synchronous guard: React pending state alone cannot block two clicks in the same tick.
export function createSubmissionGate() {
  let pending = false;
  return {
    acquire() { if (pending) return false; pending = true; return true; },
    release() { pending = false; },
  };
}
