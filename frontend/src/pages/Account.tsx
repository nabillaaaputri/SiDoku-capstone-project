import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { authService, getPreferredUserName } from "@/services/auth.service";
import { Camera, Lock, Shield, Store, User } from "lucide-react";

interface ProfileData {
  ownerName: string;
  email: string;
  phone: string;
  shopName: string;
  shopCategory: string;
  shopAddress: string;
  shopDescription: string;
  profileImage: string;
}

export default function Account() {
  const { toast } = useToast();
  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState<"profile" | "shop" | "security">(
    "profile"
  );
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const displayName = getPreferredUserName(user);
  const [formData, setFormData] = useState<ProfileData>({
    ownerName: displayName,
    email: user?.email || "pemilik@sidoku.id",
    phone: "+62 812 3456 7890",
    shopName: user?.storeName || displayName,
    shopCategory: "Retail",
    shopAddress: "Jl. Contoh No. 123, Jakarta",
    shopDescription: "Toko online yang menjual berbagai produk berkualitas",
    profileImage: "https://example.com/profile.png",
  });

  // Update form data when user changes
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        ownerName: getPreferredUserName(user),
        email: user.email || prev.email,
        shopName: user.storeName || getPreferredUserName(user),
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

  const handleSaveProfile = async () => {
    setIsSaving(true);

    try {
      if (activeTab === "profile") {
        await authService.updateProfile({
          ownerName: formData.ownerName,
          email: formData.email,
          phoneNumber: formData.phone,
          profileImage: formData.profileImage,
        });
      }

      if (activeTab === "shop") {
        await authService.updateStoreAccount({
          storeName: formData.shopName,
          storeCategory: formData.shopCategory,
          storeAddress: formData.shopAddress,
          storeDescription: formData.shopDescription,
        });
      }

      await refreshUser();
      setIsEditing(false);

      toast({
        title: "Berhasil",
        description: activeTab === "profile"
          ? "Profil Anda telah diperbarui"
          : "Data toko Anda telah diperbarui",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: authService.getErrorMessage(error, "Gagal memperbarui data akun."),
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
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

  const initials = formData.ownerName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const tabs = [
    { key: "profile" as const, label: "Profil", icon: User },
    { key: "shop" as const, label: "Data Toko", icon: Store },
    { key: "security" as const, label: "Keamanan", icon: Lock },
  ];

  const inputClass =
    "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500";
  const selectClass =
    "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500";
  const textareaClass =
    "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500";

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-5">
        {/* Header */}
        <section className="section-shell overflow-hidden">
          <div className="p-4 sm:p-5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-[2rem]">
              Pengaturan Akun
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-600">
              Kelola profil, data toko, dan keamanan akun Anda.
            </p>
          </div>
        </section>

        {/* Tab Navigation */}
        <div className="flex gap-1.5 overflow-x-auto rounded-xl bg-slate-100 p-1.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key);
                  setIsEditing(false);
                }}
                className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                  isActive
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="section-shell p-5 sm:p-6 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Informasi Profil</h2>
              <p className="text-sm text-slate-600">Perbarui data pribadi pemilik toko.</p>
            </div>

            {/* Profile Picture Section */}
            <div className="flex items-center gap-5 rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-2xl font-bold text-white shadow-md">
                {initials}
              </div>
              <div className="space-y-1.5">
                {isEditing ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="h-9 rounded-lg border-slate-200 px-3 text-sm"
                  >
                    <Camera size={14} className="mr-1.5" />
                    Ubah Foto
                  </Button>
                ) : (
                  <p className="text-sm font-semibold text-slate-900">{formData.ownerName}</p>
                )}
                <p className="text-xs text-slate-500">
                  Gunakan foto yang jelas agar profil mudah dikenali.
                </p>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Nama Pemilik Toko
                </label>
                <input
                  type="text"
                  name="ownerName"
                  value={formData.ownerName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Nomor Telepon
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={inputClass}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              {!isEditing ? (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="h-11 rounded-xl bg-slate-900 px-5 text-white hover:bg-slate-800"
                >
                  Edit Profil
                </Button>
              ) : (
                <>
                  <Button
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="h-11 rounded-xl bg-blue-600 px-5 text-white hover:bg-blue-700"
                  >
                    {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
                  </Button>
                  <Button
                    onClick={() => setIsEditing(false)}
                    variant="outline"
                    className="h-11 rounded-xl border-slate-200 px-5 hover:bg-slate-50"
                  >
                    Batal
                  </Button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Shop Data Tab */}
        {activeTab === "shop" && (
          <div className="section-shell p-5 sm:p-6 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Data Toko</h2>
              <p className="text-sm text-slate-600">Kelola informasi dan detail toko Anda.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Nama Toko
                </label>
                <input
                  type="text"
                  name="shopName"
                  value={formData.shopName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Jenis Usaha
                </label>
                <select
                  name="shopCategory"
                  value={formData.shopCategory}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={selectClass}
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

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Alamat Toko
                </label>
                <textarea
                  name="shopAddress"
                  value={formData.shopAddress}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  rows={3}
                  className={textareaClass}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Deskripsi Toko
                </label>
                <textarea
                  name="shopDescription"
                  value={formData.shopDescription}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  rows={3}
                  className={textareaClass}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              {!isEditing ? (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="h-11 rounded-xl bg-slate-900 px-5 text-white hover:bg-slate-800"
                >
                  Edit Data Toko
                </Button>
              ) : (
                <>
                  <Button
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="h-11 rounded-xl bg-blue-600 px-5 text-white hover:bg-blue-700"
                  >
                    {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
                  </Button>
                  <Button
                    onClick={() => setIsEditing(false)}
                    variant="outline"
                    className="h-11 rounded-xl border-slate-200 px-5 hover:bg-slate-50"
                  >
                    Batal
                  </Button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === "security" && (
          <div className="space-y-4 sm:space-y-5">
            <div className="section-shell p-5 sm:p-6 space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Keamanan Akun</h2>
                <p className="text-sm text-slate-600">Ubah password untuk menjaga keamanan akun Anda.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Password Lama
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    placeholder="Masukkan password lama"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Password Baru
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="Masukkan password baru"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Konfirmasi Password Baru
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="Ulangi password baru"
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button
                  onClick={handleChangePassword}
                  className="h-11 rounded-xl bg-blue-600 px-5 text-white hover:bg-blue-700"
                >
                  Ubah Password
                </Button>
              </div>
            </div>

            {/* Security Tips */}
            <div className="section-shell border-slate-100 bg-slate-50/50 p-5 sm:p-6 space-y-3">
              <div className="flex items-center gap-2">
                <Shield size={18} className="text-slate-500" />
                <h3 className="text-sm font-bold text-slate-700">Tips Keamanan</h3>
              </div>
              <ul className="space-y-1.5 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-slate-400"></span>
                  Akun Anda dilindungi dengan enkripsi tingkat enterprise
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-slate-400"></span>
                  Ganti password secara berkala untuk keamanan maksimal
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-slate-400"></span>
                  Jangan pernah membagikan password Anda kepada siapapun
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-slate-400"></span>
                  Gunakan password yang kuat: kombinasi huruf, angka, dan simbol
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
