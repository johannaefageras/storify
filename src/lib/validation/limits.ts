// Character limits by field type
export const LIMITS = {
	// Single text inputs
	SHORT_TEXT: 100, // name, hometown, occupationDetail items, age

	// Array item limits
	TAG_ITEM: 50, // family, pets, interests, locations, activities, people, meals, soundtracks
	CUSTOM_ITEM: 100, // customLocations, customActivities, customMeals, customSoundtracks
	LIST_ITEM: 200, // wins, frustrations

	// Textareas
	REFLECTION: 500, // almostHappened, unnecessaryThing, wouldRedo
	TIME_CAPSULE: 1000, // memoryFor10Years, messageToFutureSelf

	// Special fields
	EMAIL: 254, // RFC 5321 standard
	GENERATED_ENTRY: 10000, // Generated diary content

	// Array sizes
	MAX_ARRAY_SIZE: 10,
	MAX_EMOJIS: 5,

	// Payload
	MAX_PAYLOAD_BYTES: 50000 // 50KB
} as const;

// Field-to-limit mapping for easy lookup
export const FIELD_LIMITS: Record<string, number> = {
	// Profile
	name: LIMITS.SHORT_TEXT,
	age: LIMITS.SHORT_TEXT,
	hometown: LIMITS.SHORT_TEXT,
	occupationDetail: LIMITS.SHORT_TEXT,

	// Arrays with tag items
	family: LIMITS.TAG_ITEM,
	pets: LIMITS.TAG_ITEM,
	interests: LIMITS.TAG_ITEM,
	locations: LIMITS.TAG_ITEM,
	activities: LIMITS.TAG_ITEM,
	people: LIMITS.TAG_ITEM,
	meals: LIMITS.TAG_ITEM,
	soundtracks: LIMITS.TAG_ITEM,

	// Custom arrays
	customLocations: LIMITS.CUSTOM_ITEM,
	customActivities: LIMITS.CUSTOM_ITEM,
	customMeals: LIMITS.CUSTOM_ITEM,
	customSoundtracks: LIMITS.CUSTOM_ITEM,

	// List items
	wins: LIMITS.LIST_ITEM,
	frustrations: LIMITS.LIST_ITEM,

	// Textareas
	almostHappened: LIMITS.REFLECTION,
	unnecessaryThing: LIMITS.REFLECTION,
	wouldRedo: LIMITS.REFLECTION,
	memoryFor10Years: LIMITS.TIME_CAPSULE,
	messageToFutureSelf: LIMITS.TIME_CAPSULE,

	// Email
	email: LIMITS.EMAIL,
	entry: LIMITS.GENERATED_ENTRY
};
