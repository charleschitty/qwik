import { component$, useContext, useSignal, $ } from '@builder.io/qwik';
import { STORE_CONTEXT, fetchFromShopify, formatPrice } from '../utils';
import { Image } from 'qwik-image';
import { modifyLineItemMutation, removeLineItemMutation } from '../mutation';

export const StoreCartRows = component$(() => {
  const loadingSignal = useSignal(false);
  const appStore = useContext(STORE_CONTEXT);

  const onModifyLineItemMutation = $(async (variantId: string, quantity: number) => {
    loadingSignal.value = true;
    const response = await fetchFromShopify(modifyLineItemMutation(appStore.cart.id, variantId, quantity));
    const {
      data: { checkoutLineItemsAdd },
    } = await response.json();
    appStore.cart = checkoutLineItemsAdd.checkout;
    loadingSignal.value = false;
  });

  const onRemoveLineItemMutation = $(async (lineItemId: string) => {
    loadingSignal.value = true;
    const response = await fetchFromShopify(removeLineItemMutation(appStore.cart.id, [lineItemId]));
    const {
      data: { checkoutLineItemsRemove },
    } = await response.json();
    appStore.cart = checkoutLineItemsRemove.checkout;
    loadingSignal.value = false;
  });

  return (
    <div class="flow-root">
      <ul class="-my-6 divide-y divide-gray-200">
        {appStore.cart.lineItems.edges.map(({ node: lineItem }: any) => {
          return (
            <li key={lineItem.id} class="py-6 flex">
              <div class="flex-shrink-0 w-24 h-24 border border-gray-200 rounded-md overflow-hidden">
                <Image
                  layout="fixed"
                  width="100"
                  height="100"
                  class="w-full h-full object-center object-cover"
                  src={lineItem.variant.image.src}
                  alt={lineItem.title}
                />
              </div>

              <div class="ml-4 flex-1 flex flex-col">
                <div>
                  <div class="flex justify-between text-base font-medium text-gray-900">
                    <h3>{lineItem.title}</h3>
                    <div class="ml-4">
                      {formatPrice(lineItem.variant.price.amount, lineItem.variant.price.currencyCode)}
                    </div>
                  </div>
                </div>
                <div class="flex-1 flex items-center text-md">
                  <label html-for={`quantity-${lineItem.id}`} class="text-black mr-2">
                    x{lineItem.quantity}
                  </label>
                  <div class="flex space-x col-span-2 text-solid-medium text-black">
                    <button
                      disabled={loadingSignal.value}
                      title="Remove item"
                      class="flex rounded-full items-center justify-center hover:opacity-70 transition duration-200 disabled:cursor-not-allowed"
                      onClick$={async () => {
                        await onModifyLineItemMutation(lineItem.variant.id, -1);
                      }}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        class="h-8"
                        style="fill: none; stroke: currentcolor;"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                        ></path>
                      </svg>
                    </button>
                    <button
                      disabled={loadingSignal.value}
                      title="Add item"
                      class="flex rounded-full items-center justify-center hover:opacity-70 transition duration-200 disabled:cursor-not-allowed"
                      onClick$={async () => {
                        await onModifyLineItemMutation(lineItem.variant.id, 1);
                      }}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        class="h-8"
                        style="fill: none; stroke: currentcolor;"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                        ></path>
                      </svg>
                    </button>
                  </div>
                  <div class="flex-1"></div>
                  <div class="flex">
                    <button
                      disabled={loadingSignal.value}
                      value={lineItem.id}
                      class="font-medium text-black disabled:cursor-not-allowed"
                      onClick$={async () => {
                        await onRemoveLineItemMutation(lineItem.id);
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
});
