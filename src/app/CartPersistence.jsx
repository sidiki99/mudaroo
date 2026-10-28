
"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setCart } from "./store/cartSlice";
// import { setCart } from "@/redux/cartSlice";

export default function CartPersistence() {
  const dispatch = useDispatch();
  const items = useSelector((state) => state.cart.items);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("mudaroo-cart");

      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);

        if (Array.isArray(parsedCart)) {
          dispatch(setCart(parsedCart));
        }
      }
    } catch (error) {
      console.error("Failed to restore cart:", error);
    } finally {
      setHydrated(true);
    }
  }, [dispatch]);

  useEffect(() => {
    if (!hydrated) return;

    try {
      localStorage.setItem(
        "mudaroo-cart",
        JSON.stringify(items)
      );
    } catch (error) {
      console.error("Failed to save cart:", error);
    }
  }, [items, hydrated]);

  return null;
}
