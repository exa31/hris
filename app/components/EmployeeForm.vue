<template>
  <div class="max-w-[1200px] mx-auto space-y-12 pb-20">
    <Toast />

    <div
      v-if="loading"
      class="flex flex-col items-center justify-center py-40 space-y-6"
    >
      <div class="relative w-20 h-20">
        <div
          class="absolute inset-0 border-4 border-indigo-100 dark:border-slate-800 rounded-full"
        ></div>
        <div
          class="absolute inset-0 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"
        ></div>
      </div>
      <p
        class="text-indigo-600 dark:text-indigo-400 font-black uppercase tracking-[0.4em] text-[10px]"
      >
        Retrieving Talent Matrix
      </p>
    </div>

    <form v-else @submit.prevent="handleSubmit" class="space-y-10">
      <!-- Sophisticated Floating Header -->
      <div
        class="sticky top-24 z-20 bg-[#f8fafc]/80 dark:bg-slate-950/80 backdrop-blur-xl py-4 -mx-4 px-4 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-transparent transition-all"
        id="form-header"
      >
        <Motion
          :initial="{ opacity: 0, x: -20 }"
          :animate="{ opacity: 1, x: 0 }"
        >
          <div class="flex items-center gap-4">
            <div
              class="w-12 h-12 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-indigo-600 shadow-sm"
            >
              <i
                class="bi"
                :class="isEdit ? 'bi-person-gear' : 'bi-person-plus-fill'"
              ></i>
            </div>
            <div>
              <h1
                class="text-2xl font-black text-slate-800 dark:text-white tracking-tight"
              >
                {{ isEdit ? "Refine Profile" : "New Talent Onboarding" }}
              </h1>
              <div class="flex items-center gap-2">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span
                  class="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest"
                  >Configuration Active</span
                >
              </div>
            </div>
          </div>
        </Motion>

        <div class="flex items-center gap-3">
          <Button
            label="Discard"
            severity="secondary"
            text
            class="!rounded-xl !px-6 !py-3 !font-black !uppercase !text-[9px] !tracking-widest dark:!text-slate-400"
            @click="$router.back()"
          />
          <Button
            type="submit"
            :label="isEdit ? 'Save Changes' : 'Confirm Onboarding'"
            :loading="submitting"
            class="!rounded-xl !px-8 !py-3.5 !bg-indigo-600 !border-none !font-black !uppercase !text-[9px] !tracking-widest shadow-lg shadow-indigo-100 dark:shadow-none"
          />
        </div>
      </div>

      <div class="space-y-8">
        <!-- Profile & Vital Stats Header -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Motion
            :initial="{ opacity: 0, scale: 0.95 }"
            :animate="{ opacity: 1, scale: 1 }"
            class="bg-indigo-950 dark:bg-indigo-900/70 dark:border dark:border-indigo-700/50 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl dark:shadow-none"
          >
            <!-- Decorative elements -->
            <div
              class="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"
            ></div>
            <div
              class="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl"
            ></div>

            <div
              class="relative z-10 flex flex-col items-center text-center space-y-6"
            >
              <div class="relative group">
                <div
                  class="absolute inset-0 bg-indigo-500 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity"
                ></div>
                <Avatar
                  :image="
                    form.photo_url ||
                    'https://ui-avatars.com/api/?name=' +
                      (form.name || 'User') +
                      '&background=fff&color=4f46e5&size=200'
                  "
                  shape="circle"
                  class="!w-32 !h-32 border-4 border-white/10 shadow-2xl ring-4 ring-white/5 relative z-10"
                />
                <button
                  type="button"
                  @click="triggerPhotoUpload"
                  class="absolute bottom-1 right-1 w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center border-2 border-indigo-950 dark:border-indigo-800 text-white shadow-xl z-20 hover:scale-110 transition-transform"
                >
                  <i class="bi bi-camera-fill"></i>
                </button>
              </div>

              <div class="space-y-1">
                <h3 class="text-xl font-black tracking-tight leading-tight">
                  {{ form.name || "Candidate Name" }}
                </h3>
                <div
                  class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10"
                >
                  <span
                    class="text-indigo-200 font-bold uppercase tracking-widest text-[9px]"
                    >{{ form.position_name || "Awaiting Designation" }}</span
                  >
                </div>
              </div>
            </div>
          </Motion>

          <!-- Contact Details Card -->
          <div
            class="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm space-y-6"
          >
            <h4
              class="text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-[0.2em] flex items-center gap-2"
            >
              <i class="bi bi-link-45deg text-indigo-500"></i> Connectivity
            </h4>
            <div class="space-y-4">
              <div class="group">
                <label
                  class="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block"
                  >Email Protocol
                  <span class="text-rose-500 ml-0.5">*</span></label
                >
                <div
                  class="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 group-focus-within:border-indigo-200 transition-colors"
                  :class="{
                    'border-rose-200 ring-4 ring-rose-500/5': errors.email,
                  }"
                >
                  <i
                    class="bi bi-envelope text-slate-300 group-focus-within:text-indigo-500"
                  ></i>
                  <InputText
                    v-model="form.email"
                    class="!bg-transparent !border-none !p-0 !text-xs !font-bold !w-full dark:!text-slate-300"
                    placeholder="talent@nexushr.io"
                  />
                </div>
                <small
                  v-if="errors.email"
                  class="text-[8px] font-bold text-rose-500 ml-1 uppercase tracking-widest"
                  >{{ errors.email }}</small
                >
              </div>
              <div class="group">
                <label
                  class="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block"
                  >Secure Phone
                  <span class="text-rose-500 ml-0.5">*</span></label
                >
                <div
                  class="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 group-focus-within:border-emerald-200 transition-colors"
                  :class="{
                    'border-rose-200 ring-4 ring-rose-500/5': errors.phone,
                  }"
                >
                  <i class="bi bi-whatsapp text-emerald-400"></i>
                  <InputText
                    v-model="form.phone"
                    class="!bg-transparent !border-none !p-0 !text-xs !font-bold !w-full dark:!text-slate-300"
                    placeholder="+62 812-xxxx-xxxx"
                  />
                </div>
                <small
                  v-if="errors.phone"
                  class="text-[8px] font-bold text-rose-500 ml-1 uppercase tracking-widest"
                  >{{ errors.phone }}</small
                >
              </div>
            </div>
          </div>

          <!-- System Intelligence Card -->
          <div
            class="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-6 border border-slate-200/50 dark:border-slate-800 space-y-6"
          >
            <div class="flex items-center justify-between">
              <h4
                class="text-[9px] font-black text-slate-500 uppercase tracking-widest"
              >
                System Intelligence
              </h4>
              <div class="flex items-center gap-1.5">
                <span
                  class="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"
                ></span>
                <span class="text-[8px] font-black text-indigo-500 uppercase"
                  >Live Sync</span
                >
              </div>
            </div>

            <div class="space-y-5">
              <div class="space-y-2">
                <div
                  class="flex items-center justify-between text-[9px] font-black uppercase tracking-widest"
                >
                  <span class="text-slate-400">Profile Completion</span>
                  <span class="text-indigo-600"
                    >{{ completionPercentage }}%</span
                  >
                </div>
                <div
                  class="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden"
                >
                  <div
                    class="h-full bg-indigo-600 rounded-full transition-all duration-1000"
                    :style="{ width: completionPercentage + '%' }"
                  ></div>
                </div>
              </div>

              <div
                class="pt-2 border-t border-slate-200/50 dark:border-slate-800 space-y-3"
              >
                <div class="flex items-center justify-between">
                  <div class="flex flex-col">
                    <span class="text-[9px] font-black text-slate-400 uppercase"
                      >Employment Status</span
                    >
                    <span
                      class="text-[10px] font-bold"
                      :class="
                        form.status ? 'text-emerald-500' : 'text-rose-500'
                      "
                    >
                      {{ form.status ? "Active Protocol" : "Suspended" }}
                    </span>
                  </div>
                  <InputSwitch v-model="form.status" />
                </div>

                <div
                  class="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm"
                >
                  <div class="flex items-center gap-3">
                    <div
                      class="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600"
                    >
                      <i class="bi bi-clock-history"></i>
                    </div>
                    <div class="flex flex-col">
                      <span
                        class="text-[8px] font-black text-slate-400 uppercase"
                        >Total Tenure</span
                      >
                      <span class="text-[10px] font-black tracking-tight">{{
                        calculatedTenure
                      }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Main Content: Detailed Information -->
        <div class="space-y-8">
          <!-- Section Card: Personal Profile -->
          <div
            class="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 shadow-sm space-y-8"
          >
            <div
              class="flex items-center gap-4 border-b border-slate-50 dark:border-slate-800 pb-6"
            >
              <div
                class="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600"
              >
                <i class="bi bi-person-vcard-fill text-lg"></i>
              </div>
              <div>
                <h3
                  class="text-lg font-black text-slate-800 dark:text-white tracking-tight"
                >
                  Identity Foundation
                </h3>
                <p
                  class="text-[10px] font-bold text-slate-400 uppercase tracking-widest"
                >
                  Personal identification and demographics
                </p>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-1.5">
                <label
                  class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-2"
                  >Full Identity Name
                  <span class="text-rose-500 ml-0.5">*</span></label
                >
                <InputText
                  v-model="form.name"
                  :class="{ 'p-invalid': errors.name }"
                  class="!w-full !rounded-xl !p-4 !bg-slate-50 dark:!bg-slate-800/50 !border-none !text-xs !font-bold dark:!text-white focus:!ring-2 focus:!ring-indigo-500/10 transition-all"
                  placeholder="e.g. John Doe"
                  required
                />
                <Transition name="p-message-content">
                  <small
                    v-if="errors.name"
                    class="text-[9px] font-black text-rose-500 ml-2 uppercase tracking-widest flex items-center gap-1"
                  >
                    <i class="bi bi-exclamation-circle"></i> {{ errors.name }}
                  </small>
                </Transition>
              </div>
              <div class="space-y-1.5">
                <label
                  class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-2"
                  >Internal NIP Code
                  <span class="text-rose-500 ml-0.5">*</span></label
                >
                <InputText
                  v-model="form.nip"
                  :class="{ 'p-invalid': errors.nip }"
                  class="!w-full !rounded-xl !p-4 !bg-slate-50 dark:!bg-slate-800/50 !border-none !text-xs !font-bold dark:!text-white focus:!ring-2 focus:!ring-indigo-500/10 transition-all"
                  placeholder="e.g. 19900101 202401 1 001"
                  required
                />
                <Transition name="p-message-content">
                  <small
                    v-if="errors.nip"
                    class="text-[9px] font-black text-rose-500 ml-2 uppercase tracking-widest flex items-center gap-1"
                  >
                    <i class="bi bi-exclamation-circle"></i> {{ errors.nip }}
                  </small>
                </Transition>
              </div>
              <div class="md:col-span-2 space-y-1.5">
                <label
                  class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-2"
                  >City / Regency of Birth
                  <span class="text-rose-500 ml-0.5">*</span></label
                >
                <AutoComplete
                  v-model="birthCitySearch"
                  :suggestions="filteredRegencies"
                  @complete="searchBirthCity"
                  @item-select="onRegencySelect"
                  optionLabel="name"
                  placeholder="Search city/regency..."
                  :minLength="3"
                  class="!w-full"
                  :class="{ 'p-invalid': errors.birth_place_id }"
                  :pt="{
                    pcInputText: {
                      root: {
                        class:
                          '!w-full !rounded-xl !p-4 !bg-slate-50 dark:!bg-slate-800/50 !border-none !text-xs !font-bold dark:!text-white',
                      },
                    },
                  }"
                />
                <Transition name="p-message-content">
                  <small
                    v-if="errors.birth_place_id"
                    class="text-[9px] font-black text-rose-500 ml-2 uppercase tracking-widest flex items-center gap-1"
                  >
                    <i class="bi bi-exclamation-circle"></i>
                    {{ errors.birth_place_id }}
                  </small>
                </Transition>
              </div>
              <div class="space-y-1.5">
                <label
                  class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-2"
                  >Birth Date <span class="text-rose-500 ml-0.5">*</span></label
                >
                <DatePicker
                  v-model="form.birth_date"
                  class="!w-full"
                  :max-date="new Date()"
                  placeholder="Select Birth Date"
                  :class="{ 'p-invalid': errors.birth_date }"
                  :pt="{
                    pcInputText: {
                      root: {
                        class:
                          '!rounded-xl !p-4 !bg-slate-50 dark:!bg-slate-800/50 !border-none !text-xs !font-bold',
                      },
                    },
                  }"
                />
                <Transition name="p-message-content">
                  <small
                    v-if="errors.birth_date"
                    class="text-[9px] font-black text-rose-500 ml-2 uppercase tracking-widest flex items-center gap-1"
                  >
                    <i class="bi bi-exclamation-circle"></i>
                    {{ errors.birth_date }}
                  </small>
                </Transition>
              </div>
              <div class="space-y-1.5">
                <label
                  class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-2"
                  >Gender Identification</label
                >
                <Select
                  v-model="form.gender"
                  :options="[
                    { label: 'Laki-laki', value: 'Male' },
                    { label: 'Perempuan', value: 'Female' },
                  ]"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Select Gender"
                  class="!w-full !rounded-xl !bg-slate-50 dark:!bg-slate-800/50 !border-none !text-xs !font-bold h-12 flex items-center px-4"
                />
              </div>

              <div class="space-y-1.5">
                <label
                  class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-2"
                  >Marital Status</label
                >
                <Select
                  v-model="form.marital_status"
                  :options="['Single', 'Married', 'Divorced', 'Widowed']"
                  placeholder="Select Status"
                  class="!w-full !rounded-xl !bg-slate-50 dark:!bg-slate-800/50 !border-none !text-xs !font-bold h-12 flex items-center px-4"
                />
              </div>
              <div class="space-y-1.5">
                <label
                  class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-2"
                  >Dependents (Children)</label
                >
                <InputNumber
                  v-model="form.children_count"
                  :min="0"
                  class="!w-full"
                  placeholder="0"
                  :pt="{
                    pcInputText: {
                      root: {
                        class:
                          '!rounded-xl !p-4 !bg-slate-50 dark:!bg-slate-800/50 !border-none !text-xs !font-bold h-12',
                      },
                    },
                  }"
                />
              </div>
            </div>
          </div>

          <!-- Section Card: Employment Context -->
          <div
            class="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 shadow-sm space-y-8"
          >
            <div
              class="flex items-center gap-4 border-b border-slate-50 dark:border-slate-800 pb-6"
            >
              <div
                class="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-600"
              >
                <i class="bi bi-briefcase-fill text-lg"></i>
              </div>
              <div>
                <h3
                  class="text-lg font-black text-slate-800 dark:text-white tracking-tight"
                >
                  Work Architecture
                </h3>
                <p
                  class="text-[10px] font-bold text-slate-400 uppercase tracking-widest"
                >
                  Job details and contract specifications
                </p>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-1.5">
                <label
                  class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2"
                  >Assigned Position
                  <span class="text-rose-500 ml-0.5">*</span></label
                >
                <Select
                  v-model="form.position_id"
                  :options="posOptions"
                  optionLabel="name"
                  optionValue="id"
                  placeholder="Select Position"
                  class="!w-full !rounded-xl !bg-slate-50 dark:!bg-slate-800/50 !border-none !text-xs !font-bold h-12 flex items-center px-4"
                  :class="{ 'p-invalid': errors.position_id }"
                />
                <Transition name="p-message-content">
                  <small
                    v-if="errors.position_id"
                    class="text-[9px] font-black text-rose-500 ml-2 uppercase tracking-widest flex items-center gap-1"
                  >
                    <i class="bi bi-exclamation-circle"></i>
                    {{ errors.position_id }}
                  </small>
                </Transition>
              </div>

              <div class="space-y-1.5">
                <label
                  class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2"
                  >Operational Department
                  <span class="text-rose-500 ml-0.5">*</span></label
                >
                <Select
                  v-model="form.department_id"
                  :options="deptOptions"
                  optionLabel="name"
                  optionValue="id"
                  placeholder="Select Department"
                  class="!w-full !rounded-xl !bg-slate-50 dark:!bg-slate-800/50 !border-none !text-xs !font-bold h-12 flex items-center px-4"
                  :class="{ 'p-invalid': errors.department_id }"
                />
                <Transition name="p-message-content">
                  <small
                    v-if="errors.department_id"
                    class="text-[9px] font-black text-rose-500 ml-2 uppercase tracking-widest flex items-center gap-1"
                  >
                    <i class="bi bi-exclamation-circle"></i>
                    {{ errors.department_id }}
                  </small>
                </Transition>
              </div>

              <div class="space-y-1.5">
                <label
                  class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2"
                  >Contractual Protocol</label
                >
                <div
                  class="flex p-1 bg-slate-50 dark:bg-slate-800/50 rounded-xl"
                >
                  <button
                    v-for="t in ['Tetap', 'Kontrak', 'Magang']"
                    :key="t"
                    type="button"
                    @click="form.type = t"
                    class="flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all"
                    :class="
                      form.type === t
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200'
                        : 'text-slate-400 hover:text-slate-600'
                    "
                  >
                    {{ t }}
                  </button>
                </div>
              </div>
              <div class="space-y-1.5">
                <label
                  class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2"
                  >Calculated Age (Years)</label
                >
                <div
                  class="w-full h-12 bg-slate-50 dark:bg-slate-800/50 rounded-xl flex items-center px-4 text-xs font-black text-indigo-600 border-2 border-indigo-50/50"
                >
                  {{ calculatedAge }} Years Old
                </div>
              </div>
            </div>
          </div>

          <!-- Section Card: Address & Residency -->
          <div
            class="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 shadow-sm space-y-8"
          >
            <div
              class="flex items-center gap-4 border-b border-slate-50 dark:border-slate-800 pb-6"
            >
              <div
                class="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600"
              >
                <i class="bi bi-geo-alt-fill text-lg"></i>
              </div>
              <div>
                <h3
                  class="text-lg font-black text-slate-800 dark:text-white tracking-tight uppercase tracking-widest text-[11px]"
                >
                  Residency Protocol
                </h3>
                <p
                  class="text-[10px] font-bold text-slate-400 uppercase tracking-widest"
                >
                  Geographical location and address records
                </p>
              </div>
            </div>

            <div class="grid grid-cols-1 gap-6">
              <div class="space-y-1.5">
                <label
                  class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2"
                  >Search District
                  <span class="text-rose-500 ml-0.5">*</span></label
                >
                <AutoComplete
                  v-model="districtSearch"
                  :suggestions="filteredDistricts"
                  @complete="searchDistrict"
                  @item-select="onDistrictSelect"
                  optionLabel="name"
                  placeholder="Search district..."
                  :minLength="3"
                  class="!w-full"
                  :class="{ 'p-invalid': errors.district_id }"
                  :pt="{
                    pcInputText: {
                      root: {
                        class:
                          '!w-full !rounded-xl !p-4 !bg-slate-50 dark:!bg-slate-800/50 !border-none !text-xs !font-bold dark:!text-white',
                      },
                    },
                  }"
                />
                <Transition name="p-message-content">
                  <small
                    v-if="errors.district_id"
                    class="text-[9px] font-black text-rose-500 ml-2 uppercase tracking-widest flex items-center gap-1"
                  >
                    <i class="bi bi-exclamation-circle"></i>
                    {{ errors.district_id }}
                  </small>
                </Transition>
              </div>
              <div class="space-y-1.5">
                <label
                  class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2"
                  >Kabupaten</label
                >
                <InputText
                  :value="displayRegency"
                  disabled
                  class="!w-full !rounded-xl !p-4 !bg-slate-100 dark:!bg-slate-800 !border-none !text-xs !font-bold opacity-70"
                />
              </div>
              <div class="space-y-1.5">
                <label
                  class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2"
                  >Provinsi</label
                >
                <InputText
                  :value="displayProvince"
                  disabled
                  class="!w-full !rounded-xl !p-4 !bg-slate-100 dark:!bg-slate-800 !border-none !text-xs !font-bold opacity-70"
                />
              </div>
              <div class="space-y-1.5">
                <label
                  class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2"
                  >Jarak Rumah ke Kantor (KM)
                  <span class="text-rose-500 ml-0.5">*</span></label
                >
                <InputNumber
                  v-model="form.distance_km"
                  :min="0"
                  :max="250"
                  suffix=" KM"
                  class="!w-full"
                  placeholder="0 KM"
                  :class="{ 'p-invalid': errors.distance_km }"
                  :pt="{
                    pcInputText: {
                      root: {
                        class:
                          '!rounded-xl !p-4 !bg-slate-50 dark:!bg-slate-800/50 !border-none !text-xs !font-bold h-12',
                      },
                    },
                  }"
                />
                <Transition name="p-message-content">
                  <small
                    v-if="errors.distance_km"
                    class="text-[9px] font-black text-rose-500 ml-2 uppercase tracking-widest flex items-center gap-1"
                  >
                    <i class="bi bi-exclamation-circle"></i>
                    {{ errors.distance_km }}
                  </small>
                </Transition>
              </div>
              <div class="space-y-1.5">
                <label
                  class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2"
                  >Full Residential Address
                  <span class="text-rose-500 ml-0.5">*</span></label
                >
                <Textarea
                  v-model="form.full_address"
                  rows="3"
                  :class="{ 'p-invalid': errors.full_address }"
                  class="!w-full !rounded-xl !p-4 !bg-slate-50 dark:!bg-slate-800/50 !border-none !text-xs !font-bold dark:!text-white focus:!ring-2 focus:!ring-indigo-500/10 transition-all"
                  placeholder="e.g. Jl. Melati No. 123, RT 01/RW 02"
                />
                <small
                  v-if="errors.full_address"
                  class="text-[9px] font-black text-rose-500 ml-2 uppercase tracking-widest"
                  >{{ errors.full_address }}</small
                >
              </div>
            </div>
          </div>

          <div
            class="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 shadow-sm space-y-8"
          >
            <div
              class="flex items-center justify-between border-b border-slate-50 dark:border-slate-800 pb-6"
            >
              <div class="flex items-center gap-4">
                <div
                  class="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center text-rose-600"
                >
                  <i class="bi bi-mortarboard-fill text-lg"></i>
                </div>
                <div>
                  <h3
                    class="text-lg font-black text-slate-800 dark:text-white tracking-tight"
                  >
                    Academic History
                  </h3>
                  <p
                    class="text-[10px] font-bold text-slate-400 uppercase tracking-widest"
                  >
                    Educational background and master data
                  </p>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <span
                  class="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[9px] font-black text-slate-500"
                  v-if="form.educations.length"
                >
                  {{ form.educations.length }} RECORDS
                </span>
              </div>
            </div>

            <div class="space-y-6">
              <div
                class="flex flex-col md:flex-row gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800"
              >
                <div class="flex-1 space-y-1">
                  <label
                    class="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2"
                    >Master Data Selection</label
                  >
                  <div class="flex gap-2">
                    <Select
                      v-model="selectedEduId"
                      :options="availableEduOptions"
                      optionLabel="name"
                      optionValue="id"
                      placeholder="Pick from master..."
                      class="!flex-1 !rounded-xl !bg-white dark:!bg-slate-900 !border-none !text-xs !font-bold h-11 flex items-center px-4"
                    />
                    <Button
                      icon="bi bi-plus-lg"
                      label="Add"
                      @click="addEducation"
                      :disabled="!selectedEduId"
                      class="!rounded-xl !px-4 !bg-indigo-600 !border-none !font-black !uppercase !text-[9px]"
                    />
                    <Button
                      icon="bi bi-trash3"
                      severity="danger"
                      text
                      @click="removeGlobalEdu"
                      :disabled="!selectedEduId"
                      class="!rounded-xl !bg-white dark:!bg-slate-900 !text-rose-500 border border-slate-100 dark:border-slate-800"
                      v-tooltip.top="'Delete from Master'"
                    />
                  </div>
                </div>
                <div
                  class="w-px bg-slate-200 dark:bg-slate-800 hidden md:block"
                ></div>
                <div class="flex-1 space-y-1">
                  <label
                    class="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2"
                    >Register New Education</label
                  >
                  <div class="flex gap-2">
                    <InputText
                      v-model="newEduName"
                      placeholder="New record name..."
                      class="!flex-1 !rounded-xl !p-3 !bg-white dark:!bg-slate-900 !border-none !text-xs !font-bold dark:!text-white"
                      @keyup.enter="createNewEdu"
                    />
                    <Button
                      icon="bi bi-magic"
                      label="Create"
                      @click="createNewEdu"
                      :disabled="!newEduName"
                      class="!rounded-xl !px-4 !bg-emerald-600 !border-none !font-black !uppercase !text-[9px]"
                    />
                  </div>
                </div>
              </div>

              <div
                class="flex flex-wrap gap-3 p-6 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl min-h-[120px] items-center justify-center"
              >
                <TransitionGroup name="list">
                  <div
                    v-for="edu in form.educations"
                    :key="edu.id"
                    class="group flex items-center gap-3 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-sm hover:shadow-md hover:border-indigo-200 transition-all"
                  >
                    <i class="bi bi-mortarboard text-indigo-500"></i>
                    <span
                      class="text-xs font-black text-slate-700 dark:text-slate-300"
                      >{{ edu.name }}</span
                    >
                    <button
                      @click="removeEducation(edu.id)"
                      class="opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center justify-center rounded-full bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all"
                    >
                      <i class="bi bi-x text-sm"></i>
                    </button>
                  </div>
                </TransitionGroup>
                <div
                  v-if="form.educations.length === 0"
                  class="flex flex-col items-center text-center space-y-2 opacity-30"
                >
                  <i class="bi bi-cloud-slash text-3xl"></i>
                  <p class="text-[9px] font-black uppercase tracking-[0.2em]">
                    No Academic Ties Found
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>

    <!-- Hidden Elements -->
    <input
      type="file"
      ref="photoInput"
      @change="handlePhotoChange"
      class="hidden"
      accept="image/*"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useEmployees } from "~/composables/useEmployees";
