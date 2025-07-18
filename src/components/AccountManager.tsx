import { useState, useEffect } from "react";
import { Landmark, Plus, Trash2, Edit3, Save, X, Calendar } from "lucide-react";
import type { Account, ContributionPlan } from "../types";
import { ACCOUNT_COLORS } from "../types";

interface AccountManagerProps {
  accounts: Account[];
  onAccountsChange: (accounts: Account[]) => void;
  retirementAge: number;
}

const DEFAULT_ACCOUNTS: Account[] = [
  {
    id: "ira",
    type: "IRA",
    name: "Tax Deferred",
    startingAmount: 0,
    contributionPlans: [],
    color: ACCOUNT_COLORS["IRA"],
  },
  {
    id: "roth",
    type: "Roth IRA",
    name: "Tax Free",
    startingAmount: 0,
    contributionPlans: [],
    color: ACCOUNT_COLORS["Roth IRA"],
  },
  {
    id: "brokerage",
    type: "Brokerage",
    name: "Taxable",
    startingAmount: 0,
    contributionPlans: [],
    color: ACCOUNT_COLORS["Brokerage"],
  },
];

const AccountManager = ({
  accounts,
  onAccountsChange,
  retirementAge,
}: AccountManagerProps) => {
  // Ensure all three accounts always exist
  useEffect(() => {
    if (!accounts || accounts.length !== 3) {
      onAccountsChange(DEFAULT_ACCOUNTS);
    }
  }, [accounts, onAccountsChange]);

  const [editingId, setEditingId] = useState<string | null>(null);

  const handleEditAccount = (account: Account) => {
    setEditingId(account.id);
  };

  const handleSaveEdit = (account: Account) => {
    onAccountsChange(
      accounts.map((acc) => (acc.id === account.id ? account : acc))
    );
    setEditingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  return (
    <div className="card">
      <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
        <Landmark className="w-5 h-5 text-primary-600" />
        Manage Accounts
      </h2>
      {/* No Add New Account UI */}
      {/* Existing Accounts */}
      <div className="space-y-3">
        {accounts.map((account) => (
          <div key={account.id} className="account-card">
            {editingId === account.id ? (
              <EditAccountForm
                account={account}
                onSave={handleSaveEdit}
                onCancel={handleCancelEdit}
                retirementAge={retirementAge}
              />
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: account.color }}
                  />
                  <div>
                    <h4 className="font-medium text-gray-800">
                      {account.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {account.type === "IRA" && "Tax Deferred"}
                      {account.type === "Roth IRA" && "Tax Free"}
                      {account.type === "Brokerage" && "Taxable"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-800">
                    ${account.startingAmount.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-600">
                    {account.contributionPlans.length > 0 ? (
                      <span>
                        {account.contributionPlans.map((plan, index) => (
                          <span key={plan.id}>
                            {index > 0 && " + "}$
                            {plan.yearlyAmount.toLocaleString()}/year
                            <br />
                            <span className="text-gray-500">
                              (ages {plan.startAge}-{plan.endAge})
                            </span>
                          </span>
                        ))}
                      </span>
                    ) : (
                      "No contributions planned"
                    )}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditAccount(account)}
                    className="p-2 text-gray-500 hover:text-primary-600 transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  {/* No Delete Button */}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

interface EditAccountFormProps {
  account: Account;
  onSave: (account: Account) => void;
  onCancel: () => void;
  retirementAge: number;
}

const EditAccountForm = ({
  account,
  onSave,
  onCancel,
  retirementAge,
}: EditAccountFormProps) => {
  const [editedAccount, setEditedAccount] = useState<Account>(account);
  const [startingAmountInput, setStartingAmountInput] = useState<string>(
    account.startingAmount === undefined || account.startingAmount === null
      ? "0"
      : String(account.startingAmount)
  );

  const handleSave = () => {
    onSave({
      ...editedAccount,
      startingAmount:
        startingAmountInput === "" ? 0 : parseFloat(startingAmountInput),
    });
  };

  const addContributionPlan = () => {
    const newPlan: ContributionPlan = {
      id: Date.now().toString(),
      yearlyAmount: 0,
      startAge: 30,
      endAge: retirementAge,
    };
    setEditedAccount({
      ...editedAccount,
      contributionPlans: [...editedAccount.contributionPlans, newPlan],
    });
  };

  const updateContributionPlan = (
    planId: string,
    updates: Partial<ContributionPlan>
  ) => {
    setEditedAccount({
      ...editedAccount,
      contributionPlans: editedAccount.contributionPlans.map((plan) =>
        plan.id === planId ? { ...plan, ...updates } : plan
      ),
    });
  };

  const removeContributionPlan = (planId: string) => {
    setEditedAccount({
      ...editedAccount,
      contributionPlans: editedAccount.contributionPlans.filter(
        (plan) => plan.id !== planId
      ),
    });
  };

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        handleSave();
      }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input
          type="text"
          placeholder="Account Name"
          value={editedAccount.name}
          onChange={(e) =>
            setEditedAccount({ ...editedAccount, name: e.target.value })
          }
          className="input-field"
        />

        <input
          type="number"
          placeholder="Starting Amount"
          value={startingAmountInput}
          onChange={(e) => setStartingAmountInput(e.target.value)}
          onBlur={() => {
            if (startingAmountInput === "") setStartingAmountInput("0");
          }}
          className="input-field"
        />
      </div>

      {/* Contribution Plans */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Contribution Plans
          </h4>
          <button
            onClick={addContributionPlan}
            className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
          >
            <Plus className="w-3 h-3" />
            Add Plan
          </button>
        </div>

        {editedAccount.contributionPlans.map((plan) => (
          <div key={plan.id} className="bg-gray-50 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Contribution Plan
              </span>
              <button
                onClick={() => removeContributionPlan(plan.id)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Yearly Amount
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={plan.yearlyAmount}
                  onChange={(e) =>
                    updateContributionPlan(plan.id, {
                      yearlyAmount: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="input-field text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Start Age
                </label>
                <input
                  type="number"
                  placeholder="30"
                  value={plan.startAge}
                  onChange={(e) =>
                    updateContributionPlan(plan.id, {
                      startAge: parseInt(e.target.value) || 0,
                    })
                  }
                  className="input-field text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  End Age
                </label>
                <input
                  type="number"
                  placeholder="65"
                  value={plan.endAge}
                  onChange={(e) =>
                    updateContributionPlan(plan.id, {
                      endAge: parseInt(e.target.value) || retirementAge,
                    })
                  }
                  className="input-field text-sm"
                />
              </div>
            </div>

            <div className="text-xs text-gray-600">
              ${plan.yearlyAmount.toLocaleString()}/year from age{" "}
              {plan.startAge} to {plan.endAge}
            </div>
          </div>
        ))}

        {editedAccount.contributionPlans.length === 0 && (
          <div className="text-center py-4 text-gray-500 text-sm">
            No contribution plans. Click "Add Plan" to create one.
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button type="submit" className="btn-primary flex-1 flex items-center">
          <Save className="w-4 h-4 mr-2" />
          Save
        </button>
        <button onClick={onCancel} className="btn-secondary flex items-center">
          <X className="w-4 h-4 mr-2" />
          Cancel
        </button>
      </div>
    </form>
  );
};

export default AccountManager;
