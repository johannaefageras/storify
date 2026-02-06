export type Emoji = {
	id: string;
	name: string;
	svg: string;
};

export type EmojiCategory = {
	name: string;
	icon: string;
	emojis: Emoji[];
};
