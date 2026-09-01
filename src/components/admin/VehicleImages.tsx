"use client";

import { useEffect, useState } from "react";

type VehicleImage = {
  id: string;
  url: string;
  isPrimary: boolean;
  sortOrder: number;
};

type VehicleImagesProps = {
  vehicleId: string;
};

export default function VehicleImages({
  vehicleId,
}: VehicleImagesProps) {
  const [images, setImages] = useState<VehicleImage[]>([]);
  const [url, setUrl] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(
    null
  );
  const [primaryId, setPrimaryId] = useState<string | null>(
    null
  );

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* -------------------------------- */
  /* Fetch Images */
  /* -------------------------------- */

  const fetchImages = async () => {
    try {
      setError("");

      const response = await fetch(
        `/api/admin/vehicles/${vehicleId}/images`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to fetch images"
        );
      }

      setImages(data.images || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch images"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, [vehicleId]);

  /* -------------------------------- */
  /* Add Image */
  /* -------------------------------- */

  const handleAdd = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    const trimmedUrl = url.trim();

    setError("");
    setSuccess("");

    if (!trimmedUrl) {
      setError("Image URL is required");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(
        `/api/admin/vehicles/${vehicleId}/images`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: trimmedUrl,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to add image"
        );
      }

      setImages((previous) => {
        const newImage = data.image;

        /*
         * If API made this image primary,
         * remove primary state from local images.
         */
        if (newImage.isPrimary) {
          return [
            ...previous.map((image) => ({
              ...image,
              isPrimary: false,
            })),
            newImage,
          ];
        }

        return [...previous, newImage];
      });

      setUrl("");

      setSuccess("Image added successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to add image"
      );
    } finally {
      setSaving(false);
    }
  };

  /* -------------------------------- */
  /* Set Primary */
  /* -------------------------------- */

  const handleSetPrimary = async (
    image: VehicleImage
  ) => {
    if (image.isPrimary) {
      return;
    }

    setPrimaryId(image.id);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `/api/admin/vehicles/${vehicleId}/images`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            imageId: image.id,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to set primary image"
        );
      }

      setImages((previous) =>
        previous.map((item) => ({
          ...item,
          isPrimary: item.id === image.id,
        }))
      );

      setSuccess("Primary image updated successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to set primary image"
      );
    } finally {
      setPrimaryId(null);
    }
  };

  /* -------------------------------- */
  /* Delete Image */
  /* -------------------------------- */

  const handleDelete = async (
    image: VehicleImage
  ) => {
    const confirmed = window.confirm(
      image.isPrimary
        ? "This is the primary image. If you delete it, another image will automatically become primary. Continue?"
        : "Are you sure you want to delete this image?"
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(image.id);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `/api/admin/vehicles/${vehicleId}/images`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            imageId: image.id,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to delete image"
        );
      }

      /*
       * Refresh from API because if the deleted image
       * was primary, backend may have selected another
       * image as primary.
       */
      await fetchImages();

      setSuccess("Image deleted successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete image"
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="border-b p-5 sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold">
            Vehicle Images
          </h3>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage images and select the primary vehicle image.
          </p>
        </div>

        <span className="text-sm text-muted-foreground">
          {images.length} image
          {images.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Messages */}
      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}

      {/* Add Image */}
      <form
        onSubmit={handleAdd}
        className="mt-5 flex flex-col gap-3 sm:flex-row"
      >
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com/car-image.jpg"
          className="h-11 min-w-0 flex-1 rounded-lg border bg-background px-3 text-sm outline-none transition focus:ring-2 focus:ring-ring"
        />

        <button
          type="submit"
          disabled={saving}
          className="h-11 rounded-lg bg-black px-5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Adding..." : "+ Add Image"}
        </button>
      </form>

      {/* Images */}
      <div className="mt-6">
        {loading ? (
          <p className="text-sm text-muted-foreground">
            Loading images...
          </p>
        ) : images.length === 0 ? (
          <div className="rounded-xl border border-dashed p-8 text-center">
            <p className="text-sm text-muted-foreground">
              No vehicle images added yet.
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Add an image URL above.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {images.map((image) => (
              <div
                key={image.id}
                className="group overflow-hidden rounded-xl border bg-background"
              >
                {/* Image */}
                <div className="relative aspect-video overflow-hidden bg-muted">
                  <img
                    src={image.url}
                    alt="Vehicle"
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />

                  {/* Primary Badge */}
                  {image.isPrimary && (
                    <span className="absolute left-3 top-3 rounded-full bg-black px-3 py-1 text-xs font-medium text-white">
                      ★ Primary
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 p-3">
                  {!image.isPrimary && (
                    <button
                      type="button"
                      onClick={() =>
                        handleSetPrimary(image)
                      }
                      disabled={primaryId === image.id}
                      className="w-full rounded-lg border px-3 py-2 text-xs font-medium transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {primaryId === image.id
                        ? "Setting..."
                        : "★ Set as Primary"}
                    </button>
                  )}

                  {image.isPrimary && (
                    <div className="rounded-lg bg-muted px-3 py-2 text-center text-xs font-medium text-muted-foreground">
                      Current Primary Image
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      handleDelete(image)
                    }
                    disabled={deletingId === image.id}
                    className="w-full rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {deletingId === image.id
                      ? "Deleting..."
                      : "Delete Image"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}