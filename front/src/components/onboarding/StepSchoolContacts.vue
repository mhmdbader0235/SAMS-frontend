<template>
  <div class="space-y-6 animation-fade-in">
    <div>
      <h3 class="text-lg font-bold text-slate-900 flex items-center gap-2">
        <PhoneCall class="w-5 h-5 text-blue-600" /> Contacts Directory
      </h3>
      <p class="text-xs text-slate-500 mt-1">At least one contact must be marked as an emergency contact with a reachable phone number before the school can activate — trips can't be planned without one.</p>
    </div>

    <transition name="fade">
      <div v-if="errorMsg" class="p-3.5 bg-rose-50 border border-rose-200 rounded text-xs text-rose-800 font-semibold flex items-center gap-2.5 shadow-xs">
        <AlertCircle class="w-4 h-4 shrink-0 text-rose-600" />
        <span>{{ errorMsg }}</span>
      </div>
    </transition>

    <div class="theme-card rounded border border-slate-200 bg-white overflow-hidden shadow-xs">
      <div v-if="contacts.length === 0" class="text-center py-8 text-xs text-slate-400 italic">
        No contacts added yet.
      </div>
      <div v-else class="divide-y divide-slate-200">
        <div v-for="c in contacts" :key="c.id" class="flex items-center justify-between p-3.5">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
              <User class="w-4 h-4 text-slate-500" />
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold text-slate-900">{{ c.name }}</span>
                <span class="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">{{ c.role_title }}</span>
                <span v-if="c.is_emergency_contact" class="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                  <Siren class="w-2.5 h-2.5" /> Emergency
                </span>
              </div>
              <div class="text-[11px] text-slate-500 mt-0.5">{{ c.phone || 'No phone' }} <span v-if="c.email">· {{ c.email }}</span></div>
            </div>
          </div>
          <button @click="removeContact(c.id)" class="p-1.5 rounded text-rose-500 hover:bg-rose-50 transition-colors">
            <Trash2 class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>

    <div class="theme-card rounded p-5 border border-slate-200 bg-white shadow-xs space-y-4">
      <h4 class="font-bold text-xs uppercase tracking-wider text-slate-600">Add Contact</h4>
      <div class="grid md:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Role / Title <span class="text-rose-500">*</span></label>
          <input v-model="newContact.role_title" type="text" placeholder="e.g. Principal"
            class="w-full bg-white border border-slate-300 rounded px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 shadow-xs" />
        </div>
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Full Name <span class="text-rose-500">*</span></label>
          <input v-model="newContact.name" type="text" class="w-full bg-white border border-slate-300 rounded px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 shadow-xs" />
        </div>
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Phone</label>
          <input v-model="newContact.phone" type="text" placeholder="e.g. +962 79 000 0000"
            class="w-full bg-white border border-slate-300 rounded px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 shadow-xs" />
        </div>
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Email <span class="text-slate-400 font-normal normal-case">optional</span></label>
          <input v-model="newContact.email" type="email" class="w-full bg-white border border-slate-300 rounded px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 shadow-xs" />
        </div>
      </div>
      <label class="flex items-center gap-2 cursor-pointer w-fit">
        <input type="checkbox" v-model="newContact.is_emergency_contact" class="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
        <span class="text-xs font-semibold text-slate-700">This is an emergency contact</span>
      </label>
      <button @click="addContact" :disabled="isAdding" class="btn-primary text-xs font-bold px-4 py-2 rounded text-white flex items-center gap-1.5 shadow-xs disabled:opacity-50">
        <Plus class="w-3.5 h-3.5" /> Add Contact
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { PhoneCall, User, Siren, Trash2, Plus, AlertCircle } from 'lucide-vue-next';
import { useSchoolStore } from '../../store';

const schoolStore = useSchoolStore();
const isAdding = ref(false);
const errorMsg = ref(null);

const contacts = computed(() => schoolStore.profile?.contacts || []);

const newContact = ref({ role_title: '', name: '', phone: '', email: '', is_emergency_contact: false });

const addContact = async () => {
  errorMsg.value = null;
  if (!newContact.value.role_title.trim() || !newContact.value.name.trim()) {
    errorMsg.value = 'Role/Title and Name are required.';
    return;
  }
  isAdding.value = true;
  try {
    await schoolStore.createContact({
      role_title: newContact.value.role_title.trim(),
      name: newContact.value.name.trim(),
      phone: newContact.value.phone.trim() || null,
      email: newContact.value.email.trim() || null,
      is_emergency_contact: newContact.value.is_emergency_contact,
      escalation_order: contacts.value.length + 1
    });
    newContact.value = { role_title: '', name: '', phone: '', email: '', is_emergency_contact: false };
  } catch (err) {
    errorMsg.value = err.message || 'Failed to add contact';
  } finally {
    isAdding.value = false;
  }
};

const removeContact = async (id) => {
  try {
    await schoolStore.deleteContact(id);
  } catch (err) {
    errorMsg.value = err.message || 'Failed to remove contact';
  }
};
</script>