import { useRegion } from "~/composables/useRegion";
import { useEducations } from "~/composables/useEducations";

const route = useRoute();
const router = useRouter();
const { getEmployee, addEmployee, updateEmployee } = useEmployees();
const {
  getKabupaten,
  getKecamatan,
  getProvinsiById,
  getKabupatenById,
  getKecamatanById,
} = useRegion();
const { fetchEducations, createEducation, removeGlobalEducation } =
  useEducations();

const allRegencies = ref<any[]>([]);
const filteredRegencies = ref<any[]>([]);
const birthCitySearch = ref(""); // For POB UI input

const allDistricts = ref<any[]>([]);
const filteredDistricts = ref<any[]>([]);
const districtSearch = ref(""); // For Address UI input

// Display fields for address (disabled)
const displayRegency = ref("");
const displayProvince = ref("");

// Education state
const educationOptions = ref<any[]>([]);
const selectedEduId = ref<number | null>(null);
const newEduName = ref("");

const isEdit = route.params.id !== undefined;
const loading = ref(isEdit);
const submitting = ref(false);
const photoInput = ref<HTMLInputElement | null>(null);

const deptOptions = ref<any[]>([]);
const posOptions = ref<any[]>([]);

const form = ref<any>({
  name: "",
  nip: null,
  birth_place_id: null,
  dob: null,
  gender: "Male",
  religion: "Islam",
  marital_status: "Single",
  children_count: 0,
  phone: "",
  email: "",
  district_id: null,
  full_address: "",
  department_id: null,
  position_id: null,
  site: "",
  type: "Tetap",
  join_date: new Date(),
  salary: 0,
  status: true,
  photo_url: "",
  educations: [],
  distance_km: 0,
});

