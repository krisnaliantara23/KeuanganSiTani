// src/pages/PengaturanPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  User,
  Bell,
  Lock,
  Mail,
  Phone,
  CalendarClock,
  Shield,
  XCircle,
} from "lucide-react";

import { getMe, updateMe, changeMyPassword } from "../services/authService";
import {
  createInvite,
  listKlasterInvites,
  revokeInvite,
  getMyInvites,
  acceptInvite,
  rejectInvite,
} from "../services/klasterInviteService";
import {
  listKlasters,
  getKlasterDetail,
  createKlaster,
  updateKlaster,
  deleteKlaster,
  kickMember,
} from "../services/klasterService";

export default function PengaturanPage() {
  const token = localStorage.getItem("token");

  // ===== Profile (auth/me) =====
  const [me, setMe] = useState(null);
  const [profile, setProfile] = useState({ name: "", email: "", phone: "" });
  const [loadingMe, setLoadingMe] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);

  // ===== Password =====
  const [pwd, setPwd] = useState({ old_password: "", new_password: "" });
  const [savingPwd, setSavingPwd] = useState(false);

  // ===== Invites (admin) =====
  const [invForm, setInvForm] = useState({
    email: "",
    phone: "",
    role: "member", // member | admin
    expires_local: "", // datetime-local
  });
  const [sending, setSending] = useState(false);
  const [invites, setInvites] = useState([]);
  const [loadingInvites, setLoadingInvites] = useState(false);

  // ===== My Invites (non-admin) =====
  const [myInvites, setMyInvites] = useState([]);
  const [loadingMyInv, setLoadingMyInv] = useState(false);
  const [actingId, setActingId] = useState(null);

  // ===== Klaster (admin tools) =====
  const [klasters, setKlasters] = useState([]);
  const [loadingKlasters, setLoadingKlasters] = useState(false);
  const [selectKlasterId, setSelectKlasterId] = useState("");
  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [mkName, setMkName] = useState("");
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");

  const isAdmin = useMemo(
    () => ["admin", "superadmin"].includes((me?.role || "").toLowerCase()),
    [me]
  );

  // ===== Initial: get /auth/me =====
  useEffect(() => {
    (async () => {
      try {
        const res = await getMe(token);
        const user = res.data?.user || res.data || null;
        setMe(user);
        setProfile({
          name: user?.nama || "",
          email: user?.email || "",
          phone: user?.nomor_telepon || "",
        });
      } catch (e) {
        console.error("Gagal load profil:", e);
      } finally {
        setLoadingMe(false);
      }
    })();
  }, [token]);

  // ===== Load undangan + data klaster berdasar role =====
  useEffect(() => {
    if (!me) return;

    if (isAdmin && me.klaster_id) {
      loadKlasterInvites();
    } else {
      loadMyInvites();
    }

    if (isAdmin) {
      loadKlasters();
      if (me.klaster_id) openMembers(me.klaster_id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me]);

  // ================== START CRUD KLASTER ========================
  async function loadKlasters() {
    try {
      setLoadingKlasters(true);
      const res = await listKlasters(token);
      const rows = Array.isArray(res.data?.data) ? res.data.data : res.data || [];
      setKlasters(rows);
      setSelectKlasterId(String(me?.klaster_id || ""));
    } catch (e) {
      console.error("Gagal ambil klaster:", e);
      setKlasters([]);
    } finally {
      setLoadingKlasters(false);
    }
  }

  async function openMembers(klasterId) {
    if (!klasterId) {
      setMembers([]);
      return;
    }
    try {
      setLoadingMembers(true);
      const res = await getKlasterDetail(token, klasterId);
      const list = Array.isArray(res.data?.members)
        ? res.data.members
        : res.data?.members || [];
      setMembers(list);
    } catch (e) {
      console.error("Gagal ambil members:", e);
      setMembers([]);
    } finally {
      setLoadingMembers(false);
    }
  }

  // ganti klaster (admin/superadmin)
  async function changeMyKlaster() {
    if (!selectKlasterId) return;
    try {
      await updateMe(token, { klaster_id: Number(selectKlasterId) });
      const fresh = await getMe(token);
      setMe(fresh.data?.user || fresh.data || null);
      await openMembers(Number(selectKlasterId));
      alert("Klaster berhasil diubah.");
    } catch (e) {
      console.error("Gagal ganti klaster:", e);
      alert(e?.response?.data?.message || "Gagal ganti klaster");
    }
  }

  // create/update/delete klaster
  async function onCreateKlaster(e) {
    e.preventDefault();
    if (!mkName.trim()) return;
    try {
      await createKlaster(token, { nama_klaster: mkName.trim() });
      setMkName("");
      await loadKlasters();
    } catch (e) {
      alert(e?.response?.data?.message || "Gagal membuat klaster");
    }
  }

  async function onUpdateKlaster(id) {
    if (!editName.trim()) return;
    try {
      await updateKlaster(token, id, { nama_klaster: editName.trim() });
      setEditId(null);
      setEditName("");
      await loadKlasters();
    } catch (e) {
      alert(e?.response?.data?.message || "Gagal update klaster");
    }
  }

  async function onDeleteKlaster(id) {
    if (!window.confirm("Hapus klaster ini?")) return;
    try {
      await deleteKlaster(token, id);
      if (String(me?.klaster_id) === String(id)) {
        // backend bisa set user.klaster_id=null; refresh profil
        const fresh = await getMe(token);
        setMe(fresh.data?.user || fresh.data || null);
        setMembers([]);
      }
      await loadKlasters();
    } catch (e) {
      alert(e?.response?.data?.message || "Gagal hapus klaster");
    }
  }

  async function onKick(u) {
    if (!me?.klaster_id) return;
    if (u.user_id === me.user_id) return alert("Tidak bisa mengeluarkan diri sendiri.");
    if (!window.confirm(`Keluarkan ${u.nama || u.email}?`)) return;
    try {
      await kickMember(token, me.klaster_id, u.user_id);
      await openMembers(me.klaster_id);
    } catch (e) {
      alert(e?.response?.data?.message || "Gagal mengeluarkan member");
    }
  }
  // ===================== END OF CRUD KLASTER ===========================

  async function loadKlasterInvites() {
    if (!me?.klaster_id) return;
    try {
      setLoadingInvites(true);
      const res = await listKlasterInvites(token, me.klaster_id);
      const list = Array.isArray(res.data?.data) ? res.data.data : res.data || [];
      setInvites(list);
    } catch (e) {
      console.error("Gagal ambil undangan klaster:", e);
      setInvites([]);
    } finally {
      setLoadingInvites(false);
    }
  }

  async function loadMyInvites() {
    try {
      setLoadingMyInv(true);
      const res = await getMyInvites(token);
      const list = Array.isArray(res.data?.data) ? res.data.data : res.data || [];
      setMyInvites(list);
    } catch (e) {
      console.error("Gagal ambil undangan saya:", e);
      setMyInvites([]);
    } finally {
      setLoadingMyInv(false);
    }
  }

  // ====== Update Profile ======
  const onSaveProfile = async (e) => {
    e.preventDefault();
    if (!me) return;

    // kirim hanya field yang berubah & tidak kosong
    const patch = {};
    const nm = profile.name?.trim();
    const em = profile.email?.trim();
    const ph = profile.phone?.trim();
    if (nm && nm !== (me.nama || "")) patch.nama = nm;
    if (em && em !== (me.email || "")) patch.email = em;
    if (ph && ph !== (me.nomor_telepon || "")) patch.nomor_telepon = ph;

    if (Object.keys(patch).length === 0) {
      alert("Tidak ada perubahan.");
      return;
    }

    try {
      setSavingProfile(true);
      const res = await updateMe(token, patch);
      const updated = res.data?.user || res.data || {};
      setMe(updated);
      setProfile({
        name: updated?.nama || "",
        email: updated?.email || "",
        phone: updated?.nomor_telepon || "",
      });
      alert("Profil berhasil diperbarui.");
    } catch (e) {
      console.error("Gagal update profil:", e);
      alert(e?.response?.data?.message || "Gagal menyimpan profil");
    } finally {
      setSavingProfile(false);
    }
  };

  // ====== Change Password ======
  const onChangePassword = async (e) => {
    e.preventDefault();
    if (!pwd.old_password || !pwd.new_password) return alert("Lengkapi password.");
    if (pwd.new_password.length < 8) return alert("Password baru minimal 8 karakter.");
    if (pwd.new_password === pwd.old_password)
      return alert("Password baru tidak boleh sama dengan yang lama.");

    try {
      setSavingPwd(true);
      await changeMyPassword(token, {
        old_password: pwd.old_password,
        new_password: pwd.new_password,
      });
      setPwd({ old_password: "", new_password: "" });
      alert("Password berhasil diubah.");
    } catch (e) {
      console.error("Gagal ubah password:", e);
      alert(e?.response?.data?.message || "Gagal mengubah password");
    } finally {
      setSavingPwd(false);
    }
  };

  // ===== Owner/Admin: create + revoke =====
  const onCreateInvite = async (e) => {
    e.preventDefault();
    if (!me?.klaster_id)
      return alert("Anda belum tergabung/menjadi admin di klaster mana pun.");

    try {
      setSending(true);
      const expires_at = invForm.expires_local
        ? new Date(invForm.expires_local).toISOString()
        : undefined;

      await createInvite(token, me.klaster_id, {
        email: invForm.email || undefined,
        phone: invForm.phone || undefined,
        role: invForm.role || "member",
        ...(expires_at ? { expires_at } : {}),
      });

      setInvForm({ email: "", phone: "", role: "member", expires_local: "" });
      await loadKlasterInvites();
      alert("Undangan dibuat.");
    } catch (e) {
      console.error("Gagal buat undangan:", e);
      alert(e?.response?.data?.message || "Gagal membuat undangan");
    } finally {
      setSending(false);
    }
  };

  const onRevoke = async (invite) => {
    if (!me?.klaster_id) return;
    const who =
      invite.target_email ||
      invite.email ||
      invite.target_phone ||
      invite.phone ||
      invite.user_email ||
      "user";
    if (!window.confirm(`Cabut undangan untuk ${who}?`)) return;
    try {
      await revokeInvite(token, me.klaster_id, invite.invite_id || invite.id);
      await loadKlasterInvites();
    } catch (e) {
      console.error("Gagal revoke:", e);
      alert(e?.response?.data?.message || "Gagal mencabut undangan");
    }
  };

  // ===== Member: accept / reject =====
  const doAccept = async (inv) => {
    try {
      setActingId(inv.invite_id);
      await acceptInvite(token, { token: inv.token, invite_id: inv.invite_id });
      await loadMyInvites();
      alert("Undangan diterima.");
    } catch (e) {
      console.error("Gagal accept:", e);
      alert(e?.response?.data?.message || "Gagal menerima undangan");
    } finally {
      setActingId(null);
    }
  };

  const doReject = async (inv) => {
    try {
      setActingId(inv.invite_id);
      await rejectInvite(token, { token: inv.token, invite_id: inv.invite_id });
      await loadMyInvites();
      alert("Undangan ditolak.");
    } catch (e) {
      console.error("Gagal reject:", e);
      alert(e?.response?.data?.message || "Gagal menolak undangan");
    } finally {
      setActingId(null);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-6">
      <h2 className="text-2xl font-bold mb-6">Pengaturan</h2>

      <div className="space-y-8">
        {/* ================== Profil ================== */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <User className="mr-2" size={20} /> Profil Pengguna
          </h3>

          {loadingMe ? (
            <p className="text-gray-500">Memuat profil…</p>
          ) : (
            <form
              onSubmit={onSaveProfile}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div className="flex flex-col gap-2">
                <span className="font-bold">Nama Lengkap</span>
                <input
                  type="text"
                  placeholder="Nama Lengkap"
                  className="p-2 border rounded"
                  value={profile.name}
                  onChange={(e) =>
                    setProfile({ ...profile, name: e.target.value })
                  }
                />
              </div>

              <div className="flex flex-col gap-2">
                <span className="font-bold">Email</span>
                <input
                  type="email"
                  placeholder="Alamat Email"
                  className="p-2 border rounded"
                  value={profile.email}
                  onChange={(e) =>
                    setProfile({ ...profile, email: e.target.value })
                  }
                />
              </div>

              <div className="flex flex-col gap-2">
                <span className="font-bold">Nomor Telepon</span>
                <input
                  type="text"
                  placeholder="Nomor Telepon"
                  className="p-2 border rounded w-full"
                  value={profile.phone}
                  onChange={(e) =>
                    setProfile({ ...profile, phone: e.target.value })
                  }
                />
              </div>

              <div className="md:col-span-2 text-sm text-gray-600">
                Role: <span className="font-medium">{me?.role || "-"}</span>{" "}
                {me?.klaster_id ? (
                  <span className="ml-2">
                    | Klaster ID: <span className="font-mono">{me.klaster_id}</span>
                  </span>
                ) : (
                  <span className="ml-2">| Belum bergabung ke klaster</span>
                )}
              </div>

              <div className="md:col-span-2">
                <button
                  type="submit"
                  className={`mt-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 ${
                    savingProfile ? "opacity-60" : ""
                  }`}
                  disabled={savingProfile}
                >
                  {savingProfile ? "Menyimpan…" : "Simpan Perubahan Profil"}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* ================== Manajemen Klaster (ADMIN) ================== */}
        {isAdmin && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Shield className="mr-2" size={20} /> Manajemen Klaster (Admin)
            </h3>

            {/* Ganti Klaster Saya */}
            <div className="p-4 border rounded mb-5">
              <div className="font-medium mb-2">Klaster Saya</div>
              <div className="flex flex-wrap gap-2 items-center">
                <select
                  className="p-2 border rounded min-w-[240px]"
                  disabled={loadingKlasters}
                  value={selectKlasterId}
                  onChange={(e) => setSelectKlasterId(e.target.value)}
                >
                  <option value="">— Pilih klaster —</option>
                  {klasters.map((k) => (
                    <option key={k.klaster_id} value={k.klaster_id}>
                      {k.nama_klaster || `Klaster #${k.klaster_id}`}
                    </option>
                  ))}
                </select>
                <button
                  className="bg-emerald-600 text-white px-3 py-2 rounded"
                  onClick={changeMyKlaster}
                  disabled={!selectKlasterId}
                >
                  Jadikan Klaster Saya
                </button>
                {me?.klaster_id && (
                  <span className="text-sm text-gray-600">
                    Aktif: <b>{me.klaster_id}</b>
                  </span>
                )}
              </div>
            </div>

            {/* CRUD Klaster */}
            <div className="p-4 border rounded mb-5">
              <div className="font-medium mb-2">Daftar Klaster</div>
              <form onSubmit={onCreateKlaster} className="flex gap-2 mb-3">
                <input
                  className="p-2 border rounded flex-1"
                  placeholder="Nama klaster baru"
                  value={mkName}
                  onChange={(e) => setMkName(e.target.value)}
                />
                <button
                  type="submit"
                  className="bg-green-600 text-white px-3 py-2 rounded"
                >
                  Buat
                </button>
              </form>

              {loadingKlasters ? (
                <p className="text-gray-500">Memuat…</p>
              ) : (
                <table className="w-full text-left border">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-2">ID</th>
                      <th className="p-2">Nama Klaster</th>
                      <th className="p-2">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {klasters.map((k) => (
                      <tr key={k.klaster_id} className="border-t">
                        <td className="p-2">{k.klaster_id}</td>
                        <td className="p-2">
                          {editId === k.klaster_id ? (
                            <input
                              className="p-1 border rounded w-full"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                            />
                          ) : (
                            k.nama_klaster || "-"
                          )}
                        </td>
                        <td className="p-2 flex gap-2">
                          {editId === k.klaster_id ? (
                            <>
                              <button
                                className="px-2 py-1 rounded bg-emerald-600 text-white"
                                onClick={() => onUpdateKlaster(k.klaster_id)}
                              >
                                Simpan
                              </button>
                              <button
                                className="px-2 py-1 rounded bg-gray-200"
                                onClick={() => {
                                  setEditId(null);
                                  setEditName("");
                                }}
                              >
                                Batal
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                className="px-2 py-1 rounded bg-amber-500 text-white"
                                onClick={() => {
                                  setEditId(k.klaster_id);
                                  setEditName(k.nama_klaster || "");
                                }}
                              >
                                Edit
                              </button>
                              <button
                                className="px-2 py-1 rounded bg-rose-600 text-white"
                                onClick={() => onDeleteKlaster(k.klaster_id)}
                              >
                                Hapus
                              </button>
                              <button
                                className="px-2 py-1 rounded bg-sky-600 text-white"
                                onClick={() => openMembers(k.klaster_id)}
                              >
                                Lihat Anggota
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                    {klasters.length === 0 && (
                      <tr>
                        <td
                          className="p-3 text-center text-gray-500"
                          colSpan={3}
                        >
                          Tidak ada klaster.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>

            {/* Anggota Klaster Terpilih/Me */}
            <div className="p-4 border rounded mb-8">
              <div className="font-medium mb-2">
                Anggota Klaster {me?.klaster_id ? `#${me.klaster_id}` : ""}
              </div>
              {loadingMembers ? (
                <p className="text-gray-500">Memuat…</p>
              ) : members.length === 0 ? (
                <p className="text-gray-500">
                  Tidak ada anggota / belum memilih klaster.
                </p>
              ) : (
                <table className="w-full text-left border">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-2">Nama</th>
                      <th className="p-2">Email</th>
                      <th className="p-2">Role</th>
                      <th className="p-2">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((m) => (
                      <tr key={m.user_id} className="border-t">
                        <td className="p-2">{m.nama || "-"}</td>
                        <td className="p-2">{m.email || "-"}</td>
                        <td className="p-2">{m.role || "-"}</td>
                        <td className="p-2">
                          <button
                            className="px-2 py-1 rounded bg-rose-600 text-white"
                            onClick={() => onKick(m)}
                            disabled={m.user_id === me?.user_id}
                          >
                            Kick
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ================== Undangan Klaster (admin/superadmin vs member) ================== */}
        {isAdmin ? (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Shield className="mr-2" size={20} /> Kelola Undangan (Admin)
            </h3>

            {!me?.klaster_id ? (
              <div className="p-3 rounded border bg-amber-50 text-amber-800">
                Anda admin/superadmin, namun belum berada pada klaster apa pun.
                Buat/atur klaster terlebih dahulu.
              </div>
            ) : (
              <>
                {/* Create form */}
                <form
                  onSubmit={onCreateInvite}
                  className="grid grid-cols-1 md:grid-cols-4 gap-3 items-start"
                >
                  <div className="flex items-center gap-2 md:col-span-2">
                    <Mail size={18} className="text-gray-500" />
                    <input
                      type="email"
                      placeholder="Email (opsional)"
                      className="p-2 border rounded w-full"
                      value={invForm.email}
                      onChange={(e) =>
                        setInvForm({ ...invForm, email: e.target.value })
                      }
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={18} className="text-gray-500" />
                    <input
                      type="text"
                      placeholder="No. HP (opsional)"
                      className="p-2 border rounded w-full"
                      value={invForm.phone}
                      onChange={(e) =>
                        setInvForm({ ...invForm, phone: e.target.value })
                      }
                    />
                  </div>
                  <select
                    className="p-2 border rounded"
                    value={invForm.role}
                    onChange={(e) =>
                      setInvForm({ ...invForm, role: e.target.value })
                    }
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                  <div className="flex items-center gap-2 md:col-span-2">
                    <CalendarClock size={18} className="text-gray-500" />
                    <input
                      type="datetime-local"
                      className="p-2 border rounded w-full"
                      value={invForm.expires_local}
                      onChange={(e) =>
                        setInvForm({
                          ...invForm,
                          expires_local: e.target.value,
                        })
                      }
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 md:col-span-1"
                    disabled={sending}
                  >
                    {sending ? "Membuat…" : "Buat Undangan"}
                  </button>
                </form>

                {/* List undangan */}
                <div className="mt-5">
                  <h4 className="font-semibold mb-2">Undangan Aktif</h4>
                  {loadingInvites ? (
                    <p className="text-gray-500">Memuat…</p>
                  ) : invites.length === 0 ? (
                    <p className="text-gray-500">Tidak ada undangan.</p>
                  ) : (
                    <table className="w-full text-left border">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="p-2">Email</th>
                          <th className="p-2">HP</th>
                          <th className="p-2">Role</th>
                          <th className="p-2">Kadaluwarsa</th>
                          <th className="p-2">Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invites.map((iv) => (
                          <tr key={iv.invite_id || iv.id} className="border-t">
                            <td className="p-2">
                              {iv.target_email || iv.email || "-"}
                            </td>
                            <td className="p-2">
                              {iv.target_phone || iv.phone || "-"}
                            </td>
                            <td className="p-2">{iv.role || "member"}</td>
                            <td className="p-2">
                              {iv.expires_at
                                ? new Date(iv.expires_at).toLocaleString("id-ID")
                                : "-"}
                            </td>
                            <td className="p-2">
                              <button
                                className="px-2 py-1 rounded bg-rose-600 text-white"
                                onClick={() => onRevoke(iv)}
                              >
                                Cabut
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </>
            )}
          </div>
        ) : (
          /* ================== Undangan untuk saya (member) ================== */
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <XCircle className="mr-2" size={20} /> Undangan untuk Saya
            </h3>
            {loadingMyInv ? (
              <p className="text-gray-500">Memuat…</p>
            ) : myInvites.length === 0 ? (
              <p className="text-gray-500">Tidak ada undangan.</p>
            ) : (
              <table className="w-full text-left border">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2">Klaster</th>
                    <th className="p-2">Role</th>
                    <th className="p-2">Kadaluwarsa</th>
                    <th className="p-2">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {myInvites.map((iv) => (
                    <tr key={iv.invite_id} className="border-t">
                      <td className="p-2">
                        {iv.klaster_nama || iv.klaster_id || "-"}
                      </td>
                      <td className="p-2">{iv.role || "member"}</td>
                      <td className="p-2">
                        {iv.expires_at
                          ? new Date(iv.expires_at).toLocaleString("id-ID")
                          : "-"}
                      </td>
                      <td className="p-2 flex gap-2">
                        <button
                          className={`px-2 py-1 rounded bg-emerald-600 text-white ${
                            actingId === iv.invite_id ? "opacity-60" : ""
                          }`}
                          onClick={() => doAccept(iv)}
                          disabled={actingId === iv.invite_id}
                        >
                          {actingId === iv.invite_id ? "Memproses…" : "Terima"}
                        </button>
                        <button
                          className={`px-2 py-1 rounded bg-rose-600 text-white ${
                            actingId === iv.invite_id ? "opacity-60" : ""
                          }`}
                          onClick={() => doReject(iv)}
                          disabled={actingId === iv.invite_id}
                        >
                          {actingId === iv.invite_id ? "Memproses…" : "Tolak"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ================== Notifikasi (placeholder) ================== */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Bell className="mr-2" size={20} /> Notifikasi
          </h3>
          <div className="space-y-2">
            <label className="flex items-center">
              <input type="checkbox" className="form-checkbox" />
              <span className="ml-2">
                Notifikasi email untuk laporan bulanan
              </span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="form-checkbox" />
              <span className="ml-2">
                Notifikasi saat ada pembaruan fitur
              </span>
            </label>
          </div>
        </div>

        {/* ================== Ganti Kata Sandi ================== */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Lock className="mr-2" size={20} /> Ganti Kata Sandi
          </h3>
          <form
            onSubmit={onChangePassword}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <input
              type="password"
              placeholder="Kata Sandi Saat Ini"
              className="p-2 border rounded"
              value={pwd.old_password}
              onChange={(e) =>
                setPwd({ ...pwd, old_password: e.target.value })
              }
            />
            <input
              type="password"
              placeholder="Kata Sandi Baru (≥ 8 karakter)"
              className="p-2 border rounded"
              value={pwd.new_password}
              onChange={(e) =>
                setPwd({ ...pwd, new_password: e.target.value })
              }
            />
            <div className="md:col-span-2">
              <button
                type="submit"
                className={`mt-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 ${
                  savingPwd ? "opacity-60" : ""
                }`}
                disabled={savingPwd}
              >
                {savingPwd ? "Memproses…" : "Ubah Kata Sandi"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
