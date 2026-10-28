"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setWishlist } from "./store/wishlistSlice";


export default function WishlistPersistence() {
  const dispatch = useDispatch();
  const items = useSelector((state) => state.wishlist.items);

  // Load saved wishlist once when the app opens
  useEffect(() => {
    try {
      const saved = localStorage.getItem("mudaroo-wishlist");

      if (saved) {
        const parsed = JSON.parse(saved);

        if (Array.isArray(parsed)) {
          dispatch(setWishlist(parsed));
        }
      }
    } catch (error) {
      console.error("Could not load wishlist:", error);
    }
  }, [dispatch]);

  // Save wishlist whenever it changes
  useEffect(() => {
    localStorage.setItem(
      "mudaroo-wishlist",
      JSON.stringify(items)
    );
  }, [items]);

  return null;
}