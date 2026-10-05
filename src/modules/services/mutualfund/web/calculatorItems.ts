import type { CalculatorKind } from './calculations';

export interface CalculatorItem {
  id: CalculatorKind;
  title: string;
  subtitle: string;
  screen: string;
}

// Keep the existing calculation IDs while using the supplied mobile labels.
export const CALCULATORS: CalculatorItem[] = [
  { id: 'sip', title: 'SIP Calculator', subtitle: 'Estimate future value of your monthly SIP', screen: 'SIPCalculator' },
  { id: 'goal_sip', title: 'Goal SIP Calculator', subtitle: 'Monthly investment needed to reach your goal', screen: 'GoalSIPCalculator' },
  { id: 'smart_goal', title: 'Smart Goal Calculator', subtitle: 'Plan goals considering existing investments', screen: 'SmartGoalCalculator' },
  { id: 'inflation', title: 'Inflation Calculator', subtitle: 'Impact of inflation on your expenses', screen: 'InflationCalculator' },
  { id: 'cost_delay', title: 'Cost of Delay', subtitle: 'Impact of delaying your investments', screen: 'CostOfDelayCalculator' },
  { id: 'lumpsum', title: 'Lumpsum Calculator', subtitle: 'Calculate returns on one-time investment', screen: 'LumpsumCalculator' },
  { id: 'retirement', title: 'Retirement Planning', subtitle: 'Estimate your retirement corpus', screen: 'RetirementCalculator' },
  { id: 'stepup_sip', title: 'Step-Up SIP Calculator', subtitle: 'Future value with annual SIP increase', screen: 'StepUpSIPCalculator' },
  { id: 'swp', title: 'SWP Calculator', subtitle: 'Systematic Withdrawal Plan projections', screen: 'SWPCalculator' },
];
