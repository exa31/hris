<template>
  <div class="space-y-6">
    <!-- Header Section -->
    <div
      class="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-100 dark:border-slate-800"
    >
      <Motion
        :initial="{ opacity: 0, x: -20 }"
        :animate="{ opacity: 1, x: 0 }"
        class="space-y-2"
      >
        <div
          class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20"
        >
          <span
            class="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"
          ></span>
          <span
            class="text-[9px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400"
            >Internal Comm</span
          >
        </div>
        <h1
          class="text-3xl font-black text-slate-800 dark:text-white tracking-tight"
        >
          Pengumuman
        </h1>
        <p class="text-slate-400 dark:text-slate-500 font-medium text-sm">
          Sampaikan informasi dan berita terbaru ke seluruh tim.
        </p>
      </Motion>

      <Motion :initial="{ opacity: 0, x: 20 }" :animate="{ opacity: 1, x: 0 }">
        <Button
          v-if="hasPermission('announcements', 'create')"
          label="Buat Pengumuman"
          icon="bi bi-plus-lg"
          class="!rounded-xl !px-6 !py-3 !bg-indigo-600 !border-none !text-white !font-black !uppercase !text-[10px] !tracking-widest shadow-lg shadow-indigo-200 dark:shadow-none hover:!bg-indigo-500 transition-colors"
          @click="openCreateModal"
        />
      </Motion>
    </div>

    <!-- Filters -->
    <Motion
      :initial="{ opacity: 0, y: 10 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ delay: 0.2 }"
    >
      <div
        class="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-12 gap-4 items-end"
      >
        <div class="md:col-span-8 space-y-1.5">
          <label
            class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1"
            >Cari Informasi</label
          >
          <span class="relative block group">
            <i
              class="bi bi-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 group-focus-within:text-indigo-500 transition-colors"
            ></i>
            <InputText
              v-model="searchQuery"
              placeholder="Judul atau kata kunci isi pengumuman..."
               class="w-full !pl-11 !py-3 !bg-slate-50 dark:!bg-slate-800 !border-none !rounded-xl !text-xs !font-bold !text-slate-800 dark:!text-white"
            />
          </span>
        </div>

        <div class="md:col-span-4 space-y-1.5">
          <label
            class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1"
            >Prioritas</label
          >
          <Select
            v-model="selectedPriority"
            :options="priorityOptions"
            optionLabel="label"
            optionValue="value"
            class="w-full !bg-slate-50 dark:!bg-slate-800 !border-none !rounded-xl !shadow-none !text-slate-800 dark:!text-slate-200"
          />
        </div>
      </div>
    </Motion>

    <!-- Content Grid -->
    <div
      v-if="loading"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      <div
        v-for="i in 3"
        :key="i"
        class="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4"
      >
        <Skeleton
          width="30%"
          height="1.5rem"
          class="!rounded-lg dark:!bg-slate-800"
        />
        <Skeleton
          width="80%"
          height="2rem"
          class="!rounded-lg dark:!bg-slate-800"
        />
        <Skeleton
          width="100%"
          height="6rem"
          class="!rounded-lg dark:!bg-slate-800"
        />
      </div>
    </div>

    <div
      v-else-if="announcements.length === 0"
      class="flex flex-col items-center justify-center py-20 px-6 text-center"
    >
      <div class="relative mb-6">
        <div
          class="absolute inset-0 bg-indigo-500/10 rounded-full blur-2xl animate-pulse"
        ></div>
        <div
          class="w-20 h-20 bg-white dark:bg-slate-800 rounded-2xl shadow-xl flex items-center justify-center relative z-10 border border-slate-100 dark:border-slate-700"
        >
          <i class="bi bi-megaphone text-4xl text-indigo-500"></i>
        </div>
      </div>
      <h3
        class="text-xl font-black text-slate-800 dark:text-white mb-2 tracking-tight"
      >
        Belum Ada Pengumuman
      </h3>
      <p
        class="text-xs font-bold text-slate-400 dark:text-slate-500 max-w-[280px] leading-relaxed uppercase tracking-widest"
      >
        Jadilah yang pertama menyampaikan berita hari ini!
      </p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Motion
        v-for="(ann, idx) in announcements"
        :key="ann.id"
        :initial="{ opacity: 0, y: 20 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ delay: idx * 0.1 }"
        class="group"
      >
        <div
          class="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 h-full flex flex-col relative overflow-hidden"
        >
          <div
            :class="[
              'absolute top-0 left-0 w-1.5 h-full transition-all group-hover:w-2',
              prioritySideColor(ann.priority),
            ]"
          ></div>

          <div class="flex items-center justify-between mb-5">
            <Tag
              :value="priorityLabel(ann.priority)"
              class="!rounded-lg !px-3 !py-1 !text-[9px] !font-black !uppercase"
              :class="priorityBadgeClass(ann.priority)"
            />

            <div
              class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Button
                v-if="hasPermission('announcements', 'update')"
                icon="bi bi-pencil"
                @click="openEditModal(ann)"
                text
                rounded
                class="!w-8 !h-8 !text-slate-400 hover:!bg-slate-50 dark:hover:!bg-slate-800 hover:!text-indigo-500"
              />
              <Button
                v-if="hasPermission('announcements', 'delete')"
                icon="bi bi-trash"
                @click="confirmDelete(ann.id)"
                text
                rounded
                class="!w-8 !h-8 !text-slate-400 hover:!bg-rose-50 dark:hover:!bg-rose-500/10 hover:!text-rose-500"
              />
            </div>
          </div>

          <h3
            class="text-lg font-black text-slate-800 dark:text-white leading-tight mb-3 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors"
          >
            {{ ann.title }}
          </h3>

          <p
            class="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed mb-6 flex-grow line-clamp-4"
          >
            {{ ann.content }}
          </p>

          <div
            class="pt-5 border-t border-slate-50 dark:border-slate-800/50 flex items-center justify-between"
          >
            <div class="flex items-center gap-3">
              <Avatar
                :label="ann.creator_name?.charAt(0)"
                shape="circle"
                class="!bg-slate-100 dark:!bg-slate-800 !text-slate-500 dark:!text-slate-400 !font-bold !w-8 !h-8 !text-xs"
              />
              <div class="flex flex-col">
                <span
                  class="text-[10px] font-black text-slate-700 dark:text-slate-300"
                  >{{ ann.creator_name }}</span
                >
                <span
                  class="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest"
                  >{{ formatDateTime(ann.created_at) }}</span
                >
              </div>
            </div>

            <Tag
              :value="ann.is_active ? 'PUBLISHED' : 'DRAFT'"
              :class="
                ann.is_active
                  ? '!bg-emerald-50 dark:!bg-emerald-500/10 !text-emerald-600 dark:!text-emerald-400'
                  : '!bg-slate-50 dark:!bg-slate-800 !text-slate-500 dark:!text-slate-400'
              "
              class="!text-[8px] !font-black !px-2 !py-0.5 !rounded-md !uppercase !tracking-widest"
            />
          </div>
        </div>
      </Motion>
    </div>

    <!-- Pagination -->
    <div class="flex items-center justify-center pt-8" v-if="totalPages > 1">
      <Paginator
        :rows="itemsPerPage"
        :totalRecords="totalAnnouncements"
        template="PrevPageLink PageLinks NextPageLink"
        @page="(e) => (currentPage = e.page + 1)"
        class="!bg-transparent !p-0"
      />
    </div>

    <!-- Create/Edit Dialog -->
    <Dialog
      v-model:visible="modalOpen"
      modal
      :header="isEditing ? 'Perbarui Pengumuman' : 'Tulis Pengumuman Baru'"
      class="w-full max-w-xl"
      :pt="{
        root: {
          class:
            '!rounded-2xl !border !border-slate-100 dark:!border-slate-800 !shadow-2xl overflow-hidden !bg-white dark:!bg-slate-900',
        },
        header: {
          class:
            'px-8 pt-8 pb-4 !bg-transparent !border-b !border-slate-100 dark:!border-slate-800 !text-slate-800 dark:!text-white',
        },
        content: { class: 'px-8 py-6 !bg-transparent' },
        footer: { class: 'px-8 pb-8 !bg-transparent !border-none' },
      }"
    >
      <div class="space-y-5">
        <div class="space-y-1.5">
          <label
            class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1"
            >Judul Utama <span class="text-rose-500">*</span></label
          >
          <InputText
            v-model="formData.title"
            placeholder="Gunakan judul yang menarik perhatian..."
            :class="[
              'w-full !rounded-xl !bg-slate-50 dark:!bg-slate-800 !border-none !text-slate-800 dark:!text-white',
              formErrors.title ? '!border !border-rose-500' : '',
            ]"
          />
          <small
            v-if="formErrors.title"
            class="text-rose-500 text-xs mt-1 ml-1 block"
            >{{ formErrors.title }}</small
          >
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-1.5">
            <label
              class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1"
              >Prioritas Pesan</label
            >
            <Select
              v-model="formData.priority"
              :options="priorityOptions.slice(1)"
              optionLabel="label"
              optionValue="value"
              class="w-full !rounded-xl !bg-slate-50 dark:!bg-slate-800 !border-none !text-slate-800 dark:!text-slate-200"
            />
          </div>
          <div class="space-y-1.5">
            <label
              class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1"
              >Target Departemen</label
            >
            <Select
              v-model="formData.target_department"
              :options="departmentOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Seluruh Perusahaan"
              class="w-full !rounded-xl !bg-slate-50 dark:!bg-slate-800 !border-none !text-slate-800 dark:!text-slate-200"
            />
          </div>
        </div>

        <div class="space-y-1.5">
          <label
            class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1"
            >Konten Pengumuman <span class="text-rose-500">*</span></label
          >
          <Textarea
            v-model="formData.content"
            rows="6"
            placeholder="Tuliskan detail pengumuman secara lengkap di sini..."
            :class="[
              'w-full !rounded-xl !bg-slate-50 dark:!bg-slate-800 !border-none !p-4 !text-slate-800 dark:!text-white !placeholder:text-slate-400 dark:placeholder:!text-slate-500',
              formErrors.content ? '!border !border-rose-500' : '',
            ]"
          />
          <small
            v-if="formErrors.content"
            class="text-rose-500 text-xs mt-1 ml-1 block"
            >{{ formErrors.content }}</small
          >
        </div>

        <div
          class="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700"
        >
          <ToggleSwitch v-model="formData.is_active" />
          <div class="flex flex-col">
            <span
              class="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest"
              >Publikasikan Sekarang</span
            >
            <span
              class="text-[9px] font-medium text-slate-400 dark:text-slate-500"
              >Pengumuman akan langsung terlihat oleh target.</span
            >
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex items-center justify-end gap-3">
          <Button
            label="Simpan Draft"
            text
            severity="secondary"
            @click="modalOpen = false"
            class="!rounded-xl !font-black !uppercase !text-[10px] !tracking-widest dark:!text-slate-400"
          />
          <Button
            :label="isEditing ? 'Simpan Perubahan' : 'Terbitkan Sekarang'"
            :loading="loading"
            @click="handleSubmit"
            class="!rounded-xl !px-6 !py-3 !bg-indigo-600 !border-none !text-white !font-black !uppercase !text-[10px] !tracking-widest shadow-lg shadow-indigo-200 dark:shadow-none hover:!bg-indigo-500 transition-colors"
          />
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from "vue";
import { useConfirm } from "primevue/useconfirm";
import {
  useAnnouncements,
  type Announcement,
} from "~/composables/useAnnouncements";
import { useAuth } from "~/composables/useAuth";

