import { useState } from "react";
import { Plus, Trash2, Edit3, Save, X } from "lucide-react";
import type { Account, AccountType } from "../types";
import { ACCOUNT_COLORS } from "../types";

interface AccountManagerProps {
  accounts: Account[];
  onAccountsChange: (accounts: Account[]) => void;
}

const AccountManager = ({
  accounts,
  onAccountsChange,
}: AccountManagerProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newAccount, setNewAccount] = useState<Partial<Account>>({
    type: "IRA",
    name: "",
    startingAmount: 0,
    yearlyContribution: 0,
  });

  const handleAddAccount = () => {
    if (!newAccount.name || !newAccount.type) return;

    const account: Account = {
      id: Date.now().toString(),
      type: newAccount.type as AccountType,
      name: newAccount.name,
      startingAmount: newAccount.startingAmount || 0,
      yearlyContribution: newAccount.yearlyContribution || 0,
      color: ACCOUNT_COLORS[newAccount.type as AccountType],
    };

    onAccountsChange([...accounts, account]);
    setNewAccount({
      type: "IRA",
      name: "",
      startingAmount: 0,
      yearlyContribution: 0,
    });
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

          <input
            type="text"
            placeholder="Account Name"
            value={newAccount.name}
            onChange={(e) =>
              setNewAccount({ ...newAccount, name: e.target.value })
            }
            className="input-field"
          />

          <input
            type="number"
            placeholder="Starting Amount"
            value={newAccount.startingAmount}
            onChange={(e) =>
              setNewAccount({
                ...newAccount,
                startingAmount: parseFloat(e.target.value) || 0,
              })
            }
            className="input-field"
          />

          <input
            type="number"
            placeholder="Yearly Contribution"
            value={newAccount.yearlyContribution}
            onChange={(e) =>
              setNewAccount({
                ...newAccount,
                yearlyContribution: parseFloat(e.target.value) || 0,
              })
            }
            className="input-field"
          />
        </div>

        <button onClick={handleAddAccount} className="btn-primary mt-3 w-full">
          <Plus className="w-4 h-4 mr-2" />
          Add Account
        </button>
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
                    +${account.yearlyContribution.toLocaleString()}/year
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
}

const EditAccountForm = ({
  account,
  onSave,
  onCancel,
}: EditAccountFormProps) => {
  const [editedAccount, setEditedAccount] = useState<Account>(account);

  const handleSave = () => {
    onSave(editedAccount);
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input
          type="text"
          value={editedAccount.name}
          onChange={(e) =>
            setEditedAccount({ ...editedAccount, name: e.target.value })
          }
          className="input-field"
        />

        <input
          type="number"
          value={editedAccount.startingAmount}
          onChange={(e) =>
            setEditedAccount({
              ...editedAccount,
              startingAmount: parseFloat(e.target.value) || 0,
            })
          }
          className="input-field"
        />

        <input
          type="number"
          value={editedAccount.yearlyContribution}
          onChange={(e) =>
            setEditedAccount({
              ...editedAccount,
              yearlyContribution: parseFloat(e.target.value) || 0,
            })
          }
          className="input-field"
        />
      </div>

      <div className="flex gap-2">
        <button onClick={handleSave} className="btn-primary flex-1">
          <Save className="w-4 h-4 mr-2" />
          Save
        </button>
        <button onClick={onCancel} className="btn-secondary">
          <X className="w-4 h-4 mr-2" />
          Cancel
        </button>
      </div>
    </div>
  );
};

export default AccountManager;
