import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useCart } from '@/stores/cart';
import { changeCart } from '@/lib/shopify.functions';
import { track } from '@/lib/track';
import type { Cart } from '@/lib/commerce';
vi.mock('@/lib/shopify.functions',()=>({changeCart:vi.fn()}));
vi.mock('@/lib/track',()=>({cartAttributes:()=>[],waitForConsentSync:vi.fn().mockResolvedValue(undefined),track:vi.fn()}));
vi.mock('sonner',()=>({toast:{error:vi.fn(),info:vi.fn()}}));
const stale={id:'expired'} as Cart;
describe('expired cart state recovery',()=>{
 beforeEach(()=>{vi.clearAllMocks();useCart.setState({cart:stale,cartId:'expired',busy:false,open:false})});
 it('clears the persisted ID on sync and next add creates a new cart',async()=>{
  vi.mocked(changeCart).mockResolvedValue(null);
  await useCart.getState().sync();
  expect(useCart.getState().cartId).toBeNull();
  expect(useCart.getState().cart).toBeNull();
  await useCart.getState().add([{merchandiseId:'variant',quantity:2}]);
  expect(changeCart).toHaveBeenLastCalledWith({data:{operation:'create',cartId:undefined,lines:[{merchandiseId:'variant',quantity:2}],attributes:[]}});
  expect(track).not.toHaveBeenCalled();
 });
 it('clears stale state when updating a nonexistent cart',async()=>{
  vi.mocked(changeCart).mockResolvedValue(null);
  await useCart.getState().update('line','variant',3);
  expect(useCart.getState().cartId).toBeNull();
  expect(useCart.getState().cart).toBeNull();
 });
 it('clears stale state when removing from a nonexistent cart',async()=>{
  vi.mocked(changeCart).mockResolvedValue(null);
  await useCart.getState().remove('line');
  expect(useCart.getState().cartId).toBeNull();
  expect(useCart.getState().cart).toBeNull();
 });
 it('keeps the existing cart on ambiguous add failures and does not retry',async()=>{
  vi.mocked(changeCart).mockRejectedValue(new Error('Network unavailable'));
  await useCart.getState().add([{merchandiseId:'variant',quantity:2}]);
  expect(useCart.getState().cartId).toBe('expired');
  expect(changeCart).toHaveBeenCalledTimes(1);
  expect(track).not.toHaveBeenCalled();
  expect(useCart.getState().busy).toBe(false);
 });
});