const confirm = useConfirm();
const { hasPermission } = useAuth();
const {
  announcements,
  loading,
  currentPage,
  itemsPerPage,
  totalAnnouncements,
  totalPages,
  searchQuery,
  selectedPriority,
  fetchAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} = useAnnouncements();

const modalOpen = ref(false);
const isEditing = ref(false);
const editingId = ref<number | null>(null);

const formData = reactive({
  title: "",
  content: "",
  priority: "Normal" as string,
  target_department: null as string | null,
  is_active: true,
});

const formErrors = reactive({
  title: "",
  content: "",
});

const validateForm = () => {
  let valid = true;
  formErrors.title = "";
  formErrors.content = "";

  if (!formData.title.trim()) {
    formErrors.title = "Judul pengumuman harus diisi";
    valid = false;
  }
  if (!formData.content.trim()) {
    formErrors.content = "Konten pengumuman harus diisi";
    valid = false;
  }
  return valid;
};

const priorityOptions = [
  { label: "Semua Prioritas", value: "" },
  { label: "Normal", value: "Normal" },
  { label: "Penting", value: "Important" },
  { label: "Urgent", value: "Urgent" },
];

const departmentOptions = [
  { label: "Semua Departemen", value: null },
  { label: "Marketing", value: "Marketing" },
  { label: "HRD", value: "HRD" },
  { label: "Production", value: "Production" },
  { label: "Executive", value: "Executive" },
];

