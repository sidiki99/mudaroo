
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [],
};

const cartSlice = createSlice({
  name: "cart",
  initialState,

  reducers: {
    // Add a product or increase its quantity
    addToCart: (state, action) => {
      const { product, quantity = 1, size, color } = action.payload;

      const existingItem = state.items.find(
        (item) =>
          item.productId === product._id &&
          item.size === size &&
          item.color === color
      );

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.items.push({
          productId: product._id,
          title: product.title,
          price: product.price,
          image: product.images?.[0] || product.image || "",
          size,
          color,
          quantity,
        });
      }
    },

    // Increase quantity
    increaseQuantity: (state, action) => {
      const item = state.items.find(
        (item) => item.productId === action.payload.productId &&
          item.size === action.payload.size &&
          item.color === action.payload.color
      );

      if (item) {
        item.quantity += 1;
      }
    },

    // Decrease quantity
    decreaseQuantity: (state, action) => {
      const item = state.items.find(
        (item) => item.productId === action.payload.productId &&
          item.size === action.payload.size &&
          item.color === action.payload.color
      );

      if (item && item.quantity > 1) {
        item.quantity -= 1;
      }
    },

    // Remove an item from the cart
    removeFromCart: (state, action) => {
      state.items = state.items.filter(
        (item) =>
          !(
            item.productId === action.payload.productId &&
            item.size === action.payload.size &&
            item.color === action.payload.color
          )
      );
    },

    // Clear the entire cart
    clearCart: (state) => {
      state.items = [];
    },

    // Restore a saved cart
    setCart: (state, action) => {
      state.items = action.payload;
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
