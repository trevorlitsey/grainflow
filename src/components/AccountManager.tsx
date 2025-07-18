import { useState } from "react";
import { Plus, Trash2, Edit3, Save, X, Calendar } from "lucide-react";
import type { Account, AccountType, ContributionPlan } from "../types";
import { ACCOUNT_COLORS } from "../types";

interface AccountManagerProps {
  accounts: Account[];
  onAccountsChange: (accounts: Account[]) => void;
  retirementAge: number;
}

const AccountManager = ({
  accounts,
  onAccountsChange,
  retirementAge,
}: AccountManagerProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newAccount, setNewAccount] = useState<Partial<Account>>({
    type: "IRA",
    name: "",
    startingAmount: 0,
    contributionPlans: [],
  });
  const [startingAmountInput, setStartingAmountInput] = useState<string>("0");

  const handleAddAccount = () => {
    if (!newAccount.name || !newAccount.type) return;

    const account: Account = {
      id: Date.now().toString(),
      type: newAccount.type as AccountType,
      name: newAccount.name,
      startingAmount:
        startingAmountInput === "" ? 0 : parseFloat(startingAmountInput),
      contributionPlans: newAccount.contributionPlans || [],
      color: ACCOUNT_COLORS[newAccount.type as AccountType],
    };

    onAccountsChange([...accounts, account]);
    setNewAccount({
      type: "IRA",
      name: "",
      startingAmount: 0,
      contributionPlans: [],
    });
    setStartingAmountInput("0");
  };

  const handleDeleteAccount = (id: string) => {
    onAccountsChange(accounts.filter((acc) => acc.id !== id));
  };

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
        <Plus className="w-5 h-5 text-primary-600" />
        Manage Accounts
      </h2>

      {/* Add New Account */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          Add New Account
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Account Type
            </label>
            <select
              value={newAccount.type}
              onChange={(e) =>
                setNewAccount({
                  ...newAccount,
                  type: e.target.value as AccountType,
                })
              }
              className="input-field"
            >
              <option value="IRA">Traditional IRA</option>
              <option value="Roth IRA">Roth IRA</option>
              <option value="Brokerage">Brokerage</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Account Name
            </label>
            <input
              type="text"
              placeholder="e.g., My 401k"
              value={newAccount.name}
              onChange={(e) =>
                setNewAccount({ ...newAccount, name: e.target.value })
              }
              className="input-field"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Starting Amount
            </label>
            <input
              type="number"
              placeholder="0"
              value={startingAmountInput}
              onChange={(e) => setStartingAmountInput(e.target.value)}
              onBlur={() => {
                if (startingAmountInput === "") setStartingAmountInput("0");
              }}
              className="input-field"
            />
          </div>
        </div>

        <div className="flex justify-center mt-3">
          <button
            onClick={handleAddAccount}
            className="btn-primary flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Account
          </button>
        </div>
      </div>

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
                    <p className="text-sm text-gray-600">{account.type}</p>
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
                  <button
                    onClick={() => handleDeleteAccount(account.id)}
                    className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {accounts.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No accounts added yet.</p>
            <p className="text-sm">
              Add your first account above to get started!
            </p>
          </div>
        )}
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
    <div className="space-y-4">
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
        <button
          onClick={handleSave}
          className="btn-primary flex-1 flex items-center"
        >
          <Save className="w-4 h-4 mr-2" />
          Save
        </button>
        <button onClick={onCancel} className="btn-secondary flex items-center">
          <X className="w-4 h-4 mr-2" />
          Cancel
        </button>
      </div>
    </div>
  );
};

export default AccountManager;
