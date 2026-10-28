
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [],
};

const cartSlice = createSlice({
  name: "cart",
  initialState,

  reducers: {
    addToCart: (state, action) => {
      const {
        product,
        quantity = 1,
        size,
        color,
        variantId,
        sku,
        image,
      } = action.payload;

      const productId = product?._id;

      if (!productId) return;

      const existingItem = state.items.find((item) => {
        if (variantId && item.variantId) {
          return (
            item.productId === productId &&
            item.variantId === variantId
          );
        }

        return (
          item.productId === productId &&
          item.size === size &&
          item.color === color
        );
      });

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.items.push({
          productId,
          variantId: variantId || null,
          sku: sku || "",
          name: product.name || product.title || "",
          title: product.title || product.name || "",
          slug: product.slug || "",
          price: product.price ?? 0,
          image:
            image ||
            product.images?.[0] ||
            product.image ||
            "",
          size: size || "",
          color: color || "",
          quantity,
        });
      }
    },

    increaseQuantity: (state, action) => {
      const { productId, variantId, size, color } =
        action.payload;

      const item = state.items.find((item) =>
        variantId && item.variantId
          ? item.productId === productId &&
            item.variantId === variantId
          : item.productId === productId &&
            item.size === size &&
            item.color === color
      );

      if (item) item.quantity += 1;
    },

    decreaseQuantity: (state, action) => {
      const { productId, variantId, size, color } =
        action.payload;

      const item = state.items.find((item) =>
        variantId && item.variantId
          ? item.productId === productId &&
            item.variantId === variantId
          : item.productId === productId &&
            item.size === size &&
            item.color === color
      );

      if (item && item.quantity > 1) {
        item.quantity -= 1;
      }
    },

    removeFromCart: (state, action) => {
      const { productId, variantId, size, color } =
        action.payload;

      state.items = state.items.filter((item) => {
        if (variantId && item.variantId) {
          return !(
            item.productId === productId &&
            item.variantId === variantId
          );
        }

        return !(
          item.productId === productId &&
          item.size === size &&
          item.color === color
        );
      });
    },

    clearCart: (state) => {
      state.items = [];
    },

    setCart: (state, action) => {
      state.items = Array.isArray(action.payload)
        ? action.payload
        : [];
    },
  },
});

export const {
  addToCart,
  increaseQuantity,
  decreaseQuantity,
  removeFromCart,
  clearCart,
  setCart,
} = cartSlice.actions;

export default cartSlice.reducer;