onMounted(async () => {
  const { $axios } = useNuxtApp();
  const [regData, distData, eduData, deptRes, posRes] = await Promise.all([
    getKabupaten(),
    getKecamatan(),
    fetchEducations(),
    $axios.get("/api/departments"),
    $axios.get("/api/positions"),
  ]);

  allRegencies.value = regData;
  allDistricts.value = distData;
  educationOptions.value = eduData;
  deptOptions.value = deptRes.data;
  posOptions.value = posRes.data;

  if (isEdit) {
    try {
      const data = await getEmployee(Number(route.params.id));
      if (data) {
        // Helper to parse date string to local Date object without shifting
        const parseUTCDate = (dateStr?: string | null): Date | null => {
          if (!dateStr) return null;

          const parts = dateStr.split(/[-T ]/);

          if (parts.length < 3) {
            const fallbackDate = new Date(dateStr);

            return Number.isNaN(fallbackDate.getTime()) ? null : fallbackDate;
          }

          const [yearStr, monthStr, dayStr] = parts;

          const year = Number(yearStr);
          const month = Number(monthStr);
          const day = Number(dayStr);

          if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)) {
            return null;
          }

          const date = new Date(year, month - 1, day);

          return Number.isNaN(date.getTime()) ? null : date;
        };

        form.value = {
          ...data,
          birth_date: parseUTCDate(data.birth_date),
          join_date: parseUTCDate(data.join_date) || new Date(),
          educations: Array.isArray(data.educations) ? data.educations : [],
          distance_km: data.distance_km !== null && data.distance_km !== undefined ? Number(data.distance_km) : 0,
        };

        // Initialize display names and search inputs using API response data
        if (data.birth_place_id) {
          birthCitySearch.value = data.birthCityName || "";
        }
        if (data.district_id) {
          districtSearch.value = data.districtName || "";
          displayRegency.value = data.regencyName || "";
          displayProvince.value = data.provinceName || "";
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      loading.value = false;
    }
  } else {
    loading.value = false;
  }

  window.addEventListener("scroll", () => {
    const header = document.getElementById("form-header");
    if (header) {
      if (window.scrollY > 100) {
        header.classList.add(
          "border-slate-100",
          "dark:border-slate-800",
          "shadow-sm",
        );
      } else {
        header.classList.remove(
          "border-slate-100",
          "dark:border-slate-800",
          "shadow-sm",
        );
      }
    }
  });
});