const priorityLabel = (p: string) => {
  const map: Record<string, string> = {
    Normal: "Normal",
    Important: "Penting",
    Urgent: "Sangat Penting",
  };
  return map[p] || p;
};

const priorityBadgeClass = (p: string) => {
  const map: Record<string, string> = {
    Normal: "!bg-indigo-50 dark:!bg-indigo-500/10 !text-indigo-600 dark:!text-indigo-400 !border-indigo-100 dark:!border-indigo-500/20",
    Important: "!bg-amber-50 dark:!bg-amber-500/10 !text-amber-600 dark:!text-amber-400 !border-amber-100 dark:!border-amber-500/20",
    Urgent: "!bg-rose-50 dark:!bg-rose-500/10 !text-rose-600 dark:!text-rose-400 !border-rose-100 dark:!border-rose-500/20",
  };
  return map[p] || "!bg-slate-50 dark:!bg-slate-800 !text-slate-400 dark:!text-slate-500";
};

const prioritySideColor = (p: string) => {
  const map: Record<string, string> = {
    Normal: "bg-indigo-500",
    Important: "bg-amber-500",
    Urgent: "bg-rose-500",
  };
  return map[p] || "bg-slate-200";
};

const formatDateTime = (d: string) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const openCreateModal = () => {
  isEditing.value = false;
  editingId.value = null;
  formData.title = "";
  formData.content = "";
  formData.priority = "Normal";
  formData.target_department = null;
  formData.is_active = true;
  formErrors.title = "";
  formErrors.content = "";
  modalOpen.value = true;
};

