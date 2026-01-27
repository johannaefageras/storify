import { browser } from '$app/environment';
import { Preferences } from '@capacitor/preferences';
import type { WeatherData } from '$lib/utils/weather';
import { fetchWeather } from '$lib/utils/weather';
import { getCurrentPosition } from '$lib/utils/geolocation';
import { fetchLocationName } from '$lib/utils/geocoding';

export interface UserProfile {
  name: string;
  age: string;
  pronouns: string;
  hometown: string;
  family: string[];
  pets: string[];
  occupationType: 'student' | 'working' | 'other' | '';
  occupationDetail: string[];
  interests: string[];
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

  // Step 7: Time Capsule (optional)
  memoryFor10Years: string;
  messageToFutureSelf: string;

  // Step 8: AI Voice
  selectedTone: string;
}

const PROFILE_STORAGE_KEY = 'storify-profile';

const defaultProfile: UserProfile = {
  name: '',
  age: '',
  pronouns: '',
  hometown: '',
  family: [],
  pets: [],
  occupationType: '',
  occupationDetail: [],
  interests: []
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
    memoryFor10Years: '',
    messageToFutureSelf: '',
    selectedTone: 'classic'
  };

  let data = $state<WizardData>({ ...defaultData });
  let currentStep = $state(0);
  let isResultView = $state(false);
  const totalSteps = 10;

  async function loadProfile(): Promise<UserProfile> {
    if (!browser) return { ...defaultProfile };

    try {
      const { value } = await Preferences.get({ key: PROFILE_STORAGE_KEY });
      if (value) {
        const parsed = JSON.parse(value);
        return {
          name: parsed.name || '',
          age: parsed.age || '',
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
          interests: Array.isArray(parsed.interests) ? parsed.interests : []
        };
      }
    } catch (e) {
      console.error('Failed to load profile from Preferences:', e);
    }

    return { ...defaultProfile };
  }

  async function saveProfile(profile: UserProfile) {
    if (!browser) return;

    try {
      await Preferences.set({
        key: PROFILE_STORAGE_KEY,
        value: JSON.stringify(profile)
      });
    } catch (e) {
      console.error('Failed to save profile to Preferences:', e);
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
    get isResultView() {
      return isResultView;
    },
    get progress() {
      return ((currentStep + 1) / totalSteps) * 100;
    },
    async initProfile() {
      const profile = await loadProfile();
      data.profile = profile;
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
        case 4: // Wins & Frustrations - at least one win or frustration
          return (
            data.wins.some((w) => w.trim() !== '') || data.frustrations.some((f) => f.trim() !== '')
          );
        case 5: // Reflections - optional
          return true;
        case 6: // Food & Music - optional
          return true;
        case 7: // Time Capsule - optional
          return true;
        case 8: // AI Voice - has default, always valid
          return data.selectedTone.trim() !== '';
        case 9: // Summary - no next button needed
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
            data.profile.age.trim() !== '' ||
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
            data.customSoundtracks.length > 0
          );
        case 7: // Time Capsule
          return data.memoryFor10Years.trim() !== '' || data.messageToFutureSelf.trim() !== '';
        default:
          return false;
      }
    }
  };
}

export const wizardStore = createWizardStore();
