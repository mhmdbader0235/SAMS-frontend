<template>
  <div class="min-h-screen">
    <div class="max-w-5xl mx-auto space-y-6">
      <!-- Title Banner -->
      <div class="flex items-center gap-3 theme-card rounded-2xl p-6 shadow-sm">
        <div class="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
          <ClipboardList class="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <h2 class="text-xl font-bold theme-text-heading tracking-tight">Management Forms</h2>
          <p class="text-xs text-gray-500 font-medium mt-0.5">Configure academic structures, users, and event planning</p>
        </div>
      </div>
    <!-- Alert Messages -->
    <transition name="fade">
      <div v-if="successMsg" class="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-sm text-emerald-400 font-medium flex items-center gap-2">
        <CheckCircle class="w-4 h-4 shrink-0" />
        {{ successMsg }}
      </div>
    </transition>
    <transition name="fade">
      <div v-if="errorMsg" class="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-sm text-rose-400 font-medium flex items-center gap-2">
        <AlertCircle class="w-4 h-4 shrink-0" />
        {{ errorMsg }}
      </div>
    </transition>

    <!-- Form Panels -->
    <div class="space-y-6">
      <div>
        <EventWizard @completed="router.push('/dashboard')" />
      </div>
    </div>

    </div><!-- closes p-8 wrapper -->
  </div><!-- closes min-h-screen -->
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore, useSchoolStore } from '../store';
import { fromDateTimeLocal } from '../format';
import EventWizard from './wizard/EventWizard.vue';
import { 
  apiLoadLevels, 
  apiCreateLevel, 
  apiLoadTeachers, 
  apiCreateTeacher,
  apiLoadParents, 
  apiLoadStudents, 
  apiCreateStudent, 
  apiLinkParentStudent, 
  apiLoadClasses, 
  apiCreateClass,
  apiUpdateClass,
  apiDeleteClass,
  apiGetClassStudents,
  apiAssignStudentToClass,
  apiRemoveStudentFromClass,
  apiCreateEvent,
  apiCreateManager
} from '../api';
import { 
  ClipboardList, 
  Layers, 
  BookOpen, 
  UserPlus, 
  Users, 
  CalendarDays, 
  Plus, 
  Trash,
  CheckCircle,
  AlertCircle,
  Search,
  Pencil,
  X
} from 'lucide-vue-next';

const router = useRouter();
const authStore = useAuthStore();
const schoolStore = useSchoolStore();
const user = computed(() => authStore.user);

const activeTab = ref('structure');
const tabs = computed(() => [
  { id: 'structure', name: 'School Structure', icon: Layers },
  { id: 'users', name: 'Students & Parents', icon: Users },
  { id: 'events', name: 'Plan Event', icon: CalendarDays }
]);

const successMsg = ref(null);
const errorMsg = ref(null);

const setSuccess = (msg) => {
  successMsg.value = msg;
  setTimeout(() => { successMsg.value = null; }, 4000);
};

const setError = (msg) => {
  errorMsg.value = msg;
  setTimeout(() => { errorMsg.value = null; }, 4000);
};

// Lists loaded dynamically
const levels = ref([]);
const teachers = ref([]);
const parents = ref([]);
const students = ref([]);
const classes = ref([]);

// Form states
const levelForm = ref({ name: '' });
const classForm = ref({ name: '', level_id: '', head_teacher_id: '' });
const editingClass = ref(null);
const editClassForm = ref({ id: null, name: '', level_id: '', head_teacher_id: '' });
const editClassStudents = ref([]);
const studentToAdd = ref('');
const studentSearchToAdd = ref('');
const studentForm = ref({ name: '', email: '', password: '', class_id: '', gender: '', birth_data: '' });
const teacherForm = ref({ name: '', email: '', password: '' });
const managerForm = ref({ email: '', password: '' });
const linkForm = ref({ student_id: '', parent_id: '' });
const studentSearch = ref('');
const parentSearch = ref('');

const filteredStudentsToAdd = computed(() => {
  let available = students.value.filter(stu => stu.class_id !== editClassForm.value.id);
  if (!studentSearchToAdd.value) return available;
  const q = studentSearchToAdd.value.toLowerCase();
  return available.filter(s => 
    s.name.toLowerCase().includes(q) || 
    s.email.toLowerCase().includes(q)
  );
});

const filteredStudents = computed(() => {
  if (!studentSearch.value) return students.value.slice(0, 50);
  const q = studentSearch.value.toLowerCase();
  return students.value.filter(s => 
    s.name.toLowerCase().includes(q) || 
    s.email.toLowerCase().includes(q)
  ).slice(0, 50);
});

const filteredParents = computed(() => {
  if (!parentSearch.value) return parents.value.slice(0, 50);
  const q = parentSearch.value.toLowerCase();
  return parents.value.filter(p => 
    p.name.toLowerCase().includes(q) || 
    p.email.toLowerCase().includes(q)
  ).slice(0, 50);
});

const eventForm = ref({
  title: '',
  description: '',
  address: '',
  school_subsidy: '',
  date: '',
  class_mappings: []
});

const loadAllData = async () => {
  try {
    levels.value = await apiLoadLevels();
    teachers.value = await apiLoadTeachers();
    parents.value = await apiLoadParents();
    students.value = await apiLoadStudents();
    classes.value = await apiLoadClasses();
  } catch (err) {
    console.error('Failed to load lists:', err);
  }
};

onMounted(() => {
  loadAllData();
});

// Create actions
const handleCreateLevel = async () => {
  try {
    await apiCreateLevel({ name: levelForm.value.name });
    levelForm.value.name = '';
    setSuccess('Level created successfully!');
    loadAllData();
  } catch (err) {
    setError(err.message);
  }
};

