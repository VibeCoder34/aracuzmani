"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { Plus, Trash2, Loader2, AlertCircle, Upload, X } from "lucide-react";
import { ImageUploader } from "@/components/admin/image-uploader";

interface Brand {
  id: number;
  name: string;
  country: string | null;
}

interface Model {
  id: number;
  brand_id: number;
  name: string;
  start_year: number | null;
  end_year: number | null;
  car_brands: Brand;
}

interface Trim {
  id: number;
  model_id: number;
  year: number;
  trim_name: string | null;
  engine: string | null;
  transmission: string | null;
  drivetrain: string | null;
  car_models: {
    id: number;
    name: string;
    car_brands: {
      id: number;
      name: string;
    };
  };
}

export default function AdminPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<"brands" | "models" | "trims" | "images">("brands");

  // Data states
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [trims, setTrims] = useState<Trim[]>([]);

  // Form states
  const [brandForm, setBrandForm] = useState({ name: "", country: "" });
  const [modelForm, setModelForm] = useState({
    brand_id: "",
    name: "",
    start_year: "",
    end_year: "",
  });
  const [trimForm, setTrimForm] = useState({
    model_id: "",
    year: "",
    trim_name: "",
    engine: "",
    transmission: "",
    drivetrain: "",
    // Interior design
    seat_count: "",
    trunk_volume: "",
    // Exterior design
    door_count: "",
    width: "",
    length: "",
    height: "",
    weight: "",
    body_type: "",
    // Fuel economy
    fuel_type: "",
    avg_consumption: "",
    // Performance
    max_torque: "",
    max_speed: "",
    acceleration_0_to_100: "",
    horsepower: "",
    transmission_type: "",
    drive_type: "",
    // Images
    image_urls: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);

  // Check admin access
  useEffect(() => {
    const checkAdmin = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (!profile || !["admin", "moderator"].includes(profile.role)) {
        router.push("/");
        return;
      }

      setIsAdmin(true);
      setLoading(false);
      loadData();
    };

    checkAdmin();
  }, [supabase, router]);

  const loadData = async () => {
    // Load brands
    const brandsRes = await fetch("/api/admin/brands");
    if (brandsRes.ok) {
      const data = await brandsRes.json();
      setBrands(data.brands || []);
    }

    // Load models
    const modelsRes = await fetch("/api/admin/models");
    if (modelsRes.ok) {
      const data = await modelsRes.json();
      setModels(data.models || []);
    }

    // Load trims
    const trimsRes = await fetch("/api/admin/trims");
    if (trimsRes.ok) {
      const data = await trimsRes.json();
      setTrims(data.trims || []);
    }
  };

  const handleAddBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/admin/brands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(brandForm),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to add brand");
      }

      setSuccess("Brand added successfully!");
      setBrandForm({ name: "", country: "" });
      loadData();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddModel = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/admin/models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...modelForm,
          brand_id: parseInt(modelForm.brand_id),
          start_year: modelForm.start_year ? parseInt(modelForm.start_year) : null,
          end_year: modelForm.end_year ? parseInt(modelForm.end_year) : null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to add model");
      }

      setSuccess("Model added successfully!");
      setModelForm({ brand_id: "", name: "", start_year: "", end_year: "" });
      loadData();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploadingImages(true);
    setError(null);

    try {
      // Generate a slug for the car
      const selectedModel = models.find(m => m.id === parseInt(trimForm.model_id));
      if (!selectedModel) {
        throw new Error('Please select a model first');
      }

      const brand = selectedModel.car_brands.name;
      const model = selectedModel.name;
      const year = trimForm.year;
      const trimName = trimForm.trim_name;
      
      const carSlug = `${brand}-${model}-${year}${trimName ? `-${trimName}` : ''}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("carSlug", carSlug);

        const res = await fetch("/api/admin/upload-image", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to upload image");
        }

        return res.json();
      });

      const results = await Promise.all(uploadPromises);
      const newUrls = results.map(r => r.url);
      
      setUploadedImageUrls(prev => [...prev, ...newUrls]);
      setTrimForm(prev => ({
        ...prev,
        image_urls: [...prev.image_urls ? prev.image_urls.split(',').map(u => u.trim()).filter(u => u) : [], ...newUrls].join(', ')
      }));
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred while uploading images");
      }
    } finally {
      setUploadingImages(false);
    }
  };

  const handleRemoveImage = (urlToRemove: string) => {
    const updatedUrls = uploadedImageUrls.filter(url => url !== urlToRemove);
    setUploadedImageUrls(updatedUrls);
    setTrimForm(prev => ({
      ...prev,
      image_urls: updatedUrls.join(', ')
    }));
  };

  const handleAddTrim = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      // Use uploaded image URLs
      const imageUrlsArray = uploadedImageUrls.length > 0 
        ? uploadedImageUrls 
        : (trimForm.image_urls ? trimForm.image_urls.split(',').map(url => url.trim()).filter(url => url) : []);

      const res = await fetch("/api/admin/trims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model_id: parseInt(trimForm.model_id),
          year: parseInt(trimForm.year),
          trim_name: trimForm.trim_name || null,
          engine: trimForm.engine || null,
          transmission: trimForm.transmission || null,
          drivetrain: trimForm.drivetrain || null,
          // Interior design
          seat_count: trimForm.seat_count ? parseInt(trimForm.seat_count) : null,
          trunk_volume: trimForm.trunk_volume ? parseInt(trimForm.trunk_volume) : null,
          // Exterior design
          door_count: trimForm.door_count ? parseInt(trimForm.door_count) : null,
          width: trimForm.width ? parseInt(trimForm.width) : null,
          length: trimForm.length ? parseInt(trimForm.length) : null,
          height: trimForm.height ? parseInt(trimForm.height) : null,
          weight: trimForm.weight ? parseInt(trimForm.weight) : null,
          body_type: trimForm.body_type || null,
          // Fuel economy
          fuel_type: trimForm.fuel_type || null,
          avg_consumption: trimForm.avg_consumption ? parseFloat(trimForm.avg_consumption) : null,
          // Performance
          max_torque: trimForm.max_torque ? parseInt(trimForm.max_torque) : null,
          max_speed: trimForm.max_speed ? parseInt(trimForm.max_speed) : null,
          acceleration_0_to_100: trimForm.acceleration_0_to_100 ? parseFloat(trimForm.acceleration_0_to_100) : null,
          horsepower: trimForm.horsepower ? parseInt(trimForm.horsepower) : null,
          transmission_type: trimForm.transmission_type || null,
          drive_type: trimForm.drive_type || null,
          // Images
          image_urls: imageUrlsArray,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to add trim");
      }

      setSuccess("Trim added successfully!");
      setTrimForm({
        model_id: "",
        year: "",
        trim_name: "",
        engine: "",
        transmission: "",
        drivetrain: "",
        seat_count: "",
        trunk_volume: "",
        door_count: "",
        width: "",
        length: "",
        height: "",
        weight: "",
        body_type: "",
        fuel_type: "",
        avg_consumption: "",
        max_torque: "",
        max_speed: "",
        acceleration_0_to_100: "",
        horsepower: "",
        transmission_type: "",
        drive_type: "",
        image_urls: "",
      });
      setUploadedImageUrls([]);
      loadData();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBrand = async (id: number) => {
    if (!confirm("Are you sure? This will delete all related models and trims.")) return;

    try {
      const res = await fetch(`/api/admin/brands?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete brand");
      setSuccess("Brand deleted successfully!");
      loadData();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    }
  };

  const handleDeleteModel = async (id: number) => {
    if (!confirm("Are you sure? This will delete all related trims.")) return;

    try {
      const res = await fetch(`/api/admin/models?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete model");
      setSuccess("Model deleted successfully!");
      loadData();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    }
  };

  const handleDeleteTrim = async (id: number) => {
    if (!confirm("Are you sure?")) return;

    try {
      const res = await fetch(`/api/admin/trims?id=${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete trim");
      }
      setSuccess("Trim deleted successfully!");
      loadData();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Panel</h1>
        <p className="text-muted-foreground">
          Manage car brands, models, and trims
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800">{success}</p>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="mb-6 border-b border-border">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab("brands")}
            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
              activeTab === "brands"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Brands ({brands.length})
          </button>
          <button
            onClick={() => setActiveTab("models")}
            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
              activeTab === "models"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Models ({models.length})
          </button>
          <button
            onClick={() => setActiveTab("trims")}
            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
              activeTab === "trims"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Trims ({trims.length})
          </button>
          <button
            onClick={() => setActiveTab("images")}
            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
              activeTab === "images"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Upload Images
          </button>
        </div>
      </div>

      {/* Brands Tab */}
      {activeTab === "brands" && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add New Brand
            </h2>
            <form onSubmit={handleAddBrand} className="space-y-4">
              <div>
                <Label htmlFor="brand-name">Brand Name *</Label>
                <Input
                  id="brand-name"
                  value={brandForm.name}
                  onChange={(e) =>
                    setBrandForm({ ...brandForm, name: e.target.value })
                  }
                  placeholder="e.g., Toyota"
                  required
                />
              </div>
              <div>
                <Label htmlFor="brand-country">Country</Label>
                <Input
                  id="brand-country"
                  value={brandForm.country}
                  onChange={(e) =>
                    setBrandForm({ ...brandForm, country: e.target.value })
                  }
                  placeholder="e.g., Japan"
                />
              </div>
              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Brand
                  </>
                )}
              </Button>
            </form>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">All Brands</h2>
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {brands.map((brand) => (
                <div
                  key={brand.id}
                  className="flex items-center justify-between p-3 bg-accent/50 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{brand.name}</p>
                    {brand.country && (
                      <p className="text-sm text-muted-foreground">{brand.country}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteBrand(brand.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Models Tab */}
      {activeTab === "models" && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add New Model
            </h2>
            <form onSubmit={handleAddModel} className="space-y-4">
              <div>
                <Label htmlFor="model-brand">Brand *</Label>
                <select
                  id="model-brand"
                  value={modelForm.brand_id}
                  onChange={(e) =>
                    setModelForm({ ...modelForm, brand_id: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-border rounded-md bg-background"
                  required
                >
                  <option value="">Select a brand</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="model-name">Model Name *</Label>
                <Input
                  id="model-name"
                  value={modelForm.name}
                  onChange={(e) =>
                    setModelForm({ ...modelForm, name: e.target.value })
                  }
                  placeholder="e.g., Corolla"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="model-start-year">Start Year</Label>
                  <Input
                    id="model-start-year"
                    type="number"
                    value={modelForm.start_year}
                    onChange={(e) =>
                      setModelForm({ ...modelForm, start_year: e.target.value })
                    }
                    placeholder="2020"
                  />
                </div>
                <div>
                  <Label htmlFor="model-end-year">End Year</Label>
                  <Input
                    id="model-end-year"
                    type="number"
                    value={modelForm.end_year}
                    onChange={(e) =>
                      setModelForm({ ...modelForm, end_year: e.target.value })
                    }
                    placeholder="Leave empty if current"
                  />
                </div>
              </div>
              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Model
                  </>
                )}
              </Button>
            </form>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">All Models</h2>
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {models.map((model) => (
                <div
                  key={model.id}
                  className="flex items-center justify-between p-3 bg-accent/50 rounded-lg"
                >
                  <div>
                    <p className="font-medium">
                      {model.car_brands.name} {model.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {model.start_year && `${model.start_year} - `}
                      {model.end_year || "Present"}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteModel(model.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Trims Tab */}
      {activeTab === "trims" && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add New Trim
            </h2>
            <form onSubmit={handleAddTrim} className="space-y-4">
              <div>
                <Label htmlFor="trim-model">Model *</Label>
                <select
                  id="trim-model"
                  value={trimForm.model_id}
                  onChange={(e) =>
                    setTrimForm({ ...trimForm, model_id: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-border rounded-md bg-background"
                  required
                >
                  <option value="">Select a model</option>
                  {models.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.car_brands.name} {model.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="trim-year">Year *</Label>
                <Input
                  id="trim-year"
                  type="number"
                  value={trimForm.year}
                  onChange={(e) =>
                    setTrimForm({ ...trimForm, year: e.target.value })
                  }
                  placeholder="2024"
                  required
                />
              </div>
              <div>
                <Label htmlFor="trim-name">Trim Name</Label>
                <Input
                  id="trim-name"
                  value={trimForm.trim_name}
                  onChange={(e) =>
                    setTrimForm({ ...trimForm, trim_name: e.target.value })
                  }
                  placeholder="e.g., Sport, Limited"
                />
              </div>
              <div>
                <Label htmlFor="trim-engine">Engine</Label>
                <Input
                  id="trim-engine"
                  value={trimForm.engine}
                  onChange={(e) =>
                    setTrimForm({ ...trimForm, engine: e.target.value })
                  }
                  placeholder="e.g., 2.0L Turbo"
                />
              </div>
              <div>
                <Label htmlFor="trim-transmission">Transmission</Label>
                <Input
                  id="trim-transmission"
                  value={trimForm.transmission}
                  onChange={(e) =>
                    setTrimForm({ ...trimForm, transmission: e.target.value })
                  }
                  placeholder="e.g., Automatic"
                />
              </div>
              <div>
                <Label htmlFor="trim-drivetrain">Drivetrain</Label>
                <Input
                  id="trim-drivetrain"
                  value={trimForm.drivetrain}
                  onChange={(e) =>
                    setTrimForm({ ...trimForm, drivetrain: e.target.value })
                  }
                  placeholder="e.g., FWD, AWD"
                />
              </div>

              {/* Interior Design Specifications */}
              <div className="pt-4 border-t border-border">
                <h3 className="text-sm font-semibold mb-3 text-primary">İç Tasarım Özellikleri</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="trim-seat-count">Koltuk Sayısı</Label>
                    <Input
                      id="trim-seat-count"
                      type="number"
                      value={trimForm.seat_count}
                      onChange={(e) =>
                        setTrimForm({ ...trimForm, seat_count: e.target.value })
                      }
                      placeholder="e.g., 5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="trim-trunk-volume">Bagaj Hacmi (L)</Label>
                    <Input
                      id="trim-trunk-volume"
                      type="number"
                      value={trimForm.trunk_volume}
                      onChange={(e) =>
                        setTrimForm({ ...trimForm, trunk_volume: e.target.value })
                      }
                      placeholder="e.g., 450"
                    />
                  </div>
                </div>
              </div>

              {/* Exterior Design Specifications */}
              <div className="pt-4 border-t border-border">
                <h3 className="text-sm font-semibold mb-3 text-primary">Dış Tasarım Özellikleri</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="trim-door-count">Kapı Sayısı</Label>
                    <Input
                      id="trim-door-count"
                      type="number"
                      value={trimForm.door_count}
                      onChange={(e) =>
                        setTrimForm({ ...trimForm, door_count: e.target.value })
                      }
                      placeholder="e.g., 4"
                    />
                  </div>
                  <div>
                    <Label htmlFor="trim-body-type">Gövde Tipi</Label>
                    <Input
                      id="trim-body-type"
                      value={trimForm.body_type}
                      onChange={(e) =>
                        setTrimForm({ ...trimForm, body_type: e.target.value })
                      }
                      placeholder="e.g., Sedan, SUV"
                    />
                  </div>
                  <div>
                    <Label htmlFor="trim-width">Genişlik (mm)</Label>
                    <Input
                      id="trim-width"
                      type="number"
                      value={trimForm.width}
                      onChange={(e) =>
                        setTrimForm({ ...trimForm, width: e.target.value })
                      }
                      placeholder="e.g., 1820"
                    />
                  </div>
                  <div>
                    <Label htmlFor="trim-length">Uzunluk (mm)</Label>
                    <Input
                      id="trim-length"
                      type="number"
                      value={trimForm.length}
                      onChange={(e) =>
                        setTrimForm({ ...trimForm, length: e.target.value })
                      }
                      placeholder="e.g., 4650"
                    />
                  </div>
                  <div>
                    <Label htmlFor="trim-height">Yükseklik (mm)</Label>
                    <Input
                      id="trim-height"
                      type="number"
                      value={trimForm.height}
                      onChange={(e) =>
                        setTrimForm({ ...trimForm, height: e.target.value })
                      }
                      placeholder="e.g., 1470"
                    />
                  </div>
                  <div>
                    <Label htmlFor="trim-weight">Ağırlık (kg)</Label>
                    <Input
                      id="trim-weight"
                      type="number"
                      value={trimForm.weight}
                      onChange={(e) =>
                        setTrimForm({ ...trimForm, weight: e.target.value })
                      }
                      placeholder="e.g., 1450"
                    />
                  </div>
                </div>
              </div>

              {/* Fuel Economy Specifications */}
              <div className="pt-4 border-t border-border">
                <h3 className="text-sm font-semibold mb-3 text-primary">Yakıt Ekonomisi</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="trim-fuel-type">Yakıt Tipi</Label>
                    <Input
                      id="trim-fuel-type"
                      value={trimForm.fuel_type}
                      onChange={(e) =>
                        setTrimForm({ ...trimForm, fuel_type: e.target.value })
                      }
                      placeholder="e.g., Benzin, Dizel, Elektrik"
                    />
                  </div>
                  <div>
                    <Label htmlFor="trim-avg-consumption">Ort. Yakıt Tüketimi (L/100km)</Label>
                    <Input
                      id="trim-avg-consumption"
                      type="number"
                      step="0.1"
                      value={trimForm.avg_consumption}
                      onChange={(e) =>
                        setTrimForm({ ...trimForm, avg_consumption: e.target.value })
                      }
                      placeholder="e.g., 6.5"
                    />
                  </div>
                </div>
              </div>

              {/* Performance Specifications */}
              <div className="pt-4 border-t border-border">
                <h3 className="text-sm font-semibold mb-3 text-primary">Performans Özellikleri</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="trim-horsepower">Beygir Gücü (HP)</Label>
                    <Input
                      id="trim-horsepower"
                      type="number"
                      value={trimForm.horsepower}
                      onChange={(e) =>
                        setTrimForm({ ...trimForm, horsepower: e.target.value })
                      }
                      placeholder="e.g., 150"
                    />
                  </div>
                  <div>
                    <Label htmlFor="trim-max-torque">Azami Tork (Nm)</Label>
                    <Input
                      id="trim-max-torque"
                      type="number"
                      value={trimForm.max_torque}
                      onChange={(e) =>
                        setTrimForm({ ...trimForm, max_torque: e.target.value })
                      }
                      placeholder="e.g., 250"
                    />
                  </div>
                  <div>
                    <Label htmlFor="trim-max-speed">Azami Hız (km/h)</Label>
                    <Input
                      id="trim-max-speed"
                      type="number"
                      value={trimForm.max_speed}
                      onChange={(e) =>
                        setTrimForm({ ...trimForm, max_speed: e.target.value })
                      }
                      placeholder="e.g., 210"
                    />
                  </div>
                  <div>
                    <Label htmlFor="trim-acceleration">0-100 km/h (saniye)</Label>
                    <Input
                      id="trim-acceleration"
                      type="number"
                      step="0.01"
                      value={trimForm.acceleration_0_to_100}
                      onChange={(e) =>
                        setTrimForm({ ...trimForm, acceleration_0_to_100: e.target.value })
                      }
                      placeholder="e.g., 8.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="trim-transmission-type">Vites Türü</Label>
                    <Input
                      id="trim-transmission-type"
                      value={trimForm.transmission_type}
                      onChange={(e) =>
                        setTrimForm({ ...trimForm, transmission_type: e.target.value })
                      }
                      placeholder="e.g., Otomatik, Manuel"
                    />
                  </div>
                  <div>
                    <Label htmlFor="trim-drive-type">Çekiş Tipi</Label>
                    <Input
                      id="trim-drive-type"
                      value={trimForm.drive_type}
                      onChange={(e) =>
                        setTrimForm({ ...trimForm, drive_type: e.target.value })
                      }
                      placeholder="e.g., FWD, AWD"
                    />
                  </div>
                </div>
              </div>

              {/* Image Upload */}
              <div className="pt-4 border-t border-border">
                <h3 className="text-sm font-semibold mb-3 text-primary">Araba Fotoğrafları</h3>
                
                {/* Upload Area */}
                <div className="mb-4">
                  <Label htmlFor="trim-image-upload" className="mb-2 block">
                    Fotoğrafları Yükle
                  </Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                    <input
                      type="file"
                      id="trim-image-upload"
                      className="hidden"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      multiple
                      onChange={(e) => handleImageUpload(e.target.files)}
                      disabled={uploadingImages || !trimForm.model_id}
                    />
                    <label
                      htmlFor="trim-image-upload"
                      className={`cursor-pointer ${!trimForm.model_id ? 'cursor-not-allowed opacity-50' : ''}`}
                    >
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm font-medium mb-1">
                        {uploadingImages ? 'Yükleniyor...' : 'Fotoğraf yüklemek için tıklayın'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {!trimForm.model_id 
                          ? 'Önce model seçmelisiniz' 
                          : 'PNG, JPG, WebP (Çoklu seçim mümkün)'}
                      </p>
                    </label>
                  </div>
                </div>

                {/* Uploaded Images Preview */}
                {uploadedImageUrls.length > 0 && (
                  <div>
                    <Label className="mb-2 block">
                      Yüklenen Fotoğraflar ({uploadedImageUrls.length})
                    </Label>
                    <div className="grid grid-cols-2 gap-3">
                      {uploadedImageUrls.map((url, idx) => (
                        <div
                          key={idx}
                          className="relative group rounded-lg overflow-hidden border border-border"
                        >
                          <img
                            src={url}
                            alt={`Car ${idx + 1}`}
                            className="w-full h-24 object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(url)}
                            className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Manual URL Input (Optional) */}
                <div className="mt-4">
                  <Label htmlFor="trim-image-urls" className="text-xs text-muted-foreground">
                    Veya URL'leri manuel girin (virgülle ayırın)
                  </Label>
                  <textarea
                    id="trim-image-urls"
                    value={trimForm.image_urls}
                    onChange={(e) =>
                      setTrimForm({ ...trimForm, image_urls: e.target.value })
                    }
                    placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                    rows={2}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-xs font-mono mt-1"
                  />
                </div>
              </div>

              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Trim
                  </>
                )}
              </Button>
            </form>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">All Trims</h2>
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {trims.map((trim) => (
                <div
                  key={trim.id}
                  className="flex items-center justify-between p-3 bg-accent/50 rounded-lg"
                >
                  <div>
                    <p className="font-medium">
                      {trim.car_models.car_brands.name} {trim.car_models.name}{" "}
                      {trim.year}
                    </p>
                    {trim.trim_name && (
                      <p className="text-sm text-muted-foreground">{trim.trim_name}</p>
                    )}
                    {trim.engine && (
                      <p className="text-xs text-muted-foreground">
                        {trim.engine} • {trim.transmission} • {trim.drivetrain}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteTrim(trim.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Images Tab */}
      {activeTab === "images" && (
        <div className="max-w-4xl mx-auto">
          <ImageUploader
            onUploadComplete={(images) => {
              console.log("Uploaded images:", images);
            }}
          />
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">📝 Instructions:</h3>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Enter a unique car slug (e.g., "toyota-corolla-2024")</li>
              <li>Upload one or multiple images for the car</li>
              <li>Copy the public URLs and use them in your application</li>
              <li>Images are stored in Supabase Storage under "review-images/cars/"</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}

