/**
 * Strapi Preview verification endpoint.
 * Strapi redirects editors here with ?secret=...&url=...&status=...
 * We verify the secret and redirect to the preview URL with Nuxt preview mode enabled.
 * @see https://docs.strapi.io/dev-docs/preview
 */

const host = process.env.STRAPI_PREVIEW_URL || '';

export default defineEventHandler((event) => {
  const config = useRuntimeConfig();
  const query = getQuery(event);

  const secret = query.secret as string | undefined;
  const status = query.status as string | undefined;
  const slug = query.slug as string | undefined;
  const type = query.type as string | undefined;

  if (!secret || secret !== config.strapiPreviewSecret) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid preview secret',
    });
  }

  if (type !== 'article') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid type',
    });
  }

  const target = `/preview/${slug}?status=${status}`;

  return sendRedirect(event, target, 307);
});