const handleCreateClass = async () => {
  try {
    await apiCreateClass({
      name: classForm.value.name,
      level_id: classForm.value.level_id,
      head_teacher_id: classForm.value.head_teacher_id
    });
    classForm.value.name = '';
    classForm.value.level_id = '';
    classForm.value.head_teacher_id = '';
    setSuccess('Class created successfully!');
    loadAllData();
  } catch (err) {
    setError(err.message);
  }
};

const loadClassStudents = async (classId) => {
  try {
    editClassStudents.value = await apiGetClassStudents(classId);
  } catch (err) {
    console.error('Failed to load class students:', err);
  }
};

const openEditClassModal = async (cls) => {
  editingClass.value = cls;
  editClassForm.value = {
    id: cls.id,
    name: cls.name,
    level_id: cls.level_id,
    head_teacher_id: cls.head_teacher_id
  };
  studentToAdd.value = '';
  await loadClassStudents(cls.id);
};

const closeEditClassModal = () => {
  editingClass.value = null;
  editClassStudents.value = [];
};

const handleUpdateClass = async () => {
  try {
    await apiUpdateClass(editClassForm.value.id, {
      name: editClassForm.value.name,
      level_id: editClassForm.value.level_id,
      head_teacher_id: editClassForm.value.head_teacher_id
    });
    setSuccess('Class details updated successfully!');
    loadAllData();
  } catch (err) {
    setError(err.message);
  }
};

const handleDeleteClass = async () => {
  if (!confirm('Are you sure you want to delete this class? This cannot be undone.')) return;
  try {
    await apiDeleteClass(editClassForm.value.id);
    setSuccess('Class deleted successfully!');
    closeEditClassModal();
    loadAllData();
  } catch (err) {
    setError(err.message);
  }
};

const handleAddStudentToClass = async () => {
  if (!studentToAdd.value) return;
  try {
    await apiAssignStudentToClass(editClassForm.value.id, studentToAdd.value);
    setSuccess('Student added to class.');
    studentToAdd.value = '';
    await loadClassStudents(editClassForm.value.id);
    loadAllData();
  } catch (err) {
    setError(err.message);
  }
};

const handleRemoveStudentFromClass = async (studentId) => {
  if (!confirm('Remove this student from the class?')) return;
  try {
    await apiRemoveStudentFromClass(editClassForm.value.id, studentId);
    setSuccess('Student removed from class.');
    await loadClassStudents(editClassForm.value.id);
    loadAllData();
  } catch (err) {
    setError(err.message);
  }
};

const handleCreateStudent = async () => {
  try {
    await apiCreateStudent({
      email: studentForm.value.email,
      password: studentForm.value.password,
      name: studentForm.value.name,
      class_id: studentForm.value.class_id,
      gender: studentForm.value.gender || null,
      birth_data: studentForm.value.birth_data || null
    });
    studentForm.value = { name: '', email: '', password: '', class_id: '', gender: '', birth_data: '' };
    setSuccess('Student profile created successfully!');
    loadAllData();
  } catch (err) {
    setError(err.message);
  }
};

const handleCreateTeacher = async () => {
  try {
    await apiCreateTeacher({
      email: teacherForm.value.email,
      password: teacherForm.value.password,
      name: teacherForm.value.name
    });
    teacherForm.value = { name: '', email: '', password: '' };
    setSuccess('Teacher profile created successfully!');
    loadAllData();
  } catch (err) {
    setError(err.message);
  }
};

const handleCreateManager = async () => {
  try {
    await apiCreateManager({
      email: managerForm.value.email,
      password: managerForm.value.password
    });
    managerForm.value = { email: '', password: '' };
    setSuccess('Manager user created successfully!');
    loadAllData();
  } catch (err) {
    setError(err.message);
  }
};

const handleLinkParent = async () => {
  try {
    await apiLinkParentStudent({
      student_id: linkForm.value.student_id,
      parent_id: linkForm.value.parent_id
    });
    linkForm.value.student_id = '';
    linkForm.value.parent_id = '';
    setSuccess('Student linked to Parent successfully!');
  } catch (err) {
    setError(err.message);
  }
};

// Event class maps
const addClassMapping = () => {
  eventForm.value.class_mappings.push({
    class_id: '',
    ticket_price: '',
    budgets: []
  });
};

const removeClassMapping = (idx) => {
  eventForm.value.class_mappings.splice(idx, 1);
};

const handleCreateEvent = async () => {
  try {
    if (eventForm.value.class_mappings.length === 0) {
      setError('Please add at least one Class Target for the event.');
      return;
    }
    const mappings = eventForm.value.class_mappings.map(m => ({
      class_id: parseInt(m.class_id),
      ticket_price: parseFloat(m.ticket_price || 0.0),
      budgets: m.budgets.filter(b => b.description.trim() !== '').map(b => ({
        description: b.description.trim(),
        price: parseFloat(b.price || 0.0)
      }))
    }));

    await apiCreateEvent({
      title: eventForm.value.title,
      description: eventForm.value.description,
      address: eventForm.value.address,
      school_subsidy: parseFloat(eventForm.value.school_subsidy || 0.0),
      date: fromDateTimeLocal(eventForm.value.date, schoolStore.timezone),
      class_mappings: mappings
    });

    eventForm.value = { title: '', description: '', address: '', school_subsidy: '', date: '', class_mappings: [] };
    setSuccess('Event published and targets notified successfully!');
  } catch (err) {
    setError(err.message);
  }
};
</script>
