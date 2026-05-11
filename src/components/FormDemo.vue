<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-10 px-4">
    <div class="max-w-4xl mx-auto">

      <!-- Header -->
      <div class="text-center mb-10">
        <span
          class="inline-block px-3 py-1 text-xs font-semibold tracking-widest uppercase rounded-full bg-indigo-100 text-indigo-700 mb-3">UI
          Library</span>
        <h1 class="text-4xl font-bold text-gray-900 mb-2">Form Components</h1>
        <p class="text-gray-500 text-sm">Every input type with live validation — all powered by <code
            class="bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded">useForm</code></p>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-8" novalidate>

        <!-- ── Section 1: Text Inputs ─────────────────────────────────────── -->
        <FormSection title="Text Inputs" icon="✏️">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <BaseInput id="fullName" label="Full Name" placeholder="John Doe" required :modelValue="values.fullName"
              :error="errors.fullName" @update:modelValue="(v) => setField('fullName', v)"
              @blur="() => touch('fullName')" />

            <BaseInput id="email" label="Email Address" type="email" placeholder="you@example.com" required
              :modelValue="values.email" :error="errors.email" @update:modelValue="(v) => setField('email', v)"
              @blur="() => touch('email')" />

            <BaseInput id="phone" label="Phone Number" type="tel" placeholder="+1 (555) 000-0000"
              :modelValue="values.phone" :error="errors.phone" @update:modelValue="(v) => setField('phone', v)"
              @blur="() => touch('phone')" />

            <BaseInput id="website" label="Website URL" type="url" placeholder="https://example.com"
              :modelValue="values.website" :error="errors.website" @update:modelValue="(v) => setField('website', v)"
              @blur="() => touch('website')" />

            <BaseInput id="age" label="Age" type="number" placeholder="18" hint="Must be between 1 and 120"
              :modelValue="values.age" :error="errors.age" @update:modelValue="(v) => setField('age', Number(v))"
              @blur="() => touch('age')" />

            <BaseInput id="password" label="Password" type="password" placeholder="Min 8 characters" required
              :modelValue="values.password" :error="errors.password" @update:modelValue="(v) => setField('password', v)"
              @blur="() => touch('password')" />

            <BaseInput id="confirmPassword" label="Confirm Password" type="password" placeholder="Repeat password"
              required :modelValue="values.confirmPassword" :error="errors.confirmPassword"
              @update:modelValue="(v) => setField('confirmPassword', v)" @blur="() => touch('confirmPassword')" />

            <BaseInput id="username" label="Username" placeholder="letters and numbers only"
              hint="Only lowercase letters, numbers and underscores" :modelValue="values.username"
              :error="errors.username" @update:modelValue="(v) => setField('username', v)"
              @blur="() => touch('username')" />
          </div>
        </FormSection>

        <!-- ── Section 2: Date/Time Inputs ───────────────────────────────── -->
        <FormSection title="Date & Time" icon="📅">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <BaseInput id="birthDate" label="Date of Birth" type="date" :modelValue="values.birthDate"
              :error="errors.birthDate" @update:modelValue="(v) => setField('birthDate', v)"
              @blur="() => touch('birthDate')" />

            <BaseInput id="meetingTime" label="Meeting Time" type="time" :modelValue="values.meetingTime"
              :error="errors.meetingTime" @update:modelValue="(v) => setField('meetingTime', v)"
              @blur="() => touch('meetingTime')" />

            <BaseInput id="eventDateTime" label="Event Date & Time" type="datetime-local"
              :modelValue="values.eventDateTime" :error="errors.eventDateTime"
              @update:modelValue="(v) => setField('eventDateTime', v)" @blur="() => touch('eventDateTime')" />

            <BaseInput id="birthMonth" label="Birth Month" type="month" :modelValue="values.birthMonth"
              :error="errors.birthMonth" @update:modelValue="(v) => setField('birthMonth', v)"
              @blur="() => touch('birthMonth')" />
          </div>
        </FormSection>

        <!-- ── Section 3: Textarea ───────────────────────────────────────── -->
        <FormSection title="Textarea" icon="📝">
          <BaseTextarea label="Bio / Description" placeholder="Tell us about yourself..." :rows="4" :maxlength="300"
            required :modelValue="values.bio" :error="errors.bio" @update:modelValue="(v) => setField('bio', v)"
            @blur="() => touch('bio')" />
        </FormSection>

        <!-- ── Section 4: Select ─────────────────────────────────────────── -->
        <FormSection title="Select & Dropdowns" icon="🔽">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <BaseSelect label="Country" placeholder="Choose your country" required :options="countryOptions"
              :modelValue="values.country" :error="errors.country" @update:modelValue="(v) => setField('country', v)"
              @blur="() => touch('country')" />

            <BaseSelect label="Programming Language (grouped)" placeholder="Select language"
              :options="languageGroupOptions" :modelValue="values.language" :error="errors.language"
              @update:modelValue="(v) => setField('language', v)" @blur="() => touch('language')" />
          </div>
        </FormSection>

        <!-- ── Section 5: Checkboxes ─────────────────────────────────────── -->
        <FormSection title="Checkboxes" icon="☑️">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-3">
              <p class="text-sm font-medium text-gray-700">Single Checkbox</p>
              <BaseCheckbox label="I accept the Terms of Service" description="You must accept to continue." required
                :modelValue="values.terms" :error="errors.terms" @update:modelValue="(v) => setField('terms', v)"
                @blur="() => touch('terms')" />
              <BaseCheckbox label="Subscribe to newsletter" :modelValue="values.newsletter"
                @update:modelValue="(v) => setField('newsletter', v)" />
            </div>

            <div class="space-y-3">
              <BaseCheckboxGroup label="Favourite Frameworks" required :options="frameworkOptions"
                :modelValue="values.frameworks" :error="errors.frameworks"
                @update:modelValue="(v) => setField('frameworks', v)" @blur="() => touch('frameworks')" />
            </div>
          </div>
        </FormSection>

        <!-- ── Section 6: Radio ──────────────────────────────────────────── -->
        <FormSection title="Radio Buttons" icon="🔘">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <BaseRadioGroup label="Experience Level" required layout="vertical" :options="experienceOptions"
              :modelValue="values.experience" :error="errors.experience"
              @update:modelValue="(v) => setField('experience', v)" @blur="() => touch('experience')" />

            <BaseRadioGroup label="Preferred Contact" layout="horizontal" :options="contactOptions"
              :modelValue="values.contact" @update:modelValue="(v) => setField('contact', v)" />
          </div>
        </FormSection>

        <!-- ── Section 7: Toggle ─────────────────────────────────────────── -->
        <FormSection title="Toggle Switch" icon="🔀">
          <div class="space-y-4 max-w-md">
            <BaseToggle label="Enable notifications" description="Receive push and email alerts."
              :modelValue="values.notifications" @update:modelValue="(v) => setField('notifications', v)" showStatus
              activeLabel="Notifications ON" inactiveLabel="Notifications OFF" />

            <BaseToggle label="Dark mode" description="Use dark theme across the app." :modelValue="values.darkMode"
              @update:modelValue="(v) => setField('darkMode', v)" showStatus activeLabel="Dark mode active"
              inactiveLabel="Light mode active" />
          </div>
        </FormSection>

        <!-- ── Section 8: Slider ─────────────────────────────────────────── -->
        <FormSection title="Range Slider" icon="🎚️">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <BaseSlider label="Budget" :min="0" :max="10000" :step="100" prefix="$" :modelValue="values.budget"
              :error="errors.budget" @update:modelValue="(v) => setField('budget', v)" @blur="() => touch('budget')" />

            <BaseSlider label="Satisfaction Score" :min="0" :max="10" :step="1" suffix="/10"
              :modelValue="values.satisfaction" @update:modelValue="(v) => setField('satisfaction', v)" />
          </div>
        </FormSection>

        <!-- ── Section 9: Rating ─────────────────────────────────────────── -->
        <FormSection title="Star Rating" icon="⭐">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <BaseRating label="Rate your experience" required size="lg"
              :labels="['Poor', 'Fair', 'Good', 'Great', 'Excellent']" :modelValue="values.rating"
              :error="errors.rating" @update:modelValue="(v) => setField('rating', v)" @blur="() => touch('rating')" />

            <BaseRating label="Difficulty (read-only)" :modelValue="3" :readonly="true" size="md" :clearable="false" />
          </div>
        </FormSection>

        <!-- ── Section 10: Tag Input ──────────────────────────────────────── -->
        <FormSection title="Tag Input" icon="🏷️">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <BaseTagInput label="Skills" placeholder="Add a skill..." :maxTags="10" required
              hint="Press Enter or comma to add a tag" :modelValue="values.skills" :error="errors.skills"
              @update:modelValue="(v) => setField('skills', v)" @blur="() => touch('skills')" />

            <BaseTagInput label="Tags / Keywords" placeholder="Add keywords..." :modelValue="values.keywords"
              @update:modelValue="(v) => setField('keywords', v)" />
          </div>
        </FormSection>

        <!-- ── Section 11: File Upload ────────────────────────────────────── -->
        <FormSection title="File Upload" icon="📁">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <BaseFileUpload label="Profile Photo" accept="image/*" :maxSize="5" required :error="errors.avatar"
              @update:modelValue="(v) => setField('avatar', v)" @blur="() => touch('avatar')" />

            <BaseFileUpload label="Attachments (multiple)" accept=".pdf,.doc,.docx" :maxSize="20" :multiple="true"
              :error="errors.attachments" @update:modelValue="(v) => setField('attachments', v)" />
          </div>
        </FormSection>

        <!-- ── Section 12: Tree Select ───────────────────────────────────── -->
        <FormSection title="Tree Select" icon="🌳">
          <!-- Strategy legend -->
          <div class="mb-4 flex flex-wrap gap-3 text-xs">
            <span
              class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 font-medium">
              <span class="w-2 h-2 rounded-full bg-indigo-500 inline-block"></span>independent — each node toggled
              individually
            </span>
            <span
              class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-medium">
              <span class="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>leaf-only — only leaf nodes
              selectable
            </span>
            <span
              class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 font-medium">
              <span class="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>cascade — parent selects all children;
              indeterminate when partial
            </span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <!-- Single select -->
            <BaseTreeSelect label="Department (single)" placeholder="Select a department..." required
              :tree="departmentTree" :modelValue="values.department" :error="errors.department"
              @update:modelValue="(v) => setField('department', v)" @blur="() => touch('department')" />

            <!-- Multi – independent (default) -->
            <BaseTreeSelect label="Skills (multi · independent)" placeholder="Select skills..." :multi="true"
              selection-strategy="independent" :tree="skillTree" :modelValue="values.skills"
              @update:modelValue="(v) => setField('skills', v)" />

            <!-- Multi – leaf-only -->
            <BaseTreeSelect label="Permissions (multi · leaf-only)" placeholder="Select permissions..." :multi="true"
              selection-strategy="leaf-only" :tree="permissionTree" :modelValue="values.permissions"
              @update:modelValue="(v) => setField('permissions', v)" />

            <!-- Multi – cascade -->
            <BaseTreeSelect label="Categories (multi · cascade)" placeholder="Select categories..." :multi="true"
              selection-strategy="cascade" :tree="categoryTree" :modelValue="values.categories"
              @update:modelValue="(v) => setField('categories', v)" />
          </div>
        </FormSection>

        <!-- ── Section 13: Color & Range ────────────────────────────────── -->
        <FormSection title="Other Native Inputs" icon="🎨">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
            <BaseInput id="color" label="Brand Color" type="color" :modelValue="values.brandColor"
              @update:modelValue="(v) => setField('brandColor', v)" />
            <BaseInput id="searchQuery" label="Search" type="search" placeholder="Search anything..."
              :modelValue="values.searchQuery" @update:modelValue="(v) => setField('searchQuery', v)" />
            <BaseInput id="pinCode" label="PIN Code" type="password" placeholder="••••" :maxlength="6"
              hint="4–6 digit PIN" :modelValue="values.pinCode" :error="errors.pinCode"
              @update:modelValue="(v) => setField('pinCode', v)" @blur="() => touch('pinCode')" />
          </div>
        </FormSection>

        <!-- ── Submit bar ────────────────────────────────────────────────── -->
        <div
          class="sticky bottom-0 bg-white/80 backdrop-blur border-t border-gray-200 rounded-xl shadow-lg p-4 flex items-center gap-4 flex-wrap">
          <BaseButton type="submit" :fullWidth="false" variant="primary">
            Submit Form
          </BaseButton>
          <BaseButton type="button" :fullWidth="false" variant="secondary" @click="reset">
            Reset
          </BaseButton>

          <div class="flex items-center gap-2 ml-auto text-sm">
            <span :class="isValid ? 'text-emerald-600' : 'text-gray-400'" class="flex items-center gap-1 font-medium">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path v-if="isValid" fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clip-rule="evenodd" />
                <path v-else fill-rule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clip-rule="evenodd" />
              </svg>
              {{ isValid ? 'Form valid' : 'Has errors' }}
            </span>
            <span v-if="isDirty"
              class="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">Unsaved changes</span>
          </div>
        </div>
      </form>

      <!-- Success toast -->
      <transition name="fade">
        <div v-if="submitted"
          class="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-5 py-4 rounded-xl shadow-2xl flex items-center gap-3 text-sm font-medium">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          Form submitted successfully!
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, defineComponent, h } from 'vue'
import { useForm } from '../ui-lib/useForm'
import {
  required, email, url, phone, numeric, integer, minLength, maxLength,
  min, max, pattern, sameAs, minItems, fileSize, fileType,
} from '../ui-lib/validators'

