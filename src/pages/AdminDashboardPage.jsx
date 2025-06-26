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

  // 🟢 Add new resort
  const handleAddResort = async () => {
    const { error } = await supabase.from("resorts").insert([
      {
        name: formData.name,
        description: formData.description,
        location: formData.location,
        map_link: formData.map_link,
        images: formData.images.split(",").map((url) => url.trim()),
        stay_types: formData.stay_types.split(",").map((s) => s.trim()),
        tags: formData.tags.split(",").map((t) => t.trim()),
        price_min: parseInt(formData.price_min),
        price_max: parseInt(formData.price_max),
        availability: formData.availability,
      },
    ]);
    if (error) {
      alert("❌ Error: " + error.message);
    } else {
      alert("✅ Resort added!");
      setFormData(initialForm);
      fetchResorts();
    }
  };

  // 🔴 Delete resort
  const handleDelete = async (id: number) => {
    const { error } = await supabase.from("resorts").delete().eq("id", id);
    if (!error) {
      alert("🗑 Resort deleted");
      fetchResorts();
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">🏕️ LuxeStays Admin Panel</h1>

      {/* Add Form */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {Object.keys(initialForm).map((key) => (
          <input
            key={key}
            name={key}
            placeholder={key.replace("_", " ")}
            value={formData[key]}
            onChange={(e) =>
              setFormData({ ...formData, [key]: e.target.value })
            }
            className="p-2 border rounded"
          />
        ))}
        <button
          onClick={handleAddResort}
          className="col-span-2 bg-green-600 text-white p-2 rounded hover:bg-green-700"
        >
          ➕ Add Resort
        </button>
      </div>

      {/* List Resorts */}
      <div>
        <h2 className="text-xl font-semibold mb-4">
          🗂 Resorts ({resorts.length})
        </h2>

        {loading ? (
          <p>Loading resorts...</p>
        ) : (
          resorts.map((r) => (
            <div
              key={r.id}
              className="border rounded p-4 mb-4 shadow-sm flex justify-between"
            >
              <div>
                <h3 className="font-bold text-lg">{r.name}</h3>
                <p className="text-sm text-gray-500">{r.location}</p>
                <p className="text-sm">₹{r.price_min} - ₹{r.price_max}</p>
                <p className="text-sm text-green-700">{r.availability}</p>
              </div>
              <button
                onClick={() => handleDelete(r.id)}
                className="text-red-600 hover:underline"
              >
                🗑 Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
