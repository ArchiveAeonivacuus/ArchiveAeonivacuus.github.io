import { defineCollection, z } from "astro:content";

const postSchema = z.object({
	title: z.string(),
	published: z.coerce.date(),
	updated: z.coerce.date().optional().nullable(),
	draft: z.boolean().optional().default(false),
	description: z.string().optional().default(""),
	image: z.string().optional().default(""),
	tags: z.array(z.string()).optional().default([]),
	category: z.string().optional().nullable().default(""),
	lang: z.string().optional().default(""),
	translate_key: z.string().optional().default(""),
	rootClass: z.string().optional().default(""),

	/* For internal use */
	prevTitle: z.string().default(""),
	prevSlug: z.string().default(""),
	nextTitle: z.string().default(""),
	nextSlug: z.string().default(""),
});
const postsCollection = defineCollection({
	schema: postSchema,
});
const specCollection = defineCollection({
	schema: z.object({}),
});
const specTypstCollection = defineCollection({
	schema: z.object({}),
});
const typstPostsCollection = defineCollection({
	schema: postSchema,
});
export const collections = {
	posts: postsCollection,
	"typst-posts": typstPostsCollection,
	spec: specCollection,
	"spec-typst": specTypstCollection,
};
