import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { User, Lock, Store } from "lucide-react";

interface ProfileData {
  ownerName: string;
  email: string;
  phone: string;
  shopName: string;
  shopCategory: string;
  shopAddress: string;
  shopDescription: string;
  profileImage?: string;
}

export default function Account() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"profile" | "shop" | "security">(
    "profile"
  );
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<ProfileData>({
    ownerName: user?.name || "Nama Pemilik Toko",
    email: user?.email || "pemilik@sidoku.id",
    phone: "+62 812 3456 7890",
    shopName: user?.storeName || "Toko Saya",
    shopCategory: "Retail",
    shopAddress: "Jl. Contoh No. 123, Jakarta",
    shopDescription: "Toko online yang menjual berbagai produk berkualitas",
  });

  // Update form data when user changes
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        ownerName: user.name || prev.ownerName,
        email: user.email || prev.email,
        shopName: user.storeName || prev.shopName,
      }));
    }
  }, [user]);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = () => {
    setIsEditing(false);
    toast({
      title: "Berhasil",
      description: "Profil Anda telah diperbarui",
    });
  };

  const handleChangePassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "Password baru tidak cocok",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password harus minimal 6 karakter",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Berhasil",
      description: "Password Anda telah diubah",
    });

    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Pengaturan Akun</h1>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b-2 border-black">
          <button
            onClick={() => setActiveTab("profile")}
            className={`px-4 py-3 font-bold border-b-2 transition ${
              activeTab === "profile"
                ? "border-b-black text-black"
                : "border-b-transparent text-gray-600 hover:text-black"
            }`}
          >
            <User className="inline mr-2" size={18} />
            Profil
          </button>
          <button
            onClick={() => setActiveTab("shop")}
            className={`px-4 py-3 font-bold border-b-2 transition ${
              activeTab === "shop"
                ? "border-b-black text-black"
                : "border-b-transparent text-gray-600 hover:text-black"
            }`}
          >
            <Store className="inline mr-2" size={18} />
            Data Toko
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={`px-4 py-3 font-bold border-b-2 transition ${
              activeTab === "security"
                ? "border-b-black text-black"
                : "border-b-transparent text-gray-600 hover:text-black"
            }`}
          >
            <Lock className="inline mr-2" size={18} />
            Keamanan
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="space-y-6">
            <div className="border-3 border-black p-6 bg-white">
              <h2 className="text-2xl font-bold mb-6">Informasi Profil</h2>

              {/* Profile Picture Section */}
              <div className="mb-6 pb-6 border-b-2 border-gray-200">
                <label className="block text-sm font-bold mb-3">Foto Profil</label>
                <div className="flex gap-4 items-center">
                  <div className="w-20 h-20 rounded-full bg-gray-300 border-2 border-black flex items-center justify-center text-2xl font-bold">
                    👤
                  </div>
                  {isEditing && (
                    <input
                      type="file"
                      accept="image/*"
                      className="border-2 border-black px-3 py-2 text-sm"
                    />
                  )}
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                {/* Owner Name */}
                <div>
                  <label className="block text-sm font-bold mb-2">
                    Nama Pemilik Toko
                  </label>
                  <input
                    type="text"
                    name="ownerName"
                    value={formData.ownerName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full border-2 border-black px-3 py-2 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-bold mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full border-2 border-black px-3 py-2 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-bold mb-2">
                    Nomor Telepon
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full border-2 border-black px-3 py-2 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-6">
                {!isEditing ? (
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="border-2 border-black bg-black text-white px-4 py-2 font-bold hover:bg-gray-800"
                  >
                    Edit Profil
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={handleSaveProfile}
                      className="border-2 border-black bg-black text-white px-4 py-2 font-bold hover:bg-gray-800"
                    >
                      Simpan Perubahan
                    </Button>
                    <Button
                      onClick={() => setIsEditing(false)}
                      variant="outline"
                      className="border-2 border-black px-4 py-2 font-bold hover:bg-gray-100"
                    >
                      Batal
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Shop Data Tab */}
        {activeTab === "shop" && (
          <div className="space-y-6">
            <div className="border-3 border-black p-6 bg-white">
              <h2 className="text-2xl font-bold mb-6">Data Toko</h2>

              <div className="space-y-4">
                {/* Shop Name */}
                <div>
                  <label className="block text-sm font-bold mb-2">
                    Nama Toko
                  </label>
                  <input
                    type="text"
                    name="shopName"
                    value={formData.shopName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full border-2 border-black px-3 py-2 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Shop Category */}
                <div>
                  <label className="block text-sm font-bold mb-2">
                    Kategori Toko
                  </label>
                  <select
                    name="shopCategory"
                    value={formData.shopCategory}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full border-2 border-black px-3 py-2 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option>Retail</option>
                    <option>Grosir</option>
                    <option>Jasa</option>
                    <option>Makanan & Minuman</option>
                    <option>Fashion</option>
                    <option>Elektronik</option>
                    <option>Lainnya</option>
                  </select>
                </div>

                {/* Shop Address */}
                <div>
                  <label className="block text-sm font-bold mb-2">
                    Alamat Toko
                  </label>
                  <textarea
                    name="shopAddress"
                    value={formData.shopAddress}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    rows={3}
                    className="w-full border-2 border-black px-3 py-2 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Shop Description */}
                <div>
                  <label className="block text-sm font-bold mb-2">
                    Deskripsi Toko
                  </label>
                  <textarea
                    name="shopDescription"
                    value={formData.shopDescription}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    rows={3}
                    className="w-full border-2 border-black px-3 py-2 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-6">
                {!isEditing ? (
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="border-2 border-black bg-black text-white px-4 py-2 font-bold hover:bg-gray-800"
                  >
                    Edit Data Toko
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={handleSaveProfile}
                      className="border-2 border-black bg-black text-white px-4 py-2 font-bold hover:bg-gray-800"
                    >
                      Simpan Perubahan
                    </Button>
                    <Button
                      onClick={() => setIsEditing(false)}
                      variant="outline"
                      className="border-2 border-black px-4 py-2 font-bold hover:bg-gray-100"
                    >
                      Batal
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === "security" && (
          <div className="space-y-6">
            <div className="border-3 border-black p-6 bg-white">
              <h2 className="text-2xl font-bold mb-6">Keamanan Akun</h2>

              <div className="space-y-4">
                {/* Current Password */}
                <div>
                  <label className="block text-sm font-bold mb-2">
                    Password Saat Ini
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className="w-full border-2 border-black px-3 py-2"
                  />
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-bold mb-2">
                    Password Baru
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full border-2 border-black px-3 py-2"
                  />
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-bold mb-2">
                    Konfirmasi Password Baru
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className="w-full border-2 border-black px-3 py-2"
                  />
                </div>
              </div>

              {/* Action Button */}
              <div className="flex gap-2 mt-6">
                <Button
                  onClick={handleChangePassword}
                  className="border-2 border-black bg-black text-white px-4 py-2 font-bold hover:bg-gray-800"
                >
                  Ubah Password
                </Button>
              </div>
            </div>

            {/* Additional Security Info */}
            <div className="border-3 border-black p-6 bg-gray-50">
              <h3 className="font-bold mb-4">Informasi Keamanan</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>
                  • Akun Anda dilindungi dengan enkripsi tingkat enterprise
                </li>
                <li>• Ganti password secara berkala untuk keamanan maksimal</li>
                <li>
                  • Jangan pernah membagikan password Anda kepada siapapun
                </li>
                <li>
                  • Gunakan password yang kuat kombinasi huruf, angka, dan simbol
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
