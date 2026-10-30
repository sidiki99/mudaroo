"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import ProductForm from "../../add/page";


export default function EditProductPage() {
  const { id } = useParams();
  const router = useRouter();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      try {
        const res = await axios.get(`/api/products/${id}`);

        // Adjust this according to the response from your API.
        const data = res.data.product ?? res.data.data ?? res.data;

        setProduct(data);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load product."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return <p className="p-6">Loading product...</p>;
  }

  if (error || !product) {
    return (
      <div className="p-6">
        <p className="text-red-600">
          {error || "Product not found."}
        </p>

        <button
          onClick={() => router.push("/admin/products")}
          className="mt-3 rounded-lg bg-gray-900 px-4 py-2 text-white"
        >
          Back to Products
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
     <ProductForm product={product}  key={product._id}  />
    </div>
  );
}