const calculatedAge = computed(() => {
  if (form.value.birth_date && form.value.join_date) {
    const birth = new Date(form.value.birth_date);
    const join = new Date(form.value.join_date);
    let age = join.getFullYear() - birth.getFullYear();
    const m = join.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && join.getDate() < birth.getDate())) {
      age--;
    }
    return age > 0 ? age : 0;
  }
  return "-";
});

const calculatedTenure = computed(() => {
  if (form.value.join_date) {
    const join = new Date(form.value.join_date);
    const now = new Date();
    let years = now.getFullYear() - join.getFullYear();
    let months = now.getMonth() - join.getMonth();
    if (months < 0) {
      years--;
      months += 12;
    }
    return `${years}Y ${months}M`;
  }
  return "0Y 0M";
});

const completionPercentage = computed(() => {
  const fields = [
    "name",
    "nip",
    "email",
    "phone",
    "birth_place_id",
    "dob",
    "district_id",
    "full_address",
  ];
  const filled = fields.filter((f) => !!form.value[f]).length;
  const eduFilled = form.value.educations.length > 0 ? 1 : 0;
  return Math.round(((filled + eduFilled) / (fields.length + 1)) * 100);
});

// Search Methods
const searchBirthCity = async (event: any) => {
  const { $axios } = useNuxtApp();
  try {
    const res = await $axios.get("/api/locations/regencies", {
      params: { q: event.query },
    });
    filteredRegencies.value = res.data || [];
  } catch (e) {
    console.error("POB Search Error:", e);
    filteredRegencies.value = [];
  }
};

