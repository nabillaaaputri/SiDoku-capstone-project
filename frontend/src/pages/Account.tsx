import { useState, useEffect, useRef } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/services/auth.service";
import apiClient from "@/services/api";
import { useNavigate } from "react-router-dom";
import { Camera, Eye, EyeOff, Lock, Shield, Store, User } from "lucide-react";

const MAX_PROFILE_IMAGE_SIZE = 1 * 1024 * 1024;

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

interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

interface ProfileResponseData {
  id: string;
  ownerName: string;
  email: string;
  phoneNumber?: string;
  profileImage?: string;
}

interface StoreAccountResponseData {
  id: string;
  storeName: string;
  storeCategory?: string;
  storeAddress?: string;
  storeDescription?: string;
}

const createEmptyProfileData = (): ProfileData => ({
  ownerName: "",
  email: "",
  phone: "",
  shopName: "",
  shopCategory: "",
  shopAddress: "",
  shopDescription: "",
  profileImage: "",
});

const buildProfileData = (
  profile: ProfileResponseData,
  storeAccount: StoreAccountResponseData,
): ProfileData => {

  return {
    ownerName: profile.ownerName || "",
    email: profile.email || "",
    phone: profile.phoneNumber || "",
    shopName: storeAccount.storeName || "",
    shopCategory: storeAccount.storeCategory || "",
    shopAddress: storeAccount.storeAddress || "",
    shopDescription: storeAccount.storeDescription || "",
    profileImage: profile.profileImage || "",
  };
};

