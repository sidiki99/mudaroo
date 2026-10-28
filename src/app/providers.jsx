
"use client";

import { MantineProvider } from "@mantine/core";
import { Provider } from "react-redux";

import CartPersistence from "./CartPersistence";
import { store } from "./store/store";
import WishlistPersistence from "./wishlistPersistence";

export default function Providers({ children }) {
  return (
       <MantineProvider defaultColorScheme="light">
      <Provider store={store}>
        <CartPersistence />
        <WishlistPersistence />
        {children}
      </Provider>
    </MantineProvider>
  );
}
