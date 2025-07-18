import { PiggyBank, TrendingUp, Heart } from "lucide-react";
import ScenarioManagerDropdown from "./ScenarioManagerDropdown";

const Header = () => {
  return (
    <header className="text-center">
      <div className="flex items-center justify-center gap-3 mb-4">
        <div className="p-3 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full">
          <PiggyBank className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-indigo-600 bg-clip-text text-transparent">
          GrainFlow
        </h1>
      </div>
      <div className="flex justify-center mb-2">
        <ScenarioManagerDropdown />
      </div>
      <p className="text-lg text-gray-600 max-w-2xl mx-auto">
        Plan your retirement. Track your IRA, Roth IRA, and brokerage accounts
        with tax-aware projections.
      </p>
      <div className="flex items-center justify-center gap-6 mt-6 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-success-500" />
          <span>Smart Projections</span>
        </div>
        <div className="flex items-center gap-2">
          <Heart className="w-4 h-4 text-pink-500" />
          <span>Tax-Aware</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