export default function Account() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, refreshUser, logout } = useAuth();
  const profileImageInputRef = useRef<HTMLInputElement | null>(null);
  const savedProfileDataRef = useRef<ProfileData>(createEmptyProfileData());
  const [activeTab, setActiveTab] = useState<"profile" | "shop" | "security">(
    "profile"
  );
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<ProfileData>(() => createEmptyProfileData());

  const loadAccountData = async () => {
    const [profileResponse, storeAccountResponse] = await Promise.all([
      apiClient.get<ApiResponse<ProfileResponseData>>("/settings/profile"),
      apiClient.get<ApiResponse<StoreAccountResponseData>>("/settings/store-account"),
    ]);

    const nextProfileData = buildProfileData(
      profileResponse.data.data,
      storeAccountResponse.data.data,
    );

    savedProfileDataRef.current = nextProfileData;
    setFormData(nextProfileData);

    return nextProfileData;
  };

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    let isActive = true;

    const fetchAccountData = async () => {
      try {
        await loadAccountData();

        if (!isActive) {
          return;
        }
      } catch (error) {
        if (!isActive) {
          return;
        }

        toast({
          title: "Error",
          description: authService.getErrorMessage(error, "Gagal memuat data akun."),
          variant: "destructive",
        });
      }
    };

    fetchAccountData();

    return () => {
      isActive = false;
    };
  }, [toast, user?.id]);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.currentTarget;

    if (name === "shopName") {
      setFormData((prev) => ({ ...prev, shopName: value }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!isEditing) {
      event.target.value = "";
      return;
    }

    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Error",
        description: "Hanya file gambar yang diperbolehkan.",
        variant: "destructive",
      });
      event.target.value = "";
      return;
    }

    if (file.size > MAX_PROFILE_IMAGE_SIZE) {
      toast({
        title: "Error",
        description: "Ukuran foto terlalu besar. Maksimal 1MB.",
        variant: "destructive",
      });
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      if (!result) {
        return;
      }

      setFormData((prev) => ({ ...prev, profileImage: result }));
    };
    reader.readAsDataURL(file);
  };

  const resetProfileDraft = () => {
    const savedProfileData = savedProfileDataRef.current;

    setFormData(savedProfileData);

    if (profileImageInputRef.current) {
      profileImageInputRef.current.value = "";
    }
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
        console.log("SAVE SHOP FORM DATA:", formData);
        await authService.updateStoreAccount({
          storeName: formData.shopName,
          storeCategory: formData.shopCategory,
          storeAddress: formData.shopAddress,
          storeDescription: formData.shopDescription,
        });
      }

      savedProfileDataRef.current = formData;
      if (profileImageInputRef.current) {
        profileImageInputRef.current.value = "";
      }
      setIsEditing(false);

      await Promise.allSettled([
        loadAccountData(),
        refreshUser(),
      ]);

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

  const resetPasswordForm = () => {
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    });
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  const handleChangePassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!passwordData.currentPassword.trim()) {
      toast({
        title: "Error",
        description: "Password lama wajib diisi.",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 5) {
      toast({
        title: "Error",
        description: "Password baru minimal 5 karakter.",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword === passwordData.currentPassword) {
      toast({
        title: "Error",
        description: "Password baru tidak boleh sama dengan password lama.",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      toast({
        title: "Error",
        description: "Password baru dan konfirmasi password tidak sama.",
        variant: "destructive",
      });
      return;
    }

    setIsChangingPassword(true);

    try {
      await authService.updatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmNewPassword: passwordData.confirmNewPassword,
      });

      toast({
        title: "Berhasil",
        description: "Password berhasil diubah. Silakan login ulang.",
      });

      resetPasswordForm();
      await logout();
      navigate("/login", { replace: true });
    } catch (error) {
      toast({
        title: "Error",
        description: authService.getErrorMessage(error, "Gagal mengubah password."),
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const initials = formData.ownerName
    .split(" ")
    .filter(Boolean)
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
                  if (isEditing) {
                    resetProfileDraft();
                  }
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
              <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-2xl font-bold text-white shadow-md">
                {formData.profileImage ? (
                  <img
                    src={formData.profileImage}
                    alt="Foto profil"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  initials
                )}
              </div>
              <div className="space-y-1.5">
                <p className="text-sm font-semibold text-slate-900">{formData.ownerName}</p>
                <p className="text-xs text-slate-500">
                  Gunakan foto yang jelas agar profil mudah dikenali.
                </p>
                {isEditing && (
                  <Button
                    type="button"
                    variant="outline"
                    className="h-9 rounded-lg border-slate-200 px-3 text-sm"
                    onClick={() => profileImageInputRef.current?.click()}
                  >
                    <Camera size={14} className="mr-1.5" />
                    Ubah Foto
                  </Button>
                )}
              </div>
            </div>

            <input
              ref={profileImageInputRef}
              type="file"
              accept="image/*"
              onChange={handleProfileImageSelect}
              className="hidden"
            />

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

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Foto Profil / Warung
                </label>
                <div className="flex h-11 items-center rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-600">
                  {formData.profileImage ? "Foto profil tersimpan" : "Belum ada foto"}
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  Foto akan dipreview di frontend dan disimpan ke pengaturan akun.
                </p>
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
                    onClick={() => {
                      resetProfileDraft();
                      setIsEditing(false);
                    }}
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
                    onClick={() => {
                      resetProfileDraft();
                      setIsEditing(false);
                    }}
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

              <form className="space-y-4" onSubmit={handleChangePassword}>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Password Lama
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      placeholder="Masukkan password lama"
                      className={`${inputClass} pr-11`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword((current) => !current)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-800"
                      aria-label={showCurrentPassword ? "Sembunyikan password lama" : "Tampilkan password lama"}
                    >
                      {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Password Baru
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      placeholder="Masukkan password baru"
                      className={`${inputClass} pr-11`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword((current) => !current)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-800"
                      aria-label={showNewPassword ? "Sembunyikan password baru" : "Tampilkan password baru"}
                    >
                      {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Konfirmasi Password Baru
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmNewPassword"
                      value={passwordData.confirmNewPassword}
                      onChange={handlePasswordChange}
                      placeholder="Ulangi password baru"
                      className={`${inputClass} pr-11`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((current) => !current)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-800"
                      aria-label={showConfirmPassword ? "Sembunyikan konfirmasi password" : "Tampilkan konfirmasi password"}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isChangingPassword}
                  className="h-11 rounded-xl bg-blue-600 px-5 text-white hover:bg-blue-700"
                >
                  {isChangingPassword ? "Menyimpan..." : "Ubah Password"}
                </Button>
              </div>
              </form>
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