const searchDistrict = async (event: any) => {
  const { $axios } = useNuxtApp();
  try {
    const res = await $axios.get("/api/locations/districts", {
      params: { q: event.query },
    });
    filteredDistricts.value = res.data || [];
  } catch (e) {
    console.error("District Search Error:", e);
    filteredDistricts.value = [];
  }
};

// Selection Handlers
const onRegencySelect = (event: any) => {
  form.value.birth_place_id = event.value.id;
  birthCitySearch.value = event.value.name;
};

const onDistrictSelect = (event: any) => {
  const dist = event.value;
  form.value.district_id = dist.id;
  districtSearch.value = dist.name;
  displayRegency.value = dist.regency || "";
  displayProvince.value = dist.province || "";
};

const triggerPhotoUpload = () => photoInput.value?.click();

const handlePhotoChange = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      form.value.photo_url = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
};

// Education Logic
const availableEduOptions = computed(() => {
  const selectedIds = new Set(form.value.educations.map((e: any) => e.id));
  return educationOptions.value.filter((edu) => !selectedIds.has(edu.id));
});

const addEducation = () => {
  if (!selectedEduId.value) return;
  const edu = educationOptions.value.find((e) => e.id === selectedEduId.value);
  if (edu) {
    form.value.educations.push(edu);
    selectedEduId.value = null;
  }
};

