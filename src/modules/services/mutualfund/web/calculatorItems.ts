import type { CalculatorKind } from './calculations';

import sipImg from '../../../../assets/calculators/calc-sip.png';
import goalSipImg from '../../../../assets/calculators/calc-goal-sip.png';
import smartGoalImg from '../../../../assets/calculators/calc-smart-goal.png';
import inflationImg from '../../../../assets/calculators/calc-inflation.png';
import costDelayImg from '../../../../assets/calculators/calc-cost-delay.png';
import lumpsumImg from '../../../../assets/calculators/calc-lumpsum.png';
import retirementImg from '../../../../assets/calculators/calc-retirement.png';
import stepupSipImg from '../../../../assets/calculators/calc-stepup-sip.png';
import swpImg from '../../../../assets/calculators/calc-swp.png';

export interface CalculatorItem {
  id: CalculatorKind;
  title: string;
  subtitle: string;
  screen: string;
  image?: string;
}

// Keep the existing calculation IDs while using the supplied mobile labels.
export const CALCULATORS: CalculatorItem[] = [
  { id: 'sip', title: 'SIP Calculator', subtitle: 'Estimate future value of your monthly SIP', screen: 'SIPCalculator', image: sipImg },
  { id: 'goal_sip', title: 'Goal SIP Calculator', subtitle: 'Monthly investment needed to reach your goal', screen: 'GoalSIPCalculator', image: goalSipImg },
  { id: 'smart_goal', title: 'Smart Goal Calculator', subtitle: 'Plan goals considering existing investments', screen: 'SmartGoalCalculator', image: smartGoalImg },
  { id: 'inflation', title: 'Inflation Calculator', subtitle: 'Impact of inflation on your expenses', screen: 'InflationCalculator', image: inflationImg },
  { id: 'cost_delay', title: 'Cost of Delay', subtitle: 'Impact of delaying your investments', screen: 'CostOfDelayCalculator', image: costDelayImg },
  { id: 'lumpsum', title: 'Lumpsum Calculator', subtitle: 'Calculate returns on one-time investment', screen: 'LumpsumCalculator', image: lumpsumImg },
  { id: 'retirement', title: 'Retirement Planning', subtitle: 'Estimate your retirement corpus', screen: 'RetirementCalculator', image: retirementImg },
  { id: 'stepup_sip', title: 'Step-Up SIP Calculator', subtitle: 'Future value with annual SIP increase', screen: 'StepUpSIPCalculator', image: stepupSipImg },
  { id: 'swp', title: 'SWP Calculator', subtitle: 'Systematic Withdrawal Plan projections', screen: 'SWPCalculator', image: swpImg },
];
