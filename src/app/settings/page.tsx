import { CategoryManagement } from "@/components/settings/category-management";

export default function SettingsPage() {
  return (
    <div className="settings-page">
      <div className="page-heading-row">
        <div>
          <p className="section-kicker">Your preferences</p>
          <h1 className="page-title">Settings</h1>
          <p className="page-lede">Make Folia feel like yours. Start by naming the things you track.</p>
        </div>
      </div>
      <CategoryManagement />
    </div>
  );
}