// ── Inline FormSection layout component ──────────────────────────────────────
const FormSection = defineComponent({
  props: { title: String, icon: String },
  setup(props, { slots }) {
    return () => h('div', { class: 'bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden' }, [
      h('div', { class: 'px-6 py-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-100 flex items-center gap-2' }, [
        h('span', { class: 'text-xl' }, props.icon),
        h('h2', { class: 'text-base font-semibold text-gray-800' }, props.title),
      ]),
      h('div', { class: 'p-6' }, slots.default?.()),
    ])
  },
})

// ── Static option data ────────────────────────────────────────────────────────
const countryOptions = [
  { label: 'United States', value: 'us' }, { label: 'United Kingdom', value: 'uk' },
  { label: 'Canada', value: 'ca' }, { label: 'Australia', value: 'au' },
  { label: 'Germany', value: 'de' }, { label: 'India', value: 'in' },
  { label: 'Japan', value: 'jp' }, { label: 'Brazil', value: 'br' },
]

const languageGroupOptions = [
  { label: 'Frontend', options: [{ label: 'JavaScript', value: 'js' }, { label: 'TypeScript', value: 'ts' }, { label: 'Elm', value: 'elm' }] },
  { label: 'Backend', options: [{ label: 'Python', value: 'py' }, { label: 'Go', value: 'go' }, { label: 'Rust', value: 'rs' }, { label: 'Java', value: 'java' }] },
  { label: 'Mobile', options: [{ label: 'Swift', value: 'swift' }, { label: 'Kotlin', value: 'kotlin' }, { label: 'Dart', value: 'dart' }] },
]

