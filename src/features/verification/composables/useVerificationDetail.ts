import { onMounted, onBeforeUnmount } from 'vue';
import { storeToRefs } from 'pinia';
import { useVerificationStore } from '../stores/verification.store';
import { useMismatchStore } from '../stores/mismatch.store';
import type {
  CompleteVerificationDto,
  RejectVerificationDto,
  ResolveMismatchDto,
} from '../types';

export function useVerificationDetail(id: number) {
  const verificationStore = useVerificationStore();
  const mismatchStore = useMismatchStore();

  const { current, loading, submitting } = storeToRefs(verificationStore);
  const { items: mismatches, submitting: mismatchSubmitting } =
    storeToRefs(mismatchStore);

  async function load() {
    await verificationStore.fetchOne(id);
    await mismatchStore.fetchByVerification(id);
  }

  async function start() {
    return verificationStore.start(id);
  }

  async function complete(payload: CompleteVerificationDto) {
    const res = await verificationStore.complete(id, payload);
    await mismatchStore.fetchByVerification(id);
    return res;
  }

  async function approve(notes?: string) {
    return verificationStore.approve(id, notes);
  }

  async function reject(payload: RejectVerificationDto) {
    return verificationStore.reject(id, payload);
  }

  async function resolveMismatch(mismatchId: number, payload: ResolveMismatchDto) {
    return mismatchStore.resolve(mismatchId, payload);
  }

  async function waiveMismatch(mismatchId: number, notes: string) {
    return mismatchStore.waive(mismatchId, { resolution_notes: notes });
  }

  async function escalateMismatch(mismatchId: number, notes: string) {
    return mismatchStore.escalate(mismatchId, { resolution_notes: notes });
  }

  onMounted(load);
  onBeforeUnmount(() => verificationStore.clearCurrent());

  return {
    verification: current,
    mismatches,
    loading,
    submitting,
    mismatchSubmitting,
    load,
    start,
    complete,
    approve,
    reject,
    resolveMismatch,
    waiveMismatch,
    escalateMismatch,
  };
}