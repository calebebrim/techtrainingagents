export const getInitials = (name?: string | null): string => {
  if (!name) {
    return 'U';
  }

  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return 'U';
  }

  const [first, second] = parts;
  const initials = `${first?.[0] ?? ''}${second?.[0] ?? ''}`.toUpperCase();

  if (initials) {
    return initials;
  }

  return parts[0][0].toUpperCase();
};
