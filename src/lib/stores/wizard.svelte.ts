import { browser } from '$app/environment';
import { Preferences } from '@capacitor/preferences';
import type { WeatherData } from '$lib/utils/weather';
import { fetchWeather } from '$lib/utils/weather';
import { getCurrentPosition } from '$lib/utils/geolocation';
import { fetchLocationName } from '$lib/utils/geocoding';
import { supabase } from '$lib/supabase/client';
import { authStore } from '$lib/stores/auth.svelte';

export interface UserProfile {
  name: string;
  birthday: string | null;
  pronouns: string;
  hometown: string;
  family: string[];
  pets: string[];
  occupationType: 'student' | 'working' | 'other' | '';
  occupationDetail: string[];
  interests: string[];
  avatarUrl: string | null;
}

export interface WizardData {
  // Step 0: User Profile (persistent)
  profile: UserProfile;

  // Step 1: Date & Emojis
  date: string;
  weekday: string;
  weather: WeatherData | null;
  locationName: string | null; // e.g., "Södermalm, Stockholm"
  emojis: string[];

  // Step 2: Sleep & Energy
  sleepQuality: number;
  energyLevel: number;
  mood: number;

  // Step 3: Where & What
  locations: string[];
  customLocations: string[];
  activities: string[];
  customActivities: string[];
  people: string[];

  // Step 4: Wins & Frustrations
  wins: string[];
  frustrations: string[];

  // Step 5: Reflections (optional)
  almostHappened: string;
  unnecessaryThing: string;
  wouldRedo: string;

  // Step 6: Food & Music (optional)
  meals: string[];
  customMeals: string[];
  soundtracks: string[];
  customSoundtracks: string[];
  moodColor: string;

  // Step 7: Time Capsule (optional)
  memoryFor10Years: string;
  messageToFutureSelf: string;

  // Step 8: AI Voice
  selectedTone: string;

  // Step 9: Add-ons
  includeHoroscope: boolean;
  includeOnThisDay: boolean;
  includeHomework: boolean;
}

const PROFILE_STORAGE_KEY = 'storify-profile';

const defaultProfile: UserProfile = {
  name: '',
  birthday: null,
  pronouns: '',
  hometown: '',
  family: [],
  pets: [],
  occupationType: '',
  occupationDetail: [],
  interests: [],
  avatarUrl: null
};