const frameworkOptions = [
  { label: 'Vue.js', value: 'vue' }, { label: 'React', value: 'react' },
  { label: 'Angular', value: 'angular' }, { label: 'Svelte', value: 'svelte' },
  { label: 'Nuxt', value: 'nuxt' },
]

const experienceOptions = [
  { label: 'Junior (0-2 yrs)', value: 'junior', description: 'Learning the basics' },
  { label: 'Mid (2-5 yrs)', value: 'mid', description: 'Solid hands-on experience' },
  { label: 'Senior (5+ yrs)', value: 'senior', description: 'Team lead or architect' },
]

const contactOptions = [
  { label: 'Email', value: 'email' }, { label: 'Phone', value: 'phone' }, { label: 'Chat', value: 'chat' },
]

const departmentTree = [
  {
    id: 'eng', label: 'Engineering', children: [
      { id: 'fe', label: 'Frontend', children: [{ id: 'ui', label: 'UI/UX' }, { id: 'mobile', label: 'Mobile' }] },
      { id: 'be', label: 'Backend', children: [{ id: 'api', label: 'API Team' }, { id: 'db', label: 'Database' }] },
      { id: 'devops', label: 'DevOps' },
    ]
  },
  { id: 'design', label: 'Design', children: [{ id: 'brand', label: 'Brand' }, { id: 'product', label: 'Product Design' }] },
  { id: 'hr', label: 'Human Resources' },
  { id: 'finance', label: 'Finance' },
]