const createNewEdu = async () => {
  if (!newEduName.value.trim()) return;
  const newEdu = await createEducation(newEduName.value);
  if (newEdu) {
    educationOptions.value.push(newEdu);
    form.value.educations.push(newEdu);
    newEduName.value = "";
  }
};

const removeEducation = (id: number) => {
  form.value.educations = form.value.educations.filter((e: any) => e.id !== id);
};

const removeGlobalEdu = async () => {
  if (!selectedEduId.value) return;
  try {
    await removeGlobalEducation(selectedEduId.value);
    educationOptions.value = educationOptions.value.filter(
      (e) => e.id !== selectedEduId.value,
    );
    selectedEduId.value = null;
  } catch (e) {
    console.error(e);
  }
};

const formatDate = (date: any) => {
  if (!date) return "-";
  const d = new Date(date);
  return d.toLocaleDateString("id-ID", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const errors = ref<any>({});
const toast = useToast();

const validateForm = () => {
  errors.value = {};
  if (!form.value.name) errors.value.name = "Name is required";
  if (!form.value.nip) {
    errors.value.nip = "NIP is required";
  } else if (!String(form.value.nip).replace(/\D/g, "")) {
    errors.value.nip = "NIP must contain valid numbers";
  }
  if (!form.value.email) errors.value.email = "Email is required";
  else if (!/^\S+@\S+\.\S+$/.test(form.value.email))
    errors.value.email = "Invalid email protocol";
  if (!form.value.phone) errors.value.phone = "Phone is required";
  if (!form.value.birth_place_id)
    errors.value.birth_place_id = "Birth city is required";
  if (!form.value.birth_date)
    errors.value.birth_date = "Birth date is required";
  if (!form.value.position_id)
    errors.value.position_id = "Position is required";
  if (!form.value.department_id)
    errors.value.department_id = "Department is required";
  if (!form.value.district_id)
    errors.value.district_id = "Residency location is required";
  if (form.value.distance_km === undefined || form.value.distance_km === null)
    errors.value.distance_km = "Distance is required";
  else if (Number(form.value.distance_km) < 0)
    errors.value.distance_km = "Distance cannot be negative";
  if (!form.value.full_address || form.value.full_address.length < 5)
    errors.value.full_address = "Full address is required (min 5 chars)";

  return Object.keys(errors.value).length === 0;
};

const handleSubmit = async () => {
  if (!validateForm()) {
    toast.add({
      severity: "error",
      summary: "Validation Failed",
      detail: "Please check your input protocols",
      life: 3000,
    });
    return;
  }

  submitting.value = true;
  try {
    // Helper to format local date to YYYY-MM-DD string
    const formatToUTCDate = (date: any) => {
      if (!date) return null;
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    const payload = {
      ...form.value,
      nip: Number(String(form.value.nip).replace(/\D/g, "")),
      birth_date: formatToUTCDate(form.value.birth_date),
      join_date: formatToUTCDate(form.value.join_date),
      status: !!form.value.status,
      children_count: Number(form.value.children_count),
      educationIds: form.value.educations.map((e: any) => e.id),
      distance_km: Number(form.value.distance_km || 0),
    };

    if (isEdit) {
      await updateEmployee(Number(route.params.id), payload);
      toast.add({
        severity: "success",
        summary: "Profile Updated",
        detail: "Talent matrix successfully refined",
        life: 3000,
      });
    } else {
      await addEmployee(payload);
      toast.add({
        severity: "success",
        summary: "Talent Onboarded",
        detail: "New record initialized in central database",
        life: 3000,
      });
    }
    router.push("/employees");
  } catch (e: any) {
    console.error(e);
    const detail = e.response?.data?.message || "Interface connection failure";
    toast.add({
      severity: "error",
      summary: "Execution Error",
      detail,
      life: 5000,
    });
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped>
:deep(.p-datepicker-trigger) {
  @apply !hidden;
}
:deep(.p-inputnumber-input) {
  @apply !text-right !font-black;
}

/* Elegant focus states for all input types */
:deep(.p-inputtext:focus),
:deep(.p-select:focus-within),
:deep(.p-autocomplete-input:focus),
:deep(.p-inputnumber-input:focus),
:deep(.p-textarea:focus) {
  @apply !ring-4 !ring-indigo-500/10 !border-indigo-300 dark:!border-indigo-500/50 transition-all;
  transform: translateY(-2px);
  box-shadow: 0 12px 30px -5px rgba(79, 70, 229, 0.15);
}

:deep(.p-inputtext),
:deep(.p-select),
:deep(.p-textarea),
:deep(.p-inputnumber-input) {
  @apply transition-all duration-300;
}
</style>
