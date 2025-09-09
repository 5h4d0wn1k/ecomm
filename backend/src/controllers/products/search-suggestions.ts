import { Request, Response } from 'express';
import { prisma } from '../../config';
import enhancedSearchService from '../../services/enhanced-search.service';

/**
 * Get search suggestions based on query
 */
export const getSearchSuggestions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { q: query, limit = 10 } = req.query;

    if (!query || typeof query !== 'string' || query.length < 2) {
      res.status(200).json({
        success: true,
        data: [],
      });
      return;
    }

    // Use enhanced autocomplete service
    const suggestions = await enhancedSearchService.getAutocompleteSuggestions(
      query.trim(),
      Number(limit)
    );

    // If no Elasticsearch suggestions, fall back to popular terms
    if (suggestions.length === 0) {
      const popularTerms = [
        't-shirts', 'jeans', 'shoes', 'watches', 'bags',
        'sunglasses', 'jewelry', 'home decor', 'kitchen'
      ];

      const fallbackSuggestions = popularTerms.filter(term =>
        term.toLowerCase().includes(query.toLowerCase())
      ).slice(0, Number(limit));

      res.status(200).json({
        success: true,
        data: fallbackSuggestions,
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: suggestions,
    });
  } catch (error) {
    console.error('Search suggestions error:', error);

    // Fallback to basic suggestions if Elasticsearch fails
    try {
      const { q: query } = req.query;
      const searchTerm = (query as string).toLowerCase().trim();

      const popularTerms = [
        't-shirts', 'jeans', 'shoes', 'watches', 'bags',
        'sunglasses', 'jewelry', 'home decor', 'kitchen'
      ];

      const fallbackSuggestions = popularTerms.filter(term =>
        term.toLowerCase().includes(searchTerm)
      ).slice(0, 5);

      res.status(200).json({
        success: true,
        data: fallbackSuggestions,
      });
    } catch (fallbackError) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: {
          code: 'INTERNAL_ERROR',
          details: 'Failed to fetch search suggestions',
        },
      });
    }
  }
};