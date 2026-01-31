import { ScamShieldResult, RiskLevel } from '../types';
import { SCAM_TEMPLATES, URGENCY_KEYWORDS } from '../constants';

/**
 * Deterministic local risk analysis engine
 */
export function analyzeTextWithRules(text: string): ScamShieldResult {
  const normalizedText = text.toLowerCase();
  
  let bestMatch = null;
  let maxScore = 0;
  
  // 1. Calculate category scores
  const categoryScores = SCAM_TEMPLATES.map(template => {
    let score = 0;
    template.keywords.forEach(keyword => {
      if (normalizedText.includes(keyword.toLowerCase())) {
        score += 20;
      }
    });
    return { template, score };
  });

  // 2. Calculate Urgency/Threat bonus
  let urgencyScore = 0;
  URGENCY_KEYWORDS.forEach(word => {
    if (normalizedText.includes(word.toLowerCase())) {
      urgencyScore += 10;
    }
  });

  // 3. Find best category match
  categoryScores.sort((a, b) => b.score - a.score);
  const primaryMatch = categoryScores[0];
  
  const finalScore = Math.min(99, primaryMatch.score + urgencyScore);
  
  // 4. Determine Risk Label
  let riskLabel = RiskLevel.LOW;
  if (finalScore > 85) riskLabel = RiskLevel.CRITICAL;
  else if (finalScore > 60) riskLabel = RiskLevel.HIGH;
  else if (finalScore > 30) riskLabel = RiskLevel.MEDIUM;

  // 5. Default Fallback
  if (primaryMatch.score === 0 && urgencyScore === 0) {
    return {
      riskPercent: 5,
      riskLabel: RiskLevel.LOW,
      scamType: "Unknown / Low Risk",
      summary: "No common scam patterns detected. However, always stay vigilant and never share OTPs.",
      actions_A: [{ title: "Stay Safe", steps: ["Never share OTPs.", "Do not click unknown links."], priority: 1 }],
      actions_B: [{ title: "Check Statements", steps: ["Monitor your bank accounts for unauthorized transactions."], priority: 1 }]
    };
  }

  const selectedTemplate = primaryMatch.template;

  return {
    riskPercent: finalScore,
    riskLabel,
    scamType: selectedTemplate.title,
    summary: selectedTemplate.explanation,
    actions_A: selectedTemplate.actions_A,
    actions_B: selectedTemplate.actions_B
  };
}