const openEditModal = (ann: Announcement) => {
  isEditing.value = true;
  editingId.value = ann.id;
  formData.title = ann.title;
  formData.content = ann.content;
  formData.priority = ann.priority;
  formData.target_department = ann.target_department;
  formData.is_active = ann.is_active;
  formErrors.title = "";
  formErrors.content = "";
  modalOpen.value = true;
};

const handleSubmit = async () => {
  if (!validateForm()) return;

  try {
    if (isEditing.value && editingId.value) {
      await updateAnnouncement(editingId.value, { ...formData });
    } else {
      await createAnnouncement({ ...formData });
    }
    modalOpen.value = false;
    fetchAnnouncements();
  } catch {}
};

const confirmDelete = (id: number) => {
  confirm.require({
    message:
      "Apakah Anda yakin ingin menghapus pengumuman ini secara permanen?",
    header: "Hapus Pengumuman",
    icon: "bi bi-exclamation-triangle-fill text-rose-500",
    rejectProps: {
      label: "Batal",
      severity: "secondary",
      outlined: true,
    },
    acceptProps: {
      label: "Hapus",
      severity: "danger",
    },
    accept: async () => {
      await deleteAnnouncement(id);
      await fetchAnnouncements();
    },
  });
};

let searchDebounce: ReturnType<typeof setTimeout> | null = null;

onMounted(() => fetchAnnouncements());

watch(searchQuery, () => {
  if (searchDebounce) clearTimeout(searchDebounce);
  searchDebounce = setTimeout(() => {
    currentPage.value = 1;
    fetchAnnouncements();
  }, 400);
});

watch([currentPage, selectedPriority], () => fetchAnnouncements());

definePageMeta({ layout: "default" });
</script>
