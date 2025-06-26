import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const initialForm = {
  name: "",
  description: "",
  location: "",
  map_link: "",
  stay_types: "",
  tags: "",
  price_min: "",
  price_max: "",
  availability: "Available",
};

export default function AdminPanel() {
  const [formData, setFormData] = useState(initialForm);
  const [selectedImage, setSelectedImage] = useState(null);
  const [resorts, setResorts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch resorts
  const fetchResorts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("resorts")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setResorts(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchResorts();
  }, []);

  // Upload image
  const uploadImageToSupabase = async (file) => {
    const fileName = `${Date.now()}-${file.name}`;
    const { error } = await supabase.storage
      .from("resort-images")
      .upload(fileName, file);

    if (error) {
      alert("Upload failed: " + error.message);
      return null;
    }

    const { data: publicData } = supabase.storage
      .from("resort-images")
      .getPublicUrl(fileName);

    return publicData.publicUrl;
  };

  // Add resort
  const handleAddResort = async () => {
    let imageUrl = "";

    if (selectedImage) {
      imageUrl = await uploadImageToSupabase(selectedImage);
      if (!imageUrl) {
        return;
      }
    }

    const { error } = await supabase.from("resorts").insert([
      {
        name: formData.name,
        description: formData.description,
        location: formData.location,
        map_link: formData.map_link,
        images: imageUrl ? [imageUrl] : [],
        stay_types: formData.stay_types.split(",").map((s) => s.trim()),
        tags: formData.tags.split(",").map((t) => t.trim()),
        price_min: parseInt(formData.price_min),
        price_max: parseInt(formData.price_max),
        availability: formData.availability,
      },
    ]);

    if (error) {
      alert("Error adding resort: " + error.message);
    } else {
      alert("✅ Resort added!");
      setFormData(initialForm);
      setSelectedImage(null);
      fetchResorts();
    }
  };

  // Delete resort
  const handleDelete = async (id) => {
    const { error } = await supabase.from("resorts").delete().eq("id", id);
    if (!error) {
      alert("Resort deleted");
      fetchResorts();
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">🏕️ LuxeStays Admin Panel</h1>

      {/* Form */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <input
          name="name"
          placeholder="Resort Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="p-2 border rounded col-span-2 sm:col-span-1"
        />
        <input
          name="location"
          placeholder="Location (e.g., Kerala, India)"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          className="p-2 border rounded col-span-2 sm:col-span-1"
        />
        <textarea
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="p-2 border rounded col-span-2"
        />
        <input
          name="price_min"
          placeholder="Minimum Price"
          type="number"
          value={formData.price_min}
          onChange={(e) => setFormData({ ...formData, price_min: e.target.value })}
          className="p-2 border rounded"
        />
        <input
          name="price_max"
          placeholder="Maximum Price"
          type="number"
          value={formData.price_max}
          onChange={(e) => setFormData({ ...formData, price_max: e.target.value })}
          className="p-2 border rounded"
        />
        <input
          name="map_link"
          placeholder="Google Maps Link"
          value={formData.map_link}
          onChange={(e) => setFormData({ ...formData, map_link: e.target.value })}
          className="p-2 border rounded col-span-2"
        />
        <input
          name="stay_types"
          placeholder="Stay Types (comma-separated)"
          value={formData.stay_types}
          onChange={(e) => setFormData({ ...formData, stay_types: e.target.value })}
          className="p-2 border rounded col-span-2"
        />
        <input
          name="tags"
          placeholder="Tags (e.g., family, luxury)"
          value={formData.tags}
          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
          className="p-2 border rounded col-span-2"
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setSelectedImage(e.target.files[0])}
          className="col-span-2 border p-2 rounded"
        />
        <button
          onClick={handleAddResort}
          className="col-span-2 bg-green-600 text-white p-2 rounded hover:bg-green-700"
        >
          ➕ Add Resort
        </button>
      </div>

      {/* Resort List */}
      <h2 className="text-xl font-semibold mb-4 text-center">
        🗂 Current Resorts ({resorts.length})
      </h2>

      {loading ? (
        <p className="text-center">Loading resorts...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {resorts.map((r) => (
            <div key={r.id} className="border rounded p-4 shadow-sm bg-white">
              {r.images?.[0] && (
                <img
                  src={r.images[0]}
                  alt={r.name}
                  className="w-full h-48 object-cover rounded mb-3"
                />
              )}
              <h3 className="font-bold text-lg">{r.name}</h3>
              <p className="text-gray-600 text-sm">{r.location}</p>
              <p className="text-sm mb-1">
                ₹{r.price_min} – ₹{r.price_max}
              </p>
              <p className="text-green-700 text-sm mb-2">
                {r.availability}
              </p>
              <button
                onClick={() => handleDelete(r.id)}
                className="text-red-600 hover:underline"
              >
                🗑 Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