const permissionTree = [
  { id: 'user', label: 'Users', children: [{ id: 'user:read', label: 'Read' }, { id: 'user:write', label: 'Write' }, { id: 'user:delete', label: 'Delete' }] },
  { id: 'content', label: 'Content', children: [{ id: 'content:read', label: 'Read' }, { id: 'content:publish', label: 'Publish' }] },
  { id: 'settings', label: 'Settings', children: [{ id: 'settings:view', label: 'View' }, { id: 'settings:edit', label: 'Edit' }] },
  { id: 'reports', label: 'Reports' },
]

// independent demo tree
const skillTree = [
  {
    id: 'frontend', label: 'Frontend', children: [
      { id: 'vue', label: 'Vue.js' }, { id: 'react', label: 'React' }, { id: 'svelte', label: 'Svelte' },
    ],
  },
  {
    id: 'backend', label: 'Backend', children: [
      { id: 'node', label: 'Node.js' }, { id: 'python', label: 'Python' }, { id: 'go', label: 'Go' },
    ],
  },
  { id: 'devops', label: 'DevOps', children: [{ id: 'docker', label: 'Docker' }, { id: 'k8s', label: 'Kubernetes' }] },
]

// cascade demo tree
const categoryTree = [
  {
    id: 'electronics', label: 'Electronics', children: [
      { id: 'phones', label: 'Phones', children: [{ id: 'android', label: 'Android' }, { id: 'ios', label: 'iOS' }] },
      { id: 'laptops', label: 'Laptops' },
      { id: 'tablets', label: 'Tablets' },
    ],
  },
  {
    id: 'clothing', label: 'Clothing', children: [
      { id: 'mens', label: "Men's" }, { id: 'womens', label: "Women's" }, { id: 'kids', label: "Kids'" },
    ],
  },
  { id: 'books', label: 'Books', children: [{ id: 'fiction', label: 'Fiction' }, { id: 'nonfiction', label: 'Non-Fiction' }] },
]

