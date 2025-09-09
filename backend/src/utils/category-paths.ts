import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Updates the materialized path and level for a category
 * @param categoryId The ID of the category to update
 */
export async function updateCategoryPath(categoryId: number): Promise<void> {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    include: { parent: true }
  });

  if (!category) {
    throw new Error(`Category with ID ${categoryId} not found`);
  }

  let path: string;
  let level: number;

  if (category.parentId && category.parent) {
    // Child category
    path = `${category.parent.path}/${category.slug}`;
    level = category.parent.level + 1;
  } else {
    // Root category
    path = `/${category.slug}`;
    level = 0;
  }

  await prisma.category.update({
    where: { id: categoryId },
    data: { path, level }
  });

  // Update all children recursively
  const children = await prisma.category.findMany({
    where: { parentId: categoryId }
  });

  for (const child of children) {
    await updateCategoryPath(child.id);
  }
}

/**
 * Updates paths for all categories in the database
 * Useful for initial setup or fixing corrupted paths
 */
export async function rebuildAllCategoryPaths(): Promise<void> {
  console.log('🔄 Rebuilding category paths...');

  // Get all root categories first
  const rootCategories = await prisma.category.findMany({
    where: { parentId: null },
    orderBy: { sortOrder: 'asc' }
  });

  for (const rootCategory of rootCategories) {
    await updateCategoryPath(rootCategory.id);
  }

  console.log('✅ Category paths rebuilt successfully');
}

/**
 * Gets all ancestor categories for a given category
 * @param categoryId The category ID
 * @returns Array of ancestor categories ordered from root to parent
 */
export async function getCategoryAncestors(categoryId: number): Promise<any[]> {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    include: { parent: true }
  });

  if (!category) {
    return [];
  }

  const ancestors = [];
  let current = category.parent;

  while (current) {
    ancestors.unshift(current);
    current = await prisma.category.findUnique({
      where: { id: current.parentId! },
      include: { parent: true }
    })?.then(cat => cat?.parent || null);
  }

  return ancestors;
}

/**
 * Gets all descendant categories for a given category
 * @param categoryId The category ID
 * @returns Array of descendant categories
 */
export async function getCategoryDescendants(categoryId: number): Promise<any[]> {
  const category = await prisma.category.findUnique({
    where: { id: categoryId }
  });

  if (!category) {
    return [];
  }

  const descendants = [];
  const stack = [category];

  while (stack.length > 0) {
    const current = stack.pop()!;
    const children = await prisma.category.findMany({
      where: { parentId: current.id }
    });

    for (const child of children) {
      descendants.push(child);
      stack.push(child);
    }
  }

  return descendants;
}

/**
 * Validates category hierarchy to prevent circular references
 * @param categoryId The category being moved
 * @param newParentId The new parent category ID
 * @returns true if move is valid, false if it would create a circular reference
 */
export async function validateCategoryHierarchy(categoryId: number, newParentId: number | null): Promise<boolean> {
  if (!newParentId) {
    return true; // Moving to root is always valid
  }

  // Check if newParentId is a descendant of categoryId
  const descendants = await getCategoryDescendants(categoryId);
  return !descendants.some(desc => desc.id === newParentId);
}

/**
 * Moves a category to a new parent
 * @param categoryId The category to move
 * @param newParentId The new parent ID (null for root)
 */
export async function moveCategory(categoryId: number, newParentId: number | null): Promise<void> {
  // Validate the move
  const isValid = await validateCategoryHierarchy(categoryId, newParentId);
  if (!isValid) {
    throw new Error('Cannot move category: would create circular reference');
  }

  // Update parent
  await prisma.category.update({
    where: { id: categoryId },
    data: { parentId: newParentId }
  });

  // Update paths for this category and all descendants
  await updateCategoryPath(categoryId);
}

/**
 * Gets categories by path prefix (useful for breadcrumbs and navigation)
 * @param pathPrefix The path prefix to search for
 * @returns Array of categories matching the path prefix
 */
export async function getCategoriesByPathPrefix(pathPrefix: string): Promise<any[]> {
  return await prisma.category.findMany({
    where: {
      path: {
        startsWith: pathPrefix
      },
      isActive: true
    },
    orderBy: [
      { level: 'asc' },
      { sortOrder: 'asc' }
    ]
  });
}

/**
 * Gets category tree structure
 * @param maxDepth Maximum depth to fetch (null for unlimited)
 * @returns Nested category tree
 */
export async function getCategoryTree(maxDepth: number | null = null): Promise<any[]> {
  const rootCategories = await prisma.category.findMany({
    where: {
      parentId: null,
      isActive: true
    },
    orderBy: { sortOrder: 'asc' },
    include: {
      children: maxDepth !== 1 ? {
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
        include: maxDepth !== 2 ? {
          children: maxDepth !== 2 ? {
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' }
          } : false
        } : false
      } : false
    }
  });

  return rootCategories;
}