function createWizardStore() {
  const defaultData: WizardData = {
    profile: { ...defaultProfile },
    date: '',
    weekday: '',
    weather: null,
    locationName: null,
    emojis: [],
    sleepQuality: 5.48,
    energyLevel: 5.48,
    mood: 5.48,
    locations: [],
    customLocations: [],
    activities: [],
    customActivities: [],
    people: [],
    wins: [''],
    frustrations: [''],
    almostHappened: '',
    unnecessaryThing: '',
    wouldRedo: '',
    meals: [],
    customMeals: [],
    soundtracks: [],
    customSoundtracks: [],
    moodColor: '',
    memoryFor10Years: '',
    messageToFutureSelf: '',
    selectedTone: '',
    includeHoroscope: false,
    includeOnThisDay: false,
    includeHomework: true
  };

  let data = $state<WizardData>({ ...defaultData });
  let currentStep = $state(0);
  let isResultView = $state(false);
  const totalSteps = 11;

  async function loadProfileFromPreferences(): Promise<UserProfile> {
    try {
      const { value } = await Preferences.get({ key: PROFILE_STORAGE_KEY });
      if (value) {
        const parsed = JSON.parse(value);
        return {
          name: parsed.name || '',
          birthday: parsed.birthday || null,
          pronouns: parsed.pronouns || '',
          hometown: parsed.hometown || '',
          family: Array.isArray(parsed.family) ? parsed.family : [],
          pets: Array.isArray(parsed.pets) ? parsed.pets : [],
          occupationType: parsed.occupationType || '',
          occupationDetail: Array.isArray(parsed.occupationDetail)
            ? parsed.occupationDetail
            : typeof parsed.occupationDetail === 'string' && parsed.occupationDetail.trim()
              ? [parsed.occupationDetail.trim()]
              : [],
          interests: Array.isArray(parsed.interests) ? parsed.interests : [],
          avatarUrl: parsed.avatarUrl || null
        };
      }
    } catch (e) {
      console.error('Failed to load profile from Preferences:', e);
    }
    return { ...defaultProfile };
  }

  async function loadProfileFromSupabase(userId: string): Promise<UserProfile> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !data) return { ...defaultProfile };

      return {
        name: data.name || '',
        birthday: data.birthday || null,
        pronouns: data.pronouns || '',
        hometown: data.hometown || '',
        family: data.family || [],
        pets: data.pets || [],
        occupationType: data.occupation_type || '',
        occupationDetail: data.occupation_detail || [],
        interests: data.interests || [],
        avatarUrl: data.avatar_url || null
      };
    } catch (e) {
      console.error('Failed to load profile from Supabase:', e);
      return { ...defaultProfile };
    }
  }

  async function loadProfile(): Promise<UserProfile> {
    if (!browser) return { ...defaultProfile };

    if (authStore.isLoggedIn && authStore.user) {
      return loadProfileFromSupabase(authStore.user.id);
    }
    return loadProfileFromPreferences();
  }

  async function saveProfile(profile: UserProfile) {
    if (!browser) return;

    if (authStore.isLoggedIn && authStore.user) {
      try {
        await supabase
          .from('profiles')
          .update({
            name: profile.name,
            birthday: profile.birthday,
            pronouns: profile.pronouns,
            hometown: profile.hometown,
            family: profile.family,
            pets: profile.pets,
            occupation_type: profile.occupationType,
            occupation_detail: profile.occupationDetail,
            interests: profile.interests,
            updated_at: new Date().toISOString()
          })
          .eq('id', authStore.user.id);
      } catch (e) {
        console.error('Failed to save profile to Supabase:', e);
      }
    } else {
      try {
        await Preferences.set({
          key: PROFILE_STORAGE_KEY,
          value: JSON.stringify(profile)
        });
      } catch (e) {
        console.error('Failed to save profile to Preferences:', e);
      }
    }
  }

  return {
    get data() {
      return data;
    },
    get currentStep() {
      return currentStep;
    },
    get totalSteps() {
      return totalSteps;
    },
    get displayStepNumber() {
      return authStore.isLoggedIn ? currentStep : currentStep + 1;
    },
    get displayTotalSteps() {
      return authStore.isLoggedIn ? totalSteps - 1 : totalSteps;
    },
    get isResultView() {
      return isResultView;
    },
    get progress() {
      const effectiveStep = authStore.isLoggedIn ? currentStep - 1 : currentStep;
      const effectiveTotal = authStore.isLoggedIn ? totalSteps - 1 : totalSteps;
      return ((effectiveStep + 1) / effectiveTotal) * 100;
    },
    async initProfile() {
      const profile = await loadProfile();
      data.profile = profile;
      // Logged-in users manage their profile on /profile, skip Step 0
      if (authStore.isLoggedIn && currentStep === 0) {
        currentStep = 1;
      }
    },
    async initWeather() {
      const coords = await getCurrentPosition();
      if (coords) {
        // Fetch weather and location name in parallel
        const [weather, locationInfo] = await Promise.all([
          fetchWeather(coords),
          fetchLocationName(coords)
        ]);
        if (weather) {
          data.weather = weather;
        }
        if (locationInfo) {
          data.locationName = locationInfo.name;
        }
      }
    },
    nextStep() {
      if (currentStep < totalSteps) {
        currentStep++;
      }
    },
    prevStep() {
      if (currentStep > 0) {
        currentStep--;
      }
    },
    goToStep(step: number) {
      if (step >= 0 && step <= totalSteps) {
        currentStep = step;
      }
    },
    updateData<K extends keyof WizardData>(key: K, value: WizardData[K]) {
      data[key] = value;
    },
    updateProfile<K extends keyof UserProfile>(key: K, value: UserProfile[K]) {
      data.profile[key] = value;
      void saveProfile(data.profile);
    },
    setResultView(value: boolean) {
      isResultView = value;
    },
    reset() {
      // Preserve profile data, only reset daily diary data
      const currentProfile = data.profile;
      data = { ...defaultData, profile: currentProfile };
      currentStep = 1; // Go to step 1 after reset (skip profile on restart)
      isResultView = false;
    },
    fullReset() {
      // Reset all data including step position (for going back to landing page)
      const currentProfile = data.profile;
      data = { ...defaultData, profile: currentProfile };
      currentStep = 0;
      isResultView = false;
    },
    async clearAll() {
      // Reset everything including profile and remove from storage
      data = { ...defaultData, profile: { ...defaultProfile } };
      currentStep = 0;
      isResultView = false;
      if (browser) {
        try {
          await Preferences.remove({ key: PROFILE_STORAGE_KEY });
        } catch (e) {
          console.error('Failed to remove profile from Preferences:', e);
        }
      }
    },
    isStepValid(step: number): boolean {
      // Check if required fields for a step are filled
      switch (step) {
        case 0: // Profile - optional
          return true;
        case 1: // Date & Emojis - emojis required (date/weekday auto-filled on mount)
          return data.emojis.length > 0;
        case 2: // Sleep & Energy - has defaults, always valid
          return true;
        case 3: // Where & What - locations, activities required
          return (
            (data.locations.length > 0 || data.customLocations.length > 0) &&
            (data.activities.length > 0 || data.customActivities.length > 0)
          );
        case 4: // Wins & Frustrations - at least one win required
          return data.wins.some((w) => w.trim() !== '');
        case 5: // Reflections - optional
          return true;
        case 6: // Food & Music - optional
          return true;
        case 7: // Time Capsule - optional
          return true;
        case 8: // AI Voice - has default, always valid
          return data.selectedTone.trim() !== '';
        case 9: // Add-ons - optional
          return true;
        case 10: // Summary - no next button needed
          return true;
        default:
          return true;
      }
    },
    hasOptionalFieldsFilled(step: number): boolean {
      // Check if any optional fields have been filled on optional steps
      switch (step) {
        case 0: // Profile
          return (
            data.profile.name.trim() !== '' ||
            data.profile.birthday !== null ||
            data.profile.pronouns.trim() !== '' ||
            data.profile.hometown.trim() !== '' ||
            data.profile.family.length > 0 ||
            data.profile.pets.length > 0 ||
            data.profile.occupationType !== '' ||
            data.profile.occupationDetail.length > 0 ||
            data.profile.interests.length > 0
          );
        case 5: // Reflections
          return (
            data.almostHappened.trim() !== '' ||
            data.unnecessaryThing.trim() !== '' ||
            data.wouldRedo.trim() !== ''
          );
        case 6: // Food & Music
          return (
            data.meals.length > 0 ||
            data.customMeals.length > 0 ||
            data.soundtracks.length > 0 ||
            data.customSoundtracks.length > 0 ||
            data.moodColor !== ''
          );
        case 7: // Time Capsule
          return data.memoryFor10Years.trim() !== '' || data.messageToFutureSelf.trim() !== '';
        case 9: // Add-ons
          return data.includeHoroscope || data.includeOnThisDay || data.includeHomework;
        default:
          return false;
      }
    }
  };
}

export const wizardStore = createWizardStore();
