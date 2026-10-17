import React from 'react';
import { ParsedProblem, CoachAnalysis } from '../../core/types';
import { ComplexityMeter } from './ComplexityMeter';
import { ConstraintsCard } from './ConstraintsCard';
import { KeywordChipsSection } from './KeywordChipsSection';
import { WasteToolMatrixSection } from './WasteToolMatrixSection';
import { TestCaseVisualCard } from './TestCaseVisualCard';
import { EdgeCasesChecklistSection } from './EdgeCasesChecklistSection';
import { InsightsSkeleton } from './InsightsSkeleton';
import { InsightsEmptyState } from './InsightsEmptyState';

export interface InsightsViewProps {
  problem: ParsedProblem;
  analysis: CoachAnalysis;
  isLoading?: boolean;
  onRetry?: () => void;
  className?: string;
}

export const InsightsView: React.FC<InsightsViewProps> = ({
  problem,
  analysis,
  isLoading = false,
  onRetry,
  className = '',
}) => {
  // Loading skeleton state
  if (isLoading) {
    return <InsightsSkeleton className={className} />;
  }

  // Friendly empty / parse-fail state
  if (!problem || (!problem.isParsed && !problem.title && problem.constraintsLines.length === 0)) {
    return (
      <InsightsEmptyState
        onRetry={onRetry}
        message="Problem description abhi tak load nahi hui. LeetCode problem page open karke retry button dabayein."
        className={className}
      />
    );
  }

  const firstExample = problem.examples.length > 0 ? problem.examples[0] : null;
  const fullText = `${problem.title} ${problem.descriptionText}`;

  return (
    <div className={`space-y-4 text-sm font-sans ${className}`}>
      {/* 1. Complexity Meter & TLE Ops Bar Chart */}
      <ComplexityMeter
        analysis={analysis}
        sizeMax={problem.analysis.sizeMax}
      />

      {/* 2. Parsed Constraints Table & Safety Badges */}
      <ConstraintsCard
        analysis={problem.analysis}
        overflowWarning={analysis.overflowWarning}
      />

      {/* 3. Detected Keyword Signals (Confidence-weighted chips) */}
      <KeywordChipsSection
        keywordHits={analysis.keywordHits}
      />

      {/* 4. Waste -> Tool Prescription Matrix (9 Rows, Glowing Matched) */}
      <WasteToolMatrixSection
        keywordHits={analysis.keywordHits}
      />

      {/* 5. Example 1 & Size Transition Visual (n -> n, n -> 1, n -> 2^n) */}
      <TestCaseVisualCard
        example={firstExample}
        sizeRelation={analysis.sizeRelationHint}
        outputHint={analysis.outputTypeHint}
      />

      {/* 6. Tailored Edge Cases Checklist (Auto-filtered with skips) */}
      <EdgeCasesChecklistSection
        analysis={problem.analysis}
        overflowWarning={analysis.overflowWarning}
        problemText={fullText}
      />
    </div>
  );
};
