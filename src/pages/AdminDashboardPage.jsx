import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const initialForm = {
  name: "",
  description: "",
  location: "",
  map_link: "",
  images: "",
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

  // 🔄 Fetch resorts from Supabase
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

  // 📤 Upload image to Supabase Storage
  const uploadImageToSupabase = async (file) => {
    const fileName = `${Date.now()}-${file.name}`;
    const { error } = await supabase.storage
      .from("resort-images")
      .upload(fileName, file);

    if (error) {
      console.error("Image upload failed:", error.message);
      return null;
    }

    const { data: publicData } = supabase.storage
      .from("resort-images")
      .getPublicUrl(fileName);

    return publicData.publicUrl;
  };

  // ➕ Add resort with uploaded image
  const handleAddResort = async () => {
    let imageUrl = "";

    if (selectedImage) {
      imageUrl = await uploadImageToSupabase(selectedImage);
      if (!imageUrl) {
        alert("❌ Image upload failed");
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
      alert("❌ Failed to save resort: " + error.message);
    } else {
      alert("✅ Resort added successfully!");
      setFormData(initialForm);
      setSelectedImage(null);
      fetchResorts();
    }
  };

  // 🗑 Delete resort
  const handleDelete = async (id) => {
    const { error } = await supabase.from("resorts").delete().eq("id", id);
    if (!error) {
      alert("🗑 Resort deleted");
      fetchResorts();
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">🏕️ LuxeStays Admin Panel</h1>

      {/* Form */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {Object.keys(initialForm).map((key) => (
          <input
            key={key}
            name={key}
            placeholder={key.replace("_", " ")}
            value={formData[key]}
            onChange={(e) =>
              setFormData({ ...formData, [key]: e.target.value })
            }
            className="p-2 border rounded col-span-2 sm:col-span-1"
          />
        ))}

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
            <div
              key={r.id}
              className="border rounded p-4 shadow-sm bg-white"
            >
              {r.images?.length > 0 && (
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