// ── Form setup ────────────────────────────────────────────────────────────────
const submitted = ref(false)

const { values, errors, isValid, isDirty, setField, touch, validateAll, reset } = useForm(
  {
    fullName: '', email: '', phone: '', website: '', age: '', password: '',
    confirmPassword: '', username: '', birthDate: '', meetingTime: '',
    eventDateTime: '', birthMonth: '', bio: '', country: '', language: '',
    terms: false, newsletter: false, frameworks: [], experience: '', contact: '',
    notifications: false, darkMode: false, budget: 500, satisfaction: 5,
    rating: 0, skills: [], keywords: [], avatar: null, attachments: null,
    department: null, permissions: [], categories: [], brandColor: '#6366f1', searchQuery: '', pinCode: '',
  },
  {
    fullName: [required, minLength(2), maxLength(60)],
    email: [required, email],
    phone: [phone],
    website: [url],
    age: [numeric, min(1), max(120)],
    password: [required, minLength(8)],
    confirmPassword: [required, sameAs('Password', () => values.password)],
    username: [minLength(3), pattern(/^[a-z0-9_]+$/, 'Only lowercase letters, numbers and underscores.')],
    birthDate: [required],
    bio: [required, minLength(10), maxLength(300)],
    country: [required],
    terms: [(v) => v ? null : 'You must accept the terms of service.'],
    frameworks: [minItems(1)],
    experience: [required],
    budget: [min(0), max(10000)],
    rating: [(v) => v > 0 ? null : 'Please provide a rating.'],
    skills: [minItems(1)],
    avatar: [required, fileSize(5), fileType(['image/'])],
    department: [required],
    pinCode: [pattern(/^[0-9]{4,6}$/, 'PIN must be 4–6 digits.')],
  }
)

function handleSubmit() {
  const valid = validateAll()
  if (!valid) return
  submitted.value = true
  setTimeout(() => { submitted.value = false }, 3000)
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(12px);
}
</style>
